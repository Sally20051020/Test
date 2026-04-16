export interface OHLCDataPoint {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockQuote {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  timestamp: string;
}

export interface CompanyInfo {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: number;
  description: string;
  exchange: string;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export interface TechnicalIndicator {
  name: string;
  key: string;
  value: number | string;
  signal: 'bullish' | 'bearish' | 'neutral';
  description: string;
}

export interface IndicatorLineData {
  time: string;
  value: number;
}

export interface AnalysisResult {
  symbol: string;
  indicators: TechnicalIndicator[];
  summary: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  support: number;
  resistance: number;
  trend: string;
}
