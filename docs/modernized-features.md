# Modernized Features

This document describes features that have been brought from the **OmegaT (Java)** desktop application into **OmegaCloud**. These are core CAT-tool capabilities reimplemented in a modern, browser-based stack.

---

## Translation Memory (TM)

| Feature | OmegaT (Java) | OmegaCloud |
|--------|----------------|------------|
| **TM storage** | Local `.tmx` files / project folder | MongoDB; TMs created via API or scripts |
| **TM listing** | Project-specific TM files | `GET /tm` — list all TMs with `tm_id`, `source_language`, `unit_count` |
| **TM creation** | Import TMX, create from project | `POST /tm` — create from `source_language` + list of source/target pairs |
| **TMX parsing** | Built-in (OmegaT format) | Backend `tmx_parser` using `translate.storage.tmx`; returns pairs + optional `srclang` |
| **Match request** | Per-segment lookup against loaded TMs | `POST /tm/match` — send segments + `tm_id`; returns matches per segment |

Behavior is aligned with OmegaT: one or more TMs can be used; matching is done server-side with configurable fuzzy threshold.

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
| **No match** | Empty or below threshold | `matchType: "none"`; optionally filled by AI (see New Features) |
| **Normalization** | Whitespace/case handling | `normalize()`: strip and collapse internal whitespace for comparison |

Match types are exposed in the UI with **MatchBadge** (exact / fuzzy / no match) and in the **FuzzyMatches** panel for the selected segment.

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
| **Term pairs** | Source → target (TBX/CSV/OmegaT glossary) | In-memory glossary: `source` → `target` (demo data in `demo.ts`) |
| **Suggestions** | Shown for active segment | **GlossarySuggestions**: terms whose source appears in segment (case-insensitive) |
| **Usage** | Insert term into target | Display only in prototype; terms are passed to AI when using AI translation |

Glossary is used for consistent terminology and is integrated with AI translation (suggested terms sent to the AI provider).

---

## Dictionary

| Feature | OmegaT (Java) | OmegaCloud |
|--------|----------------|------------|
| **Entries** | Term → definition / note | `DEMO_DICTIONARY`: `term` → `definition` |
| **Display** | Dictionary pane | **ProjectSidebar**: dictionary list; terms in segment can be highlighted |
| **In-context** | Click term in source to see definition | **SegmentWithDictionary**: terms in source linked; clicking scrolls to definition in sidebar |

Dictionary supports understanding of terms during translation, similar to OmegaT’s dictionary pane.

---

## Project / Document Handling

| Feature | OmegaT (Java) | OmegaCloud |
|--------|----------------|------------|
| **Documents** | Add files to project, supported formats | Demo: markdown files embedded at build time; select via document dropdown |
| **Project sidebar** | Files, glossary, dictionary | **ProjectSidebar**: document list, glossary, dictionary; highlighted terms for selected segment |
| **Document name** | From file path/name | Displayed in header/footer (e.g. `documentName`) |

In the prototype, “projects” are represented by the selected demo document and the chosen TM; full project bundles (like OmegaT’s project folder) are not yet implemented.

---

## Summary

OmegaCloud reimplements the core OmegaT workflow in a client–server architecture:

- **TM**: create, list, match against MongoDB-stored TMs; TMX import support in backend.
- **Segments**: extract from text via API; display and edit in segment editor with metadata and origin.
- **Matching**: exact/fuzzy/none with configurable threshold; match badges and fuzzy-match panel.
- **Glossary & dictionary**: term suggestions per segment and term definitions in the sidebar.

What remains out of scope for “modernized” (and is covered in **New Features**) are: AI translation, cloud deployment, REST API design, and the modern tech stack choices.
