import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Portfolio, Trade, TradeCommand, Position } from '@/types/trading';
import { getStockPrice } from '@/services/tradingService';

const INITIAL_CASH = 50000;

interface PortfolioState {
  portfolio: Portfolio;
  trades: Trade[];
  loading: boolean;
  loadPortfolio: () => void;
  loadTrades: () => void;
  submitTrade: (cmd: TradeCommand) => Trade;
  resetPortfolio: () => void;
  tickPrices: () => void;
}

const defaultPortfolio: Portfolio = {
  cashBalance: INITIAL_CASH,
  totalValue: INITIAL_CASH,
  positions: [],
  dailyPnl: 0,
  dailyPnlPercent: 0,
};

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      portfolio: { ...defaultPortfolio },
      trades: [],
      loading: false,

      loadPortfolio: () => { /* loaded from persistence */ },
      loadTrades: () => { /* loaded from persistence */ },

      submitTrade: (cmd) => {
        const price = getStockPrice(cmd.symbol);
        const trade: Trade = {
          id: `t${Date.now()}`,
          symbol: cmd.symbol.toUpperCase(),
          side: cmd.side,
          quantity: cmd.quantity,
          price,
          timestamp: new Date(),
          status: 'FILLED',
        };

        const { portfolio } = get();
        const existing = portfolio.positions.find((p) => p.symbol === trade.symbol);
        let newPositions: Position[];

        if (cmd.side === 'BUY') {
          if (existing) {
            const totalQty = existing.quantity + cmd.quantity;
            const newAvg = (existing.avgCost * existing.quantity + trade.price * cmd.quantity) / totalQty;
            newPositions = portfolio.positions.map((p) =>
              p.symbol === trade.symbol
                ? { ...p, quantity: totalQty, avgCost: +newAvg.toFixed(2), currentPrice: trade.price, pnl: +((trade.price - newAvg) * totalQty).toFixed(2), pnlPercent: +((trade.price - newAvg) / newAvg * 100).toFixed(2) }
                : p
            );
          } else {
            newPositions = [...portfolio.positions, {
              symbol: trade.symbol,
              name: trade.symbol,
              quantity: cmd.quantity,
              avgCost: trade.price,
              currentPrice: trade.price,
              pnl: 0,
              pnlPercent: 0,
            }];
          }
          const newCash = portfolio.cashBalance - trade.price * cmd.quantity;
          const totalValue = newCash + newPositions.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
          set((s) => ({
            trades: [trade, ...s.trades],
            portfolio: { ...portfolio, positions: newPositions, cashBalance: +newCash.toFixed(2), totalValue: +totalValue.toFixed(2) },
          }));
        } else {
          // SELL
          if (existing && existing.quantity >= cmd.quantity) {
            const newQty = existing.quantity - cmd.quantity;
            newPositions = newQty > 0
              ? portfolio.positions.map((p) => p.symbol === trade.symbol ? { ...p, quantity: newQty } : p)
              : portfolio.positions.filter((p) => p.symbol !== trade.symbol);
            const newCash = portfolio.cashBalance + trade.price * cmd.quantity;
            const totalValue = newCash + newPositions.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
            set((s) => ({
              trades: [trade, ...s.trades],
              portfolio: { ...portfolio, positions: newPositions, cashBalance: +newCash.toFixed(2), totalValue: +totalValue.toFixed(2) },
            }));
          }
        }
        return trade;
      },

      resetPortfolio: () => {
        set({
          portfolio: { ...defaultPortfolio },
          trades: [],
        });
      },

      tickPrices: () => {
        const { portfolio } = get();
        if (portfolio.positions.length === 0) return;
        const newPositions = portfolio.positions.map((p) => {
          const change = (Math.random() - 0.48) * p.currentPrice * 0.005;
          const newPrice = +(p.currentPrice + change).toFixed(2);
          const pnl = +((newPrice - p.avgCost) * p.quantity).toFixed(2);
          const pnlPercent = +((newPrice - p.avgCost) / p.avgCost * 100).toFixed(2);
          return { ...p, currentPrice: newPrice, pnl, pnlPercent };
        });
        const totalValue = portfolio.cashBalance + newPositions.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
        const dailyPnl = newPositions.reduce((s, p) => s + p.pnl, 0);
        const dailyPnlPercent = totalValue > 0 ? +((dailyPnl / totalValue) * 100).toFixed(2) : 0;
        set({ portfolio: { ...portfolio, positions: newPositions, totalValue: +totalValue.toFixed(2), dailyPnl: +dailyPnl.toFixed(2), dailyPnlPercent } });
      },
    }),
    {
      name: 'robo-portfolio',
      partialize: (state) => ({ portfolio: state.portfolio, trades: state.trades }),
      // Dates come back as strings from JSON — rehydrate
      onRehydrateStorage: () => (state) => {
        if (state?.trades) {
          state.trades = state.trades.map((t) => ({ ...t, timestamp: new Date(t.timestamp) }));
        }
      },
    }
  )
);
