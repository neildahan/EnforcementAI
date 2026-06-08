/* ============================================================================
 *  THE SINGLE INTEGRATION SEAM.
 *  Everything that touches the backend lives here. In dev it is a MOCK
 *  (in-memory, no client data → no egress). To go live, replace the `mock`
 *  object with the `live` object below, populated by the generated Dataverse
 *  services after `pac code add-data-source`. The UI never changes.
 * ========================================================================== */

/* ---- ENTITY CONTRACT — REAL schema (from the Compliance Agent solution) -----
 *  Source of truth: customizations.xml of ComplianceAgent (managed). prefix = hl_.
 *  WorkPlanItem is a prioritized POINTER to a Control; descriptive fields live on
 *  the Control (hl_corporategovernancecompliance) and the year on the WorkPlan.
 *  Note: priority/quarter/status are stored as TEXT (nvarchar) → see normalizers.
 * --------------------------------------------------------------------------- */
export const ENTITY_CONTRACT = {
  workPlanItem: {
    table: "hl_workplanitem",
    set: "hl_workplanitems",       // Web API entity set (plural)
    id: "hl_workplanitemid",
    fields: {
      name: "hl_name",
      title: "hl_controltitle",    // denormalized control title (human-readable)
      priority: "hl_priority",     // text → normPriority()
      quarter: "hl_quarter",       // text → normQuarter() ("Q1".."Q4")
      status: "hl_itemstatus",     // text → normStatus()
      taskType: "hl_tasktype",     // Choice (training/control/reminder/report) → normType()
      dueDate: "hl_duedate",       // Date (מועד יעד) → past + not done ⇒ overdue
    },
    lookups: {
      control: "hl_controlref",    // → hl_corporategovernancecompliance
      workPlan: "hl_workplanref",  // → hl_workplan
    },
  },
  control: {
    table: "hl_corporategovernancecompliance",
    set: "hl_corporategovernancecompliances",
    id: "hl_corporategovernancecomplianceid",
    fields: {
      title: "hl_compliancetitle",
      description: "hl_legalrequirementdescription",
      controlMeasures: "hl_recommendedcontrolmeasures",
      sourceLaw: "hl_sourcelaw",
      sourceSection: "hl_sourcesection",      // regulatoryBasis = law + section
      frequency: "hl_reviewfrequency",        // empty ⇒ NeedsReview
      residualRisk: "hl_residualrisklevel",   // choice (risk → priority upstream)
      responsibleParty: "hl_responsibleparty",// ≈ audience (responsible party)
    },
  },
  workPlan: {
    table: "hl_workplan",
    set: "hl_workplans",
    id: "hl_workplanid",
    fields: { name: "hl_name", year: "hl_year", status: "hl_status", generatedOn: "hl_generatedon" },
    lookups: { company: "hl_companyref" },
  },
  //   audience → mapped from the control's responsibleParty (closest available)
  flow: { topic: "GenerateWorkPlan", agent: "סוכן ציות חכם" },
};

/* ---- Normalizers: real columns are free text; map to the UI's internal keys -
 *  Tolerant by design — covers EN/HE variants + safe fallbacks, so the UI works
 *  whatever the GenerateWorkPlan flow writes. Confirm/trim against live data. */
const _n = (s) => (s ?? "").toString().trim().toLowerCase();

export function normPriority(v) {
  const s = _n(v);
  if (s.includes("high") || s.includes("גבוה")) return "high";
  if (s.includes("low") || s.includes("נמוך") || s.includes("נמוכה")) return "low";
  if (s.includes("med") || s.includes("בינונ")) return "medium";
  return "medium"; // safe default
}

export function normStatus(v) {
  const s = _n(v);
  if (s.includes("done") || s.includes("complet") || s.includes("הושלם") || s.includes("סגור") || s.includes("closed")) return "done";
  if (s.includes("progress") || s.includes("בתהליך") || s.includes("בביצוע") || s.includes("started")) return "in_progress";
  return "todo"; // todo / not started / open / לביצוע / ""
}

export function normQuarter(v) {
  const m = (v ?? "").toString().toUpperCase().match(/Q\s*([1-4])/);
  return m ? `Q${m[1]}` : null; // null ⇒ unscheduled (NeedsReview group)
}

export function normFrequency(v) {
  const s = (v ?? "").toString().trim();
  return s ? s : "NeedsReview"; // empty frequency ⇒ NeedsReview (per product decision)
}

// hl_tasktype Choice option codes (from the solution). Used when the live read
// returns the raw option value instead of the formatted label.
const TYPE_CODE = {
  123080001: "training",
  123080002: "control",
  123080003: "reminder",
  123080004: "report",
};

// Accepts either the Choice label (EN/HE) or the raw option code.
export function normType(v) {
  if (v != null && TYPE_CODE[v]) return TYPE_CODE[v];
  const s = _n(v);
  if (s.includes("train") || s.includes("הדרכ")) return "training";
  if (s.includes("remind") || s.includes("תזכור")) return "reminder";
  if (s.includes("report") || s.includes("דוח") || s.includes('דו"ח')) return "report";
  if (s.includes("control") || s.includes("בקר")) return "control";
  return "control"; // safe default
}

