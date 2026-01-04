import { describe, expect, it } from 'vitest';
import { atr, ema, rsi } from '../lib/indicators';

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
