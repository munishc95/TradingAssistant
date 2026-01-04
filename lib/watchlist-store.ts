'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ScanResult } from './scoring';

type WatchItem = ScanResult;

type WatchState = {
  items: WatchItem[];
  add: (item: WatchItem) => void;
  remove: (ticker: string) => void;
  clear: () => void;
};

export const useWatchlist = create<WatchState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const exists = get().items.find((i) => i.ticker === item.ticker);
        if (exists) return;
        set({ items: [...get().items, item] });
      },
      remove: (ticker) => set({ items: get().items.filter((i) => i.ticker !== ticker) }),
      clear: () => set({ items: [] }),
    }),
    { name: 'swingscanner-watchlist' },
  ),
);
