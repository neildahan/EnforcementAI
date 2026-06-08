# Enforcement AI Dashboard

Front end for the TASE compliance product (סוכן ציות חכם), built as a
**Power Apps Code App** (React) that runs inside the Power Platform tenant.

> **Full system + all Microsoft connections:** see **[ARCHITECTURE.md](./ARCHITECTURE.md)** —
> the end-to-end data flow, every Microsoft component, and how each one connects.

## Quick start (local design loop)

```bash
npm install
npm run dev
```

Opens the dashboard on **mock data** (no backend, no client data). Edit freely —
this is the loop to iterate on the design (e.g. with Claude Code in this folder).

## Structure

```
src/
  EnforcementDashboard.jsx   # composes the page + holds state
  App.jsx                    # wrap with <PowerProvider> when it becomes a Code App
  services/dataverse.js      # THE integration seam — mock now, swap for live
  lib/tokens.js              # type/priority/status meta + nav
  components/                # Sidebar, TaskCard, Controls, ConfirmModal
```

The only file that talks to a backend is `src/services/dataverse.js`. Replace its
`mock` with `live` (generated Dataverse services) to go from prototype to wired.

## Deploy to Power Apps Code App

> Verify exact flags against Microsoft Learn:
> https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-an-app-from-scratch
> and https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-data

**Prerequisites**
- Node.js + Power Platform CLI (`pac`). Verify with `pac --version`.
- A Power Platform environment with **Code Apps enabled** (PPAC feature settings).
- A Power Apps license; for a regulated product, a Commercial/Enterprise tenant.

**Steps**
1. **Authenticate** to your environment:
   ```bash
   pac auth create --environment <your-environment-url>
   ```
2. **Initialize** the Code App in this folder (adds the Power SDK / PowerProvider
   wiring + a `power.config`):
   ```bash
   pac code init --displayName "Enforcement AI"
   ```
   Then wrap `<EnforcementDashboard />` in `src/App.jsx` with the generated
   `<PowerProvider>`.
3. **Create the connection first** in Power Apps (Connections page) — for Dataverse
   that is the *Microsoft Dataverse* connector (`shared_commondataserviceforapps`).
   The CLI uses existing connections; it can't create them (initial release).
4. **Add the data source** (generates typed services under `./generated/services/`):
   ```bash
   pac code add-data-source -a shared_commondataserviceforapps -c <connection-id> -t cr1c4_workplanitem
   ```
   Repeat for other tables (e.g. `cr1c4_workplan`). Then replace the `mock` in
   `src/services/dataverse.js` with calls to the generated services and set
   `VITE_USE_MOCK=false` against a **sandbox** org.
5. **Test locally**: `npm run dev`, then open the **Local Play URL** printed by
   `pac code init`/run in the *same browser profile* as your tenant.
   (Since Dec 2025, Chrome/Edge may block local-network access — grant it if prompted.)
6. **Publish**:
   ```bash
   npm run build
   pac code push
   ```
   The app appears in make.powerapps.com → Apps. Share with licensed users. For
   multi-environment ALM, package it in a solution and use connection references.

## Security — RED LINE
Never commit real client data or secrets. Develop on the mock or a sandbox with
synthetic data. Real client data is handled only by the deployed app inside the
tenant (no-egress). See `CLAUDE.md`.
