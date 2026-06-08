import { useState, useRef, useEffect } from "react";
import { ChevronDown, Circle, RefreshCw, Check } from "lucide-react";
import { QUARTERS, YEARS, STATUS_META, STATUS_ORDER, TYPE_FILTERS, FREQUENCY_OPTIONS } from "../lib/tokens.js";

export function FrequencyControl({ onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1 text-xs font-medium text-white cursor-pointer hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
      >
        קבע תדירות
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <ul role="listbox" aria-label="בחירת תדירות" className="absolute left-0 z-30 mt-1 min-w-[8rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {FREQUENCY_OPTIONS.map((f) => (
            <li key={f.key}>
              <button
                role="option"
                aria-selected={false}
                onClick={() => { setOpen(false); onSelect(f); }}
                className="flex w-full items-center px-3 py-1.5 text-xs text-slate-600 cursor-pointer hover:bg-slate-50"
              >
                {f.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function YearSelect({ year, setYear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="בחירת שנה"
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
      >
        <span className="font-medium">{year}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="שנה"
          className="absolute right-0 z-30 mt-1 min-w-full overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {YEARS.map((y) => (
            <li key={y}>
              <button
                role="option"
                aria-selected={y === year}
                onClick={() => { setYear(y); setOpen(false); }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-sm cursor-pointer ${
                  y === year ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{y}</span>
                {y === year && <Check className="h-3.5 w-3.5" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const segTrack = "inline-flex items-center gap-0.5 rounded-xl bg-slate-100/80 p-1";
const segBtn =
  "rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300";
const segActive = "bg-white text-slate-900 font-semibold shadow-sm";
const segIdle = "text-slate-500 hover:text-slate-800";

export function QuarterTabs({ quarter, setQuarter }) {
  const tabs = [{ key: "all", label: "הכל" }, ...QUARTERS.map((q) => ({ key: q, label: q }))];
  return (
    <div className={segTrack}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setQuarter(tab.key)}
          aria-pressed={quarter === tab.key}
          className={`${segBtn} ${quarter === tab.key ? segActive : segIdle}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Progress({ done, total }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-500 whitespace-nowrap">
        <span className="font-bold text-slate-700">{pct}%</span> · {done}/{total} הושלמו
      </span>
      <div
        className="h-1.5 w-32 rounded-full bg-slate-200 overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="התקדמות"
      >
        <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function StatusFilter({ value, onChange, counts }) {
  const tabs = [
    { key: "all", label: "הכל", dot: null },
    { key: "todo", label: STATUS_META.todo.label, dot: "bg-slate-400" },
    { key: "in_progress", label: STATUS_META.in_progress.label, dot: "bg-blue-500" },
    { key: "done", label: STATUS_META.done.label, dot: "bg-emerald-500" },
  ];
  return (
    <div className={segTrack}>
      {tabs.map((tab) => {
        const isActive = value === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 ${segBtn} ${isActive ? segActive : segIdle}`}
          >
            {tab.dot && <span className={`h-1.5 w-1.5 rounded-full ${tab.dot}`} aria-hidden />}
            {tab.label}
            <span className={`text-xs tabular-nums ${isActive ? "text-slate-500" : "text-slate-400"}`}>{counts[tab.key] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}

export function TypeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = TYPE_FILTERS.find((f) => f.key === value) ?? TYPE_FILTERS[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="סינון לפי סוג משימה"
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
      >
        <span className="text-slate-400">סוג:</span>
        <span className="font-medium">{current.label}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="סוג משימה"
          className="absolute right-0 z-30 mt-1 min-w-[9rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {TYPE_FILTERS.map((f) => (
            <li key={f.key}>
              <button
                role="option"
                aria-selected={f.key === value}
                onClick={() => { onChange(f.key); setOpen(false); }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-sm cursor-pointer ${
                  f.key === value ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{f.label}</span>
                {f.key === value && <Check className="h-3.5 w-3.5" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StatusControl({ status, busy, onChange }) {
  const m = STATUS_META[status];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`סטטוס: ${m.label} — לחיצה לשינוי`}
        className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 cursor-pointer hover:bg-slate-50 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
      >
        {busy ? (
          <RefreshCw className="h-3 w-3 animate-spin text-slate-400" aria-hidden />
        ) : (
          <Circle className={`h-3 w-3 ${m.dot}`} fill="currentColor" aria-hidden />
        )}
        <span>{m.label}</span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="שינוי סטטוס"
          className="absolute left-0 z-30 mt-1 min-w-[8.5rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {STATUS_ORDER.map((s) => {
            const sm = STATUS_META[s];
            return (
              <li key={s}>
                <button
                  role="option"
                  aria-selected={s === status}
                  onClick={() => { setOpen(false); if (s !== status) onChange(s); }}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs cursor-pointer ${
                    s === status ? "bg-slate-50 font-semibold text-slate-800" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Circle className={`h-2.5 w-2.5 ${sm.dot}`} fill="currentColor" aria-hidden />
                  <span>{sm.label}</span>
                  {s === status && <Check className="ms-auto h-3 w-3" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
