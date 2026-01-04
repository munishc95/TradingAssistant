import { Candle, ema, rsi, atr } from './indicators';

export type FundamentalSnapshot = {
  marketCap?: number;
  pe?: number;
  pb?: number;
  roe?: number;
  debtToEquity?: number;
  revenueGrowth?: number;
  profitGrowth?: number;
};

export type ScanResult = {
  ticker: string;
  companyName?: string;
  sector?: string;
  currentPrice: number;
  dayChange: number;
  action: 'BUY' | 'SELL' | 'WAIT';
  entry: number;
  stop: number;
  target1: number;
  target2?: number;
  confidence: 'LOW' | 'MED' | 'HIGH';
  rationale: string;
  setup: 'Breakout' | 'Pullback';
  score: number;
  formulaDetails: {
    technical: number;
    fundamentals: number;
    liquidity: number;
    breakdown: Record<string, number>;
  };
};

export function computeScores(
  ticker: string,
  candles: Candle[],
  fundamentals: FundamentalSnapshot = {},
): ScanResult | null {
  if (!candles.length) return null;
  const closes = candles.map((c) => c.close);
  const ema20 = ema(20, closes);
  const ema50 = ema(50, closes);
  const rsiVals = rsi(14, closes);
  const atrVals = atr(14, candles);
  const last = candles[candles.length - 1];
  const lastEma20 = ema20[ema20.length - 1];
  const lastEma50 = ema50[ema50.length - 1];
  const lastRsi = rsiVals[rsiVals.length - 1] ?? 50;
  const lastAtr = atrVals[atrVals.length - 1] ?? 0;
  const twentyDayHigh = Math.max(...candles.slice(-20).map((c) => c.high));
  const twentyDayVol = average(candles.slice(-20).map((c) => c.volume ?? 0));
  const volumeSurge = last.volume && twentyDayVol ? last.volume / twentyDayVol : 1;

  const bullishTrend = last.close > lastEma20 && lastEma20 > lastEma50;
  const bearishTrend = last.close < lastEma20 && lastEma20 < lastEma50;
  const breakout = last.close > twentyDayHigh * 1.002;
  const pullback = last.close > lastEma50 && Math.abs(last.close - lastEma20) < lastAtr * 0.5;

  const technicalScoreRaw =
    (bullishTrend ? 25 : bearishTrend ? 15 : 5) +
    (breakout ? 20 : 0) +
    (pullback ? 15 : 0) +
    (50 - Math.abs(50 - lastRsi)) * 0.3 +
    Math.min(volumeSurge, 3) * 5;
  const technicalScore = clamp(technicalScoreRaw, 0, 60);

  const fundamentalsScore = computeFundamentalsScore(fundamentals);
  const liquidityScore = clamp((last.close / 10) * 2 + Math.min(volumeSurge * 5, 10), 0, 10);

  const total = round(technicalScore + fundamentalsScore + liquidityScore);

  const setup: 'Breakout' | 'Pullback' = breakout ? 'Breakout' : 'Pullback';
  const entry =
    setup === 'Breakout'
      ? round(twentyDayHigh * 1.002)
      : round(lastEma20 + (pullback ? 0 : 0.5 * lastAtr));
  const stop = round(Math.min(entry - 1.5 * lastAtr, candles[candles.length - 2]?.low - 0.5 * lastAtr || entry * 0.97));
  const risk = entry - stop;
  const target1 = round(entry + 2 * risk);
  const target2 = round(entry + 3 * risk);
  const confidence = deriveConfidence({ bullishTrend, bearishTrend, breakout, pullback, rsi: lastRsi, liquidityScore });

  return {
    ticker,
    currentPrice: last.close,
    dayChange: ((last.close - candles[candles.length - 2]?.close) / candles[candles.length - 2]?.close) * 100 || 0,
    action: bullishTrend ? 'BUY' : bearishTrend ? 'SELL' : 'WAIT',
    entry,
    stop,
    target1,
    target2,
    confidence,
    rationale: breakout
      ? 'Breakout above recent swing high'
      : pullback
      ? 'Pullback toward dynamic support'
      : 'Sideways - waiting for confirmation',
    setup,
    score: total,
    companyName: fundamentals.marketCap ? `${ticker} Corp` : undefined,
    sector: fundamentals.revenueGrowth ? 'Growth' : undefined,
    formulaDetails: {
      technical: round((technicalScore / 60) * 60),
      fundamentals: round((fundamentalsScore / 30) * 30),
      liquidity: round(liquidityScore),
      breakdown: {
        trend: bullishTrend || bearishTrend ? 25 : 5,
        breakout: breakout ? 20 : 0,
        pullback: pullback ? 15 : 0,
        rsi: round((50 - Math.abs(50 - lastRsi)) * 0.3),
        volume: round(Math.min(volumeSurge, 3) * 5),
        roe: (fundamentals.roe ?? 0) * 0.6,
      },
    },
  };
}

export function computeFundamentalsScore(f: FundamentalSnapshot): number {
  let score = 0;
  if (f.roe) score += Math.min(f.roe, 25) * 0.6;
  if (f.debtToEquity !== undefined) score += Math.max(0, 10 - f.debtToEquity * 5);
  if (f.revenueGrowth) score += Math.min(f.revenueGrowth, 20) * 0.5;
  if (f.profitGrowth) score += Math.min(f.profitGrowth, 20) * 0.5;
  if (f.pe && f.pb) score += Math.max(0, 10 - Math.abs(f.pe / Math.max(f.pb, 1) - 10));
  return clamp(score, 0, 30);
}

function deriveConfidence({
  bullishTrend,
  bearishTrend,
  breakout,
  pullback,
  rsi,
  liquidityScore,
}: {
  bullishTrend: boolean;
  bearishTrend: boolean;
  breakout: boolean;
  pullback: boolean;
  rsi: number;
  liquidityScore: number;
}): 'LOW' | 'MED' | 'HIGH' {
  const aligned = bullishTrend || bearishTrend;
  const supportiveRsi = bullishTrend ? rsi > 45 : bearishTrend ? rsi < 55 : false;
  const strong = aligned && supportiveRsi && (breakout || pullback) && liquidityScore > 4;
  if (strong) return 'HIGH';
  if ((aligned && supportiveRsi) || breakout || pullback) return 'MED';
  return 'LOW';
}

function average(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / Math.max(arr.length, 1);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
