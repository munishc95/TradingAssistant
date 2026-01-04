'use client';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { useWatchlist } from '../../lib/watchlist-store';
import type { ScanResult } from '../../lib/scoring';

export default function WatchlistTab() {
  const { items, remove } = useWatchlist();
  const [alerts, setAlerts] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkAlerts = async () => {
      for (const item of items) {
        try {
          const res = await fetch('/api/fundamentals', { method: 'POST', body: JSON.stringify({ ticker: item.ticker }) });
          const json = await res.json();
          if (!json?.price) continue;
          setAlerts((prev) => {
            if (prev[item.ticker] || json.price < item.entry) return prev;
            return { ...prev, [item.ticker]: 'Entry hit' };
          });
        } catch (error) {
          console.error('alert check', error);
        }
      }
    };

    const interval = setInterval(checkAlerts, 1000 * 60 * 5);
    checkAlerts();
    return () => clearInterval(interval);
  }, [items]);

  const exportCsv = () => {
    const header = 'ticker,entry,stop,target1,target2\n';
    const rows = items.map((i) => `${i.ticker},${i.entry},${i.stop},${i.target1},${i.target2 ?? ''}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'watchlist.csv';
    a.click();
  };

  return (
    <div className="card p-4 space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">Watching {items.length} tickers</p>
        <Button variant="outline" onClick={exportCsv} disabled={!items.length}>
          Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-400">
            <tr className="text-left">
              <th className="p-2">Ticker</th>
              <th className="p-2">Price Plan</th>
              <th className="p-2">Alert</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: ScanResult) => (
              <tr key={item.ticker} className="border-t border-gray-800">
                <td className="p-2 font-semibold">{item.ticker}</td>
                <td className="p-2 text-gray-300">
                  Entry {item.entry} / SL {item.stop} / T1 {item.target1} / T2 {item.target2}
                </td>
                <td className="p-2 text-green-300">{alerts[item.ticker] ?? '—'}</td>
                <td className="p-2">
                  <Button variant="outline" onClick={() => remove(item.ticker)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
