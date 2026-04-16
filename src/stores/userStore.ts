import { create } from 'zustand';
import type { Language } from '@/i18n/translations';

interface UserState {
  isAuthenticated: boolean;
  userId: string | null;
  username: string;
  language: Language;
  cashBalance: number;
  login: (email: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
  setLanguage: (lang: Language) => void;
  updateCashBalance: (amount: number) => void;
}

const INITIAL_CASH = 50000;

export const useUserStore = create<UserState>((set) => {
  const stored = localStorage.getItem('robo_user');
  const parsed = stored ? JSON.parse(stored) : null;
  const savedLang = (localStorage.getItem('robo_lang') as Language) || 'en';

  return {
    isAuthenticated: !!parsed,
    userId: parsed?.userId ?? null,
    username: parsed?.username ?? 'Guest',
    language: savedLang,
    cashBalance: parsed?.cashBalance ?? INITIAL_CASH,

    login: (email: string) => {
      const userId = `user_${Date.now()}`;
      const username = email.split('@')[0];
      const state = { userId, username, cashBalance: INITIAL_CASH };
      localStorage.setItem('robo_user', JSON.stringify(state));
      set({ isAuthenticated: true, userId, username, cashBalance: INITIAL_CASH });
    },

    loginAsGuest: () => {
      const userId = `guest_${Date.now()}`;
      const state = { userId, username: 'Guest', cashBalance: INITIAL_CASH };
      localStorage.setItem('robo_user', JSON.stringify(state));
      set({ isAuthenticated: true, userId, username: 'Guest', cashBalance: INITIAL_CASH });
    },

    logout: () => {
      localStorage.removeItem('robo_user');
      set({ isAuthenticated: false, userId: null, username: 'Guest', cashBalance: INITIAL_CASH });
    },

    setLanguage: (lang: Language) => {
      localStorage.setItem('robo_lang', lang);
      set({ language: lang });
    },

    updateCashBalance: (amount: number) =>
      set((s) => {
        const newBalance = s.cashBalance + amount;
        const stored = localStorage.getItem('robo_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.cashBalance = newBalance;
          localStorage.setItem('robo_user', JSON.stringify(parsed));
        }
        return { cashBalance: newBalance };
      }),
  };
});
