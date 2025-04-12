
import { useState } from "react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { TradeData } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TradesTableProps {
  trades: TradeData[];
}

type SortField = 'date_time' | 'symbol' | 'type' | 'buy_price' | 'sell_price' | 'profit_loss_dolar' | 'usdt_value';
type SortDirection = 'asc' | 'desc';

const TradesTable = ({ trades }: TradesTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('date_time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort trades
  const filteredAndSortedTrades = [...trades]
    .filter(trade => 
      trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date_time':
          comparison = new Date(a.date_time).getTime() - new Date(b.date_time).getTime();
          break;
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'buy_price':
          comparison = a.buy_price - b.buy_price;
          break;
        case 'sell_price':
          comparison = a.sell_price - b.sell_price;
          break;
        case 'profit_loss_dolar':
          const aProfit = typeof a.profit_loss_dolar === 'string' 
            ? parseFloat(a.profit_loss_dolar.replace(/[^-.\d]/g, '')) 
            : a.profit_loss_dolar;
          const bProfit = typeof b.profit_loss_dolar === 'string' 
            ? parseFloat(b.profit_loss_dolar.replace(/[^-.\d]/g, '')) 
            : b.profit_loss_dolar;
          comparison = aProfit - bProfit;
          break;
        case 'usdt_value':
          comparison = a.usdt_value - b.usdt_value;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTrades.length / rowsPerPage);
  const paginatedTrades = filteredAndSortedTrades.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trade History</CardTitle>
        <div className="flex items-center space-x-2">
          <Input 
            placeholder="Search symbols, types..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSearchTerm("")}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm("Scalping")}>
                Scalping
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm("Win Trade")}>
                Win Trades
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchTerm("Loss Trade")}>
                Loss Trades
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('date_time')} className="cursor-pointer">
                Date/Time {sortField === 'date_time' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
              </TableHead>
              <TableHead onClick={() => handleSort('symbol')} className="cursor-pointer">
                Symbol {sortField === 'symbol' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
              </TableHead>
              <TableHead onClick={() => handleSort('type')} className="cursor-pointer">
                Type {sortField === 'type' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
              </TableHead>
              <TableHead onClick={() => handleSort('buy_price')} className="cursor-pointer">
                Buy Price {sortField === 'buy_price' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
              </TableHead>
              <TableHead onClick={() => handleSort('sell_price')} className="cursor-pointer">
                Sell Price {sortField === 'sell_price' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
              </TableHead>
              <TableHead onClick={() => handleSort('profit_loss_dolar')} className="cursor-pointer">
                P/L $ {sortField === 'profit_loss_dolar' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
              </TableHead>
              <TableHead onClick={() => handleSort('profit_loss_dolar')} className="cursor-pointer">
                P/L % {sortField === 'profit_loss_dolar' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
              </TableHead>
              <TableHead onClick={() => handleSort('usdt_value')} className="cursor-pointer">
                Value (USDT) {sortField === 'usdt_value' && <ArrowUpDown className="inline h-4 w-4 ml-1" />}
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTrades.length > 0 ? (
              paginatedTrades.map((trade, index) => {
                const isProfit = trade.status === "Win Trade";
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {format(new Date(trade.date_time), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell>{trade.type}</TableCell>
                    <TableCell>{trade.buy_price}</TableCell>
                    <TableCell>{trade.sell_price}</TableCell>
                    <TableCell 
                      className={isProfit ? "text-profit font-medium" : "text-loss font-medium"}
                    >
                      {typeof trade.profit_loss_dolar === 'string' 
                        ? trade.profit_loss_dolar 
                        : trade.profit_loss_dolar.toFixed(2)}
                    </TableCell>
                    <TableCell 
                      className={isProfit ? "text-profit font-medium" : "text-loss font-medium"}
                    >
                      {trade.profit_loss}
                    </TableCell>
                    <TableCell>{trade.usdt_value}</TableCell>
                    <TableCell>
                      <span 
                        className={`inline-block px-2 py-1 rounded text-xs font-medium
                          ${isProfit 
                            ? "bg-profit/10 text-profit" 
                            : "bg-loss/10 text-loss"
                          }`
                        }
                      >
                        {trade.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No trades found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradesTable;
