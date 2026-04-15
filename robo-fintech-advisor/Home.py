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
      <h1 style="margin:0; font-size: 3rem; font-weight: 900; letter-spacing: -0.03em;">Robo-FinTech Advisor</h1>
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

c1, c2 = st.columns(2)

with c1:
    st.markdown(
        """
        <div class="rf-card" style="min-height: 150px;">
          <h3>FinTech Learning Chat</h3>
          <p>术语教学 + AI 聊天解释 + 双语学习</p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.page_link("pages/1_Terminology_QA.py", label="进入 Learning Chat", icon="📚")

with c2:
    st.markdown(
        """
        <div class="rf-card" style="min-height: 150px;">
          <h3>Simulated Trading</h3>
          <p>虚拟交易、手续费、风险指标面板</p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.page_link("pages/2_Simulated_Trading.py", label="进入 Simulated Trading", icon="💹")

st.write("")

st.markdown(
    """
    <div class="rf-card" style="min-height: 150px;">
      <h3>Technical Analysis</h3>
      <p>K 线、成交量、均线与交易信号</p>
    </div>
    """,
    unsafe_allow_html=True,
)
st.page_link("pages/3_Technical_Analysis.py", label="进入 Technical Analysis", icon="📉")
