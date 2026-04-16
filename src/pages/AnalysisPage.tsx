import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, type IChartApi, type ISeriesApi } from 'lightweight-charts';
import { Search, BarChart3, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { fetchStockHistory, addIndicatorToChart, fetchTechnicalAnalysis, fetchStockQuote, searchStock } from '@/services/analysisService';
import type { OHLCDataPoint, AnalysisResult, IndicatorLineData, StockQuote, StockSearchResult } from '@/types/analysis';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTranslation } from '@/hooks/useTranslation';

const INDICATOR_COLORS: Record<string, string> = {
  SMA: '#22c55e',
  EMA: '#f59e0b',
  RSI: '#a855f7',
};

const PERIODS = [
  { value: '1d', label: '1D' },
  { value: '5d', label: '1W' },
  { value: '1mo', label: '1M' },
  { value: '3mo', label: '3M' },
  { value: '6mo', label: '6M' },
  { value: '1y', label: '1Y' },
  { value: 'max', label: 'Max' },
] as const;

const AnalysisPage = () => {
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState('9988.HK');
  const [inputSymbol, setInputSymbol] = useState('9988.HK');
  const [period, setPeriod] = useState('1mo');
  const [ohlcData, setOhlcData] = useState<OHLCDataPoint[]>([]);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeIndicators, setActiveIndicators] = useState<Set<string>>(new Set());
  const [indicatorData, setIndicatorData] = useState<Record<string, IndicatorLineData[]>>({});

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lineSeriesRefs = useRef<Record<string, ISeriesApi<'Line'>>>({});

  const loadData = useCallback(async (sym: string, per: string = period) => {
    setLoading(true);
    setActiveIndicators(new Set());
    setIndicatorData({});
    setAnalysis(null);
    setShowSearch(false);
    try {
      const interval = per === '1d' ? '5m' : per === '5d' ? '30m' : '1d';
      const [data, q] = await Promise.all([fetchStockHistory(sym, per, interval), fetchStockQuote(sym)]);
      setOhlcData(data);
      setQuote(q);
      setSymbol(sym);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData(symbol);
  }, []);

  // Create / update chart
  useEffect(() => {
    if (!chartContainerRef.current || ohlcData.length === 0) return;

    let disposed = false;

    if (chartRef.current) {
      try { chartRef.current.remove(); } catch {}
      chartRef.current = null;
      candleSeriesRef.current = null;
      lineSeriesRefs.current = {};
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 420,
      layout: {
        background: { color: 'transparent' },
        textColor: '#6B7280',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#E5E7EB' },
        horzLines: { color: '#E5E7EB' },
      },
      crosshair: { mode: 0 },
      timeScale: {
        borderColor: '#E5E7EB',
        timeVisible: period === '1d' || period === '5d',
      },
      rightPriceScale: { borderColor: '#E5E7EB' },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    candleSeries.setData(ohlcData.map((d) => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })));

    chart.timeScale().fitContent();
    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const handleResize = () => {
      if (chartContainerRef.current && !disposed) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      try { chart.remove(); } catch {}
      chartRef.current = null;
      candleSeriesRef.current = null;
      lineSeriesRefs.current = {};
    };
  }, [ohlcData, period]);

  // Update indicator overlays
  useEffect(() => {
    if (!chartRef.current) return;
    for (const [key, series] of Object.entries(lineSeriesRefs.current)) {
      if (!activeIndicators.has(key)) {
        try { chartRef.current.removeSeries(series); } catch {}
        delete lineSeriesRefs.current[key];
      }
    }
    for (const ind of activeIndicators) {
      if (!lineSeriesRefs.current[ind] && indicatorData[ind]) {
        const color = INDICATOR_COLORS[ind] ?? '#888';
        const lineSeries = chartRef.current.addLineSeries({
          color,
          lineWidth: 2,
          priceLineVisible: false,
        });
        lineSeries.setData(indicatorData[ind].map((d) => ({ time: d.time, value: d.value })));
        lineSeriesRefs.current[ind] = lineSeries;
      }
    }
  }, [activeIndicators, indicatorData]);

  const toggleIndicator = async (type: 'SMA' | 'EMA' | 'RSI') => {
    const newSet = new Set(activeIndicators);
    if (newSet.has(type)) {
      newSet.delete(type);
      setActiveIndicators(newSet);
    } else {
      if (!indicatorData[type]) {
        const data = await addIndicatorToChart(type, ohlcData, type === 'RSI' ? 14 : 20);
        setIndicatorData((prev) => ({ ...prev, [type]: data }));
      }
      newSet.add(type);
      setActiveIndicators(newSet);
    }
  };

  const handleAnalyse = async () => {
    setAnalysing(true);
    try {
      const result = await fetchTechnicalAnalysis(symbol, period, t as (key: string) => string);
      setAnalysis(result);
    } finally {
      setAnalysing(false);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    loadData(symbol, newPeriod);
  };

  const handleSearch = () => {
    const sym = inputSymbol.trim().toUpperCase();
    if (sym) loadData(sym);
  };

  return (
    <AppLayout>
      <div className="flex h-full overflow-hidden">
        {/* Main chart area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {/* Disclaimer */}
          <div className="flex items-start gap-2.5 rounded-lg px-4 py-3 bg-warning/10 border border-warning/20">
            <span className="text-base leading-none mt-0.5">⚠️</span>
            <p className="text-sm text-foreground/90 italic">{t('disclaimer')}</p>
          </div>
          {/* Symbol input with search */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex gap-2 relative">
              <div className="relative flex-1 max-w-xs">
                <input
                  value={inputSymbol}
                  onChange={async (e) => {
                    const val = e.target.value.toUpperCase();
                    setInputSymbol(val);
                    if (val.length >= 1) {
                      const results = await searchStock(val);
                      setSearchResults(results);
                      setShowSearch(results.length > 0);
                    } else {
                      setShowSearch(false);
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setShowSearch(false); handleSearch(); } }}
                  onFocus={async () => {
                    if (inputSymbol.length >= 1) {
                      const results = await searchStock(inputSymbol);
                      setSearchResults(results);
                      setShowSearch(results.length > 0);
                    }
                  }}
                  placeholder={t('searchPlaceholder')}
                  className="w-full bg-secondary text-foreground text-sm font-mono rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                />
                {showSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    {searchResults.map((r) => (
                      <button
                        key={r.symbol}
                        onClick={() => {
                          setInputSymbol(r.symbol);
                          setShowSearch(false);
                          loadData(r.symbol);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-foreground">{r.symbol}</span>
                          <span className="text-muted-foreground text-xs truncate max-w-[150px]">{r.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{r.exchange}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => { setShowSearch(false); handleSearch(); }}
                disabled={loading}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {t('load')}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-foreground text-lg">{symbol}</span>
              {quote && (
                <span className={`text-sm font-mono font-medium ${quote.change >= 0 ? 'text-gain' : 'text-loss'}`}>
                  HK${quote.currentPrice.toFixed(2)}{' '}
                  <span className="text-xs">
                    ({quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)}, {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent}%)
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Period selector + Indicator controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mr-1">{t('periodLabel')}</span>
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePeriodChange(p.value)}
                disabled={loading}
                className={`px-2.5 py-1.5 rounded-md text-xs font-mono font-medium transition-colors border ${
                  period === p.value
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}

            <div className="w-px h-5 bg-border mx-1" />

            <span className="text-xs text-muted-foreground uppercase tracking-wider mr-1">{t('indicatorLabel')}</span>
            {(['SMA', 'EMA', 'RSI'] as const).map((ind) => (
              <button
                key={ind}
                onClick={() => toggleIndicator(ind)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors border ${
                  activeIndicators.has(ind)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: activeIndicators.has(ind) ? INDICATOR_COLORS[ind] : '#D1D5DB' }}
                />
                {ind}{ind !== 'RSI' ? ' (20)' : ' (14)'}
              </button>
            ))}

            <button
              onClick={handleAnalyse}
              disabled={analysing}
              className="ml-auto px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              {analysing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BarChart3 className="h-3.5 w-3.5" />}
              {t('analyseBtn')}
            </button>
          </div>

          {/* Candlestick chart */}
          <div className="panel-glass p-1 overflow-hidden">
            {loading ? (
              <div className="h-[420px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div ref={chartContainerRef} className="w-full" />
            )}
          </div>

          {/* Legend */}
          {activeIndicators.size > 0 && (
            <div className="flex gap-4 text-xs text-muted-foreground">
              {Array.from(activeIndicators).map((ind) => (
                <span key={ind} className="flex items-center gap-1">
                  <span className="w-3 h-0.5 rounded inline-block" style={{ backgroundColor: INDICATOR_COLORS[ind] }} />
                  {ind}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar: Analysis results */}
        <aside className="w-80 border-l border-border bg-card/30 flex flex-col shrink-0 hidden lg:flex">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-primary" />
              {t('analysisResults')}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            {analysis ? (
              <div className="space-y-4">
                {/* Recommendation */}
                <div className="panel-glass p-4 text-center">
                  <span
                    className={`text-xl font-bold ${
                      analysis.recommendation === 'BUY' ? 'text-gain' : analysis.recommendation === 'SELL' ? 'text-loss' : 'text-warning'
                    }`}
                  >
                    {analysis.recommendation === 'BUY' && <TrendingUp className="h-5 w-5 inline mr-1" />}
                    {analysis.recommendation === 'SELL' && <TrendingDown className="h-5 w-5 inline mr-1" />}
                    {analysis.recommendation === 'HOLD' && <Minus className="h-5 w-5 inline mr-1" />}
                    {analysis.recommendation}
                  </span>
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground">{t('confidence')}</div>
                    <div className="w-full h-2 bg-secondary rounded-full mt-1">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${analysis.confidence}%` }} />
                    </div>
                    <div className="text-xs text-primary font-mono mt-1">{analysis.confidence}%</div>
                  </div>
                </div>

                {/* Support / Resistance */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="panel-glass p-3 text-center">
                    <div className="text-xs text-muted-foreground">{t('support')}</div>
                    <div className="text-sm font-mono text-gain font-medium mt-1">HK${analysis.support}</div>
                  </div>
                  <div className="panel-glass p-3 text-center">
                    <div className="text-xs text-muted-foreground">{t('resistance')}</div>
                    <div className="text-sm font-mono text-loss font-medium mt-1">HK${analysis.resistance}</div>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t('aiSummary')}</h4>
                  <p className="text-sm text-foreground leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Indicators */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('indicators')}</h4>
                  {analysis.indicators.map((ind) => (
                    <div key={ind.key} className="panel-glass p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{ind.name}</span>
                        <span
                          className={`text-xs font-mono ${
                            ind.signal === 'bullish' ? 'text-gain' : ind.signal === 'bearish' ? 'text-loss' : 'text-muted-foreground'
                          }`}
                        >
                          {String(ind.value)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{ind.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <BarChart3 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {t('clickAnalyse')} <strong className="text-foreground">{t('analyseBtn')}</strong> {t('toRunAnalysis')} {symbol}.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </AppLayout>
  );
};

export default AnalysisPage;
