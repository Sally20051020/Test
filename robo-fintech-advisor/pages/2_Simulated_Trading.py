import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT / "src") not in sys.path:
    sys.path.insert(0, str(_ROOT / "src"))

import streamlit as st
import yfinance as yf
import pandas as pd

from robo_fintech.auth import ensure_login
from robo_fintech.strategy import calculate_fee, calc_risk_metrics
from robo_fintech.ui import apply_theme

st.set_page_config(page_title="模拟交易", page_icon="💹", layout="wide")
apply_theme()
st.header("模拟交易（演示）")
if not ensure_login():
    st.stop()

if "sim_cash" not in st.session_state:
    st.session_state.sim_cash = 50_000.0
if "sim_positions" not in st.session_state:
    st.session_state.sim_positions = {}
if "sim_equity" not in st.session_state:
    st.session_state.sim_equity = [50_000.0]

def reset_portfolio():
    st.session_state.sim_cash = 50_000.0
    st.session_state.sim_positions = {}
    st.session_state.sim_equity = [50_000.0]

with st.container(border=True):
    col_a, col_b = st.columns(2)
    with col_a:
        st.metric("虚拟现金 (HKD)", f"{st.session_state.sim_cash:,.2f}")
    with col_b:
        if st.button("重置为 HK$50,000"):
            reset_portfolio()
            st.rerun()

with st.container(border=True):
    ticker = st.text_input("股票代码（港股示例 9988.HK，美股 AAPL）", "9988.HK")
    qty = st.number_input("数量（股）", min_value=1, value=10, step=1)

    c1, c2 = st.columns(2)
    with c1:
        buy = st.button("买入（按最近收盘价估算）")
    with c2:
        sell = st.button("卖出全部该标的")

if buy or sell:
    try:
        px = float(yf.Ticker(ticker.strip()).history(period="5d")["Close"].iloc[-1])
    except Exception as ex:
        st.error(f"无法获取行情：{ex}")
        st.stop()

    pos = st.session_state.sim_positions.get(ticker.strip(), {"qty": 0, "avg": 0.0})

    if buy:
        fee = calculate_fee(px, qty, "buy")
        cost = px * qty + fee
        if cost > st.session_state.sim_cash:
            st.error("现金不足。")
        else:
            new_qty = pos["qty"] + qty
            new_avg = (pos["avg"] * pos["qty"] + px * qty) / new_qty if new_qty else 0.0
            st.session_state.sim_positions[ticker.strip()] = {"qty": new_qty, "avg": new_avg}
            st.session_state.sim_cash -= cost
            st.success(f"已买入 {qty} 股 @ {px:.2f}，手续费 {fee:.2f}")

    if sell:
        q0 = pos["qty"]
        if q0 <= 0:
            st.warning("没有持仓。")
        else:
            fee = calculate_fee(px, q0, "sell")
            st.session_state.sim_cash += px * q0 - fee
            st.session_state.sim_positions[ticker.strip()] = {"qty": 0, "avg": 0.0}
            st.success(f"已卖出 {q0} 股 @ {px:.2f}，手续费 {fee:.2f}")

portfolio_value = st.session_state.sim_cash
for sym, p in st.session_state.sim_positions.items():
    if p["qty"] > 0:
        try:
            last_px = float(yf.Ticker(sym).history(period="5d")["Close"].iloc[-1])
        except Exception:
            last_px = p["avg"]
        portfolio_value += p["qty"] * last_px
st.session_state.sim_equity.append(portfolio_value)

with st.container(border=True):
    st.subheader("持仓")
    for sym, p in st.session_state.sim_positions.items():
        if p["qty"] > 0:
            try:
                last = float(yf.Ticker(sym).history(period="5d")["Close"].iloc[-1])
            except Exception:
                last = p["avg"]
            mv = last * p["qty"]
            pnl = (last - p["avg"]) * p["qty"]
            st.write(f"- **{sym}** 数量 {p['qty']} | 成本 {p['avg']:.2f} | 现价 {last:.2f} | 市值 {mv:,.2f} | 浮动盈亏 {pnl:,.2f}")

st.subheader("风险指标")
metrics = calc_risk_metrics(pd.Series(st.session_state.sim_equity))
if metrics:
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("总收益率", f"{metrics['total_return'] * 100:.2f}%")
    c2.metric("年化收益率", f"{metrics['annual_return'] * 100:.2f}%")
    c3.metric("夏普比率", f"{metrics['sharpe_ratio']:.2f}")
    c4.metric("最大回撤", f"{metrics['max_drawdown'] * 100:.2f}%")

st.caption("数据来自 yfinance，仅供学习；后续可把交易记录落地到 SQLite 并接入任务关卡。")
