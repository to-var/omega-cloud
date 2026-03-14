"""
Load seed data from JSON files. Database-agnostic: only reads and parses JSON.
Any backend (MongoDB, PostgreSQL, etc.) can use this data to seed its store.
Set SEEDS_DIR (env) to override the default path to the seeds directory.
"""

import json
import os
from pathlib import Path

# Default: seeds in backend/data/seeds/ (sibling of backend/app)
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
_DEFAULT_SEEDS_DIR = _BACKEND_ROOT / "data" / "seeds"


def _get_seeds_dir() -> Path:
    # Prefer env SEEDS_DIR so it works without loading app config
    env_path = os.environ.get("SEEDS_DIR")
    if env_path:
        return Path(env_path)
    # Fall back to config (e.g. from .env) when app is running
    try:
        from app.core.config import settings
        if getattr(settings, "SEEDS_DIR", None):
            return Path(settings.SEEDS_DIR)
    except Exception:
        pass
    return _DEFAULT_SEEDS_DIR


def _read_json(filename: str) -> list | dict:
    path = _get_seeds_dir() / filename
    if not path.exists():
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_glossary_seed() -> list[dict]:
    """Return glossary seed entries: list of {source, target, target_language?}. Safe to use for any DB."""
    data = _read_json("glossary.json")
    return data if isinstance(data, list) else []


def load_dictionary_seed() -> list[dict]:
    """Return dictionary seed entries: list of {term, definition, target_language?}. Safe to use for any DB."""
    data = _read_json("dictionary.json")
    return data if isinstance(data, list) else []


def load_translation_memories_seed() -> list[dict]:
    """Return TM seed documents: list of {tm_id, source_language, target_language?, pairs}. Safe to use for any DB."""
    data = _read_json("translation_memories.json")
    return data if isinstance(data, list) else []
