# EGX Charts

TradingView-style charts for Egyptian Exchange stocks. Arabic and English UI.

## Open it
Double-click `index.html` (Chrome, Edge or Firefox). No server, no install, works offline.

## Update the prices
Needs Node 18+ and internet:

    node tools/fetch-data.mjs          # all stocks
    node tools/fetch-data.mjs COMI ETEL # some

Then refresh the page. Add stocks by editing `tools/symbols.json` (EGX code, English name, Arabic name, sector EN, sector AR) and re-running.

## What is in it
- 34 EGX stocks, daily data back to 2009 (shorter for newer listings). Candles, bars, line, area. Day / week / month / quarter / year. Log scale.
- Indicators: Volume, SMA, EMA, WMA, Bollinger, Donchian, Supertrend, rolling VWAP, RSI, MACD, Stochastic, CCI, ATR, ADX, OBV, ROC, Williams %R, MFI. Edit parameters inline.
- Drawing: trend line, ray, horizontal, vertical, rectangle, Fibonacci, text, measure. Magnet to OHLC. Click to select, Delete removes. Saved per stock in the browser.
- Compare: price ratio between two stocks in its own pane, plus correlation.
- Stats tab, and a screener (RSI, trend, distance from 52-week high).
- Scripts tab: write JavaScript that plots lines, histograms, levels and markers. See "Script API reference" in the tab and the 7 examples.

## Limits
- Data is end-of-day from Yahoo Finance's public endpoint (unofficial, no licence for redistribution, can change or break). Not live. No intraday timeframes.
- Prices are as reported, not checked against EGX's official data.
- No fundamentals (P/E, EPS, etc.). Price-based ratios only.
- Not investment advice.
