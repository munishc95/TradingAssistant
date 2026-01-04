import yahooFinance from 'yahoo-finance2';
import { Candle } from './indicators';
import { candleCache, fundamentalsCache } from './cache';

yahooFinance.setGlobalConfig({ queue: { concurrency: 5 } });

export async function fetchDailyCandles(ticker: string): Promise<Candle[]> {
  const cached = candleCache.get(ticker);
  if (cached) return cached;
  const now = new Date();
  const past = new Date();
  past.setMonth(past.getMonth() - 18);
  try {
    const result = await yahooFinance.chart(ticker, {
      period1: past,
      period2: now,
      interval: '1d',
    });
    const candles: Candle[] = (result.quotes ?? []).map((q) => ({
      date: q.date?.toISOString() ?? '',
      open: q.open ?? 0,
      high: q.high ?? 0,
      low: q.low ?? 0,
      close: q.close ?? 0,
      volume: q.volume ?? undefined,
    }));
    candleCache.set(ticker, candles);
    return candles;
  } catch (error) {
    console.error('Failed to fetch candles', ticker, error);
    return [];
  }
}

export async function fetchFundamentals(ticker: string) {
  const cached = fundamentalsCache.get(ticker);
  if (cached) return cached;
  try {
    const summary = await yahooFinance.quoteSummary(ticker, {
      modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData'],
    });
    const fundamentals = {
      marketCap: summary.summaryDetail?.marketCap,
      pe: summary.summaryDetail?.trailingPE,
      pb: summary.defaultKeyStatistics?.priceToBook,
      roe: summary.financialData?.returnOnEquity,
      debtToEquity: summary.financialData?.debtToEquity,
      revenueGrowth: summary.financialData?.revenueGrowth,
      profitGrowth: summary.financialData?.earningsGrowth,
    };
    fundamentalsCache.set(ticker, fundamentals);
    return fundamentals;
  } catch (error) {
    console.error('Failed to fetch fundamentals', ticker, error);
    return {};
  }
}
