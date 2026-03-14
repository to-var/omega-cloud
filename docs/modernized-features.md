# Modernized Features

This document describes features that have been brought from the **OmegaT (Java)** desktop application into **OmegaCloud**. These are core CAT-tool capabilities reimplemented in a modern, browser-based stack.

---

## Translation Memory (TM)

| Feature | OmegaT (Java) | OmegaCloud |
|--------|----------------|------------|
| **TM storage** | Local `.tmx` files / project folder | Database (MongoDB or SQL); TMs created via API or seeded from JSON |
| **TM listing** | Project-specific TM files | `GET /tm` — list TMs with `tm_id`, `source_language`, `target_language`, `unit_count`; optional `?target_language=` filter |
| **TM creation** | Import TMX, create from project | `POST /tm` — create from `source_language`, `target_language`, and list of source/target pairs |
| **TMX parsing** | Built-in (OmegaT format) | Backend `tmx_parser`; returns pairs + optional `srclang` |
| **Match request** | Per-segment lookup against loaded TMs | `POST /tm/match` — send segments + `tm_id`; returns matches per segment (TM only; no AI fallback) |

Behavior is aligned with OmegaT: one or more TMs can be used; matching is done server-side with configurable fuzzy threshold. TMs are tagged with **target_language** so the UI can filter by the selected translation target.

---

## Segment Extraction

| Feature | OmegaT (Java) | OmegaCloud |
|--------|----------------|------------|
| **Segmentation** | SRX / sentence-boundary rules | Plain-text segmentation: split on `.!?` and newlines |
| **Segment model** | Index, source, word count | Same: `index`, `source`, `wordCount` |
| **API** | N/A (file-based) | `POST /docs/segments` — send raw text, receive list of segments |

Segments are the unit of work: each has an index, source text, and word count. The prototype uses simple sentence splitting; production could adopt SRX or locale-aware rules.

---

## Fuzzy Matching

| Feature | OmegaT (Java) | OmegaCloud |
|--------|----------------|------------|
| **Exact match** | 100% identity (normalized) | Same: normalized comparison, `matchType: "exact"`, `confidence: 100` |
| **Fuzzy match** | Similarity score above threshold | `rapidfuzz.fuzz.ratio`; configurable `TM_FUZZY_THRESHOLD`; `matchType: "fuzzy"`, `confidence` 0–99 |
| **No match** | Empty or below threshold | `matchType: "none"`; no AI fallback (use AI translate action separately) |
| **Normalization** | Whitespace/case handling | `normalize()`: strip and collapse internal whitespace for comparison |

Match types are exposed in the UI with **MatchBadge** (exact / fuzzy / no match) and in the **Fuzzy / TM match** panel for the selected segment; the user can **insert** the fuzzy/TM target into the segment from that panel.

---

## Segment Editor

| Feature | OmegaT (Java) | OmegaCloud |
|--------|----------------|------------|
| **Segment list** | Left pane, source segments | Center: list of segments with source; click to select |
| **Translation field** | Per-segment target editing | Per-segment target in **SegmentEditor**; changes stored in state with metadata |
| **Segment metadata** | Created/changed by, date, origin | `SegmentTranslation`: `target`, `changedOn`, `changedBy`, `createdOn`, `createdBy`, `origin` |
| **Origin** | TM, manual, MT, etc. | `translation_memory` \| `manual` \| `ai_suggested` |
| **View modes** | Editor vs. preview | **Source & translation** (diff) vs. **Segment editor** tabs |

The editor preserves the OmegaT-style workflow: select segment → see source and optional TM/glossary suggestions → edit or accept translation.

---

## Glossary / Termbase

| Feature | OmegaT (Java) | OmegaCloud |
|--------|----------------|------------|
| **Term pairs** | Source → target (TBX/CSV/OmegaT glossary) | Stored in database; seeded from `backend/data/seeds/glossary.json`; entries have `source`, `target`, `target_language` |
| **API** | N/A | `GET /glossary?target_language=` — returns entries filtered by target language |
| **Suggestions** | Shown for active segment | **Glossary term matches** (right panel): terms whose source appears in segment (case-insensitive) |
| **Usage** | Insert term into target | Display in right panel; terms are passed to AI when using AI translation |

Glossary is used for consistent terminology and is integrated with AI translation. The list is filtered by the **target language** selected in the header.

---

## Dictionary

| Feature | OmegaT (Java) | OmegaCloud |
|--------|----------------|------------|
| **Entries** | Term → definition / note | Stored in database; seeded from `backend/data/seeds/dictionary.json`; entries have `term`, `definition`, `target_language` |
| **API** | N/A | `GET /dictionary?target_language=` — returns entries filtered by target language |
| **Display** | Dictionary pane | **ProjectSidebar**: dictionary list; **Dictionary term matches** (right panel) for selected segment |
| **In-context** | Click term in source to see definition | Matches shown in right column only; no inline highlighting by default |

Dictionary is filtered by **target language**; term definitions support understanding during translation. OmegaT’s dictionary pane.

---

## Project / Document Handling

| Feature | OmegaT (Java) | OmegaCloud |
|--------|----------------|------------|
| **Documents** | Add files to project, supported formats | Demo: markdown files (videogame history) in `frontend/src/data/demo-documents/`; select via document dropdown |
| **Project sidebar** | Files, glossary, dictionary | **ProjectSidebar**: document list, Translation memories (TM selector), glossary, dictionary |
| **Target language** | Project/locale setting | Header dropdown from `GET /languages`; filters glossary, dictionary, TM list |
| **Document name** | From file path/name | Displayed in header/footer (e.g. `documentName`) |

In the prototype, “projects” are represented by the selected demo document, target language, and the chosen TM; full project bundles (like OmegaT’s project folder) are not yet implemented.

---

## Summary

OmegaCloud reimplements the core OmegaT workflow in a client–server architecture:

- **TM**: create, list (with target_language), match against database-stored TMs; optional seed from JSON.
- **Segments**: extract from text via API; display and edit in segment editor; Fuzzy / TM match panel with insert.
- **Matching**: exact/fuzzy/none (TM only, no AI fallback); match badges and fuzzy-match panel.
- **Glossary & dictionary**: in DB with target_language; API filtered; term matches in right panel.
- **Target language**: global list in backend; UI selector filters glossary, dictionary, TMs.

What remains out of scope for “modernized” (and is covered in **New Features**) are: AI translation, cloud deployment, REST API design, and the modern tech stack choices.
