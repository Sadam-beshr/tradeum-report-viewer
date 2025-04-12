
import { toast } from "@/components/ui/sonner";

export interface TradeData {
  symbol: string;
  type: string;
  buy_price: number;
  sell_price: number;
  profit_loss: string;
  profit_loss_dolar: string | number;
  status: string;
  statuscoin: number;
  date_time: string;
  usdt_value: number;
}

export interface TradeResponse {
  success: boolean;
  status: number;
  data: TradeData[];
}

export const fetchTradeData = async (startDate: string, endDate: string): Promise<TradeData[]> => {
  try {
    const apiKey = 'MAHMUDwhalesplash4152637394';
    const url = `https://bot.tradeum.ai/api/v1/getallreport?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data: TradeResponse = await response.json();
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching trade data:', error);
    toast.error('Failed to load trading data');
    return [];
  }
};

export const calculateTradeMetrics = (trades: TradeData[]) => {
  if (!trades.length) {
    return {
      totalTrades: 0,
      winTrades: 0,
      lossTrades: 0,
      winRate: 0,
      totalProfit: 0,
      profitPercent: "0%",
      avgTradeDuration: "0h 0m",
      winningSymbols: [],
      losingSymbols: [],
    };
  }

  const winTrades = trades.filter(trade => trade.status === "Win Trade").length;
  const lossTrades = trades.filter(trade => trade.status === "Loss Trade").length;
  const winRate = (winTrades / trades.length) * 100;
  
  const totalProfitLoss = trades.reduce((acc, trade) => {
    const profitValue = typeof trade.profit_loss_dolar === 'string' 
      ? parseFloat(trade.profit_loss_dolar.replace(/[^-.\d]/g, '')) 
      : trade.profit_loss_dolar;
    return acc + profitValue;
  }, 0);

  // Group trades by symbol and calculate profit/loss for each
  const symbolProfits = trades.reduce((acc: Record<string, number>, trade) => {
    const symbol = trade.symbol;
    const profitValue = typeof trade.profit_loss_dolar === 'string'
      ? parseFloat(trade.profit_loss_dolar.replace(/[^-.\d]/g, ''))
      : trade.profit_loss_dolar;
      
    if (!acc[symbol]) acc[symbol] = 0;
    acc[symbol] += profitValue;
    return acc;
  }, {});
  
  const symbols = Object.entries(symbolProfits).sort((a, b) => b[1] - a[1]);
  const winningSymbols = symbols.filter(([_, profit]) => profit > 0).slice(0, 5);
  const losingSymbols = symbols.filter(([_, profit]) => profit < 0).sort((a, b) => a[1] - b[1]).slice(0, 5);

  return {
    totalTrades: trades.length,
    winTrades,
    lossTrades,
    winRate,
    totalProfit: totalProfitLoss,
    profitPercent: (totalProfitLoss > 0 ? "+" : "") + totalProfitLoss.toFixed(2) + "%",
    avgTradeDuration: "7h 38m", // This would normally be calculated from actual trade durations
    winningSymbols,
    losingSymbols,
  };
};
