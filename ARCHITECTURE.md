# ARCHITECTURE — סוכן ציות חכם (TASE Compliance System)

End-to-end explanation of the system, every Microsoft component, and exactly how
each part connects. This dashboard (Enforcement AI) is the front end of that system.

**Status legend:** ✅ built · 🟡 designed / in spec · ⬜ placeholder (needs real values)

---

## 1. What the system is

An internal-compliance platform for Israeli public companies listed on the TASE.
A client onboards two documents; the system normalizes them into a controls
register, generates a risk-prioritized annual work plan, and lets the compliance
officer (הממונה) run and track it — conversationally (Copilot agent) and visually
(this dashboard).

## 2. Hard constraint — no-egress (foundational)

Client data must **never** leave the Dataverse / Power Platform tenant boundary.
- Deterministic logic runs **inside** Power Platform (Power Automate / Dataverse /
  Office Script).
- External Azure + LLM are reserved for the **single genuinely-AI step**, subject to
  no-egress review. For strict clients (TASE public companies) the default model is
  **Azure OpenAI in-region**, not an external API.
- The development plane (laptop, source code) is separate from the data plane
  (deployed app + real records). Source is edited locally; real data is only handled
  by the deployed app in the tenant.

## 3. End-to-end data flow

```
   Client uploads:  סקר ציות (Excel)      תוכנית אכיפה (PDF)
                          │                       │
                          ▼                       ▼
        ┌─────────────────────────────────────────────────────┐
        │            INGESTION / ONBOARDING LAYER  🟡           │
        │  Excel → Office Script (deterministic, no AI)         │
        │  PDF  → Doc Intelligence + Azure OpenAI (in-region)   │
        │          → human review                               │
        └───────────────────────────┬─────────────────────────┘
                                     ▼
                       Dataverse · Control table  🟡
                     (requirement + control activity +
                      ResidualRisk + Frequency[/NeedsReview])
                                     │
                                     ▼
              Power Automate · GenerateWorkPlan flow  ✅
            (prioritize by risk · assign Quarter · idempotent)
                                     │
                                     ▼
        Dataverse · WorkPlan + WorkPlanItem  ✅  (Priority, Quarter, Type, Status)
                                     │
            ┌────────────────────────┼────────────────────────┐
            ▼                                                  ▼
   Copilot Studio agent  ✅                        Power Apps Code App  ✅(new)
   (conversational; triggers flow   ◄── ask-before-replace ──►   "משימות הממונה"
    with ask-before-replace)                         read items · update status ·
                                                       regenerate · surface NeedsReview

        Everything above runs inside the Power Platform tenant (Entra ID + DLP).
```

## 4. Microsoft components

| Component | Role | In-tenant | Status |
|---|---|---|---|
| **Dataverse** | System of record: `Control`, `WorkPlan`, `WorkPlanItem` | Yes (data plane) | 🟡/✅ |
| **Power Automate** — `GenerateWorkPlan` | Control → prioritized work plan; idempotent | Yes | ✅ |
| **Power Automate** — ingestion flows | Orchestrate parse → normalize → upsert Control | Yes | 🟡 |
| **Office Script** | Deterministic Excel (survey) parse | Yes | 🟡 |
| **Azure Document Intelligence** | PDF → text (deterministic) | Yes (in-region) | 🟡 |
| **Azure OpenAI (in-region)** | Enforcement-plan prose → structured controls (the only AI step) | Tenant region | 🟡 |
| **Copilot Studio** | Conversational agent; ask-before-replace | Yes | ✅ |
| **Power Apps Code App** | This dashboard (React) | Yes | ✅ |
| **Entra ID + DLP** | Auth + data-loss governance | Yes | ✅ |

## 5. How each connection is wired

### 5.1 Dashboard ↔ Dataverse
The Code App reads/writes `WorkPlanItem` through the **Microsoft Dataverse**
connector (`shared_commondataserviceforapps`).
- Create the connection in Power Apps (Connections page) first — the CLI uses
  existing connections, it can't create them.
