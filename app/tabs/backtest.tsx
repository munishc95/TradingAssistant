'use client';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import type { BacktestResult } from '../../lib/backtest';

const periods = [
  { id: '6M', months: 6 },
  { id: '1Y', months: 12 },
  { id: '3Y', months: 36 },
];

export default function BacktestTab() {
  const [ticker, setTicker] = useState('RELIANCE.NS');
  const [period, setPeriod] = useState(periods[0].id);
  const [strategy, setStrategy] = useState<'swing' | 'ema'>('swing');
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runBacktest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        body: JSON.stringify({ ticker, period, strategy }),
      });
      setResult(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 space-y-4">
      <div className="flex gap-3 flex-wrap items-end">
        <div>
          <p className="text-sm text-gray-400">Ticker</p>
          <input value={ticker} onChange={(e) => setTicker(e.target.value)} className="bg-surface border border-gray-700 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <p className="text-sm text-gray-400">Period</p>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-surface border border-gray-700 rounded-md px-3 py-2 text-sm">
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-sm text-gray-400">Strategy</p>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as any)}
            className="bg-surface border border-gray-700 rounded-md px-3 py-2 text-sm"
          >
            <option value="swing">Swing Strategy (EMA-based)</option>
            <option value="ema">EMA crossover</option>
          </select>
        </div>
        <Button onClick={runBacktest} disabled={loading}>
          {loading ? 'Running...' : 'Run backtest'}
        </Button>
      </div>

      {result && (
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <h4 className="font-semibold">Performance</h4>
            <p>Total Return: {(result.totalReturn * 100).toFixed(2)}%</p>
            <p>CAGR: {(result.cagr * 100).toFixed(2)}%</p>
            <p>Max DD: {(result.maxDrawdown * 100).toFixed(2)}%</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold">Quality</h4>
            <p>Win rate: {(result.winRate * 100).toFixed(1)}%</p>
            <p>Trades: {result.trades}</p>
            <p>Avg R: {result.avgR.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold">Notes</h4>
            <p>Exposure: {(result.exposure * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Illustrative only. Includes 0.1% slippage and 0.05% fees defaults.</p>
          </div>
        </div>
      )}
    </div>
  );
}
