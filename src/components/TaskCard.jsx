import { useState } from "react";
import { ChevronDown, Plus, Check } from "lucide-react";
import { TYPE_META, PRIORITY_META } from "../lib/tokens.js";
import { StatusControl } from "./Controls.jsx";

const btnPrimary = "rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white cursor-pointer hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300";
const btnSuccess = "rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white cursor-pointer hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300";
const btnSuccessSoft = "rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 cursor-pointer hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300";
const btnGhost = "rounded-lg px-3 py-1.5 text-sm text-slate-400 cursor-pointer hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300";

export default function TaskCard({ item, busy, index = 0, late = false, onChangeStatus, onSchedule, onNote, onSkip }) {
  const t = TYPE_META[item.type];
  const p = PRIORITY_META[item.priority];
  const TypeIcon = t.Icon;
  const unscheduled = item.frequency === "NeedsReview" || item.quarter === null;

  const [open, setOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const stop = (e) => e.stopPropagation();
  const saveNote = () => {
    if (!note.trim()) return;
    onNote?.(item, note.trim());
    setNote("");
    setNoteOpen(false);
  };

  return (
    <div
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
      className={`animate-card-in group rounded-2xl border bg-white shadow-card transition-shadow hover:shadow-card-lg ${late ? "border-rose-200" : "border-slate-100"}`}
    >
      <div onClick={() => setOpen((o) => !o)} className="flex items-center gap-4 px-4 py-4 cursor-pointer">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.tile}`}>
          <TypeIcon className="h-[18px] w-[18px]" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-tight text-slate-800">{item.title}</h3>
          <p className="truncate text-[13px] text-slate-400">{item.description}</p>
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
            <button
              onClick={onSchedule}
              className="rounded-md bg-amber-500 px-2.5 py-1 text-xs font-medium text-white cursor-pointer hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              קבע תדירות
            </button>
          ) : (
            <StatusControl status={item.status} busy={busy} onChange={(s) => onChangeStatus(s)} />
          )}
        </span>

        <button
          onClick={(e) => { stop(e); setOpen((o) => !o); }}
          aria-expanded={open}
          aria-label={open ? "סגירת פרטים" : "הצגת פרטים"}
          className="shrink-0 rounded-md p-1 text-slate-400 cursor-pointer hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 px-4 py-3.5">
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
            {item.dueDate && (
              <div className="flex gap-2">
                <dt className="font-semibold text-slate-700">מועד יעד:</dt>
                <dd className={late ? "font-medium text-rose-600" : "text-slate-500"}>{item.dueDate}</dd>
              </div>
            )}
          </dl>

          {noteOpen ? (
            <div className="mt-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="כתוב הערה…"
                className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <div className="mt-2 flex gap-2">
                <button onClick={saveNote} className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white cursor-pointer hover:bg-indigo-700">שמירה</button>
                <button onClick={() => { setNoteOpen(false); setNote(""); }} className="rounded-md px-3 py-1 text-xs text-slate-500 cursor-pointer hover:text-slate-700">ביטול</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setNoteOpen(true)} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 cursor-pointer hover:text-indigo-700">
              <Plus className="h-4 w-4" aria-hidden /> הוסף הערה
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
        </div>
      )}
    </div>
  );
}
