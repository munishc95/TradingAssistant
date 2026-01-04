# SwingScanner

Dark-themed educational swing scanner built with Next.js App Router, Tailwind, and shadcn-inspired components. All data is fetched server-side (Yahoo Finance) and no API keys are exposed to the browser.

## Features
- Scanner with NIFTY universes and CSV upload, streaming progress, and ranking model (60% technical / 30% fundamentals / 10% liquidity)
- Deep Dive with candlestick chart (lightweight-charts), fundamentals, and trade plan
- Watchlist persisted in localStorage with CSV export and simple polling alerts
- Backtest tab for swing/EMA strategies with equity summary
- Cached Yahoo Finance candles/fundamentals with concurrency limiting
- Unit tests for indicators and scoring logic

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:3000. For production, run `npm run build && npm start`.

## Environment
- Optional `NEWS_API_KEY` can be added for future news integrations. Currently, the UI falls back to manual headline sentiment.

## Testing

```bash
npm test
```
