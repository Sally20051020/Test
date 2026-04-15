from __future__ import annotations

import streamlit as st


THEME_CSS = """
<style>
:root {
  --bg: #f8fafc;
  --bg-soft: #f1f5f9;
  --card: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --primary: #2563eb;
  --primary-dark: #1e3a8a;
  --primary-soft: #eff6ff;
  --border: rgba(15, 23, 42, 0.08);
  --shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  --radius-xl: 28px;
  --radius-lg: 20px;
  --radius-md: 14px;
}

html, body, [class*="css"] {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.stApp {
  background:
    radial-gradient(circle at top left, rgba(59,130,246,0.10), transparent 22%),
    linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%);
  color: var(--text);
}

.block-container {
  padding-top: 2rem;
  padding-bottom: 3rem;
}

[data-testid="stSidebar"] {
  background: rgba(255,255,255,0.95);
  border-right: 1px solid var(--border);
}

[data-testid="stSidebar"] .block-container {
  padding-top: 1.5rem;
}

h1, h2, h3 {
  color: var(--text);
  letter-spacing: -0.02em;
}

.rf-hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1d4ed8 0%, #3730a3 55%, #0f172a 100%);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  color: white;
  box-shadow: 0 20px 50px rgba(30, 64, 175, 0.28);
  margin-bottom: 1.25rem;
}

.rf-hero::after {
  content: "";
  position: absolute;
  width: 320px;
  height: 320px;
  right: -90px;
  top: -110px;
  background: radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%);
  border-radius: 999px;
}

.rf-badge {
  display: inline-block;
  background: rgba(255,255,255,0.14);
  color: #dbeafe;
  border: 1px solid rgba(255,255,255,0.18);
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.rf-hero h1 {
  color: white;
  margin: 0 0 0.6rem 0;
  font-size: 3rem;
  line-height: 1.04;
  font-weight: 900;
}

.rf-hero p {
  color: rgba(255,255,255,0.9);
  font-size: 1.03rem;
  line-height: 1.7;
  max-width: 720px;
  margin-bottom: 1.2rem;
}

.rf-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

.rf-card {
  background: rgba(255,255,255,0.96);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.1rem 1.15rem;
  box-shadow: var(--shadow);
}

.rf-card h3 {
  margin: 0 0 0.3rem 0;
  font-size: 1.08rem;
  font-weight: 800;
}

.rf-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
  font-size: 0.96rem;
}

.rf-stat {
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.2rem;
  box-shadow: var(--shadow);
}

.rf-stat-label {
  color: var(--muted);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
}

.rf-stat-value {
  color: var(--text);
  font-size: 1.9rem;
  font-weight: 900;
  margin-top: 0.35rem;
}

.rf-section-title {
  font-size: 1.35rem;
  font-weight: 900;
  margin: 0 0 0.35rem 0;
}

.rf-section-subtitle {
  color: var(--muted);
  margin: 0 0 1rem 0;
}

.rf-note {
  background: var(--primary-soft);
  color: #1e3a8a;
  border: 1px solid #dbeafe;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  font-size: 0.95rem;
  font-weight: 600;
}

.rf-click-card-wrap {
  margin-bottom: 0.9rem;
}

.rf-click-card-wrap .stButton > button {
  width: 100% !important;
  min-height: 170px !important;
  border-radius: 28px !important;
  border: 1px solid rgba(37, 99, 235, 0.12) !important;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  color: white !important;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.20) !important;
  padding: 1.35rem 1.3rem !important;
  text-align: left !important;
  justify-content: flex-start !important;
  align-items: flex-start !important;
  white-space: pre-wrap !important;
  line-height: 1.55 !important;
  font-weight: 700 !important;
}

.rf-click-card-wrap .stButton > button:hover {
  filter: brightness(1.02);
  transform: translateY(-2px);
}

.rf-click-card-wrap .stButton > button p {
  margin: 0 !important;
  line-height: 1.7 !important;
}

.rf-click-card-wrap .stButton > button strong {
  display: block !important;
  font-size: 2rem !important;
  line-height: 1.2 !important;
  margin-bottom: 0.75rem !important;
  font-weight: 900 !important;
}

.rf-click-card-wrap .stButton > button em {
  display: block !important;
  font-size: 1rem !important;
  line-height: 1.75 !important;
  font-style: normal !important;
  font-weight: 500 !important;
  color: rgba(255,255,255,0.92) !important;
}
div.stButton > button,
div.stDownloadButton > button,
button[kind="primary"] {
  border-radius: 14px !important;
  border: none !important;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  color: white !important;
  font-weight: 800 !important;
  padding: 0.65rem 1rem !important;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.22);
}

div.stButton > button:hover,
button[kind="primary"]:hover {
  filter: brightness(1.03);
  transform: translateY(-1px);
}

div[data-testid="stMetric"] {
  background: white;
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1rem;
  box-shadow: var(--shadow);
}

div[data-testid="stTextInput"] input,
div[data-testid="stTextArea"] textarea,
div[data-testid="stNumberInput"] input,
div[data-testid="stSelectbox"] > div {
  border-radius: 14px !important;
}

hr {
  border-color: rgba(15, 23, 42, 0.06);
}
</style>
"""


def apply_theme() -> None:
    st.markdown(THEME_CSS, unsafe_allow_html=True)
