import { useMemo, useState } from "react";
import { ClipboardCheck, RefreshCw, ArrowLeft, GraduationCap, ShieldCheck, Bell, AlertTriangle, X } from "lucide-react";
import PageHeader from "./PageHeader.jsx";
import SetupWizard from "./SetupWizard/SetupWizard.jsx";

// The "תוכנית עבודה" view. Two states:
//   - No published plan → render the SetupWizard inline. This is the same
//     gateway as the "הגדרה ראשונית" menu item, so the user can land here
//     and start onboarding without bouncing between pages.
//   - Published plan exists → render a read-only summary (per-quarter totals,
//     per-type breakdown) with a "פרסם מחדש" CTA that drops back into the
//     wizard for a fresh round of edits.
export default function WorkPlanView({ year, planMeta, items, onPublished, onSelect, onRepublish }) {
  if (!planMeta?.published) {
    return <SetupWizard year={year} onPublished={onPublished} />;
  }

  return <PublishedSummary year={year} planMeta={planMeta} items={items} onSelect={onSelect} onRepublish={onRepublish} />;
}

function PublishedSummary({ year, planMeta, items, onSelect, onRepublish }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const stats = useMemo(() => {
    const byQuarter = { Q1: [], Q2: [], Q3: [], Q4: [], unscheduled: [] };
    const byType = { control: 0, training: 0, reminder: 0, report: 0 };
    let needsFreq = 0;
    for (const it of items) {
      byType[it.type] = (byType[it.type] || 0) + 1;
      if (it.frequency === "NeedsReview" || it.quarter == null) {
        byQuarter.unscheduled.push(it);
        needsFreq += 1;
      } else if (byQuarter[it.quarter]) {
        byQuarter[it.quarter].push(it);
      }
    }
    return { byQuarter, byType, total: items.length, needsFreq };
  }, [items]);

  const publishedAt = planMeta.publishedAt ? new Date(planMeta.publishedAt) : null;

  return (
    <div className="px-8 pt-7 pb-10">
      <PageHeader
        eyebrow="תכנון ובקרה"
        title={`תוכנית עבודה ל-${year}`}
        subtitle={publishedAt
          ? `פורסמה ב-${publishedAt.toLocaleDateString("he-IL")} · ${planMeta.total} פריטים`
          : `${planMeta.total} פריטים בתוכנית`}
        underLogo={
          <button
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-[12.5px] font-medium text-slate-600 cursor-pointer hover:border-marine-300 hover:text-marine-700 hover:bg-marine-50/60 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-marine-300"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            פרסם תוכנית חדשה
          </button>
        }
      />

      {/* Type breakdown */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <TypeStat icon={ShieldCheck}   label="בקרות"   value={stats.byType.control || 0} />
        <TypeStat icon={GraduationCap} label="הדרכות"  value={stats.byType.training || 0} />
        <TypeStat icon={Bell}          label="תזכורות" value={stats.byType.reminder || 0} />
        <TypeStat icon={ClipboardCheck} label="סה״כ פריטים" value={stats.total} tone="marine" />
      </div>

      {/* Unscheduled callout */}
      {stats.needsFreq > 0 && (
        <button
          onClick={() => onSelect?.("tasks")}
          className="mt-4 w-full text-start rounded-xl border border-amber-200/70 bg-amber-50/60 px-4 py-3 hover:bg-amber-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-700" aria-hidden />
            <span className="text-[13px] font-semibold text-amber-800">{stats.needsFreq} פריטים ללא תדירות</span>
            <span className="text-[12px] text-amber-700">— נדרשת קביעת תדירות במסך המשימות</span>
            <span className="ms-auto inline-flex items-center gap-1 text-[12px] font-semibold text-amber-800">
              עבור למשימות
              <ArrowLeft className="h-3 w-3" aria-hidden />
            </span>
          </div>
        </button>
      )}

      {/* Quarter cards */}
      <section className="mt-8">
        <SectionHeading title="פריסה רבעונית" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          {["Q1", "Q2", "Q3", "Q4"].map((q) => {
            const qItems = stats.byQuarter[q];
            const ctrl = qItems.filter((i) => i.type === "control").length;
            const tr = qItems.filter((i) => i.type === "training").length;
            const rm = qItems.filter((i) => i.type === "reminder").length;
            const rep = qItems.filter((i) => i.type === "report").length;
            return (
              <button
                key={q}
                onClick={() => onSelect?.("tasks")}
                className="text-start rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card hover:shadow-card-lg hover:border-marine-200/70 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="font-display text-[18px] font-semibold text-slate-900">{q}</div>
                  <span className="rounded-md bg-marine-50 px-2 py-0.5 text-[11.5px] font-semibold text-marine-700">
                    {qItems.length} פריטים
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-[12.5px] text-slate-600">
                  {ctrl > 0 && <Row Icon={ShieldCheck}   label="בקרות"   value={ctrl} />}
                  {tr   > 0 && <Row Icon={GraduationCap} label="הדרכות"  value={tr} />}
                  {rm   > 0 && <Row Icon={Bell}          label="תזכורות" value={rm} />}
                  {rep  > 0 && <Row Icon={ClipboardCheck} label="דוחות"  value={rep} />}
                  {qItems.length === 0 && <li className="text-slate-400 text-[12px]">אין פריטים ברבעון זה</li>}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      {confirmOpen && (
        <RepublishConfirm
          planMeta={planMeta}
          year={year}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => { setConfirmOpen(false); onRepublish(); }}
        />
      )}

      {/* Items list — read-only, jump to tasks to act on them */}
      <section className="mt-8">
        <SectionHeading
          title="פריטי התוכנית"
          extra={
            <button
              onClick={() => onSelect?.("tasks")}
              className="text-[11.5px] font-semibold text-marine-700 inline-flex items-center gap-1 hover:text-marine-800 transition cursor-pointer"
            >
              נהל במסך המשימות
              <ArrowLeft className="h-3 w-3" aria-hidden />
            </button>
          }
        />
        <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card overflow-hidden">
          {items.map((it, i) => (
            <div
              key={it.id}
              className={`flex items-center gap-3 px-4 py-3 text-[13px] ${
                i < items.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono text-slate-500 shrink-0">
                {it.quarter || "—"}
              </span>
              <span className="font-medium text-slate-800 truncate flex-1">{it.title}</span>
              <span className="text-[11.5px] text-slate-500 shrink-0">
                {it.type === "control" ? "בקרה" : it.type === "training" ? "הדרכה" : it.type === "reminder" ? "תזכורת" : "דוח"}
              </span>
              {it.frequency === "NeedsReview" && (
                <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 shrink-0">
                  ללא תדירות
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

// Ask-before-replace dialog (matches the existing pattern from ConfirmModal).
// Explains exactly what's about to happen so the user can back out before the
// wizard wipes their current selection.
function RepublishConfirm({ planMeta, year, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="אישור פרסום תוכנית חדשה"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_12px_30px_rgba(13,17,23,0.18)]">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-[16px] font-semibold tracking-tight text-slate-900">
                פרסום תוכנית חדשה ל-{year}
              </h2>
            </div>
          </div>
          <button
            onClick={onCancel}
            aria-label="סגירה"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-marine-300"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-[13px] leading-relaxed text-slate-600">
          <p>פעולה זו תוביל אותך לאשף ההגדרה הראשונית — תעלה את סקר הציות ותוכנית האכיפה מחדש, ותבחר אילו פריטים ייכנסו לתוכנית.</p>
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-3 text-[12.5px] text-amber-800">
            <strong className="font-semibold">חשוב לדעת:</strong> התוכנית הקיימת ({planMeta.total} פריטים) תוחלף בתוכנית החדשה רק לאחר שתאשר אותה סופית באשף. עד אישור — התוכנית הנוכחית נשארת בתוקף.
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-marine-300"
          >
            השאר את הקיימת
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-lg bg-marine-600 px-4 py-2 text-sm font-semibold text-white cursor-pointer shadow-[0_2px_10px_rgba(58,69,216,0.35)] hover:bg-marine-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-marine-300"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            המשך לאשף
          </button>
        </div>
      </div>
    </div>
  );
}

function TypeStat({ icon: Icon, label, value, tone }) {
  const valueCls = tone === "marine" ? "text-marine-700" : "text-slate-900";
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
      <div className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </div>
      <div className={`mt-2 font-display text-3xl font-bold tracking-tight ${valueCls}`}>{value}</div>
    </div>
  );
}

function Row({ Icon, label, value }) {
  return (
    <li className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-marine-600" aria-hidden />
      <span className="text-slate-600">{label}</span>
      <span className="ms-auto font-mono tabular-nums text-slate-500">{value}</span>
    </li>
  );
}

function SectionHeading({ title, extra }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="font-display text-[14px] font-semibold tracking-tight text-slate-700">{title}</h2>
      <div className="h-px flex-1 bg-slate-200" />
      {extra}
    </div>
  );
}
