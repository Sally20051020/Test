from __future__ import annotations

import numpy as np
import pandas as pd


def double_ma_signal(short_ma: float, long_ma: float, holding: bool) -> str:
    """Borrowed idea from ai_quant_trade: MA cross timing."""
    if short_ma >= long_ma and not holding:
        return "buy"
    if short_ma < long_ma and holding:
        return "sell"
    return "hold"


def calculate_fee(price: float, quantity: int, side: str) -> float:
    """
    Simplified fee model inspired by ai_quant_trade/cal_fee.py.
    """
    open_commission = 0.0003
    close_commission = 0.0003
    close_tax = 0.001
    min_commission = 5.0

    if side == "buy":
        commission = max(min_commission, open_commission * price * quantity)
        tax = 0.0
    else:
        commission = max(min_commission, close_commission * price * quantity)
        tax = close_tax * price * quantity
    return float(commission + tax)


def calc_risk_metrics(equity_curve: pd.Series) -> dict[str, float]:
    """
    Simplified risk indicators inspired by ai_quant_trade/risk_indicator.py.
    """
    if equity_curve.empty:
        return {}

    returns = equity_curve.pct_change().fillna(0.0)
    total_return = equity_curve.iloc[-1] / equity_curve.iloc[0] - 1
    annual_return = (1 + total_return) ** (252 / max(len(equity_curve), 1)) - 1
    vol = returns.std() * np.sqrt(252)
    sharpe = (returns.mean() * 252) / vol if vol > 0 else 0.0
    drawdown = (equity_curve / equity_curve.cummax()) - 1
    max_drawdown = float(drawdown.min())
    downside = returns[returns < 0].std() * np.sqrt(252)
    sortino = (returns.mean() * 252) / downside if downside and not np.isnan(downside) else 0.0

    return {
        "total_return": float(total_return),
        "annual_return": float(annual_return),
        "sharpe_ratio": float(sharpe),
        "max_drawdown": max_drawdown,
        "sortino_ratio": float(sortino),
    }

