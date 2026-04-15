from __future__ import annotations

import yfinance as yf


def fetch_history(ticker: str, period: str = "3mo"):
    """拉取历史行情，供图表/分析用。"""
    t = yf.Ticker(ticker.strip())
    hist = t.history(period=period)
    return hist


def fetch_info(ticker: str) -> dict:
    t = yf.Ticker(ticker.strip())
    info = t.info or {}
    return {
        "symbol": ticker.strip(),
        "name": info.get("shortName") or info.get("longName") or ticker,
        "currency": info.get("currency"),
        "regular_market_price": info.get("regularMarketPrice") or info.get("currentPrice"),
    }
