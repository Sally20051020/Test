import { useCallback } from 'react';
import { usePortfolioStore } from '@/stores/portfolioStore';
import type { TradeCommand } from '@/types/trading';

export function useTrading() {
  const { portfolio, trades, loading, loadPortfolio, loadTrades, submitTrade } = usePortfolioStore();

  const parseAndExecute = useCallback(
    async (text: string) => {
      const match = text.match(/^(buy|sell)\s+(\w+)\s+(\d+)$/i);
      if (!match) throw new Error('Invalid trade command. Use: BUY AAPL 10');
      const cmd: TradeCommand = {
        side: match[1].toUpperCase() as 'BUY' | 'SELL',
        symbol: match[2].toUpperCase(),
        quantity: parseInt(match[3]),
      };
      return submitTrade(cmd);
    },
    [submitTrade]
  );

  return { portfolio, trades, loading, loadPortfolio, loadTrades, parseAndExecute };
}
