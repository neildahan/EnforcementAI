# Spec — Onboarding Wizard ("הגדרה ראשונית" → 5-step flow)

Replaces the existing single-screen file upload with a guided flow that
produces a real work plan from the user's actual uploaded documents — with
the user picking what gets included before anything is generated.

> Status: design-locked decisions captured below. Data shapes and parser
> contract are still preliminary. No code yet. The extraction engine itself
> (Office Script / Azure Document Intelligence / Azure OpenAI in-region) is
> out of scope here — see ARCHITECTURE.md § 5.4.

## Why this exists

Today the reference product (and our app's existing setup screen) does:
upload → "ההגדרה הושלמה" → work plan is hardcoded constants. The files are
ignored. We want: upload → AI parses → **user reviews candidates and picks**
→ only then the work plan is generated from the picks.

The selection step is the load-bearing piece. Skipping it would either give
the user a generic plan (today's behavior, useless) or auto-apply
everything the AI extracted (sends 50 wrong tasks into the work plan).

## The 5 steps

```
[1 Upload] → [2 Analyzing] → [3 Review candidates] → [4 Confirm] → [5 Done]
```

### Step 1 — Upload
Two dropzones, marine accent. `סקר ציות` (.xlsx/.csv) + `תוכנית אכיפה`
(.pdf/.docx). Status per file: empty → uploading → ready. Side panel
explains what each file feeds. "המשך לניתוח" enabled when both ready.

### Step 2 — Analyzing
Files sent to the parse flow. Streaming progress: "מחלץ דרישות מסקר הציות
(23/47)…" / "מחלץ בקרות מתוכנית האכיפה…" / "ממפה לקטלוג הרגולטורי…".
Patient by design (30s–2min). Errors land here clearly with concrete
remediation steps.

### Step 3 — Review candidates *(the core new screen)*
- **Top bar**: search · bulk actions · selected count.
- **Left rail filters**: category (בקרות / הדרכות / תזכורות) · law family
  (one filter per source sheet) · priority · "ללא תדירות".
- **Center**: candidates grouped by category, then by source sheet.
  Each candidate card shows:
  - Title (from C4 of the Excel row, or PDF section heading)
  - 1-line description (from C5/C6 or PDF body)
  - **Source chip** ("סקר ציות · גיליון 'לחוק החברות' · שורה 14" /
    "תוכנית אכיפה · §57.9 · עמ' 44") — click to peek at the verbatim
    snippet in a side drawer.
  - Suggested quarter / frequency / priority / audience (editable inline).
  - **Include checkbox** (default decided by category — see D2).
  - **Hide** with reason ("לא רלוונטי", "דחיה לשנה הבאה", custom).
- **Sticky footer**: live preview — "X בקרות · Y הדרכות · Z תזכורות
  · W ללא שיבוץ — Q1: 4, Q2: 7, …". Updates on every toggle.

### Step 4 — Confirm
Summary per quarter. If a published plan already exists for this year,
show a diff (+N new, ~M changed, -K removed) — drives the existing
ask-before-replace flow. CTAs: "החלף תוכנית קיימת" · "שמור כטיוטה" ·
"חזור לעריכה".

### Step 5 — Done
"תוכנית עבודה ל-{year} נוצרה. N משימות שובצו." Links to dashboard /
tasks / control-topics.

## What the agent extracts from each file

| Candidate type    | Primary source                        | Secondary             | Notes |
|---|---|---|---|
| **בקרות**         | Excel (each row → 1 candidate)        | PDF context           | Excel is the canonical source. C3=section, C4=title, C5+C6=desc, C10=audience, C12=auditor, C17=frequency (usually empty → NeedsReview), C22=priority (נמוכה→low, בינונית→medium, גבוהה→high). |
| **הדרכות**        | PDF cadence + population × **canonical catalog topics** | — | The PDF says "annual refresher for officers" — it doesn't name topics. Catalog (today: TRAINING_1/2/3 in reference) provides the topic list. Candidates = cadence × topics. |
| **תזכורות**       | PDF                                   | —                     | §13 (חלון סגור), §37.1 (quarterly questionnaire), §57.9 (refresher), §57.10 (post-violation). |
| **טפסים/הצהרות**  | PDF annexes                           | —                     | **Fold into תזכורות** per D3. נספח ב/ג/ד/ו each generates "make sure signed/distributed" recurring tasks. |
| **Company profile** | PDF metadata (§1.7 ממונה, §3.6 צוות הדיווח, cover page company name) | — | See D6 — hybrid extraction with confidence threshold. |

## Decisions (this is the contract)

### D1 — Training topics come from the canonical catalog
The enforcement-plan PDF defines the **cadence + population** (e.g. "annual
refresher for officers"). It does NOT name training topics. Topics come from
the canonical catalog (the equivalent of `TRAINING_1/2/3` in the reference,
authored from עמדת סגל 199-9 + Securities Law). Candidate trainings are
the Cartesian product: each catalog topic × each PDF-defined audience-cadence
combination.

### D2 — Excel rows default to "active task" (not "tracking-only")
Every control candidate from the Excel is **checked by default**, even if
the survey says `עומד / אפקטיבי` / נמוכה residual. The ממונה ends up with
a verification task for that row each quarter. User can uncheck during
review. Rationale: safer (nothing slips through) over leaner.

### D3 — Annex/form tasks fold into תזכורות
No 5th category for form-chasing. נספח ב/ג/ד/ו tasks ("get signatures",
"distribute questionnaire") live inside תזכורות. Keeps the UI compact;
keeps TYPE_META at 4 types.

### D4 — Surveys are multi-sheet with varying schemas
Real surveys span multiple sheets (חוק ני"ע / חוק החברות / תקנות / עמדות
סגל) and the **column structures differ between sheets**. Implications:
- The Office Script / extraction layer needs per-sheet schemas (lookup
  by sheet name) or AI-driven header inference. Not a single rigid column
  map.
- The candidate card must be **resilient to missing fields** — render only
  the columns the source sheet supplied. Required core fields: `title`,
  `section/id`, `source sheet`. Everything else is optional.
- The review screen filters by source sheet on the left rail.

### D5 — Re-upload uses diff-and-merge (not replace)
Re-uploading mid-year does not wipe the plan. The agent compares the new
survey to the published plan and surfaces a **diff view** in the review
screen:
- `חדש` — green chip
- `השתנה` — amber chip with inline diff of the changed field(s)
- `הוסר` — rose chip
- `ללא שינוי` — collapsed by default

User approves → only the deltas apply. Existing tasks survive; new ones
get added; removed ones archive (not delete) for audit trail.
"Replace everything" stays available behind a confirmation (reuses the
existing ask-before-replace flow that's already wired in `dataverse.js`).

Requires: a stable per-candidate identity so "same row" can be matched
across uploads. Probably hash of `(source_sheet | section_id | title)`.

### D6 — PDF metadata extraction is hybrid with confidence threshold
The agent extracts company profile fields from the PDF (ממונה name, company
name, צוות הדיווח members, etc.) with a per-field confidence score:
- **High confidence** (clean extraction, e.g. § naming the ממונה in plain
  text) → prefilled in Step 3, user just confirms.
- **Low confidence** (OCR garbage, missing, ambiguous) → empty field with
  label "couldn't auto-detect — please fill in".

Where this profile gets used: task assignee defaults ("send to ממונה" →
resolves to the name), report cover pages, נספח ו questionnaire addressee,
notification "from" field.

## Data shapes (preliminary)

### `Candidate` (review-screen card model)
```js
{
  id,                   // hash(source_sheet | section | title) — stable across re-uploads
  type,                 // 'control' | 'training' | 'reminder'
  title,
  description,
  source: {
    file,               // 'survey' | 'plan' | 'catalog'
    sheet,              // Excel sheet name, or null
    section,            // §92(1), §57.9.1, etc.
    page,               // PDF page or Excel row
    snippet,            // verbatim text for "peek" drawer
  },
  suggested: {
    quarter,            // 1..4 | null (NeedsReview)
    frequency,          // 'quarterly' | 'annual' | ... | null
    priority,           // 'high' | 'medium' | 'low'
    audience,           // string (or array if multi-owner)
  },
  diff: null | {        // present only on re-upload (D5)
    state: 'new' | 'changed' | 'removed',
    changes: { field: { from, to } }
  },
  included: boolean,    // default per D2
  hidden: { reason } | null,
}
```

### `CompanyProfile` (output of D6 extraction)
```js
{
  companyName: { value, confidence },
  enforcementOfficer: {
    name: { value, confidence },
    title: { value, confidence },
  },
  reportingTeam: [
    { name, title, confidence }, …
  ],
  // freeform extension as more fields prove valuable
}
```

### `DraftPlan` (Dataverse-side — Step 3 selections persist here)
- Lives as a new entity (working name `hl_workplandraft`) so closing the
  tab is safe. Auto-saved on every selection toggle.
- Becomes a published `WorkPlan` only when Step 4 is confirmed.
- One draft per `(year, company)` — re-uploads update the same draft.

### D7 — Auto-save is optimistic local + debounced sync
On the candidates screen, every toggle/edit updates local state **instantly**
(no spinner). A debounced PATCH to Dataverse fires after ~2s of quiet. A
top-right status indicator shows `שמור` / `שומר…` / `שגיאה — לחץ לנסות שוב`.
`beforeunload` warns if the user closes the tab mid-save. Pattern matches
Linear / Notion / Google Docs.

### D8 — No approval gate in v1
ממונה is authoritative. Step 4 has one CTA: "פרסם תוכנית". Matches the
existing ask-before-replace pattern. Audit-committee approval is a v2
concern — adds a second user role, separate UI, state machine,
notifications. Out of scope now.

### D9 — Per-item editing stays open after publish
After Step 5, individual items remain editable inline everywhere they
appear (TaskCard, ControlTopicsView when wired, etc.) — same edit-mode
we already shipped on TaskCard. **Structural changes** (add new items,
remove items wholesale, reclassify) require re-entering the wizard and
go through the diff flow in D5. The rule: tweak-in-place is fine; reshape
goes through the wizard.

### D10 — Mis-classification is fixed by a type picker on the candidate card
Each candidate card has a small type selector (control / training /
reminder) that the user can change to recategorize. No drag-and-drop, no
clever inference recovery — just a picker. Moves the item between
category groups in the review screen.

### D11 — Mandatory fields are minimal; optional fields render only when present
- **Required** on every Candidate: `title`, `section` (or stable id),
  `source sheet`.
- **Optional**: everything else (`description`, `audience`, `auditor`,
  `frequency`, `priority`, `quarter`). The card renders only the optional
  fields the source actually supplied. Missing fields never block
  inclusion — they're just absent from the card.

### D12 — Wizard is always-on, accessed from the "הגדרה ראשונית" menu item
Not a one-time onboarding step. The ממונה enters the wizard any time they
want to update the work plan. First visit = fresh extraction. Subsequent
visits = re-upload triggers the diff view from D5. The existing menu
item `הגדרה ראשונית` is the door.

## Out of scope for this spec

- The actual extraction engine (Office Script for Excel + Azure Document
  Intelligence + Azure OpenAI in-region for PDF). Separate project in
  Power Automate. This spec assumes that engine returns `Candidate[]` +
  `CompanyProfile` from the upload.
- TASE / MAYA wiring for runtime auto-checks — handled by the separate
  MayaConnector project (see `~/Documents/Projects/MayaConnector`).
- The persistence of the published plan — already exists as the
  `WorkPlanItem` / `WorkPlan` entities driven by `GenerateWorkPlan`.

## Reference materials reviewed for this spec

- `/Users/neildahan/Downloads/סקר ציות חברה ציבורית - מקיף וממפה (1).xlsx`
  — 1-sheet sample, 25 rows, חוק החברות. Verified column shape (23 cols),
  duplicate-header gotcha (C11/C13), "/" multi-owner pattern (C10), mostly-
  empty C17 (frequency), well-filled C22 (residual exposure).
- `/Users/neildahan/Downloads/תוכנית אכיפה OPC (1).pdf` — 87 pages, OPC
  Energy, Nov 2018. Verified §57.9 training cadence wording, annex list,
  §13 closed-window, §37.1 quarterly questionnaire, §1.7 ממונה naming.
- `/Users/neildahan/Documents/Projects/enforcement-agent-export/src/app/upload/page.tsx`
  + `/api/upload/route.ts` + `/api/upload-status/route.ts` + `/api/generate-plan/route.ts`
  + `/src/lib/tasks-data.ts` — confirmed reference is upload + hardcoded
  catalog, no extraction.
