import { Candle, ema } from './indicators';

export type BacktestConfig = {
  strategy: 'swing' | 'ema';
  slippage: number;
  transactionCost: number;
};

export type BacktestResult = {
  totalReturn: number;
  cagr: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
  avgR: number;
  exposure: number;
  equityCurve: { date: string; equity: number }[];
};

const TRADING_DAYS_PER_YEAR = 252;
const MAX_HOLD_BARS = 5;
const STOP_LOSS_PCT = 0.02;
const TAKE_PROFIT_PCT = 0.04;

export function runBacktest(candles: Candle[], config: BacktestConfig): BacktestResult {
  if (candles.length < 50) return emptyResult(candles);
  const closes = candles.map((c) => c.close);
  const ema20 = ema(20, closes);
  const ema50 = ema(50, closes);

  let equity = 1;
  let peak = 1;
  let drawdown = 0;
  let wins = 0;
  let losses = 0;
  const curve: { date: string; equity: number }[] = [];

  for (let i = 1; i < candles.length - 1; i++) {
    const signal = config.strategy === 'ema' ? emaCross(ema20[i], ema50[i]) : swingSignal(closes, i);
    if (!signal) continue;
    const entry = candles[i + 1].open * (1 + config.slippage);
    const lastPossibleIndex = Math.min(i + MAX_HOLD_BARS, candles.length - 1);
    let exitIndex = lastPossibleIndex;
    for (let j = i + 1; j <= lastPossibleIndex; j++) {
      const price = candles[j].close;
      if (price <= entry * (1 - STOP_LOSS_PCT) || price >= entry * (1 + TAKE_PROFIT_PCT)) {
        exitIndex = j;
        break;
      }
    }
    const exit = candles[exitIndex].close;
    const grossReturn = (exit - entry) / entry - config.transactionCost;
    equity *= 1 + grossReturn;
    if (grossReturn > 0) wins++; else losses++;
    peak = Math.max(peak, equity);
    drawdown = Math.max(drawdown, (peak - equity) / peak);
    curve.push({ date: candles[i].date, equity });
  }

  const totalReturn = equity - 1;
  const years = candles.length / TRADING_DAYS_PER_YEAR;
  const cagr = Math.pow(equity, 1 / years) - 1;
  const trades = wins + losses || 1;
  const winRate = wins / trades;
  const avgR = totalReturn / Math.max(trades, 1);

  return {
    totalReturn,
    cagr,
    maxDrawdown: drawdown,
    winRate,
    trades,
    avgR,
    exposure: Math.min(1, trades * 5 / candles.length),
    equityCurve: curve,
  };
}

function emaCross(e20?: number, e50?: number): 1 | 0 {
  if (!e20 || !e50) return 0;
  return e20 > e50 ? 1 : 0;
}

function swingSignal(closes: number[], idx: number): 1 | 0 {
  if (idx < 15) return 0;
  const window = closes.slice(idx - 10, idx);
  const recentHigh = Math.max(...window);
  return closes[idx] > recentHigh ? 1 : 0;
}

function emptyResult(candles: Candle[]): BacktestResult {
  return {
    totalReturn: 0,
    cagr: 0,
    maxDrawdown: 0,
    winRate: 0,
    trades: 0,
    avgR: 0,
    exposure: 0,
    equityCurve: candles.map((c) => ({ date: c.date, equity: 1 })),
  };
}
