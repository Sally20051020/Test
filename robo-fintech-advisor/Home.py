import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT / "src") not in sys.path:
    sys.path.insert(0, str(_ROOT / "src"))

import streamlit as st

from robo_fintech.auth import ensure_login
from robo_fintech.glossary import load_glossary, search_terms
from robo_fintech.llm import ask_llm, has_llm_config
from robo_fintech.ui import apply_theme

st.set_page_config(page_title="FinTech Learning Chat", page_icon="📖", layout="wide")
apply_theme()
st.header("FinTech Learning Chat")

if not ensure_login():
    st.stop()

entries = load_glossary()
if not entries:
    st.warning("未找到 `data/glossary_sample.json`，请检查数据文件。")
    st.stop()

query = st.text_input("先检索术语（如 merger、合并、市盈率）", "")
hits = search_terms(query, entries, limit=10)

with st.container(border=True):
    st.subheader("词汇教学结果")
    if hits:
        for e in hits:
            st.markdown(
                f"**{e.get('en', '')} / {e.get('zh', '')}**  \n"
                f"{e.get('note') or '（暂无扩展说明）'}"
            )
            st.divider()
    else:
        st.write("未命中词库时，可直接在下方提问，系统会优先使用本地预设答案。")

st.subheader("AI 聊天教学")
if not has_llm_config():
    st.info("当前未配置 API，将自动使用本地预设答案模式。")

if "learn_chat" not in st.session_state:
    st.session_state.learn_chat = []

for role, text in st.session_state.learn_chat[-12:]:
    label = "你" if role == "user" else "导师"
    st.markdown(f"**{label}：** {text}")

prompt = st.text_area(
    "输入你想学习的问题",
    placeholder="例如：请用中文解释 P/E ratio，并举一个港股例子。",
    height=100
)

if st.button("发送到 AI 导师", type="primary"):
    if prompt.strip():
        st.session_state.learn_chat.append(("user", prompt))

        matched_terms = search_terms(prompt, entries, limit=4)

        if has_llm_config():
            glossary_hint = "\n".join(
                [f"{x.get('en')} / {x.get('zh')}: {x.get('note')}" for x in matched_terms]
            )
            system_prompt = (
                "你是一位面向新手用户的金融学习导师。"
                "请用简体中文回答，语气友好，先给定义，再给例子，再给风险提示。"
            )
            user_prompt = (
                f"用户问题：{prompt}\n\n"
                f"可参考术语：\n{glossary_hint if glossary_hint else '无'}\n\n"
                "请输出结构：1) 定义 2) 例子 3) 新手易错点"
            )
            answer = ask_llm(system_prompt, user_prompt)
        else:
            if matched_terms:
                sections = []
                for term in matched_terms:
                    en = term.get("en", "")
                    zh = term.get("zh", "")
                    note = term.get("note", "暂无说明。")

                    text = (
                        f"**{en}（{zh}）**\n\n"
                        f"1) 定义\n{note}\n\n"
                        f"2) 例子\n"
                        f"例如，在金融学习或投资入门时，{zh} 是一个常见概念，理解它有助于你更好地看懂市场信息。\n\n"
                        f"3) 新手易错点\n"
                        f"不要只记中文意思，最好把英文名和它的实际用途一起记。"
                    )
                    sections.append(text)

                answer = "\n\n---\n\n".join(sections)
            else:
                answer = (
                    "当前没有配置 API，所以我先用本地预设答案模式回答。\n\n"
                    "不过这个问题暂时没有在内置 glossary 里找到对应术语。\n"
                    "你可以试试输入更具体的金融词，例如：IPO、P/E ratio、dividend、beta、merger。"
                )

        st.session_state.learn_chat.append(("assistant", answer))
        st.rerun()        unsafe_allow_html=True,
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
