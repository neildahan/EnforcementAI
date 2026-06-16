import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Check, Pencil } from "lucide-react";
import { TYPE_META, PRIORITY_META, FREQUENCY_OPTIONS, QUARTERS, TYPE_FILTERS } from "../lib/tokens.js";
import { StatusControl, FrequencyControl } from "./Controls.jsx";

// Show a stored frequency value (key or label, EN/HE) as a Hebrew label when known.
const FREQ_LABEL = Object.fromEntries(FREQUENCY_OPTIONS.flatMap((f) => [[f.key, f.label], [f.label, f.label]]));
const freqLabel = (v) => FREQ_LABEL[v] ?? FREQ_LABEL[String(v).toLowerCase()] ?? v;

const inputCls = "w-full rounded-lg border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:border-marine-400 focus:ring-[3px] focus:ring-marine-50";
const fieldLabel = "mb-1 block text-xs font-semibold text-slate-600";

const btnPrimary = "rounded-lg bg-marine-600 px-3 py-1.5 text-sm font-medium text-white cursor-pointer shadow-[0_2px_10px_rgba(58,69,216,0.25)] hover:bg-marine-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-marine-300";
const btnSuccess = "rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white cursor-pointer hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300";
const btnSuccessSoft = "rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 cursor-pointer hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300";
const btnGhost = "rounded-lg px-3 py-1.5 text-sm text-slate-400 cursor-pointer hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-marine-300";

