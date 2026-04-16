import type { TradeCommand } from '@/types/trading';

// ─── Comprehensive stock data for trading (HK + US + Global) ──────
const STOCK_DATA: Record<string, { name: string; price: number; exchange: string }> = {
  // ══════ HKEX ══════
  '9988.HK': { name: 'Alibaba (HKEX)', price: 92.35, exchange: 'HKEX' },
  '0700.HK': { name: 'Tencent', price: 348.6, exchange: 'HKEX' },
  '0005.HK': { name: 'HSBC Holdings', price: 62.15, exchange: 'HKEX' },
  '9618.HK': { name: 'JD.com (HKEX)', price: 126.4, exchange: 'HKEX' },
  '2800.HK': { name: 'Tracker Fund HK', price: 19.82, exchange: 'HKEX' },
  '1299.HK': { name: 'AIA Group', price: 58.9, exchange: 'HKEX' },
  '0388.HK': { name: 'HKEX', price: 285.4, exchange: 'HKEX' },
  '3690.HK': { name: 'Meituan', price: 128.7, exchange: 'HKEX' },
  '1810.HK': { name: 'Xiaomi', price: 16.5, exchange: 'HKEX' },
  '2318.HK': { name: 'Ping An Insurance', price: 42.8, exchange: 'HKEX' },
  '0941.HK': { name: 'China Mobile', price: 72.3, exchange: 'HKEX' },
  '1024.HK': { name: 'Kuaishou', price: 55.6, exchange: 'HKEX' },
  '0001.HK': { name: 'CK Hutchison', price: 48.2, exchange: 'HKEX' },
  '0016.HK': { name: 'SHK Properties', price: 35.1, exchange: 'HKEX' },
  '1211.HK': { name: 'BYD Company', price: 232.0, exchange: 'HKEX' },
  '9999.HK': { name: 'NetEase (HKEX)', price: 118.5, exchange: 'HKEX' },
  '2382.HK': { name: 'Sunny Optical', price: 68.4, exchange: 'HKEX' },
  '9888.HK': { name: 'Baidu (HKEX)', price: 65.4, exchange: 'HKEX' },
  '2020.HK': { name: 'ANTA Sports', price: 28.1, exchange: 'HKEX' },
  '0027.HK': { name: 'Galaxy Entertainment', price: 8.45, exchange: 'HKEX' },
  '2269.HK': { name: 'WuXi Biologics', price: 32.7, exchange: 'HKEX' },
  '0175.HK': { name: 'Geely Auto', price: 5.12, exchange: 'HKEX' },
  '0003.HK': { name: 'HK & China Gas', price: 7.85, exchange: 'HKEX' },
  '0011.HK': { name: 'Hang Seng Bank', price: 138.5, exchange: 'HKEX' },
  '0066.HK': { name: 'MTR Corporation', price: 28.9, exchange: 'HKEX' },
  '6098.HK': { name: 'Country Garden Services', price: 21.3, exchange: 'HKEX' },
  '0002.HK': { name: 'CLP Holdings', price: 66.3, exchange: 'HKEX' },
  '0006.HK': { name: 'Power Assets', price: 49.8, exchange: 'HKEX' },
  '0012.HK': { name: 'Henderson Land', price: 22.5, exchange: 'HKEX' },
  '0017.HK': { name: 'New World Dev', price: 8.92, exchange: 'HKEX' },
  '0023.HK': { name: 'Bank of East Asia', price: 11.7, exchange: 'HKEX' },
  '0267.HK': { name: 'CITIC Pacific', price: 8.15, exchange: 'HKEX' },
  '0688.HK': { name: 'China Overseas Land', price: 18.6, exchange: 'HKEX' },
  '0883.HK': { name: 'CNOOC', price: 13.2, exchange: 'HKEX' },
  '0857.HK': { name: 'PetroChina', price: 5.45, exchange: 'HKEX' },
  '1398.HK': { name: 'ICBC', price: 4.32, exchange: 'HKEX' },
  '3988.HK': { name: 'Bank of China', price: 3.28, exchange: 'HKEX' },
  '0939.HK': { name: 'CCB', price: 5.18, exchange: 'HKEX' },
  '2628.HK': { name: 'China Life', price: 12.4, exchange: 'HKEX' },
  '1288.HK': { name: 'ABC', price: 3.15, exchange: 'HKEX' },
  '0968.HK': { name: 'Xinyi Solar', price: 6.82, exchange: 'HKEX' },
  '2007.HK': { name: 'Country Garden', price: 0.68, exchange: 'HKEX' },
  '6862.HK': { name: 'Haidilao', price: 16.8, exchange: 'HKEX' },
  '9961.HK': { name: 'Trip.com (HKEX)', price: 385.0, exchange: 'HKEX' },
  '9626.HK': { name: 'Bilibili (HKEX)', price: 105.5, exchange: 'HKEX' },

  // ══════ US — NYSE / NASDAQ ══════
  'AAPL': { name: 'Apple Inc.', price: 182.5, exchange: 'NASDAQ' },
  'MSFT': { name: 'Microsoft', price: 415.2, exchange: 'NASDAQ' },
  'GOOGL': { name: 'Alphabet (Google)', price: 175.8, exchange: 'NASDAQ' },
  'AMZN': { name: 'Amazon', price: 185.6, exchange: 'NASDAQ' },
  'NVDA': { name: 'NVIDIA', price: 875.3, exchange: 'NASDAQ' },
  'META': { name: 'Meta Platforms', price: 505.7, exchange: 'NASDAQ' },
  'TSLA': { name: 'Tesla Inc.', price: 175.4, exchange: 'NASDAQ' },
  'BRK-B': { name: 'Berkshire Hathaway B', price: 410.9, exchange: 'NYSE' },
  'JPM': { name: 'JPMorgan Chase', price: 198.2, exchange: 'NYSE' },
  'V': { name: 'Visa Inc.', price: 280.5, exchange: 'NYSE' },
  'JNJ': { name: 'Johnson & Johnson', price: 156.3, exchange: 'NYSE' },
  'WMT': { name: 'Walmart', price: 165.8, exchange: 'NYSE' },
  'PG': { name: 'Procter & Gamble', price: 162.4, exchange: 'NYSE' },
  'MA': { name: 'Mastercard', price: 460.1, exchange: 'NYSE' },
  'UNH': { name: 'UnitedHealth', price: 520.3, exchange: 'NYSE' },
  'HD': { name: 'Home Depot', price: 365.7, exchange: 'NYSE' },
  'DIS': { name: 'Walt Disney', price: 112.5, exchange: 'NYSE' },
  'NFLX': { name: 'Netflix', price: 620.8, exchange: 'NASDAQ' },
  'BABA': { name: 'Alibaba (NYSE)', price: 80.2, exchange: 'NYSE' },
  'NIO': { name: 'NIO Inc.', price: 5.85, exchange: 'NYSE' },
  'AMD': { name: 'AMD', price: 165.4, exchange: 'NASDAQ' },
  'INTC': { name: 'Intel', price: 32.5, exchange: 'NASDAQ' },
  'CRM': { name: 'Salesforce', price: 295.6, exchange: 'NYSE' },
  'PYPL': { name: 'PayPal', price: 62.3, exchange: 'NASDAQ' },
  'COIN': { name: 'Coinbase', price: 245.8, exchange: 'NASDAQ' },
  'UBER': { name: 'Uber', price: 78.4, exchange: 'NYSE' },
  'SQ': { name: 'Block (Square)', price: 82.1, exchange: 'NYSE' },
  'SNAP': { name: 'Snap Inc.', price: 11.2, exchange: 'NYSE' },
  'PLTR': { name: 'Palantir', price: 24.5, exchange: 'NYSE' },
  'RIVN': { name: 'Rivian', price: 12.8, exchange: 'NASDAQ' },
  'COST': { name: 'Costco', price: 725.4, exchange: 'NASDAQ' },
  'AVGO': { name: 'Broadcom', price: 1320.5, exchange: 'NASDAQ' },
  'ADBE': { name: 'Adobe', price: 485.3, exchange: 'NASDAQ' },
  'PEP': { name: 'PepsiCo', price: 172.8, exchange: 'NASDAQ' },
  'KO': { name: 'Coca-Cola', price: 62.1, exchange: 'NYSE' },
  'MCD': { name: "McDonald's", price: 295.6, exchange: 'NYSE' },
  'BA': { name: 'Boeing', price: 178.9, exchange: 'NYSE' },
  'GS': { name: 'Goldman Sachs', price: 425.3, exchange: 'NYSE' },
  'MS': { name: 'Morgan Stanley', price: 95.7, exchange: 'NYSE' },
  'T': { name: 'AT&T', price: 17.2, exchange: 'NYSE' },
  'XOM': { name: 'ExxonMobil', price: 108.5, exchange: 'NYSE' },
  'CVX': { name: 'Chevron', price: 155.2, exchange: 'NYSE' },
  'LLY': { name: 'Eli Lilly', price: 785.4, exchange: 'NYSE' },
  'ABBV': { name: 'AbbVie', price: 165.8, exchange: 'NYSE' },
  'PFE': { name: 'Pfizer', price: 27.3, exchange: 'NYSE' },
  'SHOP': { name: 'Shopify', price: 68.5, exchange: 'NYSE' },
  'SPOT': { name: 'Spotify', price: 285.6, exchange: 'NYSE' },
  'ZM': { name: 'Zoom Video', price: 68.2, exchange: 'NASDAQ' },
  'ABNB': { name: 'Airbnb', price: 152.3, exchange: 'NASDAQ' },
  'RBLX': { name: 'Roblox', price: 42.5, exchange: 'NYSE' },
  'SOFI': { name: 'SoFi Technologies', price: 8.45, exchange: 'NASDAQ' },
  'HOOD': { name: 'Robinhood', price: 12.3, exchange: 'NASDAQ' },
};

