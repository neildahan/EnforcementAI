import { useMemo, useState } from "react";
import { Search, Filter, ArrowLeft, ArrowRight, ShieldCheck, GraduationCap, Bell } from "lucide-react";
import CandidateCard from "./CandidateCard.jsx";
import SourcePeek from "./SourcePeek.jsx";

const TYPE_GROUPS = [
  { key: "control",  label: "בקרות",   icon: ShieldCheck },
  { key: "training", label: "הדרכות",  icon: GraduationCap },
  { key: "reminder", label: "תזכורות", icon: Bell },
];

const BULK_FREQS = [
  { key: "annual",    label: "שנתי" },
  { key: "quarterly", label: "רבעוני" },
  { key: "monthly",   label: "חודשי" },
];

// Step 3 — the core. User picks which candidates make it into the plan.
//
// Layout: search + filter chips at top, grouped candidate sections, and a
// sticky footer that previews the resulting plan in real time. Bulk action
// for assigning frequency to all "ללא תדירות" items (per spec — that's the
// most-clicked pain point on this screen, since C17 is empty for most rows).
export default function ReviewStep({ candidates, patchCandidate, bulkSetFrequency, counts, onBack, onNext }) {
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState(new Set(["control", "training", "reminder"]));
  const [onlyMissingFreq, setOnlyMissingFreq] = useState(false);
  const [peekCandidate, setPeekCandidate] = useState(null);

  const toggleType = (k) => setActiveTypes((prev) => {
    const next = new Set(prev);
    next.has(k) ? next.delete(k) : next.add(k);
    return next.size === 0 ? prev : next; // never empty
  });

  // Visible = type filter + missing-freq filter + text search.
  const visible = useMemo(() => {
    const q = query.trim();
    return candidates.filter((c) => {
      if (!activeTypes.has(c.type)) return false;
      if (onlyMissingFreq && c.suggested.frequency != null) return false;
      if (q && !(c.title.includes(q) || (c.description || "").includes(q) || c.source.section.includes(q))) return false;
      return true;
    });
  }, [candidates, activeTypes, onlyMissingFreq, query]);

  // Group visible by type for the section headings.
  const grouped = useMemo(() => {
    const map = { control: [], training: [], reminder: [] };
    for (const c of visible) map[c.type]?.push(c);
    return map;
  }, [visible]);

  return (
    <>
      {/* Filters bar */}
      <div className="sticky top-0 z-10 -mx-8 mb-4 bg-canvas/95 backdrop-blur px-8 py-3 border-b border-slate-200/60">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 min-w-[260px] focus-within:border-marine-400 focus-within:ring-[3px] focus-within:ring-marine-50">
            <Search className="h-4 w-4 text-slate-400" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש כותרת, תיאור, סעיף…"
              className="bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none flex-1"
            />
          </div>

          {TYPE_GROUPS.map(({ key, label, icon: Icon }) => {
            const on = activeTypes.has(key);
            return (
              <button
                key={key}
                onClick={() => toggleType(key)}
                aria-pressed={on}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium border transition cursor-pointer ${
                  on
                    ? "bg-marine-50 border-marine-200 text-marine-700"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
              </button>
            );
          })}

          <button
            onClick={() => setOnlyMissingFreq((v) => !v)}
            aria-pressed={onlyMissingFreq}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium border transition cursor-pointer ${
              onlyMissingFreq
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <Filter className="h-3.5 w-3.5" aria-hidden />
            ללא תדירות
          </button>

          <span className="ms-auto text-[12px] text-slate-500">
            <span className="font-display font-bold text-slate-700">{counts.total}</span> נבחרו · מציג {visible.length}
          </span>
        </div>

        {/* Bulk action — addresses the C17 empty-frequency reality */}
        {candidates.some((c) => c.suggested.frequency == null) && (
          <div className="mt-2 flex items-center gap-2 text-[12px]">
            <span className="text-slate-500">פעולת מסת רבים:</span>
            <span className="text-slate-700">קבע תדירות לכל פריט ללא תדירות —</span>
            {BULK_FREQS.map((f) => (
              <button
                key={f.key}
                onClick={() => bulkSetFrequency(f.key)}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-[11.5px] text-slate-600 hover:border-marine-300 hover:text-marine-700 cursor-pointer transition"
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grouped lists */}
      <div className="space-y-6">
        {TYPE_GROUPS.map(({ key, label, icon: Icon }) => {
          const items = grouped[key] || [];
          if (items.length === 0) return null;
          const selectedHere = items.filter((c) => c.included).length;
          return (
            <section key={key}>
              <div className="mb-2 flex items-center gap-2">
                <Icon className="h-4 w-4 text-marine-600" aria-hidden />
                <h2 className="font-display text-[14.5px] font-semibold tracking-tight text-slate-800">{label}</h2>
                <span className="text-[12px] text-slate-500">
                  {selectedHere}/{items.length} נבחרו
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="space-y-2">
                {items.map((c) => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    onPatch={(patch) => patchCandidate(c.id, patch)}
                    onPeekSource={setPeekCandidate}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-card">
            <p className="text-sm text-slate-500">לא נמצאו מועמדים — נסה לשנות סינון או חיפוש.</p>
          </div>
        )}
      </div>

      {/* Sticky footer — live preview + nav */}
      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur px-8 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[12.5px] text-slate-600 flex-wrap">
            <span>בתוכנית:</span>
            <Pill tone="marine" label={`${counts.control} בקרות`} />
            <Pill tone="marine" label={`${counts.training} הדרכות`} />
            <Pill tone="marine" label={`${counts.reminder} תזכורות`} />
            {counts.needsReview > 0 && <Pill tone="amber" label={`${counts.needsReview} ללא תדירות`} />}
            <span className="text-slate-300" aria-hidden>·</span>
            <span className="text-slate-500">לפי רבעון:</span>
            {[1,2,3,4].map((q) => <Pill key={q} tone="slate" label={`Q${q}: ${counts.byQuarter[q]}`} />)}
            {counts.byQuarter.unscheduled > 0 && <Pill tone="slate" label={`ללא רבעון: ${counts.byQuarter.unscheduled}`} />}
          </div>

          <div className="ms-auto flex items-center gap-2">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 transition"
            >
              <ArrowRight className="h-4 w-4" aria-hidden />
              חזור
            </button>
            <button
              onClick={onNext}
              disabled={counts.total === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-marine-600 px-5 py-2 font-display text-sm font-semibold text-white cursor-pointer shadow-[0_2px_10px_rgba(58,69,216,0.35)] hover:bg-marine-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-marine-300 transition"
            >
              סקור ואשר
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <SourcePeek candidate={peekCandidate} onClose={() => setPeekCandidate(null)} />
    </>
  );
}

function Pill({ tone, label }) {
  const toneCls = {
    marine: "bg-marine-50 text-marine-700",
    amber:  "bg-amber-50 text-amber-700",
    slate:  "bg-slate-100 text-slate-600",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${toneCls}`}>
      {label}
    </span>
  );
}
