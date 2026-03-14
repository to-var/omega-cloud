# New Features

This document describes features that are **new** relative to the classic OmegaT (Java) application. They extend the CAT workflow with AI, cloud, and a modern architecture.

---

## AI-Powered Translation

### Segment-level AI translation

- **Trigger**: User clicks the wand icon on a segment (or equivalent “Translate with AI” action).
- **Flow**: Frontend sends segment source + suggested glossary terms to `POST /ai/translate`. Backend uses the configured AI provider (e.g. OpenAI) to return a translation that respects the given terms.
- **Provider**: OpenAI (GPT-4o-mini) via `OPENAI_API_KEY`. Prompt instructs the model to use approved terms and reply with only the translation.
- **Result**: Translation is written into the segment with `origin: "ai_suggested"` and shown in the editor / diff view.

### Whole-document AI translation

- **Trigger**: “Translate all with AI” (or “Translate whole document”) in the Source & translation view.
- **Flow**: For each segment, frontend calls `POST /ai/translate` with segment source and the **full glossary** (not only segment-matched terms).
- **Result**: All segments receive AI suggestions; user can edit any segment afterward. Progress/loading state is shown during the run.

### AI as fallback when there is no TM match

- **Behavior**: In the matching service (`matcher.find_matches`), when a segment has no exact or fuzzy match above the threshold, the backend can call the AI provider to generate a suggestion.
- **Result**: Segment is returned with `matchType: "none"`, `aiSuggested: true`, and the AI result in `target`. This blurs the line between “no match” and “AI suggestion” and gives the user a starting point for every segment.

These three uses (per-segment, whole-document, fallback) form the **AI translation** feature set.

---

## Cloud & Browser-Based Architecture

| Aspect | OmegaT (Java) | OmegaCloud |
|--------|----------------|------------|
| **Runtime** | Desktop JVM | Browser (React SPA) + backend (FastAPI) |
| **Data** | Local project folder, TMX on disk | MongoDB for TMs; demo docs embedded in frontend build |
| **Deployment** | Installer per OS | Docker Compose: frontend (:5173), API (:8000), MongoDB (:27017) |
| **Access** | Single machine | Web; multiple users can use the same deployment (auth not yet in scope) |

The product is designed as a **cloud translation memory assistant**: no local install, centralized TMs, and optional AI, suitable for teams or cloud-first workflows.

---

## REST API

OmegaT has no REST API; everything is file-based. OmegaCloud exposes:

| Area | Endpoints | Purpose |
|------|-----------|--------|
| **TM** | `GET /tm`, `POST /tm`, `POST /tm/match` | List TMs, create TM, match segments against a TM |
| **Docs** | `POST /docs/segments` | Extract segments from plain text |
| **AI** | `POST /ai/translate` | Translate one segment with optional glossary terms |

This enables:

- Scripts and integrations (e.g. CI, CMS) to create TMs, run matching, or call AI.
- Future clients (mobile, CLI, other UIs) to reuse the same backend.
- Clear separation between UI and business logic.

---

## Modern Tech Stack

- **Frontend**: React, TypeScript, Vite, TanStack Query, Tailwind CSS.
- **Backend**: Python 3, FastAPI, Pydantic.
- **Data**: MongoDB for TM storage; in-memory or file-based config for demo glossary/dictionary.
- **Matching**: `rapidfuzz` for fuzzy matching (replacing or complementing OmegaT’s internal matcher).
- **AI**: `openai` (async) for chat completions; provider abstraction in `ai_stub` for future providers (e.g. Azure, local models).
- **Containers**: Docker and Docker Compose for consistent dev and deployment.

This stack supports fast iteration, type safety, and scalability compared to a monolithic Java desktop app.

---

## Configuration & Environment

- **Backend `.env`**: MongoDB URL, `TM_FUZZY_THRESHOLD`, `OPENAI_API_KEY`, `AI_PROVIDER` (e.g. `openai`).
- **Frontend**: Demo document list and glossary/dictionary live in `frontend/src/data/demo.ts`; demo markdown is embedded at build time.

Configuration is environment-driven and suitable for different deployments (dev, staging, production) without code changes.

---

## Summary

**New** in OmegaCloud compared to OmegaT:

1. **AI translation**: per-segment, whole-document, and as fallback for “no match”.
2. **Cloud architecture**: browser UI, REST API, MongoDB, Docker.
3. **REST API**: TM and doc operations and AI translation as HTTP endpoints.
4. **Modern stack**: React/TypeScript, FastAPI, rapidfuzz, OpenAI integration.

These features are documented here; evolution (e.g. more AI providers, auth, real project storage) is outlined in **Roadmap**.
