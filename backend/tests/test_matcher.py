from pathlib import Path

import pytest

from app.services.matcher import find_matches, normalize
from app.services.tmx_parser import parse_tmx

FIXTURE_PATH = Path(__file__).parent / "fixtures" / "sample.tmx"


@pytest.fixture
def tm_pairs():
    with open(FIXTURE_PATH, "rb") as f:
        pairs, _ = parse_tmx(f.read())
    return pairs


def test_normalize():
    assert normalize("  Hello   world  ") == "Hello world"
    assert normalize("test\n\tstring") == "test string"


@pytest.mark.asyncio
async def test_exact_match(tm_pairs):
    segments = [{"index": 0, "source": "Hello world.", "wordCount": 2}]
    results = await find_matches(segments, tm_pairs)

    assert len(results) == 1
    assert results[0]["match"]["matchType"] == "exact"
    assert results[0]["match"]["confidence"] == 100
    assert results[0]["match"]["target"] == "Hola mundo."
    assert results[0]["match"]["aiSuggested"] is False


@pytest.mark.asyncio
async def test_fuzzy_match(tm_pairs):
    segments = [{"index": 0, "source": "Hello world!", "wordCount": 2}]
    results = await find_matches(segments, tm_pairs)

    assert len(results) == 1
    match = results[0]["match"]
    assert match["matchType"] in ("exact", "fuzzy")
    assert match["confidence"] >= 75


@pytest.mark.asyncio
async def test_no_match(tm_pairs):
    segments = [
        {"index": 0, "source": "Completely unrelated sentence about quantum physics.", "wordCount": 6}
    ]
    results = await find_matches(segments, tm_pairs)

    assert len(results) == 1
    assert results[0]["match"]["matchType"] == "none"
    assert results[0]["match"]["confidence"] == 0
    assert results[0]["match"]["aiSuggested"] is True


@pytest.mark.asyncio
async def test_multiple_segments(tm_pairs):
    segments = [
        {"index": 0, "source": "Hello world.", "wordCount": 2},
        {"index": 1, "source": "Good morning.", "wordCount": 2},
        {"index": 2, "source": "Unknown segment here.", "wordCount": 3},
    ]
    results = await find_matches(segments, tm_pairs)

    assert len(results) == 3
    assert results[0]["match"]["matchType"] == "exact"
    assert results[1]["match"]["matchType"] == "exact"
    assert results[2]["match"]["matchType"] == "none"


def test_parse_tmx():
    with open(FIXTURE_PATH, "rb") as f:
        pairs, source_lang = parse_tmx(f.read())

    assert len(pairs) >= 10
    assert pairs[0]["source"] == "Hello world."
    assert pairs[0]["target"] == "Hola mundo."
