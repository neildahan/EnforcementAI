import { useEffect, useState } from "react";
import { Check, Loader2, FileSpreadsheet, FileText, ScanText } from "lucide-react";

// Step 2 — document-flow visualization (no generic AI sparkles). Two file
// tiles flank a centre "scan" tile so the screen actually shows what's
// happening: two source documents being read by the engine in the middle.
// A thin marine progress bar tracks overall % alongside the step list.
export default function AnalyzingStep({ steps, onDone }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= steps.length) {
      const t = setTimeout(() => onDone?.(), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActive((i) => i + 1), steps[active].duration);
    return () => clearTimeout(t);
  }, [active, steps, onDone]);

  const pct = Math.round((active / steps.length) * 100);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-card">
        {/* Document flow — visual story of what's happening */}
        <div className="flex items-center justify-center gap-3">
          <FileTile icon={FileSpreadsheet} label="סקר ציות" />
          <Connector />
          <ScannerTile />
          <Connector />
          <FileTile icon={FileText} label="תוכנית אכיפה" />
        </div>

        <h2 className="mt-6 text-center font-display text-[20px] font-semibold tracking-tight text-slate-900">
          מנתח את המסמכים
        </h2>
        <p className="mt-1 text-center text-[13px] text-slate-500">
          העיבוד רץ בתוך הסביבה — שום מידע לא יוצא החוצה
        </p>

        {/* Overall progress */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-marine-600 transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-display text-[12px] font-bold tabular-nums text-marine-700">
            {pct}%
          </span>
        </div>

        <ul className="mt-5 space-y-1.5 text-start">
          {steps.map((s, i) => {
            const state = i < active ? "done" : i === active ? "active" : "pending";
            return (
              <li
                key={i}
                className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition ${
                  state === "active"
                    ? "bg-marine-50/70"
                    : state === "done"
                    ? "bg-white"
                    : "bg-transparent opacity-60"
                }`}
              >
                {state === "active" && (
                  <span
                    className="absolute inset-y-2 -start-0.5 w-[3px] rounded-full bg-marine-500"
                    aria-hidden
                  />
                )}
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${
                  state === "done"
                    ? "bg-emerald-50 text-emerald-700"
                    : state === "active"
                    ? "bg-marine-600 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}>
                  {state === "done" ? (
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  ) : state === "active" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <span className="text-[11px] font-mono">{i + 1}</span>
                  )}
                </span>
                <span className={`text-[13px] ${state === "pending" ? "text-slate-400" : "text-slate-700"}`}>
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function FileTile({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-marine-700">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <span className="font-display text-[11px] font-semibold text-slate-500">{label}</span>
    </div>
  );
}

// Animated centre tile — the "engine" doing the work. A travelling marine
// pulse hints at the scan happening without resorting to a sparkles cliché.
function ScannerTile() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-marine-600 to-marine-700 text-white shadow-[0_4px_16px_rgba(58,69,216,0.35)]">
        <ScanText className="h-7 w-7" aria-hidden />
        <span
          className="absolute inset-x-0 top-0 h-[2px] animate-scan-sweep bg-white/70"
          aria-hidden
        />
      </span>
      <span className="font-display text-[11px] font-semibold text-marine-700">סוכן האכיפה</span>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex h-14 items-center gap-1" aria-hidden>
      <span className="h-1 w-1 rounded-full bg-marine-300 animate-pulse" />
      <span className="h-1 w-1 rounded-full bg-marine-300 animate-pulse [animation-delay:0.15s]" />
      <span className="h-1 w-1 rounded-full bg-marine-300 animate-pulse [animation-delay:0.3s]" />
    </div>
  );
}