// Date-only / datetime → "YYYY-MM-DD" (or null).
function toDateStr(v) {
  if (!v) return null;
  const s = v.toString();
  return s.length >= 10 ? s.slice(0, 10) : s;
}

/* Map a resolved record (item + expanded control + expanded workPlan) → UI shape. */
export function fromDataverse(item, control = {}, workPlan = {}) {
  const I = ENTITY_CONTRACT.workPlanItem.fields;
  const C = ENTITY_CONTRACT.control.fields;
  const W = ENTITY_CONTRACT.workPlan.fields;
  const basis = [control[C.sourceLaw], control[C.sourceSection]].filter(Boolean).join(" ");
  return {
    id: item[ENTITY_CONTRACT.workPlanItem.id],
    title: item[I.title] || item[I.name] || control[C.title] || "",
    description: control[C.description] || control[C.controlMeasures] || "",
    type: normType(item[I.taskType]),
    priority: normPriority(item[I.priority]),
    quarter: normQuarter(item[I.quarter]),
    status: normStatus(item[I.status]),
    year: workPlan[W.year] ?? null,
    frequency: normFrequency(control[C.frequency]),
    dueDate: toDateStr(item[I.dueDate]),
    regulatoryBasis: basis,
    audience: control[C.responsibleParty] || "",
  };
}

const USE_MOCK = import.meta.env?.VITE_USE_MOCK !== "false";

/* --------------------------------- mock ------------------------------------ */
const SEED = [
  { id: "1", title: "הדרכת נהלי אכיפה — עובדי כספים", description: "לומדה + חתימה על הצהרה", type: "training", priority: "high", quarter: "Q2", status: "todo", frequency: "annual", dueDate: "2026-06-30", regulatoryBasis: "נוהל אכיפה פנימי 4.2", audience: "עובדי כספים וחשבות" },
  { id: "2", title: "הדרכת נהלי אכיפה — כלל העובדים", description: "לומדה + חתימה על הצהרה", type: "training", priority: "high", quarter: "Q2", status: "todo", frequency: "annual", dueDate: "2026-06-30", regulatoryBasis: "נוהל אכיפה פנימי 4.2", audience: "כלל העובדים" },
  { id: "3", title: "ביצוע בקרות רבעון 2", description: "בחירת נושאי בקרה, ביצוע, תיעוד תוצאות וטיפול בממצאים", type: "control", priority: "high", quarter: "Q2", status: "todo", frequency: "quarterly", dueDate: "2026-05-31", regulatoryBasis: "תוכנית בקרה שנתית", audience: "ממונה ציות" },
  { id: "4", title: "הודעת חלון סגור — דוח Q2", description: "שליחת הודעה 20 יום לפני פרסום הדוח הרבעוני", type: "reminder", priority: "medium", quarter: "Q2", status: "todo", frequency: "quarterly", dueDate: "2026-06-20", regulatoryBasis: "סעיף 36 לחוק ני\"ע", audience: "נושאי משרה ומקורבים" },
  { id: "5", title: "הכנת דוח רבעוני Q2", description: "ריכוז נתונים, סקירת רו\"ח, אישור צוות הדיווח", type: "report", priority: "high", quarter: "Q2", status: "todo", frequency: "quarterly", dueDate: "2026-06-30", regulatoryBasis: "תקנות דוחות תקופתיים ומיידיים", audience: "צוות הדיווח" },
  { id: "6", title: "שאלון ניגוד עניינים — נושאי משרה", description: "הפצה, איסוף, הצלבה מול רשימת בעלי עניין", type: "control", priority: "medium", quarter: "Q2", status: "in_progress", frequency: "quarterly", dueDate: "2026-05-15", regulatoryBasis: "נוהל ניגוד עניינים", audience: "נושאי משרה" },
  { id: "7", title: "עדכון מרשם בעלי עניין", description: "תדירות לא הוגדרה בסקר/בתוכנית — דורש קביעה", type: "reminder", priority: "low", quarter: null, status: "todo", frequency: "NeedsReview", dueDate: null, regulatoryBasis: "סעיף 37 לחוק ני\"ע", audience: "מזכירות החברה" },
  { id: "8", title: "הדרכת מידע פנים — עובדי כספים ורכש", description: "לומדה + מבחן ידע לאוכלוסיית סיכון בינוני", type: "training", priority: "high", quarter: "Q1", status: "todo", frequency: "annual", dueDate: "2026-03-31", regulatoryBasis: "סעיפים 52א-52ד לחוק ני\"ע", audience: "עובדי כספים, חשבות, רכש, IR" },
  { id: "9", title: "הדרכת מידע פנים — כלל העובדים", description: "לומדה לאוכלוסיית סיכון נמוך", type: "training", priority: "high", quarter: "Q1", status: "todo", frequency: "annual", dueDate: "2026-03-31", regulatoryBasis: "סעיפים 52א-52ד לחוק ני\"ע", audience: "כלל העובדים" },
];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const mock = {
  async getWorkPlanItems({ year }) {
    await wait(450);
    return SEED.map((x) => ({ ...x, year }));
  },
  async updateItemStatus(id, status) {
    await wait(250);
    return { id, status };
  },
  async scheduleItem(id, quarter) {
    await wait(250);
    return { id, quarter };
  },
  // Ask-before-replace: first call replace=false; if result==="exists" the UI
  // confirms, then calls again with replace=true.
  async regenerateWorkPlan({ year, replace }) {
    await wait(700);
    return { result: replace ? "replaced" : "exists", year };
  },
  async askAgent() {
    await wait(400);
    return { reply: "הסוכן זמין בסביבת ה-Code App." };
  },
};

