import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT / "src") not in sys.path:
    sys.path.insert(0, str(_ROOT / "src"))

import streamlit as st

from robo_fintech.auth import change_password, current_user, login_user, logout_user, register_user
from robo_fintech.ui import apply_theme

st.set_page_config(page_title="Profile", page_icon="👤", layout="wide")
apply_theme()
st.header("Profile")

user = current_user()
if user:
    st.success(f"已登录：{user}")
    st.subheader("修改密码")
    with st.form("change_password_form"):
        old_pwd = st.text_input("旧密码", type="password")
        new_pwd = st.text_input("新密码", type="password")
        new_pwd2 = st.text_input("确认新密码", type="password")
        update = st.form_submit_button("更新密码")
        if update:
            if new_pwd != new_pwd2:
                st.error("两次新密码不一致。")
            else:
                ok, msg = change_password(user, old_pwd, new_pwd)
                if ok:
                    st.success(msg)
                else:
                    st.error(msg)
    if st.button("退出登录"):
        logout_user()
        st.rerun()
else:
    c1, c2 = st.columns(2)
    with c1:
        st.subheader("登录")
        with st.form("login_form"):
            username = st.text_input("用户名", key="login_username")
            password = st.text_input("密码", type="password", key="login_pwd")
            ok = st.form_submit_button("登录")
            if ok:
                success, msg = login_user(username, password)
                if success:
                    st.success(msg)
                    st.rerun()
                else:
                    st.error(msg)

    with c2:
        st.subheader("注册")
        with st.form("register_form"):
            new_username = st.text_input("新用户名", key="reg_username")
            new_password = st.text_input("新密码", type="password", key="reg_pwd")
            confirm_password = st.text_input("确认密码", type="password", key="reg_pwd2")
            create = st.form_submit_button("创建账号")
            if create:
                if new_password != confirm_password:
                    st.error("两次输入的密码不一致。")
                else:
                    success, msg = register_user(new_username, new_password)
                    if success:
                        st.success(msg)
                    else:
                        st.error(msg)