- `pac code add-data-source -a shared_commondataserviceforapps -c <connection-id> -t cr1c4_workplanitem`
  generates typed services under `./generated/services/`.
- In code, the single seam is `src/services/dataverse.js`. Swap its `mock` for a
  `live` object that calls the generated services. Field names come from
  `ENTITY_CONTRACT` (⬜ placeholder — remap to real logical names).
- The connector supports FetchXML / expand / relationships for the risk-priority
  queries.

### 5.2 Dashboard ↔ GenerateWorkPlan flow
The "רענון תוכנית" button calls `dataverseService.regenerateWorkPlan({ year, replace })`.
- Wire it to the `GenerateWorkPlan` cloud flow via a connector action (or a bound
  Dataverse action).
- **Ask-before-replace** (same logic as the Copilot agent): first call `Replace=false`;
  if the flow returns `Result='exists'`, the UI confirms, then calls `Replace=true`.

### 5.3 Dashboard ↔ Copilot agent
`dataverseService.askAgent()` routes to the Copilot Studio agent (Direct Line /
connector). The agent and the dashboard are two front ends over the same Dataverse
data and the same flow.

### 5.4 Ingestion → Control (upstream of everything) 🟡
- **Survey (Excel):** Office Script parses it deterministically in-tenant (header-row
  detection, duplicate-header handling, owner "/" normalization, multi-sheet by law).
  No AI. Maps each row → one `Control` record; `חשיפה שיורית` → Priority;
  empty `תדירות` → `NeedsReview`.
- **Enforcement plan (PDF):** in-tenant text extraction, then Azure OpenAI in-region
  extracts discrete controls from prose → **human review** → upsert `Control`.
- The two are **complementary layers**: survey = regulatory requirement; plan =
  control activity + frequency + owner. Idempotent upsert on a natural key
  `{ClientId}|{Law}|{Section}|{SourceType}`.

### 5.5 Auth & governance
The deployed Code App runs in the tenant under **Entra ID**, governed by **DLP**.
Real client data stays in Dataverse. The local dev loop runs on **mock or sandbox**
data only.

## 6. The code integration seam

`src/services/dataverse.js` is the **only** file that touches a backend. Mock today
(in-memory, no client data). `ENTITY_CONTRACT` at the top holds the table/field
logical names — currently ⬜ placeholders (`cr1c4_...`). Going live = replace `mock`
with `live`, set `VITE_USE_MOCK=false` against a sandbox, remap `ENTITY_CONTRACT`.

## 7. Key product decisions

- **NeedsReview frequency:** an item with no frequency is never dropped — it gets a
  Priority, shows in the amber "ללא שיבוץ" group, and is surfaced to resolve.
- **Ask-before-replace:** regenerating an existing plan confirms before replacing.
- **Complementary sources:** survey = requirement layer; enforcement plan = control
  activity / frequency / owner layer (no double-counting).

## 8. Security & dev red line

- Never commit real client data or secrets to the repo. `.gitignore` blocks `.env`,
  `/client-data/`, `/data/`, `*.client.*`, survey/enforcement file patterns.
- Develop on mock or a sandbox with synthetic data. Real records only in the
  deployed app inside the tenant.
- For a regulated product, standardize tooling on Commercial/Enterprise tiers and
  confirm data-handling terms against client commitments.

## 9. Open items / placeholders

1. ⬜ Real `Control` + `WorkPlanItem` schema (field logical names + how Risk and
   Frequency are typed) → finalizes `ENTITY_CONTRACT` and the `live` service.
2. 🟡 Ingestion layer build (Office Script + Azure OpenAI extraction + reconcile).
3. 🟡 Confirm reconciliation model (complementary layers — current lean).

## 10. References (verify exact flags)

- Code Apps — create from scratch: https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-an-app-from-scratch
- Code Apps — connect to data: https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data
- Code Apps — data usage / retention: https://learn.microsoft.com/en-us/power-apps/developer/code-apps/  ·  https://docs.anthropic.com/en/docs/claude-code/data-usage
