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

## Data rules (updated 2026-11-28)
- Prices are Yahoo Finance daily bars. Default view: prices as traded (split-adjusted only). Optional toggle "Dividend-adjust" matches TradingView's adjusted history (factors verified against Yahoo's adjusted close).
- The refresh drops no-trade bars (volume 0), the corrupt 2011 closure window, and repairs inconsistent OHLC (open outside the day's range).
- Opens of older candles from Yahoo may equal the previous close. High, low, close and volume are actual. The newest bar's open is real.
- Inactive stocks: if the last real trade is older than 14 days but the second source shows the same flat price, the chart stays with a red "no trades since" warning (only actual trades are candles). ORAS and VLMRA use their Yahoo ISIN hourly series (~3 years); VLMRA's earlier ISIN was the wrong share line.
- A stock with no real trade in the 14 days before the latest market session, no trades at all, or a last price far from a second source gets no chart (shown as "no reliable data"), never old prices.
- The latest close is compared with TradingView's public scanner as a second source. A gap over 0.5% shows a warning on that stock.
- Not live, not investment advice. Check the price on your broker screen before trading.