export function getStockPrice(symbol: string): number {
  const s = symbol.toUpperCase();
  const data = STOCK_DATA[s];
  if (data) {
    return +(data.price + (Math.random() - 0.5) * data.price * 0.005).toFixed(2);
  }
  return +(80 + Math.random() * 100).toFixed(2);
}

export function getStockName(symbol: string): string {
  return STOCK_DATA[symbol.toUpperCase()]?.name ?? symbol;
}

/** All tradeable symbols for the hot assets sidebar */
export function getAllStocks() {
  return Object.entries(STOCK_DATA).map(([symbol, data]) => ({
    symbol,
    name: data.name,
    price: data.price,
    exchange: data.exchange,
  }));
}

/**
 * Parse natural language trade command.
 * "Buy 100 9988.HK", "Sell 50 AAPL", "BUY TSLA 10"
 */
export function parseTradeCommand(text: string): TradeCommand | null {
  const patterns = [
    /^(buy|sell)\s+(\d+)\s+(?:shares?\s+(?:of\s+)?)?(\S+)$/i,
    /^(buy|sell)\s+(\S+)\s+(\d+)$/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const side = match[1].toUpperCase() as 'BUY' | 'SELL';
      const isFirstPattern = /^\d+$/.test(match[2]);
      const quantity = parseInt(isFirstPattern ? match[2] : match[3]);
      const symbol = (isFirstPattern ? match[3] : match[2]).toUpperCase();
      if (quantity > 0 && Number.isInteger(quantity) && symbol) return { side, symbol, quantity };
    }
  }
  return null;
}
