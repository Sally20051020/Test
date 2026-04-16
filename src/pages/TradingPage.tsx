import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, RotateCcw, ArrowUpRight, ArrowDownRight,
  Loader2, Clock, Wallet, PieChart, BarChart3, ChevronDown, ChevronUp, Search,
  CheckCircle2, Circle, Trophy, Menu, X,
} from 'lucide-react';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useTaskStore } from '@/stores/taskStore';
import { getStockName, getStockPrice, getAllStocks } from '@/services/tradingService';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/toaster';
import { useTranslation } from '@/hooks/useTranslation';

const HOT_ASSETS_COUNT = 20;

const TradingPage = () => {
  const { portfolio, trades, submitTrade, resetPortfolio, tickPrices } = usePortfolioStore();
  const { achievements, checkAndAwardTasks, resetAchievements } = useTaskStore();
  const { t, language } = useTranslation();

  const [selectedSymbol, setSelectedSymbol] = useState('9988.HK');
  const [quantity, setQuantity] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [assetSearch, setAssetSearch] = useState('');
  const [mobilePanel, setMobilePanel] = useState<'assets' | 'trade' | null>(null);

  useEffect(() => {
    const id = setInterval(tickPrices, 3000);
    return () => clearInterval(id);
  }, [tickPrices]);

  useEffect(() => {
    checkAndAwardTasks();
  }, [trades.length, portfolio.totalValue, portfolio.positions.length]);

  const allStocks = useMemo(() => getAllStocks(), []);
  const [hotPrices, setHotPrices] = useState<Record<string, { price: number; change: number }>>(
    () => {
      const m: Record<string, { price: number; change: number }> = {};
      allStocks.forEach((s) => {
        const p = getStockPrice(s.symbol);
        m[s.symbol] = { price: p, change: +((p - s.price) / s.price * 100).toFixed(2) };
      });
      return m;
    }
  );

  useEffect(() => {
    const id = setInterval(() => {
      setHotPrices((prev) => {
        const next = { ...prev };
        allStocks.forEach((s) => {
          const p = getStockPrice(s.symbol);
          next[s.symbol] = { price: p, change: +((p - s.price) / s.price * 100).toFixed(2) };
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [allStocks]);

  const filteredAssets = useMemo(() => {
    const q = assetSearch.toLowerCase();
    return allStocks
      .filter((s) => !q || s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      .slice(0, HOT_ASSETS_COUNT);
  }, [allStocks, assetSearch]);

  const handleTrade = useCallback((side: 'BUY' | 'SELL') => {
    const qty = parseInt(quantity);
    if (!qty || qty <= 0 || !Number.isInteger(qty)) {
      setFeedback({ type: 'error', text: t('sharesMustBePositive') });
      return;
    }
    const price = getStockPrice(selectedSymbol);
    if (price <= 0) {
      setFeedback({ type: 'error', text: t('priceError') });
      return;
    }
    if (side === 'BUY') {
      const cost = price * qty;
      if (cost > portfolio.cashBalance) {
        setFeedback({ type: 'error', text: `${t('insufficientCash')}${cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}` });
        return;
      }
    } else {
      const pos = portfolio.positions.find((p) => p.symbol === selectedSymbol);
      if (!pos || pos.quantity < qty) {
        setFeedback({ type: 'error', text: `${t('insufficientShares')} ${pos?.quantity ?? 0} ${t('sharesUnit')}` });
        return;
      }
    }
    setSubmitting(true);
    setFeedback(null);
    setTimeout(() => {
      try {
        const trade = submitTrade({ side, symbol: selectedSymbol, quantity: qty });
        setFeedback({ type: 'success', text: `${trade.side} ${trade.quantity} × ${trade.symbol} @ HK$${trade.price.toFixed(2)} ✓` });
        setQuantity('');
        setTimeout(() => checkAndAwardTasks(), 100);
      } catch {
        setFeedback({ type: 'error', text: t('tradeFailed') });
      } finally {
        setSubmitting(false);
      }
    }, 300);
  }, [quantity, selectedSymbol, portfolio, submitTrade, checkAndAwardTasks, language]);

  const handleReset = () => {
    resetPortfolio();
    resetAchievements();
    setFeedback({ type: 'success', text: t('accountReset') });
  };

  const totalPnl = portfolio.positions.reduce((s, p) => s + p.pnl, 0);
  const totalPnlPercent = portfolio.totalValue > 0 ? ((totalPnl / (portfolio.totalValue - totalPnl)) * 100) : 0;
  const completedCount = achievements.filter((a) => a.completed).length;

  const levelName = (level: number) => {
    if (level === 1) return t('beginner');
    if (level === 2) return t('trader');
    return t('analyst');
  };

  /* ── Shared sub-components ── */

  const HotAssetsList = () => (
    <>
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground mb-2">{t('hotAssets')}</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={assetSearch}
            onChange={(e) => setAssetSearch(e.target.value)}
            placeholder={t('searchStock')}
            className="w-full bg-secondary text-foreground text-xs font-mono rounded-lg pl-8 pr-3 py-2 outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {filteredAssets.map((stock) => {
          const hp = hotPrices[stock.symbol];
          const isUp = (hp?.change ?? 0) >= 0;
          return (
            <button
              key={stock.symbol}
              onClick={() => { setSelectedSymbol(stock.symbol); setMobilePanel(null); }}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all ${
                selectedSymbol === stock.symbol
                  ? 'bg-primary/15 border border-primary/30 shadow-sm'
                  : 'hover:bg-secondary/60 border border-transparent'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-mono font-semibold text-foreground truncate" title={stock.symbol}>{stock.symbol}</p>
                <p className="text-[10px] text-muted-foreground truncate" title={stock.name}>{stock.name}</p>
              </div>
              <div className="text-right ml-2 shrink-0">
                <p className="text-xs font-mono text-foreground">${hp?.price.toFixed(2) ?? '—'}</p>
                <p className={`text-[10px] font-mono ${isUp ? 'text-gain' : 'text-loss'}`}>
                  {isUp ? '+' : ''}{hp?.change.toFixed(2) ?? 0}%
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );

  const QuickTradePanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t('quickTrade')}</h3>
        <button onClick={handleReset} className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors" title={t('resetAccount')}>
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Asset selector */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1.5">{t('asset')}</label>
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="w-full bg-secondary text-foreground text-sm font-mono rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer border border-border"
        >
          {allStocks.map((s) => (
            <option key={s.symbol} value={s.symbol}>{s.symbol} — {s.name}</option>
          ))}
        </select>
      </div>

      {/* Current price card */}
      <div className="rounded-xl bg-secondary/50 border border-border p-4 text-center">
        <p className="text-xs text-muted-foreground">{t('currentPrice')}</p>
        <p className="text-2xl font-mono font-bold text-foreground mt-1">
          HK${(hotPrices[selectedSymbol]?.price ?? 0).toFixed(2)}
        </p>
        <p className={`text-xs font-mono mt-1 ${(hotPrices[selectedSymbol]?.change ?? 0) >= 0 ? 'text-gain' : 'text-loss'}`}>
          {(hotPrices[selectedSymbol]?.change ?? 0) >= 0 ? '+' : ''}{(hotPrices[selectedSymbol]?.change ?? 0).toFixed(2)}%
        </p>
      </div>

      {/* Quantity */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1.5">{t('shares')}</label>
        <input
          type="number" min="1" step="1" value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={t('enterShares')}
          className="w-full bg-secondary text-foreground text-sm font-mono rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground border border-border"
        />
        {quantity && parseInt(quantity) > 0 && (
          <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
            {t('estimated')} ≈ HK${((hotPrices[selectedSymbol]?.price ?? 0) * parseInt(quantity)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        )}
      </div>

      {/* Buy/Sell buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleTrade('BUY')}
          disabled={submitting || !quantity}
          className="py-3 rounded-xl text-sm font-semibold bg-gain/20 text-gain hover:bg-gain/30 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
          <span>{t('buy')}</span>
        </button>
        <button
          onClick={() => handleTrade('SELL')}
          disabled={submitting || !quantity}
          className="py-3 rounded-xl text-sm font-semibold bg-loss/20 text-loss hover:bg-loss/30 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownRight className="h-4 w-4" />}
          <span>{t('sell')}</span>
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <p className={`text-xs font-mono p-3 rounded-xl break-words ${feedback.type === 'success' ? 'text-gain bg-gain/10 border border-gain/20' : 'text-loss bg-loss/10 border border-loss/20'}`}>
          {feedback.text}
        </p>
      )}

      <p className="text-[10px] text-muted-foreground italic text-center">{t('simulatedDisclaimer')}</p>
    </div>
  );

  const TaskPanel = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-warning" /> {t('taskProgress')}
        </h3>
        <span className="text-xs text-muted-foreground font-mono">{completedCount}/{achievements.length}</span>
      </div>
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-warning rounded-full transition-all duration-500" style={{ width: `${(completedCount / achievements.length) * 100}%` }} />
      </div>
      <div className="space-y-2">
        {achievements.map((a) => (
          <div key={a.id} className={`rounded-xl p-3 transition-all border ${a.completed ? 'bg-gain/5 border-gain/20' : 'bg-secondary/30 border-border'}`}>
            <div className="flex items-start gap-2.5">
              {a.completed
                ? <CheckCircle2 className="h-4.5 w-4.5 text-gain shrink-0 mt-0.5" />
                : <Circle className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md mb-1 ${
                  a.level === 1 ? 'bg-primary/20 text-primary' : a.level === 2 ? 'bg-warning/20 text-warning' : 'bg-accent/20 text-accent'
                }`}>
                  Lv.{a.level} {levelName(a.level)}
                </span>
                <p className={`text-xs break-words ${a.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {a.labelKey ? t(a.labelKey as any) : (language === 'en' ? a.labelEn : a.labelZh)}
                </p>
              </div>
              <div className="text-right shrink-0 ml-1">
                <span className={`text-xs font-mono font-semibold whitespace-nowrap ${a.completed ? 'text-gain' : 'text-warning'}`}>
                  {a.completed ? '✓ ' : ''}+{a.reward.toLocaleString()}
                </span>
                <p className="text-[10px] text-muted-foreground">HKD</p>
              </div>
            </div>
            {a.completed && a.completedAt && (
              <p className="text-[10px] text-muted-foreground mt-1.5 ml-7">
                {t('awarded')} {new Date(a.completedAt).toLocaleDateString(language === 'en' ? 'en-US' : language === 'zh' ? 'zh-CN' : 'zh-TW')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <Toaster />

      {/* ── Mobile top bar with panel toggles ── */}
      <div className="lg:hidden flex items-center gap-2 p-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <button
          onClick={() => setMobilePanel(mobilePanel === 'assets' ? null : 'assets')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${mobilePanel === 'assets' ? 'bg-primary/20 text-primary' : 'bg-secondary text-foreground'}`}
        >
          <Search className="h-3.5 w-3.5" /> {t('mobileAssets')}
        </button>
        <button
          onClick={() => setMobilePanel(mobilePanel === 'trade' ? null : 'trade')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${mobilePanel === 'trade' ? 'bg-primary/20 text-primary' : 'bg-secondary text-foreground'}`}
        >
          <BarChart3 className="h-3.5 w-3.5" /> {t('mobileTrade')}
        </button>
        <div className="flex-1" />
        <p className="text-xs font-mono text-muted-foreground truncate">
          {selectedSymbol}
        </p>
      </div>

      {/* ── Mobile slide-down panels ── */}
      {mobilePanel && (
        <div className="lg:hidden border-b border-border bg-card/80 backdrop-blur-sm max-h-[60vh] overflow-y-auto">
          <div className="p-3">
            {mobilePanel === 'assets' && <HotAssetsList />}
            {mobilePanel === 'trade' && <QuickTradePanel />}
          </div>
        </div>
      )}

      <div className="flex h-full overflow-hidden">
        {/* ── Left sidebar: Hot Assets (desktop) ── */}
        <aside className="w-60 xl:w-64 border-r border-border bg-card/30 flex-col shrink-0 hidden lg:flex">
          <HotAssetsList />
        </aside>

        {/* ── Center: Main content ── */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
          {/* Top stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
            {/* Cash */}
            <div className="rounded-xl bg-card border border-border p-3 md:p-4 flex items-center gap-3 shadow-sm">
              <div className="p-2 rounded-lg bg-primary/15 shrink-0">
                <Wallet className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-muted-foreground">{t('virtualCash')}</p>
                <p className="text-sm md:text-lg font-mono font-bold text-foreground truncate" title={`HK$${portfolio.cashBalance.toLocaleString()}`}>
                  HK${portfolio.cashBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            {/* Portfolio */}
            <div className="rounded-xl bg-card border border-border p-3 md:p-4 flex items-center gap-3 shadow-sm">
              <div className="p-2 rounded-lg bg-accent/15 shrink-0">
                <PieChart className="h-4 w-4 md:h-5 md:w-5 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-muted-foreground">{t('portfolio')}</p>
                <p className="text-sm md:text-lg font-mono font-bold text-foreground truncate" title={`HK$${portfolio.totalValue.toLocaleString()}`}>
                  HK${portfolio.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            {/* P&L */}
            <div className="rounded-xl bg-card border border-border p-3 md:p-4 flex items-center gap-3 shadow-sm">
              <div className={`p-2 rounded-lg shrink-0 ${totalPnl >= 0 ? 'bg-gain/15' : 'bg-loss/15'}`}>
                {totalPnl >= 0 ? <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-gain" /> : <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-loss" />}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-muted-foreground">{t('totalPnl')}</p>
                <p className={`text-sm md:text-lg font-mono font-bold truncate ${totalPnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                  {totalPnl >= 0 ? '+' : ''}HK${totalPnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  <span className="text-[10px] md:text-xs ml-1 font-normal">({totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(1)}%)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2.5 rounded-xl px-3 md:px-4 py-2.5 md:py-3 bg-primary/8 border border-primary/15">
            <span className="text-sm leading-none mt-0.5 shrink-0">🎮</span>
            <p className="text-[10px] md:text-xs text-foreground/80 break-words">
              {t('gameDisclaimer')}
            </p>
          </div>

          {/* Positions table */}
          <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
            <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-xs md:text-sm font-semibold text-foreground flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" /> {t('positions')}
              </h3>
              <span className="text-[10px] md:text-xs text-muted-foreground font-mono">{portfolio.positions.length} {t('items')}</span>
            </div>
            {portfolio.positions.length > 0 ? (
              <>
                {/* Desktop table */}
                <div className="overflow-x-auto hidden sm:block">
                  <table className="w-full text-xs md:text-sm">
                    <thead>
                      <tr className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
                        <th className="px-3 md:px-4 py-2 text-left">{t('symbol')}</th>
                        <th className="px-3 md:px-4 py-2 text-left">{t('name')}</th>
                        <th className="px-3 md:px-4 py-2 text-right">{t('qty')}</th>
                        <th className="px-3 md:px-4 py-2 text-right">{t('avgCost')}</th>
                        <th className="px-3 md:px-4 py-2 text-right">{t('currentPrice')}</th>
                        <th className="px-3 md:px-4 py-2 text-right">{t('mktValue')}</th>
                        <th className="px-3 md:px-4 py-2 text-right">{t('pnl')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.positions.map((pos) => {
                        const mktVal = pos.currentPrice * pos.quantity;
                        return (
                          <tr key={pos.symbol} className="border-t border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="px-3 md:px-4 py-2.5 font-mono font-medium text-foreground whitespace-nowrap">{pos.symbol}</td>
                            <td className="px-3 md:px-4 py-2.5 text-muted-foreground text-xs truncate max-w-[120px]" title={getStockName(pos.symbol)}>{getStockName(pos.symbol)}</td>
                            <td className="px-3 md:px-4 py-2.5 text-right font-mono text-muted-foreground">{pos.quantity}</td>
                            <td className="px-3 md:px-4 py-2.5 text-right font-mono text-muted-foreground whitespace-nowrap">${pos.avgCost.toFixed(2)}</td>
                            <td className="px-3 md:px-4 py-2.5 text-right font-mono text-foreground whitespace-nowrap">${pos.currentPrice.toFixed(2)}</td>
                            <td className="px-3 md:px-4 py-2.5 text-right font-mono text-foreground whitespace-nowrap">${mktVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                            <td className={`px-3 md:px-4 py-2.5 text-right font-mono font-medium whitespace-nowrap ${pos.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                              {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              <span className="text-[10px] ml-0.5">({pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent}%)</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Mobile card list */}
                <div className="sm:hidden divide-y divide-border/50">
                  {portfolio.positions.map((pos) => {
                    const mktVal = pos.currentPrice * pos.quantity;
                    return (
                      <div key={pos.symbol} className="p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="text-xs font-mono font-semibold text-foreground">{pos.symbol}</p>
                            <p className="text-[10px] text-muted-foreground truncate" title={getStockName(pos.symbol)}>{getStockName(pos.symbol)}</p>
                          </div>
                          <div className={`text-right font-mono text-xs font-medium ${pos.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                            {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            <p className="text-[10px]">({pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent}%)</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                          <span>{pos.quantity} {t('sharesUnit')} × ${pos.currentPrice.toFixed(2)}</span>
                          <span>{t('mktValue')} ${mktVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="px-4 py-8 text-center text-xs md:text-sm text-muted-foreground">{t('noPositions')}</div>
            )}
          </div>

          {/* Trade History */}
          <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 border-b border-border flex items-center justify-between hover:bg-secondary/20 transition-colors"
            >
              <h3 className="text-xs md:text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" /> {t('tradeHistory')}
              </h3>
              {historyOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {historyOpen && (
              trades.length > 0 ? (
                <>
                  {/* Desktop table */}
                  <div className="overflow-x-auto hidden sm:block">
                    <table className="w-full text-xs md:text-sm">
                      <thead>
                        <tr className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
                          <th className="px-3 md:px-4 py-2 text-left">{t('time')}</th>
                          <th className="px-3 md:px-4 py-2 text-left">{t('type')}</th>
                          <th className="px-3 md:px-4 py-2 text-left">{t('symbol')}</th>
                          <th className="px-3 md:px-4 py-2 text-right">{t('qty')}</th>
                          <th className="px-3 md:px-4 py-2 text-right">{t('price')}</th>
                          <th className="px-3 md:px-4 py-2 text-right">{t('amount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trades.slice(0, 50).map((trd) => (
                          <tr key={trd.id} className="border-t border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="px-3 md:px-4 py-2 text-xs font-mono text-muted-foreground whitespace-nowrap">
                              {new Date(trd.timestamp).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-3 md:px-4 py-2">
                              <span className={`text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-0.5 ${trd.side === 'BUY' ? 'bg-gain/20 text-gain' : 'bg-loss/20 text-loss'}`}>
                                {trd.side === 'BUY' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {trd.side === 'BUY' ? t('buyAction') : t('sellAction')}
                              </span>
                            </td>
                            <td className="px-3 md:px-4 py-2 font-mono font-medium text-foreground text-xs whitespace-nowrap">{trd.symbol}</td>
                            <td className="px-3 md:px-4 py-2 text-right font-mono text-muted-foreground text-xs">{trd.quantity}</td>
                            <td className="px-3 md:px-4 py-2 text-right font-mono text-muted-foreground text-xs whitespace-nowrap">${trd.price.toFixed(2)}</td>
                            <td className="px-3 md:px-4 py-2 text-right font-mono text-foreground text-xs whitespace-nowrap">${(trd.price * trd.quantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile card list */}
                  <div className="sm:hidden divide-y divide-border/50">
                    {trades.slice(0, 30).map((trd) => (
                      <div key={trd.id} className="p-3 flex items-center gap-3">
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-md shrink-0 ${trd.side === 'BUY' ? 'bg-gain/20 text-gain' : 'bg-loss/20 text-loss'}`}>
                          {trd.side === 'BUY' ? t('buyAction') : t('sellAction')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono font-medium text-foreground">{trd.symbol}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {trd.quantity} × ${trd.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-mono text-foreground">${(trd.price * trd.quantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {new Date(trd.timestamp).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="px-4 py-6 text-center text-xs md:text-sm text-muted-foreground">{t('noHistory')}</div>
              )
            )}
          </div>
        </div>

        {/* ── Right sidebar: Quick Trade + Tasks (desktop) ── */}
        <aside className="w-72 xl:w-80 border-l border-border bg-card/30 flex-col shrink-0 hidden lg:flex overflow-y-auto">
          <div className="p-4 border-b border-border">
            <QuickTradePanel />
          </div>
          <div className="p-4 flex-1">
            <TaskPanel />
          </div>
        </aside>
      </div>
    </AppLayout>
  );
};

export default TradingPage;
