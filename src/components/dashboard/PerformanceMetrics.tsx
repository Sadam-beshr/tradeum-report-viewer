
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradeData } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parse, isValid } from 'date-fns';
import { ar } from 'date-fns/locale';

interface PerformanceMetricsProps {
  trades: TradeData[];
}

const PerformanceMetrics = ({ trades }: PerformanceMetricsProps) => {
  // Group trades by month
  const groupTradesByMonth = () => {
    const groupedTrades: Record<string, TradeData[]> = {};
    
    trades.forEach(trade => {
      try {
        const date = new Date(trade.date_time);
        if (!isValid(date)) throw new Error('Invalid date');
        
        const monthKey = format(date, 'yyyy-MM');
        if (!groupedTrades[monthKey]) {
          groupedTrades[monthKey] = [];
        }
        
        groupedTrades[monthKey].push(trade);
      } catch (error) {
        console.error(`Error parsing date: ${trade.date_time}`, error);
      }
    });
    
    return groupedTrades;
  };

  const monthlyTrades = groupTradesByMonth();

  // Calculate monthly metrics
  const monthlyMetrics = Object.entries(monthlyTrades).map(([monthKey, monthTrades]) => {
    const winTrades = monthTrades.filter(t => t.status === "Win Trade");
    const lossTrades = monthTrades.filter(t => t.status === "Loss Trade");
    
    const winPercentage = (winTrades.length / monthTrades.length) * 100;
    const lossPercentage = (lossTrades.length / monthTrades.length) * 100;
    
    const netProfit = monthTrades.reduce((sum, trade) => {
      const profitValue = typeof trade.profit_loss_dolar === 'string'
        ? parseFloat(trade.profit_loss_dolar.replace(/[^-.\d]/g, ''))
        : trade.profit_loss_dolar;
      return sum + profitValue;
    }, 0);
    
    const profitPercentage = (netProfit / monthTrades.length);
    
    const [year, month] = monthKey.split('-');
    const monthDate = new Date(parseInt(year), parseInt(month) - 1);
    
    return {
      month: format(monthDate, 'MMM', { locale: ar }),
      totalTrades: monthTrades.length,
      winning: winTrades.length,
      winningPercentage: winPercentage.toFixed(2),
      losing: lossTrades.length,
      losingPercentage: lossPercentage.toFixed(2),
      netProfit: netProfit.toFixed(2),
      profitPercentage: profitPercentage.toFixed(2),
    };
  }).sort((a, b) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(a.month) - months.indexOf(b.month);
  });

  // Calculate totals
  const totalTrades = trades.length;
  const totalWinTrades = trades.filter(t => t.status === "Win Trade").length;
  const totalLossTrades = trades.filter(t => t.status === "Loss Trade").length;
  const totalWinPercentage = (totalWinTrades / totalTrades) * 100;
  const totalLossPercentage = (totalLossTrades / totalTrades) * 100;
  
  const totalNetProfit = trades.reduce((sum, trade) => {
    const profitValue = typeof trade.profit_loss_dolar === 'string'
      ? parseFloat(trade.profit_loss_dolar.replace(/[^-.\d]/g, ''))
      : trade.profit_loss_dolar;
    return sum + profitValue;
  }, 0);
  
  const totalProfitPercentage = (totalNetProfit / totalTrades);

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Monthly Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Month</TableHead>
              <TableHead className="text-center">Total Trades</TableHead>
              <TableHead className="text-center">Winning</TableHead>
              <TableHead className="text-center">Losing</TableHead>
              <TableHead className="text-center">Profit %</TableHead>
              <TableHead className="text-center">Loss %</TableHead>
              <TableHead className="text-right">Net Profit</TableHead>
              <TableHead className="text-right">Profit %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyMetrics.map((metric) => (
              <TableRow key={metric.month}>
                <TableCell className="font-medium">{metric.month}</TableCell>
                <TableCell className="text-center">{metric.totalTrades}</TableCell>
                <TableCell className="text-center text-profit">
                  {metric.winning} ({metric.winningPercentage}%)
                </TableCell>
                <TableCell className="text-center text-loss">
                  {metric.losing} ({metric.losingPercentage}%)
                </TableCell>
                <TableCell className="text-center text-profit">{metric.winningPercentage}%</TableCell>
                <TableCell className="text-center text-loss">{metric.losingPercentage}%</TableCell>
                <TableCell className={`text-right ${parseFloat(metric.netProfit) >= 0 ? 'text-profit' : 'text-loss'}`}>
                  ${Math.abs(parseFloat(metric.netProfit)).toFixed(2)}
                </TableCell>
                <TableCell className={`text-right ${parseFloat(metric.profitPercentage) >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {parseFloat(metric.profitPercentage) >= 0 ? '+' : '-'}{Math.abs(parseFloat(metric.profitPercentage)).toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
            
            {/* Total row */}
            <TableRow className="bg-muted/30 font-medium">
              <TableCell>All Time</TableCell>
              <TableCell className="text-center">{totalTrades}</TableCell>
              <TableCell className="text-center text-profit">
                {totalWinTrades} ({totalWinPercentage.toFixed(2)}%)
              </TableCell>
              <TableCell className="text-center text-loss">
                {totalLossTrades} ({totalLossPercentage.toFixed(2)}%)
              </TableCell>
              <TableCell className="text-center text-profit">{totalWinPercentage.toFixed(2)}%</TableCell>
              <TableCell className="text-center text-loss">{totalLossPercentage.toFixed(2)}%</TableCell>
              <TableCell className={`text-right ${totalNetProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                ${Math.abs(totalNetProfit).toFixed(2)}
              </TableCell>
              <TableCell className={`text-right ${totalProfitPercentage >= 0 ? 'text-profit' : 'text-loss'}`}>
                {totalProfitPercentage >= 0 ? '+' : '-'}{Math.abs(totalProfitPercentage).toFixed(2)}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
