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
    <div class="rf-hero">
      <div class="rf-badge">AI-Powered Learning for Gen-Z Investors</div>
      <h1>Master Your Money<br>Before You Invest.</h1>
      <p>
        Learn stock market basics, practice trading with virtual cash,
        and explore technical signals in one place.
        No real risk, all real learning.
      </p>
    </div>
    """,
    unsafe_allow_html=True,
)

c1, c2, c3 = st.columns(3)
with c1:
    st.markdown(
        """
        <div class="rf-stat">
          <div class="rf-stat-label">Learning Mode</div>
          <div class="rf-stat-value">Glossary + QA</div>
        </div>
        """,
        unsafe_allow_html=True,
    )
with c2:
    st.markdown(
        """
        <div class="rf-stat">
          <div class="rf-stat-label">Simulation</div>
          <div class="rf-stat-value">Virtual Trading</div>
        </div>
        """,
        unsafe_allow_html=True,
    )
with c3:
    st.markdown(
        """
        <div class="rf-stat">
          <div class="rf-stat-label">Analysis</div>
          <div class="rf-stat-value">Candles + MA</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

st.write("")

if user:
    st.markdown(
        f"<div class='rf-note'>Welcome back, <b>{user}</b>. Your Robo-Fin workspace is ready.</div>",
        unsafe_allow_html=True,
    )
else:
    st.markdown(
        "<div class='rf-note'>You are not logged in yet. Create an account in the Profile page to unlock the simulator and analysis tools.</div>",
        unsafe_allow_html=True,
    )

st.write("")
st.markdown("<div class='rf-section-title'>Explore Core Features</div>", unsafe_allow_html=True)
st.markdown("<div class='rf-section-subtitle'>Start from the area you want to improve first.</div>", unsafe_allow_html=True)

col1, col2 = st.columns(2)

with col1:
    st.markdown(
        """
        <div class="rf-card">
          <h3>📚 Learn with Robo-Fin</h3>
          <p>
            Search FinTech terms, review bilingual explanations,
            and switch to guided Q&A for beginner-friendly learning.
          </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.page_link("pages/1_Terminology_QA.py", label="Open Learning Chat", icon="✨")

with col2:
    st.markdown(
        """
        <div class="rf-card">
          <h3>💹 Practice in the Simulator</h3>
          <p>
            Trade with virtual cash, observe fees, track holdings,
            and build confidence before touching real money.
          </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.page_link("pages/2_Simulated_Trading.py", label="Open Simulator", icon="🚀")

st.write("")
col3, col4 = st.columns([2, 1])

with col3:
    st.markdown(
        """
        <div class="rf-card">
          <h3>📉 Technical Analysis Workspace</h3>
          <p>
            View candlestick charts, moving averages, volume,
            and simple signal logic in a more visual dashboard flow.
          </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.page_link("pages/3_Technical_Analysis.py", label="Open Analysis", icon="📊")

with col4:
    st.markdown(
        """
        <div class="rf-card">
          <h3>👤 Profile</h3>
          <p>
            Sign up, log in, and manage your account before using all modules.
          </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.page_link("pages/0_Profile.py", label="Open Profile", icon="🔐")

st.write("")
st.markdown("<div class='rf-section-title'>Why this version feels stronger</div>", unsafe_allow_html=True)
st.markdown(
    """
    <div class="rf-card">
      <p>
        This homepage is rebuilt to match your TypeScript draft more closely:
        stronger hero section, cleaner dashboard hierarchy, larger rounded cards,
        and clearer entry points for Learn, Simulate, and Analysis.
      </p>
    </div>
    """,
    unsafe_allow_html=True,
)