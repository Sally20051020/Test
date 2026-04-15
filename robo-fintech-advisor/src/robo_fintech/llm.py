from __future__ import annotations

from openai import OpenAI
from openai import APIStatusError

from robo_fintech.config import OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL


def has_llm_config() -> bool:
    return bool(OPENAI_API_KEY.strip())


def ask_llm(system_prompt: str, user_prompt: str) -> str:
    if not has_llm_config():
        return "尚未配置 API Key。请在项目根目录 `.env` 中添加 `OPENAI_API_KEY` 后重试。"

    client = OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)
    try:
        resp = client.chat.completions.create(
            model=OPENAI_MODEL,
            temperature=0.2,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        return resp.choices[0].message.content or ""
    except APIStatusError as e:
        if e.status_code == 402:
            return "外部 AI 暂不可用：账户余额不足（402 Insufficient Balance）。你仍可继续使用本地词库教学功能。"
        return f"外部 AI 请求失败（HTTP {e.status_code}）。你仍可使用本地词库教学功能。"
    except Exception:
        return "外部 AI 连接失败。请稍后重试，或先使用本地词库教学功能。"

