# New Features

This document describes features that are **new** relative to the classic OmegaT (Java) application. They extend the CAT workflow with AI, cloud, and a modern architecture.

---

## AI-Powered Translation

### Segment-level AI translation

- **Trigger**: User clicks the wand icon on a segment (or equivalent “Translate with AI” action).
- **Flow**: Frontend sends segment source, suggested glossary terms, and optional `target_language` to `POST /ai/translate`. Backend uses the configured AI provider to return a translation.
- **Provider**: Configurable via `AI_PROVIDER` (OpenAI or Anthropic). All providers use unified prompts from `app/providers/ai/prompts.py`; optional `target_language` is sent and included in the prompt.
- **Result**: Translation is written into the segment with `origin: "ai_suggested"` and shown in the editor / diff view.

### Whole-document AI translation

- **Trigger**: “Translate all with AI” (or “Translate whole document”) in the Source & translation view.
- **Flow**: For each segment, frontend calls `POST /ai/translate` with segment source, full glossary, and selected target language.
- **Result**: All segments receive AI suggestions; user can edit any segment afterward. Progress/loading state is shown during the run.

**Note**: TM matching does not use AI as a fallback. When a segment has no exact or fuzzy TM match, the backend returns `matchType: "none"` with an empty target; the user can use the AI translate action explicitly if desired. All providers share the same prompt logic in `app/providers/ai/prompts.py` (`build_translation_prompt`).

---

## Cloud & Browser-Based Architecture

| Aspect         | OmegaT (Java)                     | OmegaCloud                                                                                    |
| -------------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| **Runtime**    | Desktop JVM                       | Browser (React SPA) + backend (FastAPI)                                                       |
| **Data**       | Local project folder, TMX on disk | Database (MongoDB or SQL) for TMs, glossary, dictionary; demo docs embedded in frontend build |
| **Deployment** | Installer per OS                  | Docker Compose: frontend (:5173), API (:8000), MongoDB (:27017)                               |
| **Access**     | Single machine                    | Web; multiple users can use the same deployment (auth not yet in scope)                       |

The product is designed as a **cloud translation memory assistant**: no local install, centralized TMs, and optional AI, suitable for teams or cloud-first workflows.

---

## REST API

OmegaT has no REST API; everything is file-based. OmegaCloud exposes:

| Area           | Endpoints                               | Purpose                                                                                             |
| -------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Languages**  | `GET /languages`                        | List supported target languages (code, name); single source of truth for UI dropdown and AI prompts |
| **TM**         | `GET /tm`, `POST /tm`, `POST /tm/match` | List TMs (optional `?target_language=`), create TM (with target_language), match segments           |
| **Glossary**   | `GET /glossary`                         | List glossary entries (optional `?target_language=` filter)                                         |
| **Dictionary** | `GET /dictionary`                       | List dictionary entries (optional `?target_language=` filter)                                       |
| **Docs**       | `POST /docs/segments`                   | Extract segments from plain text                                                                    |
| **AI**         | `POST /ai/translate`                    | Translate one segment with optional glossary terms and target_language                              |

This enables:

- Scripts and integrations (e.g. CI, CMS) to create TMs, run matching, or call AI.
- Future clients (mobile, CLI, other UIs) to reuse the same backend.
- Clear separation between UI and business logic.

---

## Modern Tech Stack

- **Frontend**: React, TypeScript, Vite, TanStack Query, Tailwind CSS.
- **Backend**: Python 3, FastAPI, Pydantic.
- **Data**: Database-agnostic storage (MongoDB or SQL via SQLAlchemy). TMs, glossary, dictionary in DB; seed data in `backend/data/seeds/*.json`. Protocols in `app/storage/protocols.py`.
- **Matching**: `rapidfuzz` for fuzzy matching; matcher uses TM only (no AI fallback).
- **AI**: Engine-agnostic provider interface (`app/providers/ai/`); unified prompts in `prompts.py`; supported: OpenAI, Anthropic.
- **Containers**: Docker and Docker Compose for consistent dev and deployment.

This stack supports fast iteration, type safety, and scalability compared to a monolithic Java desktop app.

---

## Configuration & Environment

- **Backend `.env`**: `DATABASE_BACKEND` (mongodb or sql), `DATABASE_URL` (for SQL), MongoDB URL when using Mongo, `TM_FUZZY_THRESHOLD`, `AI_PROVIDER` (e.g. `openai`, `anthropic`) and the matching API key(s), optional `SEEDS_DIR`.
- **Supported languages**: Defined in `backend/app/core/languages.py`; exposed at `GET /languages`. Frontend fetches this list for the target-language dropdown; AI providers use it for the prompt language name.
- **Frontend**: Demo document list and markdown in `frontend/src/data/demo-documents/` (embedded at build time); glossary and dictionary from API.

Configuration is environment-driven and suitable for different deployments (dev, staging, production) without code changes.

---

## Summary

**New** in OmegaCloud compared to OmegaT:

1. **AI translation**: per-segment and whole-document, explicitly triggered by the user.
2. **Cloud architecture**: browser UI, REST API, database (MongoDB or SQL), Docker.
3. **REST API**: languages, TM, glossary, dictionary, doc segmentation, AI translation; target_language filtering where applicable.
4. **Modern stack**: React/TypeScript, FastAPI, rapidfuzz, database-agnostic storage, multi-provider AI.

These features are documented here; evolution (e.g. more AI providers, auth, real project storage) is outlined in **Roadmap**.
