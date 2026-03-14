# Roadmap

This document outlines how the **OmegaCloud** modernization project can escalate from prototype to production, with a focus on **multidisciplinary teamwork** and clear phases.

---

## Current State: Prototype

- **Scope**: Demo documents (embedded markdown, videogame history theme), glossary and dictionary in DB (seeded from JSON, filtered by target language), database-backed TMs (MongoDB or SQL), fuzzy matching with insert-from-TM, segment editor, target language selector (from `GET /languages`), and optional AI (OpenAI or Anthropic) with unified prompts.
- **Audience**: Evaluation, demos, and experimentation — not production translation or sensitive data.
- **Team**: Implicitly small (e.g. one or a few full-stack developers).

To grow into a product, the project should add roles, define phases, and align engineering with product, UX, and language/quality needs.

---

## Phase 1: From Prototype to MVP

**Goal**: A usable, single-tenant product that translators can use on real (small) projects with minimal risk.

### 1.1 Product & Requirements

- **Owner**: Product / PM.
- **Actions**:
  - Define MVP scope: e.g. “One project per user, one TM per project, segment + glossary + AI.”
  - Prioritize: real file formats (e.g. one or two: DOCX, XLIFF, or MD), real project create/open/save, no collaboration yet.
  - Document user stories and acceptance criteria; keep a simple backlog.
- **Output**: MVP spec and prioritized backlog.

### 1.2 Security & Compliance

- **Owner**: Backend + security-minded dev or advisor.
- **Actions**:
  - Add authentication (e.g. OAuth2 or simple login); protect all TM and project endpoints by user/session.
  - Ensure API keys (e.g. `OPENAI_API_KEY`) and secrets are not exposed; use env/config and secrets management.
  - Clarify data residency and retention (where TMs and projects are stored; who can access).
- **Output**: Auth design, secure config, and a short security/compliance checklist.

### 1.3 Real Projects & File Formats

- **Owner**: Backend + (optionally) a dev with localization experience.
- **Actions**:
  - Introduce a **project** entity: create, open, list (per user); store project metadata and optionally file references in DB.
  - Support at least one real format: e.g. **XLIFF** or **DOCX** for round-trip (extract segments → translate → export). Reuse or integrate existing libs (e.g. python-docx, lxml for XLIFF).
  - Replace “demo documents only” with “open project → load source file → extract segments”; keep demo mode for onboarding.
- **Output**: Project API, one (or two) supported file formats, and basic import/export.

### 1.4 Frontend & UX

- **Owner**: Frontend / UX.
- **Actions**:
  - Replace embedded demo-only flow with: project list, create/open project, upload or select source file, then current segment/TM/glossary workflow.
  - Improve error handling and loading states (e.g. failed AI, missing TM, network errors).
  - Ensure accessibility (keyboard, screen readers) and responsive layout where needed.
- **Output**: MVP UI flow, error/loading patterns, and a short UX/accessibility checklist.

### 1.5 QA & Localization

- **Owner**: QA / test lead; optional: localization specialist.
- **Actions**:
  - Define test strategy: unit (backend matcher, TM, AI stub), integration (API, DB), and critical-path E2E (create project → load file → match → translate a few segments → export or save).
  - Add CI (e.g. GitHub Actions): run tests, lint, typechecks; block merge on failures.
  - Optionally: run a small pilot with real translators and collect feedback on terminology and UX.
- **Output**: Test plan, CI pipeline, and (if done) pilot report.

### 1.6 DevOps & Deployment

- **Owner**: DevOps / platform.
- **Actions**:
  - Document and automate deployment (e.g. Docker Compose or a single-tenant k8s/Helm setup); env-based config for staging/production.
  - Set up logging, health checks, and basic monitoring (e.g. API latency, errors).
  - Plan backups for MongoDB (TMs and project metadata).
- **Output**: Deployment runbook, monitoring, and backup/restore procedure.

**Phase 1 exit criteria**: Authenticated users can create a project, open a real file (e.g. XLIFF or DOCX), use TM + glossary + AI on segments, and save/export. Tests and deployment are in place.

---

## Phase 2: Multi-User & Collaboration Readiness

**Goal**: Support small teams and prepare for shared projects and optional collaboration.

### 2.1 Teams & Permissions

- **Owner**: Product + Backend.
- **Actions**:
  - Introduce **teams** or **workspaces**: invite users, assign roles (e.g. viewer, translator, admin).
  - Scope TMs and projects by team; enforce permissions on API and UI.
- **Output**: Team/workspace model, role definitions, and permission matrix.

### 2.2 Shared TMs & Glossary

