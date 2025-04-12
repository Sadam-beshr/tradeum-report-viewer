
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TradeData } from "@/services/api";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ProfitLossChartProps {
  trades: TradeData[];
}

type TimeFrame = "Daily" | "Weekly" | "Monthly";

const ProfitLossChart = ({ trades }: ProfitLossChartProps) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("Daily");

  // Process data for chart
  const processData = () => {
    if (!trades.length) return [];

    // Sort trades by date
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    );

    // Group trades by date according to timeframe
    const groupedData = sortedTrades.reduce((acc: Record<string, { profit: number; count: number }>, trade) => {
      const date = parseISO(trade.date_time);
      
      let key: string;
      if (timeFrame === "Daily") {
        key = format(date, "yyyy-MM-dd");
      } else if (timeFrame === "Weekly") {
        // Get the week number
        const weekNumber = Math.ceil(date.getDate() / 7);
        key = `${format(date, "yyyy-MM")}-W${weekNumber}`;
      } else {
        key = format(date, "yyyy-MM");
      }

      if (!acc[key]) {
        acc[key] = { profit: 0, count: 0 };
      }

      // Calculate profit/loss value
      const profitValue = typeof trade.profit_loss_dolar === 'string'
        ? parseFloat(trade.profit_loss_dolar.replace(/[^-.\d]/g, ''))
        : trade.profit_loss_dolar;

      acc[key].profit += profitValue;
      acc[key].count += 1;

      return acc;
    }, {});

    // Convert to array for chart
    return Object.entries(groupedData).map(([date, data]) => ({
      date,
      profit: data.profit,
      count: data.count,
      avgProfit: data.profit / data.count,
      formattedDate: timeFrame === "Daily"
        ? format(parseISO(date), "MMM d")
        : timeFrame === "Weekly"
          ? date.split("-W")[1] // Just show the week number
          : format(parseISO(date + "-01"), "MMM yyyy") // For monthly
    }));
  };

  const chartData = processData();
  
  // Calculate cumulative profit/loss
  const cumulativeData = chartData.reduce((acc: any[], entry, index) => {
    const prevCumulative = index > 0 ? acc[index - 1].cumulativeProfit : 0;
    return [
      ...acc,
      {
        ...entry,
        cumulativeProfit: prevCumulative + entry.profit
      }
    ];
  }, []);

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Profit & Loss Over Time</CardTitle>
          <CardDescription className="text-muted-foreground">
            Daily and cumulative P&L (%)
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={timeFrame === "Daily" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFrame("Daily")}
          >
            Daily
          </Button>
          <Button
            variant={timeFrame === "Weekly" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFrame("Weekly")}
          >
            Weekly
          </Button>
          <Button
            variant={timeFrame === "Monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeFrame("Monthly")}
          >
            Monthly
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={cumulativeData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <XAxis
              dataKey="formattedDate"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border border-border p-3 rounded-md shadow-md">
                      <p className="text-sm text-foreground font-medium">
                        {payload[0].payload.formattedDate}
                      </p>
                      <p className="text-sm text-profit">
                        Daily: {payload[0].payload.profit.toFixed(2)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cumulative: {payload[0].payload.cumulativeProfit.toFixed(2)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#00d15b"
              dot={false}
              name="Daily P/L"
            />
            <Line
              type="monotone"
              dataKey="cumulativeProfit"
              stroke="#0088fe"
              strokeWidth={2}
              dot={false}
              name="Cumulative P/L"
              style={{
                filter: "drop-shadow( 0px 2px 4px rgba(0, 136, 254, 0.4))",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProfitLossChart;
