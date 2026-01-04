'use client';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useWatchlist } from '../../lib/watchlist-store';
import type { ScanResult } from '../../lib/scoring';

const universes = [
  { id: 'nifty50', label: 'NIFTY 50' },
  { id: 'nifty100', label: 'NIFTY 100' },
  { id: 'nifty200', label: 'NIFTY 200' },
  { id: 'nifty500', label: 'NIFTY 500' },
  { id: 'custom', label: 'Custom CSV upload' },
];

export default function ScannerTab() {
  const [universe, setUniverse] = useState('nifty50');
  const [customTickers, setCustomTickers] = useState<string[]>([]);
  const [topN, setTopN] = useState(12);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ScanResult[]>([]);
  const { add } = useWatchlist();

  const tickers = useMemo(() => (universe === 'custom' ? customTickers : undefined), [universe, customTickers]);

  const handleUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const rows = text.split(/\r?\n/).map((r) => r.trim()).filter(Boolean);
      setCustomTickers(rows);
    };
    reader.readAsText(file);
  };

  const runScan = async () => {
    setLoading(true);
    setProgress(0);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universe, topN, tickers }),
      });
      const reader = res.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let json = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          json += decoder.decode(value);
          const parts = json.split('\n');
          const latest = parts[parts.length - 2];
          if (latest?.startsWith('PROGRESS')) {
            const pct = Number(latest.split(':')[1]);
            setProgress(pct);
          }
        }
        const cleaned = json.replace(/PROGRESS:[0-9]+\n/g, '').trim();
        if (cleaned) {
          const data = JSON.parse(cleaned);
          setResults(data.results);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  useEffect(() => {
    setResults([]);
  }, [universe]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 card p-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-400">Universe</p>
          <select
            value={universe}
            onChange={(e) => setUniverse(e.target.value)}
            className="bg-surface border border-gray-700 rounded-md px-3 py-2 text-sm"
          >
            {universes.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
        {universe === 'custom' && (
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Upload CSV</p>
            <input type="file" accept=".csv,.txt" onChange={(e) => handleUpload(e.target.files?.[0])} />
            <p className="text-xs text-gray-500">Loaded {customTickers.length} tickers</p>
          </div>
        )}
        <div className="space-y-1">
          <p className="text-sm text-gray-400">Top N</p>
          <input
            type="number"
            min={5}
            max={50}
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className="bg-surface border border-gray-700 rounded-md px-3 py-2 w-24"
          />
        </div>
        <div className="ml-auto flex items-end gap-2">
          {loading && (
            <div className="w-40 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="bg-accent h-full" style={{ width: `${progress}%` }} />
            </div>
          )}
          <Button onClick={runScan} disabled={loading}>
            {loading ? 'Scanning...' : 'Run Scan'}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {results.map((r) => (
          <article key={r.ticker} className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{r.ticker}</h3>
                {r.companyName && <p className="text-xs text-gray-400">{r.companyName}</p>}
                {r.sector && <Badge color="gray">{r.sector}</Badge>}
              </div>
              <Badge color={r.action === 'BUY' ? 'green' : r.action === 'SELL' ? 'red' : 'yellow'}>{r.action}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <p className="text-green-300">₹{r.currentPrice.toFixed(2)}</p>
              <p className={r.dayChange >= 0 ? 'text-green-400' : 'text-red-400'}>{r.dayChange.toFixed(2)}%</p>
              <Badge color={r.confidence === 'HIGH' ? 'green' : r.confidence === 'MED' ? 'yellow' : 'red'}>
                {r.confidence} Conf
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <div>Entry: <span className="text-white">{r.entry}</span></div>
              <div>Stop: <span className="text-red-300">{r.stop}</span></div>
              <div>Target1: <span className="text-green-300">{r.target1}</span></div>
              <div>Target2: <span className="text-green-300">{r.target2}</span></div>
            </div>
            <p className="text-sm text-gray-400">{r.rationale}</p>
            <p className="text-xs text-gray-500">Formula 60/30/10 weighting. Technical: {r.formulaDetails.technical.toFixed(1)} Fundamentals: {r.formulaDetails.fundamentals.toFixed(1)} Liquidity: {r.formulaDetails.liquidity.toFixed(1)}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-deep-dive', { detail: r.ticker }))}>
                Analysis
              </Button>
              <Button onClick={() => add(r)}>+ Watch</Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
