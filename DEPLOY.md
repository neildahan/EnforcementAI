# Deploying changes — Enforcement AI (Power Apps Code App)

How to publish updates to Power Platform after you change the code.

> The app lives in the **Compliance Agent - Development** environment.
> Project folder: `~/Documents/Projects/ComplianceAgentDashboard` (**no spaces** — required).

---

## ⚡ TL;DR — every time you have changes

Open Terminal and run these lines:

```bash
cd ~/Documents/Projects/ComplianceAgentDashboard
nvm use 22

# 1. SAVE your code to GitHub (history / backup)
git add -A
git commit -m "describe what you changed"
git push

# 2. PUBLISH the update to the live app
npm run build
pac code push
```

When the push finishes you'll see **"App pushed successfully. You can play your app at https://…"**.
Open that URL (or refresh the app you already have open) to see the changes.

That's it. 95% of the time this is all you need.

### Two separate "pushes" — keep them straight

| Command | Where it goes | What it does |
|---|---|---|
| `git push` | **GitHub** (https://github.com/neildahan/EnforcementAI) | Saves/versions your code. Does **not** change the live app. |
| `pac code push` | **Power Platform** | Publishes the live app users see. Does **not** touch GitHub. |

You can do one without the other (e.g. commit work-in-progress to GitHub without deploying). Usually you do both.

---

## What each line does

| Line | Why |
|---|---|
| `cd ~/Documents/Projects/ComplianceAgentDashboard` | Go into the project folder |
| `nvm use 22` | **Switch to Node 22** — `pac code` breaks on older Node. Do this every new terminal. |
| `npm run build` | Compile the React app into the `dist/` folder (what gets uploaded) |
| `pac code push` | Upload `dist/` to Power Platform and publish a new version |

You do **not** need to re-run `pac code init` — that was a one-time setup.

---

## See your app

- **Play URL** (printed after each push), or
- **make.powerapps.com → Apps → "Enforcement AI"** → Play / Share / Details.
- Always open in the **same browser profile** you sign into the tenant with.

App id: `2c96f411-f77b-4d27-9675-f6f13a59fbdb`

---

## Test locally before pushing (optional)

```bash
nvm use 22
npm run dev
```
Open the **Local Play** URL it prints (same browser profile as your tenant). Iterate, then build + push when happy.

---

## Going from demo data → real data (one-time)

The app currently shows **mock** data. To connect the real Dataverse tables:

1. In the Power Apps **Connections** page, create a **Microsoft Dataverse** connection.
2. Generate the data sources (run once per table):
   ```bash
   pac code add-data-source -a shared_commondataserviceforapps -c <connection-id> -t hl_workplanitem
   pac code add-data-source -a shared_commondataserviceforapps -c <connection-id> -t hl_corporategovernancecompliance
   pac code add-data-source -a shared_commondataserviceforapps -c <connection-id> -t hl_workplan
   ```
3. In `src/services/dataverse.js`: fill in the `live` object with the generated calls, then change the last line to:
   ```js
   export const dataverseService = USE_MOCK ? mock : live;
   ```
   and set `VITE_USE_MOCK=false` (in a `.env` file) — against a **sandbox/dev** org only.
4. `npm run build && pac code push`.

The field mapping + normalizers are already written in `dataverse.js`.

---

## Troubleshooting

**`pac` says I'm not logged in / token expired**
Re-authenticate. Sign-in *creation* must use pac **2.5.1** on this Mac (newer versions crash during login):
```bash
dotnet tool install -g microsoft.powerapps.cli.tool --version 2.5.1 --force
pac auth create --environment https://orga842a36b.crm4.dynamics.com/ --deviceCode
# then switch back to 2.8.1 for code commands:
dotnet tool install -g microsoft.powerapps.cli.tool --version 2.8.1 --force
```

**`403 CodeAppOperationNotAllowedInEnvironment`**
"Code apps" got turned off, or the change is still propagating. In **admin.powerplatform.microsoft.com → Environments → Compliance Agent - Development → Settings → Product → Features**, make sure **"Power Apps Code Apps → Enable code apps"** is **On** (allow ~10–15 min to take effect).

**`pac` hangs or shows "Broken pipe"**
Don't pipe its output (avoid `| tail` etc.). If a command seems stuck, Ctrl-C and rerun. Make sure `nvm use 22` ran in this terminal.

**`pac: command not found`**
Open a new terminal, or run `nvm use 22` first. `pac` lives at `/opt/homebrew/bin/pac`.

---

## Version notes (why the odd setup)

- Use **Node 22** (`nvm use 22`) for all `pac code` and build commands.
- `pac` is pinned around **2.8.1** for `pac code` commands; **2.5.1** only for `pac auth create` (a known macOS + .NET 10 bug crashes login on 2.6–2.8).
- Keep the project in a folder **without spaces** (a `pac` macOS bug).
