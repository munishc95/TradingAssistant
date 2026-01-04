'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ScannerTab from './tabs/scanner';
import DeepDiveTab from './tabs/deep-dive';
import WatchlistTab from './tabs/watchlist';
import BacktestTab from './tabs/backtest';

export default function Home() {
  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">SwingScanner</h1>
          <p className="text-sm text-gray-400">Education only. Not financial advice. Verify independently.</p>
        </div>
        <div className="text-xs text-yellow-200 bg-yellow-900 px-3 py-2 rounded-md border border-yellow-700">
          Paper-use only. Server-side APIs keep keys safe.
        </div>
      </header>

      <Tabs defaultValue="scanner">
        <TabsList>
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="deep">Deep Dive</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="backtest">Backtest</TabsTrigger>
        </TabsList>
        <TabsContent value="scanner">
          <ScannerTab />
        </TabsContent>
        <TabsContent value="deep">
          <DeepDiveTab />
        </TabsContent>
        <TabsContent value="watchlist">
          <WatchlistTab />
        </TabsContent>
        <TabsContent value="backtest">
          <BacktestTab />
        </TabsContent>
      </Tabs>
    </main>
  );
}
