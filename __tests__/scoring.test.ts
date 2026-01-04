import { describe, expect, it } from 'vitest';
import { computeFundamentalsScore, computeScores } from '../lib/scoring';
import type { Candle } from '../lib/indicators';

describe('computeFundamentalsScore', () => {
  it('rewards healthy metrics', () => {
    const score = computeFundamentalsScore({ roe: 15, debtToEquity: 0.3, revenueGrowth: 10, profitGrowth: 12, pe: 15, pb: 3 });
    expect(score).toBeGreaterThan(10);
  });
});

describe('computeScores', () => {
  it('creates plan from candles', () => {
    const candles: Candle[] = Array.from({ length: 60 }).map((_, i) => ({
      date: `2023-01-${i + 1}`,
      open: 100 + i,
      high: 102 + i,
      low: 98 + i,
      close: 101 + i,
      volume: 100000 + i * 100,
    }));
    const result = computeScores('TEST', candles);
    expect(result?.score).toBeGreaterThan(0);
    expect(result?.entry).toBeGreaterThan(0);
  });
});
