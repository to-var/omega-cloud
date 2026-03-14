# OmegaCloud — Cloud Translation Memory Assistant

> **This is a prototype.** It is not a final product. The UI, data, and behavior are for demonstration and experimentation only. Do not rely on it for production translation work. Features may change or be removed without notice.

OmegaCloud is a browser-based prototype that mimics a translation memory (TM) and CAT-tool workflow: load demo documents, extract segments, match against a TM, and use glossary suggestions and optional AI translation. All demo content is mock data.

---

## Architecture

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────┐
│  React SPA  │──REST──▶  FastAPI        │──DB───▶  MongoDB     │
│  :5173      │       │  :8000          │       │  :27017      │
│  (prototype │       │  rapidfuzz      │       └──────────────┘
│   UI)       │       │  matcher        │
└─────────────┘       └─────────────────┘
```

---

## Quick Start

```bash
# 1. Clone the repository
git clone git@github.com:to-var/omega-cloud.git && cd OmegaCloud

# 2. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start all services
docker compose up --build
```

The frontend will be available at `http://localhost:5173` and the API at `http://localhost:8000`.

---

## Demo documents (mock data)

Source text comes from **markdown files** in `frontend/src/data/demo-documents/`. They are **embedded at build time** (imported as raw text), so the app never fetches them from the server and always shows the correct content.

- **cat-tool.md** — Overview of CAT tools and core components (TM, glossary, QA, etc.).
- **translation-memory-basics.md** — Short intro to translation memory and fuzzy matches.
- **glossary-and-qa.md** — Glossary and quality assurance in CAT tools.

Use the **document dropdown** in the header to switch between these demo documents. To add more demos, add a new `.md` file under `src/data/demo-documents/`, import it in `frontend/src/data/demo.ts` with `?raw`, and add an entry to `DEMO_DOCUMENTS`.

---

## Prototype flow

1. **Select a demo document** — Choose one of the mock markdown documents from the dropdown. Its content is loaded and split into segments automatically.
2. **Select a Translation Memory** — Choose a TM from the dropdown (data in MongoDB; add via API or scripts).
3. **Run matching** — Click **Run Matching** to match segments against the selected TM. Match quality is shown with badges (exact / fuzzy / no match).
4. **Segment editor** — Work in the segment editor or switch to the **Source & translation** diff view. Click a segment or focus its translation field to see **suggested terms** (glossary matches for that segment) in the right panel.
5. **AI translation** — Click the wand icon on a segment, or “Translate whole document,” to request an OpenAI-powered translation. The backend uses the segment and glossary terms (or the full glossary for whole-document). Set `OPENAI_API_KEY=sk-...` in `backend/.env` (AI provider is OpenAI only).

---

## Configuration (prototype)

- **Backend `.env`** — MongoDB, TM threshold, and `OPENAI_API_KEY` for AI translation (OpenAI only).
- **Frontend** — Demo document list and glossary/dictionary are in `frontend/src/data/demo.ts`. Demo markdown files live in `frontend/src/data/demo-documents/` and are embedded at build time.

---

## Documentation

- **[Modernized features](docs/modernized-features.md)** — Features brought from the OmegaT (Java) version (TM, segments, glossary, editor, etc.).
- **[New features](docs/new-features.md)** — New capabilities such as AI translation, cloud architecture, and REST API.
- **[Roadmap](docs/roadmap.md)** — How the modernization can escalate with a multidisciplinary team (MVP → collaboration → scale).

---

## Disclaimer

This project is a **prototype**. It is not intended as a final product. Use it only for evaluation and development. Do not use it for production translation or with sensitive data without proper security and compliance review.
