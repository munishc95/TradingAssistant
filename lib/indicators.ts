export type Candle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export function ema(period: number, values: number[]): number[] {
  if (period <= 0) throw new Error('Period must be positive');
  const k = 2 / (period + 1);
  const result: number[] = [];
  let emaPrev = values[0];
  result.push(emaPrev);
  for (let i = 1; i < values.length; i++) {
    emaPrev = values[i] * k + emaPrev * (1 - k);
    result.push(emaPrev);
  }
  return result;
}

export function rsi(period: number, values: number[]): number[] {
  if (period <= 0) throw new Error('Period must be positive');
  if (values.length < period + 1) return [];
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    gains.push(Math.max(change, 0));
    losses.push(Math.max(-change, 0));
  }
  let avgGain = average(gains.slice(0, period));
  let avgLoss = average(losses.slice(0, period));
  const rsiValues: number[] = [];
  rsiValues.push(100 - 100 / (1 + avgGain / Math.max(avgLoss, 1e-8)));
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rs = avgGain / Math.max(avgLoss, 1e-8);
    rsiValues.push(100 - 100 / (1 + rs));
  }
  return rsiValues;
}

export function atr(period: number, candles: Candle[]): number[] {
  if (candles.length < period + 1) return [];
  const trs: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      trs.push(candles[i].high - candles[i].low);
    } else {
      const prevClose = candles[i - 1].close;
      const highLow = candles[i].high - candles[i].low;
      const highClose = Math.abs(candles[i].high - prevClose);
      const lowClose = Math.abs(candles[i].low - prevClose);
      trs.push(Math.max(highLow, highClose, lowClose));
    }
  }
  const atrValues: number[] = [];
  let initial = average(trs.slice(0, period));
  atrValues.push(initial);
  for (let i = period; i < trs.length; i++) {
    initial = (initial * (period - 1) + trs[i]) / period;
    atrValues.push(initial);
  }
  return atrValues;
}

function average(arr: number[]): number {
  return arr.reduce((sum, v) => sum + v, 0) / Math.max(arr.length, 1);
}

export function pivotPoints(candles: Candle[], lookback = 5) {
  const pivots: { type: 'high' | 'low'; price: number; index: number }[] = [];
  for (let i = lookback; i < candles.length - lookback; i++) {
    const window = candles.slice(i - lookback, i + lookback + 1);
    const highs = window.map((c) => c.high);
    const lows = window.map((c) => c.low);
    if (candles[i].high === Math.max(...highs)) {
      pivots.push({ type: 'high', price: candles[i].high, index: i });
    }
    if (candles[i].low === Math.min(...lows)) {
      pivots.push({ type: 'low', price: candles[i].low, index: i });
    }
  }
  return pivots;
}
