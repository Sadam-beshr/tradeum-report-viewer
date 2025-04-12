import { useState, useEffect } from "react";
import { fetchTradeData, calculateTradeMetrics, TradeData } from "@/services/api";
import { ArrowDownIcon, ArrowUpIcon, Activity, Clock, RefreshCw, PieChart } from "lucide-react";
import StatCard from "./StatCard";
import TimeRangeSelector, { DateRangeOption } from "./TimeRangeSelector";
import ProfitLossChart from "./ProfitLossChart";
import TradesTable from "./TradesTable";
import PerformanceMetrics from "./PerformanceMetrics";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date("2025-01-01"),
    end: new Date("2025-04-02"),
  });
  const [selectedOption, setSelectedOption] = useState<DateRangeOption>("30D");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadTradeData = async () => {
    setLoading(true);
    try {
      const startDateStr = format(dateRange.start, "yyyy-MM-dd");
      const endDateStr = format(dateRange.end, "yyyy-MM-dd");
      
      const data = await fetchTradeData(startDateStr, endDateStr);
      setTrades(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching trade data:", error);
      toast({
        title: "Error",
        description: "Failed to load trading data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTradeData();
  }, [dateRange]);

  const handleRefresh = () => {
    loadTradeData();
    toast({
      title: "Success",
      description: "Trade data refreshed",
    });
  };

  const handleRangeChange = (range: { start: Date; end: Date }) => {
    setDateRange(range);
  };

  const metrics = calculateTradeMetrics(trades);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Trading Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Last updated: {format(lastUpdated, "MMM dd, yyyy HH:mm:ss")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <TimeRangeSelector 
              onRangeChange={handleRangeChange} 
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Trades"
            value={metrics.totalTrades}
            subvalue={`${metrics.winRate.toFixed(2)}% success rate`}
            icon={<Activity className="h-5 w-5 text-muted-foreground" />}
          />
          
          <StatCard
            title="Bot Accuracy"
            value={`${metrics.winRate.toFixed(2)}%`}
            subvalue={`${metrics.winTrades} wins / ${metrics.lossTrades} losses`}
            icon={<PieChart className="h-5 w-5 text-muted-foreground" />}
            isProfit={metrics.winRate > 50}
            isLoss={metrics.winRate < 50}
          />
          
          <StatCard
            title="Total P/L"
            value={metrics.profitPercent}
            subvalue={`$${Math.abs(metrics.totalProfit).toFixed(2)}`}
            icon={metrics.totalProfit >= 0 ? 
              <ArrowUpIcon className="h-5 w-5 text-profit" /> : 
              <ArrowDownIcon className="h-5 w-5 text-loss" />
            }
            isProfit={metrics.totalProfit > 0}
            isLoss={metrics.totalProfit < 0}
          />
          
          <StatCard
            title="Avg. Trade Duration"
            value="7h 38m"
            subvalue="Average time in market"
            icon={<Clock className="h-5 w-5 text-muted-foreground" />}
          />
        </div>

        {/* Charts & Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProfitLossChart trades={trades} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PerformanceMetrics trades={trades} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TradesTable trades={trades} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
