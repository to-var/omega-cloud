from io import BytesIO

from translate.storage.tmx import tmxfile


def parse_tmx(file_bytes: bytes) -> tuple[list[dict], str | None]:
    """Parse a TMX file and return (translation_pairs, source_language)."""
    tmx = tmxfile(BytesIO(file_bytes))

    source_lang = None
    if hasattr(tmx, "header") and tmx.header is not None:
        source_lang = tmx.header.get("srclang")

    pairs: list[dict] = []
    for unit in tmx.units:
        source = str(unit.source or "").strip()
        target = str(unit.target or "").strip()
        if source:
            pairs.append({"source": source, "target": target})

    return pairs, source_lang
