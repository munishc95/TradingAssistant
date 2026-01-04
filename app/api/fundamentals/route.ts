import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { fetchFundamentals } from '../../../lib/data-provider';

export async function POST(request: Request) {
  const { ticker } = await request.json();
  const fundamentals = await fetchFundamentals(ticker);
  let price = null;
  try {
    const quote = await yahooFinance.quote(ticker);
    price = quote.regularMarketPrice ?? null;
  } catch (error) {
    console.error('quote failed', error);
  }
  return NextResponse.json({ price, fundamentals });
}
