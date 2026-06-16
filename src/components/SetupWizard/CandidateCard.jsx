import { useState } from "react";
import {
  ChevronDown, BookOpen, FileSpreadsheet, FileText, ExternalLink,
  GraduationCap, ShieldCheck, Bell,
} from "lucide-react";
import { PRIORITY_META, FREQUENCY_OPTIONS, QUARTERS } from "../../lib/tokens.js";

const TYPE_META = {
  control:  { label: "בקרה",  Icon: ShieldCheck,   tile: "bg-marine-50 text-marine-600" },
  training: { label: "הדרכה", Icon: GraduationCap, tile: "bg-marine-50 text-marine-600" },
  reminder: { label: "תזכורת", Icon: Bell,         tile: "bg-marine-50 text-marine-600" },
};

const SOURCE_ICON = { survey: FileSpreadsheet, plan: FileText };
const SOURCE_LABEL = { survey: "סקר ציות", plan: "תוכנית אכיפה" };

const FREQ_OPTIONS = [
  { key: "", label: "—" },
  ...FREQUENCY_OPTIONS,
  { key: "ongoing", label: "שוטף" },
];

// One candidate row. Collapsed: title, source chip, priority chip, include
// checkbox. Expanded: type picker (D10), quarter / frequency editors,
// description, audience, full source peek.
export default function CandidateCard({ candidate, onPatch, onPeekSource }) {
  const [open, setOpen] = useState(false);
  const t = TYPE_META[candidate.type];
  const TypeIcon = t.Icon;
  const SrcIcon = SOURCE_ICON[candidate.source.file];
  const priority = PRIORITY_META[candidate.suggested.priority] || PRIORITY_META.low;
  const freqMissing = candidate.suggested.frequency == null;
  const dimmed = !candidate.included;

  return (
    <div className={`rounded-2xl border bg-white shadow-card transition ${
      dimmed ? "border-slate-200/60 opacity-60" : "border-slate-200/70 hover:border-marine-200/70"
    }`}>
      <div className="flex items-start gap-3 px-4 py-3.5">
        <label className="mt-1 inline-flex shrink-0 cursor-pointer">
          <input
            type="checkbox"
            checked={candidate.included}
            onChange={(e) => onPatch({ included: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-marine-600 focus:ring-marine-500 cursor-pointer"
          />
        </label>

        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${t.tile}`}>
          <TypeIcon className="h-[18px] w-[18px]" aria-hidden />
        </span>

        <button
          onClick={() => setOpen((o) => !o)}
          className="min-w-0 flex-1 text-start cursor-pointer"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-[14.5px] font-semibold tracking-tight text-slate-900 truncate">
              {candidate.title}
            </h3>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${priority.chip}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} aria-hidden />
              {priority.short}
            </span>
            {freqMissing && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                ללא תדירות
              </span>
            )}
            {candidate.suggested.quarter && (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono text-slate-600">
                Q{candidate.suggested.quarter}
              </span>
            )}
          </div>
          {candidate.description && (
            <p className="mt-0.5 truncate text-[12.5px] text-slate-500">{candidate.description}</p>
          )}
          <div className="mt-1.5 flex items-center gap-2 text-[11.5px] text-slate-500 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5">
              <SrcIcon className="h-3 w-3 text-marine-600" aria-hidden />
              {SOURCE_LABEL[candidate.source.file]}
              {candidate.source.sheet && <span className="text-slate-400">· {candidate.source.sheet}</span>}
              <span className="text-slate-400">· {candidate.source.section}</span>
              {candidate.source.locator && <span className="text-slate-400">· {candidate.source.locator}</span>}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onPeekSource?.(candidate); }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-marine-700 hover:bg-marine-50 cursor-pointer"
            >
              <ExternalLink className="h-3 w-3" aria-hidden />
              הצג מקור
            </button>
          </div>
        </button>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="shrink-0 rounded-md p-1 text-slate-400 cursor-pointer hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-marine-300"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 px-4 py-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="סוג">
            <select
              value={candidate.type}
              onChange={(e) => onPatch({ type: e.target.value })}
              className={selectCls}
            >
              <option value="control">בקרה</option>
              <option value="training">הדרכה</option>
              <option value="reminder">תזכורת</option>
            </select>
          </Field>

          <Field label="רבעון">
            <select
              value={candidate.suggested.quarter ?? ""}
              onChange={(e) => onPatch({ suggested: { quarter: e.target.value ? Number(e.target.value) : null } })}
              className={selectCls}
            >
              <option value="">— ללא —</option>
              {QUARTERS.map((q, i) => <option key={q} value={i + 1}>{q}</option>)}
            </select>
          </Field>

          <Field label="תדירות">
            <select
              value={candidate.suggested.frequency ?? ""}
              onChange={(e) => onPatch({ suggested: { frequency: e.target.value || null } })}
              className={selectCls}
            >
              {FREQ_OPTIONS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </Field>

          <Field label="עדיפות">
            <select
              value={candidate.suggested.priority}
              onChange={(e) => onPatch({ suggested: { priority: e.target.value } })}
              className={selectCls}
            >
              <option value="high">גבוהה</option>
              <option value="medium">בינונית</option>
              <option value="low">נמוכה</option>
            </select>
          </Field>

          {candidate.suggested.audience && (
            <Field label="אוכלוסיית יעד" wide>
              <input
                value={candidate.suggested.audience}
                onChange={(e) => onPatch({ suggested: { audience: e.target.value } })}
                className={selectCls}
              />
            </Field>
          )}
        </div>
      )}
    </div>
  );
}

const selectCls = "w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-marine-400 focus:ring-[3px] focus:ring-marine-50";

function Field({ label, children, wide = false }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2 lg:col-span-4" : ""}`}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
