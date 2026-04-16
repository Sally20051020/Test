export interface Position {
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: Date;
  status: 'FILLED' | 'PENDING' | 'CANCELLED';
}

export interface Portfolio {
  cashBalance: number;
  totalValue: number;
  positions: Position[];
  dailyPnl: number;
  dailyPnlPercent: number;
}

export interface TradeCommand {
  side: 'BUY' | 'SELL';
  symbol: string;
  quantity: number;
}

export interface TaskItem {
  id: string;
  label: string;
  completed: boolean;
  level: number;
  reward: number;
}
