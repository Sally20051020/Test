from __future__ import annotations

import hashlib
import json
from typing import Dict

import streamlit as st

from robo_fintech.config import DATA_DIR

USERS_FILE = DATA_DIR / "users.json"


def _load_users() -> Dict[str, dict]:
    if not USERS_FILE.exists():
        return {}
    with open(USERS_FILE, encoding="utf-8") as f:
        return json.load(f)


def _save_users(users: Dict[str, dict]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)


def _hash_password(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def register_user(username: str, password: str) -> tuple[bool, str]:
    username = username.strip()
    if len(username) < 3:
        return False, "用户名至少 3 个字符。"
    if len(password) < 6:
        return False, "密码至少 6 位。"
    users = _load_users()
    if username in users:
        return False, "用户名已存在。"
    users[username] = {"password_hash": _hash_password(password)}
    _save_users(users)
    return True, "注册成功，请登录。"


def login_user(username: str, password: str) -> tuple[bool, str]:
    users = _load_users()
    user = users.get(username.strip())
    if not user:
        return False, "用户不存在。"
    if user.get("password_hash") != _hash_password(password):
        return False, "密码错误。"
    st.session_state["auth_user"] = username.strip()
    return True, f"欢迎回来，{username.strip()}。"


def change_password(username: str, old_password: str, new_password: str) -> tuple[bool, str]:
    users = _load_users()
    user = users.get(username.strip())
    if not user:
        return False, "用户不存在。"
    if user.get("password_hash") != _hash_password(old_password):
        return False, "旧密码不正确。"
    if len(new_password) < 6:
        return False, "新密码至少 6 位。"
    user["password_hash"] = _hash_password(new_password)
    users[username.strip()] = user
    _save_users(users)
    return True, "密码更新成功。"


def logout_user() -> None:
    st.session_state.pop("auth_user", None)


def current_user() -> str:
    return st.session_state.get("auth_user", "")


def ensure_login() -> bool:
    if current_user():
        return True
    st.warning("请先到 `Profile` 页面登录后再使用该功能。")
    return False

