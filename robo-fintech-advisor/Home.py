import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent
if str(_ROOT / "src") not in sys.path:
    sys.path.insert(0, str(_ROOT / "src"))

import streamlit as st
from robo_fintech.auth import current_user
from robo_fintech.ui import apply_theme

st.set_page_config(
    page_title="Robo-FinTech Advisor",
    page_icon="📈",
    layout="wide",
)

apply_theme()

user = current_user()

st.markdown(
    """
    <div class="rf-card" style="padding: 1.8rem 1.8rem 1.4rem 1.8rem; margin-bottom: 1rem;">
      <h1 style="margin:0; font-size: 3rem; font-weight: 900; letter-spacing: -0.03em;">
        Robo-FinTech Advisor
      </h1>
      <p style="margin-top: 0.7rem; color: var(--muted); font-size: 1.05rem; line-height: 1.7;">
        AI-powered FinTech Learning, Trading Simulation, and Analysis Workspace
      </p>
    </div>
    """,
    unsafe_allow_html=True,
)

if user:
    st.markdown(
        f"<div class='rf-note'>当前登录用户：<b>{user}</b></div>",
        unsafe_allow_html=True,
    )
else:
    st.markdown(
        "<div class='rf-note'>未登录。请先进入左侧 Profile 页面创建账号或登录。</div>",
        unsafe_allow_html=True,
    )

st.write("")

col1, col2 = st.columns(2)

with col1:
    st.markdown('<div class="rf-click-card-wrap">', unsafe_allow_html=True)
    if st.button(
        "**FinTech Learning Chat**\n\n*术语教学 + AI 聊天解释\n双语学习*",
        key="card_learning",
        width="stretch",
    ):
        st.switch_page("pages/1_Terminology_QA.py")
    st.markdown("</div>", unsafe_allow_html=True)

with col2:
    st.markdown('<div class="rf-click-card-wrap">', unsafe_allow_html=True)
    if st.button(
        "**Simulated Trading**\n\n*虚拟交易、手续费、风险指标面板*",
        key="card_sim",
        width="stretch",
    ):
        st.switch_page("pages/2_Simulated_Trading.py")
    st.markdown("</div>", unsafe_allow_html=True)

st.write("")

st.markdown('<div class="rf-click-card-wrap">', unsafe_allow_html=True)
if st.button(
    "**Technical Analysis**\n\n*K 线、成交量、均线与交易信号*",
    key="card_analysis",
    width="stretch",
):
    st.switch_page("pages/3_Technical_Analysis.py")
st.markdown("</div>", unsafe_allow_html=True)
