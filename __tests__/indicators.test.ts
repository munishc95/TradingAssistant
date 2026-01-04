import { describe, expect, it } from 'vitest';
import { atr, ema, pivotPoints, rsi } from '../lib/indicators';

const closes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('ema', () => {
  it('computes smoothing', () => {
    const values = ema(3, closes);
    expect(values[values.length - 1]).toBeCloseTo(9.25, 2);
  });
});

describe('rsi', () => {
  it('stays within bounds', () => {
    const values = rsi(3, closes);
    expect(values[0]).toBeGreaterThan(0);
    expect(values[0]).toBeLessThan(100);
  });
});

describe('atr', () => {
  it('returns smoothing', () => {
    const candles = closes.map((c, i) => ({ date: `${i}`, open: c, high: c + 1, low: c - 1, close: c }));
    const values = atr(3, candles);
    expect(values.at(-1)).toBeGreaterThan(0);
  });
});

describe('pivotPoints', () => {
  it('identifies swing highs and lows', () => {
    const candles = [1, 3, 2, 5, 4, 6, 3, 2, 4, 1].map((c, i) => ({
      date: `${i}`,
      open: c,
      high: c + 0.5,
      low: c - 0.5,
      close: c,
    }));
    const pivots = pivotPoints(candles, 1);
    const highs = pivots.filter((p) => p.type === 'high');
    const lows = pivots.filter((p) => p.type === 'low');
    expect(highs.length).toBeGreaterThan(0);
    expect(lows.length).toBeGreaterThan(0);
    expect(highs[0].price).toBeCloseTo(3.5);
    expect(lows[0].price).toBeCloseTo(1.5);
  });
});
