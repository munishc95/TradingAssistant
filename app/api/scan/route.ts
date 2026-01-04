import { NextResponse } from 'next/server';
import { computeScores } from '../../../lib/scoring';
import { fetchDailyCandles, fetchFundamentals } from '../../../lib/data-provider';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const { universe = 'nifty50', tickers, topN = 12 } = await request.json();
  const universePath = path.join(process.cwd(), 'data', `${universe}.json`);
  const list: string[] = tickers?.length ? tickers : fs.existsSync(universePath) ? JSON.parse(fs.readFileSync(universePath, 'utf-8')) : [];
  const batchSize = 8;
  let completed = 0;
  const results: any[] = [];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async pull(controller) {
      while (completed < list.length) {
        const slice = list.slice(completed, completed + batchSize);
        const batch = await Promise.all(
          slice.map(async (ticker) => {
            const candles = await fetchDailyCandles(ticker);
            const fundamentals = await fetchFundamentals(ticker);
            return computeScores(ticker, candles, fundamentals);
          }),
        );
        results.push(...batch.filter(Boolean));
        completed += slice.length;
        const pct = Math.round((completed / list.length) * 100);
        controller.enqueue(encoder.encode(`PROGRESS:${pct}\n`));
        return;
      }
      const top = results
        .filter(Boolean)
        .sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))
        .slice(0, topN);
      controller.enqueue(encoder.encode(JSON.stringify({ results: top })));
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