- **Owner**: Backend + (optionally) localization.
- **Actions**:
  - Allow TMs and glossaries to be shared at team level; support “project TM” vs “shared TM” if needed.
  - Glossary and dictionary are already in DB (with target_language); extend to associate with project/team and sharing.
- **Output**: Shared TM/glossary design and APIs.

### 2.3 Frontend & UX

- **Owner**: Frontend / UX.
- **Actions**:
  - Team/workspace switcher; project list filtered by team; basic “settings” for TM/glossary.
  - Clear indication of “who can do what” (e.g. read-only vs edit).
- **Output**: Updated UI flows and copy for teams.

### 2.4 QA & Performance

- **Owner**: QA + Backend.
- **Actions**:
  - Load and performance testing (e.g. large TM, many segments); optimize matching or caching if needed.
  - Security review: auth, authorization, and data isolation between teams.
- **Output**: Performance baseline and security review notes.

**Phase 2 exit criteria**: Teams exist; users can work in a shared context with shared TMs/glossaries and clear permissions.

---

## Phase 3: Scale, Integrations & Optional Collaboration

**Goal**: Support larger deployments, integrations (CAT/MT/TMS), and optional real-time or async collaboration.

### 3.1 Integrations

- **Owner**: Backend + Product.
- **Actions**:
  - Optional: **TMS/API** integration (e.g. push/pull jobs, TM exchange).
  - Optional: **MT** providers beyond current AI (e.g. Google, Azure, or dedicated MT APIs) with same “glossary-aware” pattern where possible.
  - Webhooks or events for “translation updated” / “project completed” for external systems.
- **Output**: Integration specs and at least one reference integration.

### 3.2 Collaboration (Optional)

- **Owner**: Full-stack + UX.
- **Actions**:
  - Define collaboration model: e.g. “one editor per segment” or “merge conflicts” strategy.
  - Implement real-time or polling-based updates (e.g. WebSockets or short polling) so multiple users see segment changes.
  - Conflict handling: last-write-wins vs. explicit conflict UI.
- **Output**: Collaboration design and minimal implementation (e.g. “see others’ segments” or “lock segment while editing”).

### 3.3 AI & Quality

- **Owner**: Backend + (optionally) linguist/QA.
- **Actions**:
  - The prototype already supports multiple AI providers (OpenAI, Anthropic) via `app/providers/ai/`; add more (e.g. Azure OpenAI, local/on-prem models) by implementing the provider protocol and registering.
  - Optional: **QA checks** (e.g. terminology consistency, numbers, placeholders) as in OmegaT; run on segment or on export.
  - Optional: **confidence** or “post-edit distance” for AI suggestions to drive analytics or training.
- **Output**: Multi-provider AI, optional QA module, and (if applicable) confidence/analytics hooks.

### 3.4 Multidisciplinary Sync

- **Owner**: PM / Eng lead.
- **Actions**:
  - Regular sync between product, frontend, backend, DevOps, and QA; roadmap and backlog visible to all.
  - Retrospectives and lightweight process (e.g. sprint or milestone-based) to adjust scope and priorities.
- **Output**: Shared roadmap, backlog, and a simple way to escalate blockers.

**Phase 3 exit criteria**: Deployments can scale; at least one integration path exists; optional collaboration and multi-provider AI are available; team process is clear.

---

## Roles Summary

| Role | Focus |
|------|--------|
| **Product / PM** | Scope, priorities, user stories, roadmap alignment. |
| **Backend** | API, TM/glossary/project storage, matching, AI integration, auth, permissions. |
| **Frontend / UX** | UI flows, accessibility, error states, team/project UX. |
| **DevOps / Platform** | Deployment, monitoring, backups, CI/CD. |
| **QA** | Test strategy, automation, E2E, performance, security testing. |
| **Localization / Linguist** | Terminology, QA rules, pilot feedback, format/segment quality. |

Not every phase requires every role full-time; the table shows ownership and focus so responsibilities are clear as the team grows.

---

## Escalation Principles

1. **Start with one discipline per area** (e.g. one backend, one frontend) and add specialists (security, DevOps, QA) as the product and risk grow.
2. **Define “done” per phase** (e.g. MVP = auth + one real format + save/export) so the team can ship incrementally.
3. **Keep docs and APIs the contract** between frontend, backend, and integrations; maintain `docs/` (e.g. modernized-features, new-features, this roadmap) and API specs.
4. **Revisit AI and compliance** early (data sent to OpenAI, retention, opt-in) and again when adding new providers or regions.

This roadmap is a living plan: adjust phases and ownership to match the actual team and market needs.
