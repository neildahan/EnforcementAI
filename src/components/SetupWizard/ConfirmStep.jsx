import { ArrowLeft, ArrowRight, Upload, Building2, UserCheck, AlertTriangle } from "lucide-react";

// Step 4 — review summary + publish CTA (D8: single CTA, no approval gate).
// Shows: company profile (from D6 metadata), per-quarter totals, and a
// callout for unscheduled / no-frequency items (so the user knows what's
// going to land as "NeedsReview").
export default function ConfirmStep({ year, counts, profile, onBack, onPublish }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      {/* Left: per-quarter summary */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-3">
            סיכום התוכנית — {year}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryStat label="סה״כ פריטים" value={counts.total} tone="marine" />
            <SummaryStat label="בקרות" value={counts.control} />
            <SummaryStat label="הדרכות" value={counts.training} />
            <SummaryStat label="תזכורות" value={counts.reminder} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-3">
            פריסה רבעונית
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((q) => (
              <div key={q} className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 text-center">
                <div className="text-[11px] font-semibold text-slate-500">Q{q}</div>
                <div className="mt-1 font-display text-[22px] font-bold text-marine-700">{counts.byQuarter[q]}</div>
                <div className="text-[11px] text-slate-500">פריטים</div>
              </div>
            ))}
          </div>
          {counts.byQuarter.unscheduled > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-[12px] font-medium text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
              {counts.byQuarter.unscheduled} פריטים ללא רבעון — ישובצו ידנית אחרי הפרסום
            </div>
          )}
          {counts.needsReview > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-[12px] font-medium text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
              {counts.needsReview} פריטים ללא תדירות — יסומנו כ-NeedsReview
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-50 transition"
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
            חזור לעריכה
          </button>
          <button
            onClick={onPublish}
            disabled={counts.total === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-marine-600 px-6 py-2.5 font-display text-sm font-semibold text-white cursor-pointer shadow-[0_2px_10px_rgba(58,69,216,0.35)] hover:bg-marine-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-marine-300 transition"
          >
            <Upload className="h-4 w-4" aria-hidden />
            פרסם תוכנית
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Right: company profile (D6) */}
      <aside className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card h-fit space-y-4">
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">
            פרופיל החברה
          </div>
          <Row icon={Building2} label="חברה" value={profile.companyName?.value} confidence={profile.companyName?.confidence} />
          <Row icon={UserCheck} label="ממונה אכיפה" value={profile.enforcementOfficer?.name?.value} confidence={profile.enforcementOfficer?.name?.confidence} sub={profile.enforcementOfficer?.title?.value} />
        </div>

        {profile.reportingTeam?.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1.5">
              צוות הדיווח
            </div>
            <ul className="space-y-1.5 text-[12.5px]">
              {profile.reportingTeam.map((m, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-marine-500" aria-hidden />
                  <span className="text-slate-700">{m.name} <span className="text-slate-400">— {m.title}</span></span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl bg-marine-50 p-3 text-[12px] leading-relaxed text-marine-800">
          הפרטים זוהו אוטומטית מתוך המסמך. אפשר לערוך אותם בהגדרות אחרי הפרסום.
        </div>
      </aside>
    </div>
  );
}

function SummaryStat({ label, value, tone }) {
  const valueCls = tone === "marine" ? "text-marine-700" : "text-slate-900";
  return (
    <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 text-center">
      <div className={`font-display text-[22px] font-bold tracking-tight ${valueCls}`}>{value}</div>
      <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value, sub, confidence }) {
  const lowConfidence = confidence === "low";
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-marine-50 text-marine-600">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold text-slate-500">{label}</div>
        {value ? (
          <div className="text-[13px] font-medium text-slate-900 truncate">{value}</div>
        ) : (
          <div className="text-[12px] italic text-amber-700">לא זוהה — נא למלא בהגדרות</div>
        )}
        {sub && <div className="text-[11.5px] text-slate-500 truncate">{sub}</div>}
      </div>
      {lowConfidence && (
        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 rounded px-1.5 py-0.5">בדיקה נדרשת</span>
      )}
    </div>
  );
}
