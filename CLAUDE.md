# CLAUDE.md — Enforcement AI Dashboard

Context for Claude Code working in this repo.

## What this is
The UI of the "סוכן אכיפה / Enforcement AI" dashboard — the front end for the
TASE compliance product (סוכן ציות חכם). It is built as a **Power Apps Code App**
(React, GA Feb 2026) that runs inside the customer's Power Platform tenant.

## Stack
- Vite + React (JavaScript, `.jsx`) + Tailwind CSS v4 + lucide-react.
- RTL Hebrew UI.
- Deploys as a Power Apps Code App via the `pac` CLI (see README → Deploy).

## Architecture — one integration seam
All backend access lives in **`src/services/dataverse.js`**. It is a MOCK in dev
(in-memory, no client data). It connects to three things we built:
1. **Dataverse** — `WorkPlanItem` / `WorkPlan` tables (output of the
   `GenerateWorkPlan` flow, which is fed by the `Control` table / ingestion layer).
2. **GenerateWorkPlan flow** — invoked with **ask-before-replace**: first call
   `replace=false`; if it returns `exists`, the UI confirms, then calls
   `replace=true`.
3. **Copilot agent** — `askAgent` (Direct Line / connector).

`ENTITY_CONTRACT` at the top of that file holds **placeholder** Dataverse logical
names (`cr1c4_...`). Remap them to the real schema before going live.

## Key product decisions (do not regress)
- **NeedsReview frequency**: a work-plan item with no frequency is NOT dropped. It
  still gets a Priority, shows in the amber "ללא שיבוץ — דורש תדירות" group, and is
  surfaced for the user to resolve. Keep this behavior.
- **Ask-before-replace**: regenerating a plan that already exists must confirm
  before replacing (it is a data-changing action).

## RED LINE — security (this is a regulated compliance product)
- **Never** put real client data or secrets in this repo: no real survey/enforcement
  files, no connection strings, no API keys. `.env` is gitignored; `.gitignore` also
  blocks `/client-data/`, `/data/`, `*.client.*`, etc.
- Develop against the **mock** (default) or a **sandbox** Dataverse with **synthetic**
  data only — never a production org with real client records.
- Real client data is handled only by the **deployed** Code App inside the Power
  Platform tenant (no-egress constraint). Your laptop / this repo never touches it.

## Dev
- `npm install` then `npm run dev` → design preview on mock data.
- Components live in `src/components/`, tokens in `src/lib/tokens.js`.

## Code style
- Short, clean components. Tailwind utilities. lucide icons (no emoji).
- Accessibility: visible focus rings, `aria-label` on icon buttons, `aria-live` toasts.
