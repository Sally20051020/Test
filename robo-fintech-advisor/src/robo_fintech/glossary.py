import json
from pathlib import Path

from robo_fintech.config import DATA_DIR


def load_glossary(path: Path | None = None) -> list[dict]:
    """加载中英术语表 JSON：每项含 en, zh, note(可选)。"""
    p = path or (DATA_DIR / "glossary_sample.json")
    if not p.exists():
        return []
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def search_terms(query: str, entries: list[dict], limit: int = 8) -> list[dict]:
    q = (query or "").strip().lower()
    if not q:
        return entries[:limit]
    out: list[dict] = []
    for e in entries:
        en = str(e.get("en", "")).lower()
        zh = str(e.get("zh", "")).lower()
        if q in en or q in zh or en.startswith(q) or zh.startswith(q):
            out.append(e)
        if len(out) >= limit:
            break
    return out
