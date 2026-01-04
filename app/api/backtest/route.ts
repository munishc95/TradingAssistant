import { NextResponse } from 'next/server';
import { fetchDailyCandles } from '../../../lib/data-provider';
import { runBacktest } from '../../../lib/backtest';

const periodToMonths: Record<string, number> = { '6M': 6, '1Y': 12, '3Y': 36 };

export async function POST(request: Request) {
  const { ticker, period = '6M', strategy = 'swing' } = await request.json();
  const candles = await fetchDailyCandles(ticker);
  const months = periodToMonths[period] ?? 6;
  const sliced = candles.slice(-Math.round(months * 21));
  const result = runBacktest(sliced, { strategy, slippage: 0.001, transactionCost: 0.0005 });
  return NextResponse.json(result);
}
