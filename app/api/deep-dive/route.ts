import { NextResponse } from 'next/server';
import { fetchDailyCandles, fetchFundamentals } from '../../../lib/data-provider';
import { computeScores } from '../../../lib/scoring';

export async function POST(request: Request) {
  const { ticker } = await request.json();
  const candles = await fetchDailyCandles(ticker);
  const fundamentals = await fetchFundamentals(ticker);
  const plan = computeScores(ticker, candles, fundamentals);
  return NextResponse.json({ candles, summary: fundamentals, plan });
}
