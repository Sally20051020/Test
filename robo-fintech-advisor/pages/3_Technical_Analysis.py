import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT / "src") not in sys.path:
    sys.path.insert(0, str(_ROOT / "src"))

import streamlit as st
import plotly.graph_objects as go
from plotly.subplots import make_subplots

from robo_fintech.auth import ensure_login
from robo_fintech.market import fetch_history, fetch_info
from robo_fintech.strategy import double_ma_signal
from robo_fintech.ui import apply_theme

st.set_page_config(page_title="技术分析", page_icon="📉", layout="wide")
apply_theme()
st.header("技术分析（K 线 + 成交量）")
if not ensure_login():
    st.stop()

with st.container(border=True):
    ticker = st.text_input("股票代码", "9988.HK")
    period = st.selectbox("区间", ["1mo", "3mo", "6mo", "1y"], index=1)

if st.button("加载图表"):
    try:
        info = fetch_info(ticker)
        hist = fetch_history(ticker, period=period)
    except Exception as ex:
        st.error(f"拉取数据失败：{ex}")
        st.stop()

    if hist.empty:
        st.warning("没有返回数据，请检查代码或网络。")
        st.stop()

    hist["MA5"] = hist["Close"].rolling(5).mean()
    hist["MA20"] = hist["Close"].rolling(20).mean()

    st.write(
        f"**{info.get('name')}** ({info.get('symbol')}) "
        f"货币 {info.get('currency')} "
        f"参考价 {info.get('regular_market_price')}"
    )

    fig = make_subplots(
        rows=2,
        cols=1,
        shared_xaxes=True,
        vertical_spacing=0.03,
        row_heights=[0.7, 0.3],
    )
    fig.add_trace(
        go.Candlestick(
            x=hist.index,
            open=hist["Open"],
            high=hist["High"],
            low=hist["Low"],
            close=hist["Close"],
            name="OHLC",
        ),
        row=1,
        col=1,
    )
    fig.add_trace(
        go.Bar(x=hist.index, y=hist["Volume"], name="成交量", marker_color="steelblue"),
        row=2,
        col=1,
    )
    fig.add_trace(
        go.Scatter(x=hist.index, y=hist["MA5"], mode="lines", name="MA5"),
        row=1,
        col=1,
    )
    fig.add_trace(
        go.Scatter(x=hist.index, y=hist["MA20"], mode="lines", name="MA20"),
        row=1,
        col=1,
    )
    fig.update_layout(xaxis_rangeslider_visible=False, height=640, template="plotly_white")
    st.plotly_chart(fig, use_container_width=True)

    signal = double_ma_signal(
        short_ma=float(hist["MA5"].iloc[-1]),
        long_ma=float(hist["MA20"].iloc[-1]),
        holding=False,
    )
    st.info(f"双均线信号：`{signal}`")
    st.caption("后续可加入 MACD、支撑阻力与大模型的一键解读。")
