import { API_BASE_URL } from './config';
import type { OHLCDataPoint, AnalysisResult, IndicatorLineData, StockQuote, CompanyInfo, StockSearchResult } from '@/types/analysis';

// ─── Mock base prices (HK + US + Global) ────────────────────────────
// Import stock data from trading service to keep both pages in sync
import { getAllStocks } from './tradingService';

const MOCK_BASE_PRICES: Record<string, number> = Object.fromEntries(
  getAllStocks().map(s => [s.symbol, s.price])
);

// ─── Stock Quote ────────────────────────────────────────────────────

export async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  // TODO: Replace with real backend call
  // const response = await fetch(`${API_BASE_URL}/api/quote/${symbol}`);
  // return response.json();
  //
  // Backend implementation (Python/FastAPI + yfinance):
  //   ticker = yf.Ticker(symbol)
  //   info = ticker.info
  //   return { currentPrice: info["regularMarketPrice"], ... }

  await new Promise((r) => setTimeout(r, 300));

  const base = MOCK_BASE_PRICES[symbol.toUpperCase()] ?? 100;
  const change = +(((Math.random() - 0.48) * base * 0.02)).toFixed(2);
  const currentPrice = +(base + change).toFixed(2);

  return {
    symbol: symbol.toUpperCase(),
    currentPrice,
    change,
    changePercent: +((change / base) * 100).toFixed(2),
    dayHigh: +(currentPrice + Math.random() * base * 0.015).toFixed(2),
    dayLow: +(currentPrice - Math.random() * base * 0.015).toFixed(2),
    volume: Math.floor(10_000_000 + Math.random() * 20_000_000),
    avgVolume: Math.floor(15_000_000 + Math.random() * 10_000_000),
    marketCap: Math.floor(base * 1_000_000_000 * (1 + Math.random())),
    peRatio: +(10 + Math.random() * 25).toFixed(1),
    dividendYield: +(Math.random() * 4).toFixed(2),
    timestamp: new Date().toISOString(),
  };
}

// ─── Company Info ───────────────────────────────────────────────────