export default function TaskCard({ item, busy, index = 0, late = false, initialOpen = false, onChangeStatus, onSetFrequency, onNote, onSkip, onSaveEdits }) {
  const t = TYPE_META[item.type];
  const p = PRIORITY_META[item.priority];
  const TypeIcon = t.Icon;
  const unscheduled = item.frequency === "NeedsReview" || item.quarter === null;

  const [open, setOpen] = useState(initialOpen);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const rootRef = useRef(null);

  // When the parent navigates here with a focus target, ensure the card is
  // expanded and brought into view (after the expand animation kicks in).
  useEffect(() => {
    if (!initialOpen) return;
    setOpen(true);
    const id = window.requestAnimationFrame(() => {
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [initialOpen]);

  const startEdit = () => {
    setForm({
      title: item.title || "",
      description: item.description || "",
      priority: item.priority || "medium",
      type: item.type || "control",
      quarter: item.quarter || "",
      frequency: item.frequency && item.frequency !== "NeedsReview" ? item.frequency : "",
      dueDate: item.dueDate || "",
      sourceLaw: item.sourceLaw || "",
      sourceSection: item.sourceSection || "",
      audience: item.audience || "",
    });
    setEditing(true);
  };
  const setF = (k, v) => setForm((p2) => ({ ...p2, [k]: v }));
  const submitEdits = () => { onSaveEdits?.(item, form); setEditing(false); };

  const stop = (e) => e.stopPropagation();
  const saveNote = () => {
    onNote?.(item, note.trim());
    setNoteOpen(false);
  };

  return (
    <div
      ref={rootRef}
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
      className={`animate-card-in group rounded-2xl border bg-white shadow-card transition hover:shadow-card-lg hover:border-marine-200/70 ${late ? "border-rose-200" : "border-slate-200/70"}`}
    >
      <div onClick={() => setOpen((o) => !o)} className="flex items-center gap-4 px-4 py-4 cursor-pointer">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${t.tile}`}>
          <TypeIcon size={20} aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[15px] font-semibold leading-tight tracking-tight text-slate-900">{item.title}</h3>
          <p className="truncate text-[13px] text-slate-500">{item.description}</p>
        </div>

        <div className="hidden items-center gap-2 text-xs font-medium sm:flex shrink-0">
          <span className="text-slate-500">{t.label}</span>
          {item.quarter && (
            <>
              <span className="text-slate-300" aria-hidden>·</span>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-600">{item.quarter}</span>
            </>
          )}
          {item.dueDate && (
            <>
              <span className="text-slate-300" aria-hidden>·</span>
              <span className={late ? "font-semibold text-rose-600" : "text-slate-400"}>
                {late ? "באיחור — " : "יעד "}{item.dueDate}
              </span>
            </>
          )}
        </div>

        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${p.chip}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} aria-hidden />
          {p.short}
        </span>

        <span onClick={stop} className="shrink-0">
          {unscheduled ? (
            <FrequencyControl onSelect={(f) => onSetFrequency(f)} />
          ) : (
            <StatusControl status={item.status} busy={busy} onChange={(s) => onChangeStatus(s)} />
          )}
        </span>

        <button
          onClick={(e) => { stop(e); setOpen((o) => !o); }}
          aria-expanded={open}
          aria-label={open ? "סגירת פרטים" : "הצגת פרטים"}
          className="shrink-0 rounded-md p-1 text-slate-400 cursor-pointer hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-marine-300"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 px-4 py-3.5">
          {editing ? (
            <form onSubmit={(e) => { e.preventDefault(); submitEdits(); }} className="space-y-3">
              <label className="block">
                <span className={fieldLabel}>כותרת</span>
                <input value={form.title} onChange={(e) => setF("title", e.target.value)} className={inputCls} />
              </label>
              <label className="block">
                <span className={fieldLabel}>תיאור</span>
                <textarea value={form.description} onChange={(e) => setF("description", e.target.value)} rows={2} className={inputCls} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={fieldLabel}>עדיפות</span>
                  <select value={form.priority} onChange={(e) => setF("priority", e.target.value)} className={inputCls}>
                    {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.short}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className={fieldLabel}>סוג</span>
                  <select value={form.type} onChange={(e) => setF("type", e.target.value)} className={inputCls}>
                    {TYPE_FILTERS.filter((tf) => tf.key !== "all").map((tf) => <option key={tf.key} value={tf.key}>{tf.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className={fieldLabel}>רבעון</span>
                  <select value={form.quarter} onChange={(e) => setF("quarter", e.target.value)} className={inputCls}>
                    <option value="">— ללא —</option>
                    {QUARTERS.map((qq) => <option key={qq} value={qq}>{qq}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className={fieldLabel}>תדירות</span>
                  <select value={form.frequency} onChange={(e) => setF("frequency", e.target.value)} className={inputCls}>
                    <option value="">— ללא —</option>
                    {FREQUENCY_OPTIONS.map((f) => <option key={f.key} value={f.label}>{f.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className={fieldLabel}>מועד יעד</span>
                  <input type="date" value={form.dueDate} onChange={(e) => setF("dueDate", e.target.value)} className={inputCls} />
                </label>
                <label className="block">
                  <span className={fieldLabel}>אוכלוסיית יעד</span>
                  <input value={form.audience} onChange={(e) => setF("audience", e.target.value)} className={inputCls} />
                </label>
                <label className="block">
                  <span className={fieldLabel}>חוק</span>
                  <input value={form.sourceLaw} onChange={(e) => setF("sourceLaw", e.target.value)} className={inputCls} />
                </label>
                <label className="block">
                  <span className={fieldLabel}>סעיף</span>
                  <input value={form.sourceSection} onChange={(e) => setF("sourceSection", e.target.value)} className={inputCls} />
                </label>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="rounded-md bg-marine-600 px-3 py-1.5 text-xs font-medium text-white cursor-pointer hover:bg-marine-700">שמירה</button>
                <button type="button" onClick={() => setEditing(false)} className="rounded-md px-3 py-1.5 text-xs text-slate-500 cursor-pointer hover:text-slate-700">ביטול</button>
              </div>
            </form>
          ) : (
          <>
          <div className="mb-2 flex justify-end">
            <button onClick={startEdit} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 cursor-pointer hover:bg-slate-100 hover:text-slate-700">
              <Pencil className="h-3.5 w-3.5" aria-hidden /> ערוך
            </button>
          </div>
          <dl className="space-y-2 text-sm">
            {item.regulatoryBasis && (
              <div className="flex gap-2">
                <dt className="font-semibold text-slate-700">בסיס רגולטורי:</dt>
                <dd className="text-slate-500">{item.regulatoryBasis}</dd>
              </div>
            )}
            {item.audience && (
              <div className="flex gap-2">
                <dt className="font-semibold text-slate-700">אוכלוסיית יעד:</dt>
                <dd className="text-slate-500">{item.audience}</dd>
              </div>
            )}
            {item.frequency && item.frequency !== "NeedsReview" && (
              <div className="flex gap-2">
                <dt className="font-semibold text-slate-700">תדירות:</dt>
                <dd className="text-slate-500">{freqLabel(item.frequency)}</dd>
              </div>
            )}
            {item.dueDate && (
              <div className="flex gap-2">
                <dt className="font-semibold text-slate-700">מועד יעד:</dt>
                <dd className={late ? "font-medium text-rose-600" : "text-slate-500"}>{item.dueDate}</dd>
              </div>
            )}
          </dl>

          {item.notes && !noteOpen && (
            <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-sm text-slate-600 whitespace-pre-wrap">{item.notes}</div>
          )}
          {noteOpen ? (
            <div className="mt-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="כתוב הערה…"
                className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:border-marine-400 focus:ring-[3px] focus:ring-marine-50"
              />
              <div className="mt-2 flex gap-2">
                <button onClick={saveNote} className="rounded-md bg-marine-600 px-3 py-1 text-xs font-medium text-white cursor-pointer hover:bg-marine-700">שמירה</button>
                <button onClick={() => { setNoteOpen(false); setNote(""); }} className="rounded-md px-3 py-1 text-xs text-slate-500 cursor-pointer hover:text-slate-700">ביטול</button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setNote(item.notes || ""); setNoteOpen(true); }} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-marine-600 cursor-pointer hover:text-marine-700">
              <Plus className="h-4 w-4" aria-hidden /> {item.notes ? "ערוך הערה" : "הוסף הערה"}
            </button>
          )}

          {!unscheduled && (
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
              {item.status === "todo" && (
                <>
                  <button onClick={() => onChangeStatus("in_progress")} className={btnPrimary}>התחל ביצוע</button>
                  <button onClick={() => onChangeStatus("done")} className={btnSuccessSoft}>סמן כהושלם</button>
                  <button onClick={() => onSkip?.(item)} className={btnGhost}>דלג</button>
                </>
              )}
              {item.status === "in_progress" && (
                <>
                  <button onClick={() => onChangeStatus("done")} className={btnSuccess}>סמן כהושלם</button>
                  <button onClick={() => onSkip?.(item)} className={btnGhost}>דלג</button>
                </>
              )}
              {item.status === "done" && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                  <Check className="h-4 w-4" aria-hidden /> הושלם
                </span>
              )}
            </div>
          )}
          </>
          )}
        </div>
      )}
    </div>
  );
}