/* --------------------------------- live ------------------------------------ *
 *  Real Dataverse access via the generated connector service
 *  (src/generated/services/MicrosoftDataverseService — from pac code add-data-source).
 *  Loaded lazily so local/dev (mock) never pulls the Power runtime client.
 *  Reads the 3 tables and joins WorkPlanItem → Control / WorkPlan in JS, then
 *  maps each row through fromDataverse(). Only runs inside the Power Apps host. */
const SET = {
  item: ENTITY_CONTRACT.workPlanItem.set,       // hl_workplanitems
  control: ENTITY_CONTRACT.control.set,          // hl_corporategovernancecompliances
  workPlan: ENTITY_CONTRACT.workPlan.set,        // hl_workplans
};
const SEL_ITEM = "hl_workplanitemid,hl_name,hl_controltitle,hl_priority,hl_quarter,hl_itemstatus,hl_tasktype,hl_duedate,_hl_controlref_value,_hl_workplanref_value";
const SEL_CONTROL = "hl_corporategovernancecomplianceid,hl_compliancetitle,hl_legalrequirementdescription,hl_recommendedcontrolmeasures,hl_sourcelaw,hl_sourcesection,hl_reviewfrequency,hl_residualrisklevel,hl_responsibleparty";
const SEL_WP = "hl_workplanid,hl_year,hl_name,hl_status";

// Status write-back: UI key → human-readable text (round-trips via normStatus).
const STATUS_WRITE = { todo: "Not Started", in_progress: "In Progress", done: "Completed" };

let _DV, _ORG;
async function dv() {
  if (!_DV) _DV = (await import("../generated/services/MicrosoftDataverseService")).MicrosoftDataverseService;
  return _DV;
}
// The Dataverse connector needs the org URL explicitly; resolve it once (portable
// across environments — no hardcoding).
async function org() {
  if (_ORG) return _ORG;
  const DV = await dv();
  const res = await DV.GetOrganizations();
  if (!res?.success) throw res?.error ?? new Error("GetOrganizations failed");
  _ORG = res.data?.value?.[0]?.Url;
  if (!_ORG) throw new Error("No organization URL resolved from the connection");
  return _ORG;
}
async function listAll(set, select) {
  const DV = await dv();
  const o = await org();
  const res = await DV.ListRecordsWithOrganization(o, set, undefined, undefined, false, false, select);
  if (!res?.success) throw res?.error ?? new Error(`ListRecords ${set} failed`);
  return res.data?.value ?? [];
}
async function patchItem(id, item) {
  const DV = await dv();
  const o = await org();
  const res = await DV.UpdateRecordWithOrganization("return=representation", "application/json", o, SET.item, id, item);
  if (!res?.success) throw res?.error ?? new Error("UpdateRecord failed");
  return res;
}

const live = {
  async getWorkPlanItems({ year }) {
    const [items, controls, plans] = await Promise.all([
      listAll(SET.item, SEL_ITEM),
      listAll(SET.control, SEL_CONTROL),
      listAll(SET.workPlan, SEL_WP),
    ]);
    const cById = Object.fromEntries(controls.map((c) => [c[ENTITY_CONTRACT.control.id], c]));
    const pById = Object.fromEntries(plans.map((p) => [p[ENTITY_CONTRACT.workPlan.id], p]));
    return items
      .map((it) => fromDataverse(it, cById[it._hl_controlref_value] ?? {}, pById[it._hl_workplanref_value] ?? {}))
      .filter((x) => year == null || x.year == null || x.year === year);
  },

  async updateItemStatus(id, status) {
    await patchItem(id, { [ENTITY_CONTRACT.workPlanItem.fields.status]: STATUS_WRITE[status] ?? status });
    return { id, status };
  },

  async scheduleItem(id, quarter) {
    await patchItem(id, { [ENTITY_CONTRACT.workPlanItem.fields.quarter]: quarter });
    return { id, quarter };
  },

  // GenerateWorkPlan is a Copilot Studio TOPIC (not a direct connector op). Not
  // wired yet — this is a harmless no-op so the refresh button doesn't error.
  async regenerateWorkPlan() {
    return { result: "noop" };
  },

  async askAgent() {
    return { reply: "הסוכן עדיין אינו מחובר ל-Code App." };
  },
};

export const dataverseService = USE_MOCK ? mock : live;
