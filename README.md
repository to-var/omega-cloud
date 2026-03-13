# OmegaT Cloud — Cloud Translation Memory Assistant

OmegaT Cloud brings the power of professional translation memory to the browser. Built for translation teams and language service providers, it connects directly to your Google Docs, matches source text against your existing translation memories, and surfaces the best translations instantly — eliminating repetitive work and ensuring consistency across every document your team touches.

## Architecture

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────┐
│  React SPA  │──REST──▶  FastAPI        │──S3───▶  MinIO / S3  │
│  :5173      │◀──JWT──│  :8000          │       │  :9000       │
└─────────────┘       │                 │       └──────────────┘
                      │  ┌────────────┐ │
                      │  │ rapidfuzz  │ │
                      │  │ translate  │ │
                      │  │ -toolkit   │ │
                      │  └────────────┘ │
                      │        │        │
                      │  ┌─────▼──────┐ │
                      │  │ Google     │ │
                      │  │ OAuth2 +   │ │
                      │  │ Docs API   │ │
                      │  └────────────┘ │
                      └─────────────────┘
```

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url> && cd omegat_cloud

# 2. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start all services
docker compose up --build
```

The frontend will be available at `http://localhost:5173` and the API at `http://localhost:8000`.

## Demo Flow

1. **Sign in** — Click "Sign in with Google" on the login page. You'll be redirected through Google OAuth2 and back to the workspace.
2. **Load a document** — Paste a Google Doc ID (or full URL) into the document input and click "Load Segments." The backend fetches the document via the Google Docs API and splits it into translatable segments.
3. **Upload a Translation Memory** — Upload a `.tmx` file using the upload area. The file is parsed and stored in S3-compatible storage.
4. **View matches** — Each segment is automatically matched against the uploaded TM. Color-coded badges show match quality:
   - **Green** — Exact match (100%)
   - **Yellow** — Fuzzy match (75–99%)
   - **Red** — No TM match (AI stub suggestion)
   - **Gray** — Not yet matched
5. **Inspect details** — Click any segment to see the full match detail in the right panel, including the target translation, confidence score, and match type.

## Enterprise Considerations

- **Shared Translation Memory** — Centralized TM storage so all translators in an organization draw from the same knowledge base, with version history and merge capabilities.
- **Role-Based Access Control** — Project managers, translators, and reviewers with granular permissions per project and language pair.
- **Office 365 / Word Integration** — Extend document ingestion beyond Google Docs to support Microsoft Word (`.docx`) and Office 365 online documents.
- **AI Provider Integration** — Swap the stub AI provider for Anthropic Claude, OpenAI GPT, or Google Gemini to generate high-quality translation suggestions for unmatched segments.
- **Multi-Language Pair Support** — Handle any source/target language combination with automatic language detection and per-pair TM storage.
- **Glossary Enforcement** — Ensure consistent terminology by enforcing project-specific glossaries during matching and AI suggestion.
- **Horizontal Scaling** — Stateless API design allows scaling the backend behind a load balancer; TM storage on S3 supports unlimited capacity.
- **Audit Logging** — Track every translation decision for compliance and quality assurance purposes.