const MOCK_COMPANIES: Record<string, Omit<CompanyInfo, 'symbol'>> = {
  // ── HKEX ──
  '9988.HK': { name: 'Alibaba Group Holding Ltd', sector: 'Technology', industry: 'Internet Retail', marketCap: 185_000_000_000, description: 'Alibaba Group operates e-commerce, cloud computing, and digital media businesses.', exchange: 'HKEX' },
  '0700.HK': { name: 'Tencent Holdings Ltd', sector: 'Technology', industry: 'Internet Content & Information', marketCap: 3_360_000_000_000, description: 'Tencent provides social media, gaming, fintech, and cloud services globally.', exchange: 'HKEX' },
  '0005.HK': { name: 'HSBC Holdings plc', sector: 'Financial Services', industry: 'Banks—Diversified', marketCap: 1_200_000_000_000, description: 'HSBC is one of the world\'s largest banking and financial services organisations.', exchange: 'HKEX' },
  '9618.HK': { name: 'JD.com Inc', sector: 'Technology', industry: 'Internet Retail', marketCap: 400_000_000_000, description: 'JD.com operates as a supply chain-based technology and service provider in China.', exchange: 'HKEX' },
  '0388.HK': { name: 'Hong Kong Exchanges and Clearing Ltd', sector: 'Financial Services', industry: 'Financial Data & Stock Exchanges', marketCap: 360_000_000_000, description: 'HKEX operates the stock exchange and futures exchange of Hong Kong.', exchange: 'HKEX' },
  '3690.HK': { name: 'Meituan', sector: 'Technology', industry: 'Internet Content & Information', marketCap: 780_000_000_000, description: 'Meituan operates an e-commerce platform for food delivery, hotel booking, and local services.', exchange: 'HKEX' },
  '1810.HK': { name: 'Xiaomi Corporation', sector: 'Technology', industry: 'Consumer Electronics', marketCap: 420_000_000_000, description: 'Xiaomi designs and sells smartphones, IoT products, and internet services.', exchange: 'HKEX' },
  '2318.HK': { name: 'Ping An Insurance', sector: 'Financial Services', industry: 'Insurance—Diversified', marketCap: 780_000_000_000, description: 'Ping An is one of China\'s largest financial services conglomerates.', exchange: 'HKEX' },
  '0941.HK': { name: 'China Mobile Ltd', sector: 'Communication Services', industry: 'Telecom Services', marketCap: 1_500_000_000_000, description: 'China Mobile is the world\'s largest mobile network operator by subscribers.', exchange: 'HKEX' },
  '1024.HK': { name: 'Kuaishou Technology', sector: 'Technology', industry: 'Internet Content & Information', marketCap: 230_000_000_000, description: 'Kuaishou operates a short video and live streaming platform in China.', exchange: 'HKEX' },
  '0001.HK': { name: 'CK Hutchison Holdings', sector: 'Industrials', industry: 'Conglomerates', marketCap: 180_000_000_000, description: 'CK Hutchison is a multinational conglomerate with businesses in ports, retail, infrastructure, and energy.', exchange: 'HKEX' },
  '1211.HK': { name: 'BYD Company Ltd', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', marketCap: 680_000_000_000, description: 'BYD manufactures electric vehicles, batteries, and renewable energy products.', exchange: 'HKEX' },
  '9999.HK': { name: 'NetEase Inc', sector: 'Technology', industry: 'Electronic Gaming & Multimedia', marketCap: 450_000_000_000, description: 'NetEase develops online games, music streaming, and e-commerce services.', exchange: 'HKEX' },
  '2382.HK': { name: 'Sunny Optical Technology', sector: 'Technology', industry: 'Electronic Components', marketCap: 160_000_000_000, description: 'Sunny Optical designs and manufactures optical components for smartphones and vehicles.', exchange: 'HKEX' },
  '9888.HK': { name: 'Baidu Inc', sector: 'Technology', industry: 'Internet Content & Information', marketCap: 320_000_000_000, description: 'Baidu operates China\'s largest search engine and is a leader in AI and autonomous driving.', exchange: 'HKEX' },
  '2020.HK': { name: 'ANTA Sports Products', sector: 'Consumer Cyclical', industry: 'Footwear & Accessories', marketCap: 280_000_000_000, description: 'ANTA is one of China\'s largest sportswear companies.', exchange: 'HKEX' },
  // ── US Markets ──
  'AAPL': { name: 'Apple Inc', sector: 'Technology', industry: 'Consumer Electronics', marketCap: 2_800_000_000_000, description: 'Apple designs iPhones, Macs, iPads, and services like the App Store and Apple Music.', exchange: 'NASDAQ' },
  'MSFT': { name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software—Infrastructure', marketCap: 3_100_000_000_000, description: 'Microsoft develops Windows, Azure cloud, Office 365, and gaming through Xbox.', exchange: 'NASDAQ' },
  'GOOGL': { name: 'Alphabet Inc', sector: 'Technology', industry: 'Internet Content & Information', marketCap: 2_200_000_000_000, description: 'Alphabet is the parent company of Google, YouTube, and Waymo.', exchange: 'NASDAQ' },
  'AMZN': { name: 'Amazon.com Inc', sector: 'Consumer Cyclical', industry: 'Internet Retail', marketCap: 1_900_000_000_000, description: 'Amazon operates the world\'s largest online marketplace and AWS cloud platform.', exchange: 'NASDAQ' },
  'NVDA': { name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors', marketCap: 2_200_000_000_000, description: 'NVIDIA designs GPUs for gaming, data centers, and AI applications.', exchange: 'NASDAQ' },
  'META': { name: 'Meta Platforms Inc', sector: 'Technology', industry: 'Internet Content & Information', marketCap: 1_300_000_000_000, description: 'Meta operates Facebook, Instagram, WhatsApp, and builds metaverse products.', exchange: 'NASDAQ' },
  'TSLA': { name: 'Tesla Inc', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', marketCap: 560_000_000_000, description: 'Tesla designs and manufactures electric vehicles, energy storage, and solar products.', exchange: 'NASDAQ' },
  'JPM': { name: 'JPMorgan Chase & Co', sector: 'Financial Services', industry: 'Banks—Diversified', marketCap: 570_000_000_000, description: 'JPMorgan Chase is the largest bank in the US by assets.', exchange: 'NYSE' },
  'V': { name: 'Visa Inc', sector: 'Financial Services', industry: 'Credit Services', marketCap: 580_000_000_000, description: 'Visa operates the world\'s largest electronic payments network.', exchange: 'NYSE' },
  'NFLX': { name: 'Netflix Inc', sector: 'Communication Services', industry: 'Entertainment', marketCap: 270_000_000_000, description: 'Netflix is the leading subscription streaming service for movies and TV series.', exchange: 'NASDAQ' },
  'DIS': { name: 'The Walt Disney Company', sector: 'Communication Services', industry: 'Entertainment', marketCap: 205_000_000_000, description: 'Disney operates theme parks, film studios, and the Disney+ streaming service.', exchange: 'NYSE' },
  'BABA': { name: 'Alibaba Group (ADR)', sector: 'Technology', industry: 'Internet Retail', marketCap: 185_000_000_000, description: 'Alibaba ADR listed on NYSE, same business as 9988.HK.', exchange: 'NYSE' },
  'NIO': { name: 'NIO Inc', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', marketCap: 10_000_000_000, description: 'NIO designs and sells smart electric vehicles in China.', exchange: 'NYSE' },
  'AMD': { name: 'Advanced Micro Devices', sector: 'Technology', industry: 'Semiconductors', marketCap: 270_000_000_000, description: 'AMD develops CPUs, GPUs, and data center processors.', exchange: 'NASDAQ' },
  'COIN': { name: 'Coinbase Global Inc', sector: 'Financial Services', industry: 'Financial Data & Stock Exchanges', marketCap: 62_000_000_000, description: 'Coinbase is the largest cryptocurrency exchange in the US.', exchange: 'NASDAQ' },
};

export async function fetchCompanyInfo(symbol: string): Promise<CompanyInfo> {
  // TODO: Replace with real backend call
  // const response = await fetch(`${API_BASE_URL}/api/info/${symbol}`);
  // return response.json();
  //
  // Backend: ticker = yf.Ticker(symbol); return ticker.info fields

  await new Promise((r) => setTimeout(r, 200));

  const s = symbol.toUpperCase();
  const info = MOCK_COMPANIES[s];
  if (info) return { symbol: s, ...info };

  return {
    symbol: s,
    name: s,
    sector: 'Unknown',
    industry: 'Unknown',
    marketCap: 0,
    description: `Company information for ${s} will be available when connected to backend.`,
    exchange: 'HKEX',
  };
}

// ─── Stock Search ───────────────────────────────────────────────────

const SEARCHABLE_STOCKS: StockSearchResult[] = [
  // ── HKEX ──
  { symbol: '9988.HK', name: 'Alibaba Group Holding Ltd', type: 'Equity', exchange: 'HKEX' },
  { symbol: '0700.HK', name: 'Tencent Holdings Ltd', type: 'Equity', exchange: 'HKEX' },
  { symbol: '0005.HK', name: 'HSBC Holdings plc', type: 'Equity', exchange: 'HKEX' },
  { symbol: '9618.HK', name: 'JD.com Inc', type: 'Equity', exchange: 'HKEX' },
  { symbol: '2800.HK', name: 'Tracker Fund of Hong Kong', type: 'ETF', exchange: 'HKEX' },
  { symbol: '1299.HK', name: 'AIA Group Ltd', type: 'Equity', exchange: 'HKEX' },
  { symbol: '0388.HK', name: 'Hong Kong Exchanges and Clearing', type: 'Equity', exchange: 'HKEX' },
  { symbol: '3690.HK', name: 'Meituan', type: 'Equity', exchange: 'HKEX' },
  { symbol: '1810.HK', name: 'Xiaomi Corporation', type: 'Equity', exchange: 'HKEX' },
  { symbol: '2318.HK', name: 'Ping An Insurance', type: 'Equity', exchange: 'HKEX' },
  { symbol: '0941.HK', name: 'China Mobile Ltd', type: 'Equity', exchange: 'HKEX' },
  { symbol: '1024.HK', name: 'Kuaishou Technology', type: 'Equity', exchange: 'HKEX' },
  { symbol: '0001.HK', name: 'CK Hutchison Holdings', type: 'Equity', exchange: 'HKEX' },
  { symbol: '0016.HK', name: 'Sun Hung Kai Properties', type: 'Equity', exchange: 'HKEX' },
  { symbol: '0027.HK', name: 'Galaxy Entertainment Group', type: 'Equity', exchange: 'HKEX' },
  { symbol: '2269.HK', name: 'WuXi Biologics', type: 'Equity', exchange: 'HKEX' },
  { symbol: '1211.HK', name: 'BYD Company Ltd', type: 'Equity', exchange: 'HKEX' },
  { symbol: '9999.HK', name: 'NetEase Inc', type: 'Equity', exchange: 'HKEX' },
  { symbol: '0175.HK', name: 'Geely Automobile Holdings', type: 'Equity', exchange: 'HKEX' },
  { symbol: '2382.HK', name: 'Sunny Optical Technology', type: 'Equity', exchange: 'HKEX' },
  { symbol: '0003.HK', name: 'CK Infrastructure Holdings', type: 'Equity', exchange: 'HKEX' },
  { symbol: '0011.HK', name: 'Hang Seng Bank Ltd', type: 'Equity', exchange: 'HKEX' },
  { symbol: '0066.HK', name: 'MTR Corporation', type: 'Equity', exchange: 'HKEX' },
  { symbol: '6098.HK', name: 'Country Garden Services', type: 'Equity', exchange: 'HKEX' },
  { symbol: '9888.HK', name: 'Baidu Inc', type: 'Equity', exchange: 'HKEX' },
  { symbol: '2020.HK', name: 'ANTA Sports Products', type: 'Equity', exchange: 'HKEX' },
  // ── US — NASDAQ / NYSE ──
  { symbol: 'AAPL', name: 'Apple Inc', type: 'Equity', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc (Google)', type: 'Equity', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc', type: 'Equity', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Equity', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc (Facebook)', type: 'Equity', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc', type: 'Equity', exchange: 'NASDAQ' },
  { symbol: 'BRK-B', name: 'Berkshire Hathaway Inc', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'WMT', name: 'Walmart Inc', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'PG', name: 'Procter & Gamble Co', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'MA', name: 'Mastercard Inc', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'HD', name: 'Home Depot Inc', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'DIS', name: 'The Walt Disney Company', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'NFLX', name: 'Netflix Inc', type: 'Equity', exchange: 'NASDAQ' },
  { symbol: 'BABA', name: 'Alibaba Group (ADR)', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'NIO', name: 'NIO Inc', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', type: 'Equity', exchange: 'NASDAQ' },
  { symbol: 'INTC', name: 'Intel Corporation', type: 'Equity', exchange: 'NASDAQ' },
  { symbol: 'CRM', name: 'Salesforce Inc', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc', type: 'Equity', exchange: 'NASDAQ' },
  { symbol: 'COIN', name: 'Coinbase Global Inc', type: 'Equity', exchange: 'NASDAQ' },
  { symbol: 'UBER', name: 'Uber Technologies Inc', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'SQ', name: 'Block Inc (Square)', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'SNAP', name: 'Snap Inc', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'PLTR', name: 'Palantir Technologies', type: 'Equity', exchange: 'NYSE' },
  { symbol: 'RIVN', name: 'Rivian Automotive', type: 'Equity', exchange: 'NASDAQ' },
];

export async function searchStock(keyword: string): Promise<StockSearchResult[]> {
  // TODO: Replace with real backend call
  // const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(keyword)}`);
  // const data = await response.json();
  // return data.results;
  //
  // Backend: use yfinance search or a pre-built symbol list

  await new Promise((r) => setTimeout(r, 150));

  const q = keyword.toLowerCase();
  return SEARCHABLE_STOCKS.filter(
    (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  ).slice(0, 10);
}

// ─── Stock History (OHLCV for candlestick chart) ────────────────────

function generateMockOHLC(symbol: string, days: number = 60): OHLCDataPoint[] {
  const data: OHLCDataPoint[] = [];
  const basePrice = MOCK_BASE_PRICES[symbol.toUpperCase()] ?? 100;
  let price = basePrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.48) * basePrice * 0.02;
    price = Math.max(price + change, basePrice * 0.7);
    const open = +(price + (Math.random() - 0.5) * 2).toFixed(2);
    const close = +price.toFixed(2);
    const high = +(Math.max(open, close) + Math.random() * basePrice * 0.015).toFixed(2);
    const low = +(Math.min(open, close) - Math.random() * basePrice * 0.015).toFixed(2);

    data.push({
      time: date.toISOString().slice(0, 10),
      open, high, low, close,
      volume: Math.floor(10_000_000 + Math.random() * 50_000_000),
    });
  }
  return data;
}

const PERIOD_DAYS: Record<string, number> = {
  '1d': 1, '5d': 5, '1mo': 30, '3mo': 90, '6mo': 180, '1y': 365, 'max': 730,
};

export async function fetchStockHistory(
  symbol: string,
  period: string = '1mo',
  interval: string = '1d'
): Promise<OHLCDataPoint[]> {
  // TODO: Replace with real backend call
  // const response = await fetch(
  //   `${API_BASE_URL}/api/history/${symbol}?period=${period}&interval=${interval}`
  // );
  // return response.json();

  await new Promise((r) => setTimeout(r, 500));
  const days = PERIOD_DAYS[period] ?? 30;
  return generateMockOHLC(symbol, days);
}

// ─── Indicator Calculations ─────────────────────────────────────────

function computeSMA(data: OHLCDataPoint[], period: number): IndicatorLineData[] {
  const result: IndicatorLineData[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((s, d) => s + d.close, 0);
    result.push({ time: data[i].time, value: +(sum / period).toFixed(2) });
  }
  return result;
}

function computeEMA(data: OHLCDataPoint[], period: number): IndicatorLineData[] {
  const result: IndicatorLineData[] = [];
  const multiplier = 2 / (period + 1);
  let ema = data.slice(0, period).reduce((s, d) => s + d.close, 0) / period;
  result.push({ time: data[period - 1].time, value: +ema.toFixed(2) });
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({ time: data[i].time, value: +ema.toFixed(2) });
  }
  return result;
}

function computeRSI(data: OHLCDataPoint[], period: number = 14): IndicatorLineData[] {
  const result: IndicatorLineData[] = [];
  const changes = data.map((d, i) => (i === 0 ? 0 : d.close - data[i - 1].close));
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    if (changes[i] > 0) avgGain += changes[i]; else avgLoss += Math.abs(changes[i]);
  }
  avgGain /= period; avgLoss /= period;
  for (let i = period; i < data.length; i++) {
    if (i > period) {
      avgGain = (avgGain * (period - 1) + (changes[i] > 0 ? changes[i] : 0)) / period;
      avgLoss = (avgLoss * (period - 1) + (changes[i] < 0 ? Math.abs(changes[i]) : 0)) / period;
    }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push({ time: data[i].time, value: +(100 - 100 / (1 + rs)).toFixed(2) });
  }
  return result;
}

export async function addIndicatorToChart(
  indicatorType: 'SMA' | 'EMA' | 'RSI',
  data: OHLCDataPoint[],
  period: number = 20
): Promise<IndicatorLineData[]> {
  // TODO: Replace with real backend call
  // const response = await fetch(`${API_BASE_URL}/api/indicators`, {
  //   method: 'POST', headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ indicatorType, period, symbol }),
  // });
  // return response.json();

  await new Promise((r) => setTimeout(r, 200));
  switch (indicatorType) {
    case 'SMA': return computeSMA(data, period);
    case 'EMA': return computeEMA(data, period);
    case 'RSI': return computeRSI(data, period);
    default: return [];
  }
}

export async function fetchTechnicalAnalysis(
  symbol: string,
  period: string = '1mo',
  t?: (key: string) => string
): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 700));

  const days = PERIOD_DAYS[period] ?? 30;
  
  const periodLabelMap: Record<string, string> = {
    '1d': t?.('period1D') ?? '1 Day',
    '5d': t?.('period1W') ?? '1 Week',
    '1mo': t?.('period1M') ?? '1 Month',
    '3mo': t?.('period3M') ?? '3 Months',
    '6mo': t?.('period6M') ?? '6 Months',
    '1y': t?.('period1Y') ?? '1 Year',
    'max': t?.('periodMax') ?? 'Max',
  };
  const periodLabel = periodLabelMap[period] ?? period;

  const data = generateMockOHLC(symbol, days);
  const lastPrice = data[data.length - 1]?.close ?? 90;
  const rsiValues = computeRSI(generateMockOHLC(symbol, Math.max(days, 30)));
  const currentRSI = rsiValues.length > 0 ? rsiValues[rsiValues.length - 1].value : 50;

  const rsiStatus = currentRSI < 30
    ? (t?.('analysisOversold') ?? 'oversold')
    : currentRSI > 70
    ? (t?.('analysisOverbought') ?? 'overbought')
    : (t?.('analysisNeutral') ?? 'neutral');

  const momentum = Math.random() > 0.5
    ? (t?.('analysisUpward') ?? 'upward')
    : (t?.('analysisConsolidating') ?? 'consolidating');

  const volumeStatus = Math.random() > 0.5
    ? (t?.('analysisIncreasing') ?? 'increasing')
    : (t?.('analysisStable') ?? 'stable');

  const tradingAt = t?.('analysisTradingAt') ?? 'Trading at';
  const rsiLabel = t?.('analysisRSI') ?? 'RSI(14) at';
  const smaLabel = t?.('analysisSMASuggests') ?? '20-day SMA suggests';
  const momentumLabel = t?.('analysisMomentum') ?? 'momentum';
  const volumeLabel = t?.('analysisVolume') ?? 'Volume';
  const periodLabelText = t?.('analysisPeriodLabel') ?? 'Analysis period';

  const summary = `${symbol} (${periodLabel}): ${tradingAt} HK$${lastPrice.toFixed(2)}. ${rsiLabel} ${currentRSI} (${rsiStatus}). ${smaLabel}${momentum}${momentumLabel}. ${volumeLabel} ${volumeStatus}. ${periodLabelText}: ${periodLabel}.`;

  const rsiDesc = `${t?.('analysisRSIAt') ?? 'RSI at'} ${currentRSI} — ${currentRSI < 30 ? (t?.('analysisOversold') ?? 'oversold') : currentRSI > 70 ? (t?.('analysisOverbought') ?? 'overbought') : (t?.('analysisNeutralTerritory') ?? 'neutral territory')}. ${periodLabelText}: ${periodLabel}.`;

  return {
    symbol,
    recommendation: currentRSI < 40 ? 'BUY' : currentRSI > 65 ? 'SELL' : 'HOLD',
    confidence: Math.floor(55 + Math.random() * 30),
    summary,
    support: +(lastPrice * 0.95).toFixed(2),
    resistance: +(lastPrice * 1.06).toFixed(2),
    trend: Math.random() > 0.5 ? 'Bullish' : 'Neutral',
    indicators: [
      { name: 'RSI (14)', key: 'rsi', value: currentRSI, signal: currentRSI < 40 ? 'bullish' : currentRSI > 65 ? 'bearish' : 'neutral', description: rsiDesc },
      { name: 'SMA (20)', key: 'sma20', value: `HK$${(lastPrice * (0.97 + Math.random() * 0.06)).toFixed(2)}`, signal: 'neutral', description: `${t?.('analysisPriceNearSMA') ?? 'Price near the 20-day SMA. Based on'} ${periodLabel} ${t?.('analysisData') ?? 'data'}.` },
      { name: 'EMA (12)', key: 'ema12', value: `HK$${(lastPrice * (0.98 + Math.random() * 0.04)).toFixed(2)}`, signal: 'bullish', description: t?.('analysisEMATrending') ?? 'Short-term EMA trending upward.' },
      { name: 'Volume', key: 'vol', value: '+8.3%', signal: 'bullish', description: t?.('analysisVolumeAbove') ?? 'Above-average volume on recent trading days.' },
    ],
  };
}
