'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { createChart, IChartApi } from 'lightweight-charts';
import type { Candle } from '../../lib/indicators';
import { useWatchlist } from '../../lib/watchlist-store';
import type { ScanResult } from '../../lib/scoring';

export default function DeepDiveTab() {
  const [ticker, setTicker] = useState('RELIANCE.NS');
  const [data, setData] = useState<{
    candles: Candle[];
    summary?: any;
    plan?: ScanResult;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const { add } = useWatchlist();

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<string>;
      setTicker(custom.detail);
      analyze(custom.detail);
    };
    window.addEventListener('open-deep-dive', handler);
    return () => window.removeEventListener('open-deep-dive', handler);
  }, []);

  useEffect(() => {
    if (!chartRef.current || !data?.candles?.length) return;
    if (chartInstance.current) chartInstance.current.remove();
    const chart = createChart(chartRef.current, {
      layout: { background: { color: '#0b0f1a' }, textColor: '#e5e7eb' },
      grid: { horzLines: { color: '#1f2937' }, vertLines: { color: '#1f2937' } },
      width: chartRef.current.clientWidth,
      height: 320,
    });
    const candleSeries = chart.addCandlestickSeries({ upColor: '#22c55e', downColor: '#ef4444', borderVisible: false });
    candleSeries.setData(
      data.candles.map((c) => ({ time: c.date.substring(0, 10), open: c.open, high: c.high, low: c.low, close: c.close })),
    );
    chart.addLineSeries({ color: '#7c3aed', lineWidth: 2 }).setData(
      data.candles.map((c) => ({ time: c.date.substring(0, 10), value: c.close })),
    );
    chartInstance.current = chart;
  }, [data]);

  const analyze = async (t?: string) => {
    const symbol = t ?? ticker;
    setLoading(true);
    try {
      const res = await fetch('/api/deep-dive', { method: 'POST', body: JSON.stringify({ ticker: symbol }) });
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 space-y-4">
      <div className="flex gap-3 items-end flex-wrap">
        <div className="space-y-1">
          <p className="text-sm text-gray-400">Ticker</p>
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="bg-surface border border-gray-700 rounded-md px-3 py-2 text-sm"
            placeholder="RELIANCE.NS"
          />
        </div>
        <Button onClick={() => analyze()} disabled={loading}>
          {loading ? 'Loading...' : 'Analyze'}
        </Button>
      </div>
      <div className="bg-surface rounded-lg border border-gray-800">
        <div ref={chartRef} />
      </div>
      {data && (
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold">Technical</h4>
            <p>Trend + RSI + ATR overlays rendered on the chart.</p>
            <p className="text-gray-400">Support/Resistance inferred from pivots.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Fundamentals</h4>
            {data.summary ? (
              <ul className="space-y-1 text-gray-300">
                <li>Market Cap: {data.summary.marketCap ?? 'n/a'}</li>
                <li>PE: {data.summary.pe ?? 'n/a'} | PB: {data.summary.pb ?? 'n/a'}</li>
                <li>ROE: {data.summary.roe ?? 'n/a'} Debt/Equity: {data.summary.debtToEquity ?? 'n/a'}</li>
              </ul>
            ) : (
              <p className="text-gray-500">No fundamentals available.</p>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Plan</h4>
            {data.plan ? (
              <div className="space-y-1">
                <Badge color="green">{data.plan.action}</Badge>
                <p>Entry {data.plan.entry} | SL {data.plan.stop} | T1 {data.plan.target1} | T2 {data.plan.target2}</p>
                <p className="text-xs text-gray-500">{data.plan.rationale}</p>
                <Button onClick={() => add(data.plan!)}>+ Watch</Button>
              </div>
            ) : (
              <p className="text-gray-500">Run analysis to generate a plan.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
