import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePortfolioStore } from './portfolioStore';
import { toast } from '@/hooks/use-toast';
import { translations } from '@/i18n/translations';
import type { Language } from '@/i18n/translations';

export interface Achievement {
  id: string;
  level: number;
  labelKey: string;
  labelEn: string;
  labelZh: string;
  reward: number;
  completed: boolean;
  rewardClaimed: boolean;
  completedAt: string | null;
}

interface TaskState {
  achievements: Achievement[];
  checkAndAwardTasks: () => void;
  resetAchievements: () => void;
}

const INITIAL_CASH = 50000;

const defaultAchievements: Achievement[] = [
  {
    id: 'first_buy',
    level: 1,
    labelKey: 'taskFirstBuy',
    labelEn: 'Complete your first BUY trade',
    labelZh: '完成第一筆買入交易',
    reward: 5000,
    completed: false,
    rewardClaimed: false,
    completedAt: null,
  },
  {
    id: 'hold_3_days',
    level: 2,
    labelKey: 'taskHold3Days',
    labelEn: 'Hold any stock for more than 3 days',
    labelZh: '持有任意股票超過 3 天',
    reward: 10000,
    completed: false,
    rewardClaimed: false,
    completedAt: null,
  },
  {
    id: 'growth_10',
    level: 3,
    labelKey: 'taskGrowth10',
    labelEn: 'Grow total assets by 10% above initial capital',
    labelZh: '總資產相比初始資金增長超過 10%',
    reward: 15000,
    completed: false,
    rewardClaimed: false,
    completedAt: null,
  },
];

function getLang(): Language {
  return (localStorage.getItem('robo_lang') as Language) || 'en';
}

function tt(key: string): string {
  const lang = getLang();
  return (translations[lang] as Record<string, string>)[key] ?? key;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      achievements: defaultAchievements.map((a) => ({ ...a })),

      checkAndAwardTasks: () => {
        const portfolioStore = usePortfolioStore.getState();
        const { portfolio, trades } = portfolioStore;
        const { achievements } = get();
        const now = new Date().toISOString();
        let cashRewardTotal = 0;
        const toastMessages: string[] = [];

        const updated = achievements.map((a) => {
          if (a.completed && a.rewardClaimed) return a;

          let justCompleted = a.completed;

          if (a.id === 'first_buy' && !a.completed) {
            const hasBuy = trades.some((t) => t.side === 'BUY');
            if (hasBuy) justCompleted = true;
          }

          if (a.id === 'hold_3_days' && !a.completed) {
            const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
            const hasOldBuy = trades.some(
              (t) => t.side === 'BUY' && new Date(t.timestamp).getTime() < threeDaysAgo
            );
            if (hasOldBuy) {
              const oldBuySymbols = trades
                .filter((t) => t.side === 'BUY' && new Date(t.timestamp).getTime() < threeDaysAgo)
                .map((t) => t.symbol);
              const stillHolding = portfolio.positions.some(
                (p) => p.quantity > 0 && oldBuySymbols.includes(p.symbol)
              );
              if (stillHolding) justCompleted = true;
            }
          }

          if (a.id === 'growth_10' && !a.completed) {
            if (portfolio.totalValue > INITIAL_CASH * 1.1) {
              justCompleted = true;
            }
          }

          if (justCompleted && !a.rewardClaimed) {
            cashRewardTotal += a.reward;
            const levelLabel = a.level === 1 ? tt('beginner') : a.level === 2 ? tt('trader') : tt('analyst');
            toastMessages.push(
              `🎉 ${tt('taskCompletedMsg')}【${levelLabel}】${tt('taskReward')} +${a.reward.toLocaleString()} HKD！`
            );
            return { ...a, completed: true, rewardClaimed: true, completedAt: a.completedAt ?? now };
          }

          return a;
        });

        const changed = updated.some((a, i) => a.completed !== achievements[i].completed || a.rewardClaimed !== achievements[i].rewardClaimed);
        if (changed) {
          set({ achievements: updated });

          if (cashRewardTotal > 0) {
            const ps = usePortfolioStore.getState();
            const newCash = ps.portfolio.cashBalance + cashRewardTotal;
            const newTotal = newCash + ps.portfolio.positions.reduce((s, p) => s + p.currentPrice * p.quantity, 0);
            usePortfolioStore.setState({
              portfolio: { ...ps.portfolio, cashBalance: +newCash.toFixed(2), totalValue: +newTotal.toFixed(2) },
            });
          }

          toastMessages.forEach((msg) => {
            toast({ title: tt('taskCompleted'), description: msg });
          });
        }
      },

      resetAchievements: () => {
        set({ achievements: defaultAchievements.map((a) => ({ ...a })) });
      },
    }),
    {
      name: 'robo-achievements',
      partialize: (state) => ({ achievements: state.achievements }),
    }
  )
);
