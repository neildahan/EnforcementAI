import { useMemo } from "react";
import {
  AlertTriangle, TrendingUp, CalendarClock, ListChecks,
  Lock, ArrowLeft, CheckCircle2,
} from "lucide-react";
import { TYPE_META, PRIORITY_META, MODULES, QUARTERS } from "../lib/tokens.js";
import PageHeader from "./PageHeader.jsx";

const todayISO = () => new Date().toISOString().slice(0, 10);
const currentQuarter = () => `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
const daysLeftInQuarter = () => {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  const endDate = new Date(now.getFullYear(), q * 3, 0);
  return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / 86400000));
};

// Tiny inline bar sparkline. `data` is normalized; the last bar always reads
// as "now" — slightly stronger than the others.
function Sparkline({ data, color = "currentColor" }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-7 items-end gap-[3px]" aria-hidden>
      {data.map((v, i) => (
        <span
          key={i}
          className="w-1 rounded-sm"
          style={{
            height: `${Math.max((v / max) * 100, 8)}%`,
            background: color,
            opacity: i === data.length - 1 ? 1 : 0.32,
          }}
        />
      ))}
    </div>
  );
}

// 4-up KPI card. Tone (`marine | emerald | rose | amber | slate`) maps to the
// number color + sparkline color; everything else stays neutral so the card
// reads as a product card, not a dashboard tile of color.
function KpiCard({ tone = "marine", icon: Icon, label, value, hint, spark }) {
  const toneCls = {
    marine:  { text: "text-marine-700",  bar: "var(--color-marine-600)" },
    emerald: { text: "text-emerald-700", bar: "var(--color-emerald-500, #10b981)" },
    rose:    { text: "text-rose-700",    bar: "var(--color-rose-500, #f43f5e)" },
    amber:   { text: "text-amber-700",   bar: "var(--color-amber-500, #f59e0b)" },
    slate:   { text: "text-slate-700",   bar: "#94a3b8" },
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card hover:shadow-card-lg transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
            {label}
          </div>
          <div className={`mt-2 font-display text-3xl font-bold tracking-tight ${toneCls.text}`}>{value}</div>
        </div>
        {spark && <Sparkline data={spark} color={toneCls.bar} />}
      </div>
      {hint && <div className="mt-2 text-[12px] text-slate-500">{hint}</div>}
    </div>
  );
}

// Single recommendation in the "פעולות מומלצות" panel. Calm marine framing
// with a clear right-arrow CTA — no glow/pulse.
function NextActionRow({ tone = "marine", title, body, cta, onAction }) {
  const dot = {
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    marine: "bg-marine-500",
    emerald: "bg-emerald-500",
  }[tone];
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 border-b border-slate-100 last:border-b-0">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="font-display text-[13.5px] font-semibold text-slate-900 truncate">{title}</div>
        <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{body}</p>
      </div>
      {cta && (
        <button
          onClick={onAction}
          className="shrink-0 inline-flex items-center gap-1 rounded-full bg-marine-50 px-3 py-1 text-[11.5px] font-semibold text-marine-700 hover:bg-marine-100 transition cursor-pointer"
        >
          {cta}
          <ArrowLeft className="h-3 w-3" aria-hidden />
        </button>
      )}
    </div>
  );
}

export default function DashboardView({
  items, loading,
  view, onSelect,
}) {
  const today = todayISO();
  const currentQ = currentQuarter();

  // Everything the dashboard renders is derived in one pass so adding new
  // panels is a matter of reading more from `stats`.
  const stats = useMemo(() => {
    const scheduled = items.filter((i) => i.frequency !== "NeedsReview" && i.quarter !== null);
    const unscheduled = items.filter((i) => i.frequency === "NeedsReview" || i.quarter === null);

    const done = scheduled.filter((i) => i.status === "done").length;
    const total = scheduled.length;
    const annualPct = total ? Math.round((done / total) * 100) : 0;

    const overdue = scheduled.filter((i) => i.dueDate && i.dueDate < today && i.status !== "done");

    const qScheduled = scheduled.filter((i) => i.quarter === currentQ);
    const qDone = qScheduled.filter((i) => i.status === "done").length;
    const qPct = qScheduled.length ? Math.round((qDone / qScheduled.length) * 100) : 0;

    // Done per quarter — the sparkline driver for "התקדמות שנתית".
    const doneByQuarter = QUARTERS.map(
      (q) => scheduled.filter((i) => i.quarter === q && i.status === "done").length
    );

    // Type distribution across scheduled items.
    const byType = Object.fromEntries(
      Object.keys(TYPE_META).map((k) => [k, scheduled.filter((i) => i.type === k).length])
    );

    // Upcoming: not-done items, sorted by overdue first, then priority, then dueDate.
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const upcoming = scheduled
      .filter((i) => i.status !== "done")
      .map((i) => ({ ...i, late: i.dueDate && i.dueDate < today }))
      .sort((a, b) => {
        if (a.late !== b.late) return a.late ? -1 : 1;
        const pa = priorityOrder[a.priority] ?? 9;
        const pb = priorityOrder[b.priority] ?? 9;
        if (pa !== pb) return pa - pb;
        return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
      })
      .slice(0, 6);

    return {
      total, done, annualPct,
      overdue, qScheduled, qDone, qPct,
      unscheduled, doneByQuarter, byType, upcoming,
    };
  }, [items, today, currentQ]);

  // Next-action prompts — derived from the same data, no AI framing.
  const actions = useMemo(() => {
    const out = [];
    if (stats.overdue.length > 0) {
      out.push({
        tone: "rose",
        title: `${stats.overdue.length} משימות באיחור`,
        body: "משימות מתוזמנות שעבר מועד היעד שלהן וטרם הושלמו — נדרש טיפול.",
        cta: "פתח רשימה",
        onAction: () => onSelect?.("tasks"),
      });
    }
    if (stats.unscheduled.length > 0) {
      out.push({
        tone: "amber",
        title: `${stats.unscheduled.length} משימות ללא שיבוץ`,
        body: "פריטים שדורשים קביעת תדירות לפני שניתן לשבץ אותם לרבעון.",
        cta: "קבע תדירות",
        onAction: () => onSelect?.("tasks"),
      });
    }
    if (stats.qScheduled.length > 0 && stats.qPct < 50) {
      const left = daysLeftInQuarter();
      out.push({
        tone: "marine",
        title: `התקדמות ${currentQ}: ${stats.qPct}%`,
        body: `נותרו ${left} ימים לסוף הרבעון. נמשיך לטפל במשימות הפתוחות לפי סדר עדיפות.`,
        cta: "המשך טיפול",
        onAction: () => onSelect?.("tasks"),
      });
    }
    if (out.length === 0 && stats.total > 0) {
      out.push({
        tone: "emerald",
        title: "התוכנית במסלול תקין",
        body: "אין משימות באיחור ואין פריטים פתוחים בעדיפות גבוהה — המשך לעקוב.",
      });
    }
    return out;
  }, [stats, currentQ, onSelect]);

  return (
    <div className="px-8 pt-7 pb-10">
      {/* Header */}
      <PageHeader
        eyebrow="מרכז בקרה"
        title="לוח בקרה ראשי"
        subtitle="ניטור תוכנית האכיפה — התקדמות, יעדים ופעולות מומלצות"
      />

      {/* KPI grid */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[120px] rounded-2xl border border-slate-200/70 bg-white shadow-card animate-pulse" />
            ))
          : (
            <>
              <KpiCard
                tone="marine"
                icon={TrendingUp}
                label="התקדמות שנתית"
                value={`${stats.annualPct}%`}
                hint={`${stats.done} מתוך ${stats.total} משימות מתוזמנות`}
                spark={stats.doneByQuarter}
              />
              <KpiCard
                tone={stats.overdue.length ? "rose" : "emerald"}
                icon={AlertTriangle}
                label="משימות באיחור"
                value={stats.overdue.length}
                hint={stats.overdue.length ? "נדרש טיפול דחוף" : "אין משימות באיחור"}
              />
              <KpiCard
                tone="marine"
                icon={CalendarClock}
                label={`התקדמות ${currentQ}`}
                value={`${stats.qPct}%`}
                hint={`${stats.qDone}/${stats.qScheduled.length} ברבעון • נותרו ${daysLeftInQuarter()} ימים`}
              />
              <KpiCard
                tone={stats.unscheduled.length ? "amber" : "slate"}
                icon={ListChecks}
                label="ללא שיבוץ"
                value={stats.unscheduled.length}
                hint={stats.unscheduled.length ? "דורשות קביעת תדירות" : "הכל משובץ"}
              />
            </>
          )
        }
      </div>

      {/* Upcoming tasks */}
      {!loading && stats.upcoming.length > 0 && (
        <section className="mt-10">
          <SectionHeading
            title={`משימות קרובות — ${currentQ}`}
            extra={
              <button
                onClick={() => onSelect?.("tasks")}
                className="text-[11.5px] font-semibold text-marine-700 inline-flex items-center gap-1 hover:text-marine-800 transition cursor-pointer"
              >
                כל המשימות
                <ArrowLeft className="h-3 w-3" aria-hidden />
              </button>
            }
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {stats.upcoming.map((task) => {
              const tm = TYPE_META[task.type];
              const pm = PRIORITY_META[task.priority];
              const TypeIcon = tm.Icon;
              return (
                <button
                  key={task.id}
                  onClick={() => onSelect?.("tasks", { focusTaskId: task.id })}
                  className="text-start rounded-2xl border border-slate-200/70 bg-white p-4 shadow-card hover:shadow-card-lg hover:border-marine-200/70 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tm.tile}`}>
                      <TypeIcon size={16} aria-hidden />
                    </span>
                    <span className="text-[11.5px] font-semibold text-slate-500">{tm.label}</span>
                    <span className={`ms-auto inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${pm.chip}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${pm.dot}`} aria-hidden />
                      {pm.short}
                    </span>
                    {task.late && (
                      <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">איחור</span>
                    )}
                  </div>
                  <h4 className="mt-2 font-display text-[13.5px] font-semibold leading-snug tracking-tight text-slate-900 line-clamp-2">
                    {task.title}
                  </h4>
                  <div className="mt-2 flex items-center gap-2 text-[11.5px] text-slate-500">
                    {task.dueDate && <span>יעד {task.dueDate}</span>}
                    {task.quarter && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-600">{task.quarter}</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Two-column: modules + next actions */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          <SectionHeading title="מודולי המערכת" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {MODULES.map((m) => {
              const navItem = findNav(m.key);
              const enabled = navItem?.enabled ?? false;
              const Icon = navItem?.Icon;
              const isCurrent = view === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => enabled && onSelect?.(m.key)}
                  disabled={!enabled}
                  className={`group text-start rounded-2xl border bg-white p-4 shadow-card transition ${
                    enabled
                      ? "border-slate-200/70 hover:border-marine-200/70 hover:shadow-card-lg cursor-pointer"
                      : "border-slate-200/70 opacity-70 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-marine-50 text-marine-600">
                      {Icon && <Icon className="h-[18px] w-[18px]" aria-hidden />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-[14px] font-semibold tracking-tight text-slate-900">{m.title}</h3>
                        {isCurrent && (
                          <span className="rounded-full bg-marine-50 px-2 py-0.5 text-[10px] font-bold text-marine-700">צפייה כעת</span>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-slate-500">{m.desc}</p>
                    </div>
                    {enabled ? (
                      <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-marine-600 transition shrink-0" aria-hidden />
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        <Lock className="h-2.5 w-2.5" aria-hidden /> בקרוב
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <aside>
          <SectionHeading title="פעולות מומלצות" />
          <div className="rounded-2xl border border-slate-200/70 bg-white shadow-card overflow-hidden">
            {actions.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12.5px] text-slate-500 flex flex-col items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />
                אין פעולות נדרשות כרגע
              </div>
            ) : (
              actions.map((a, i) => <NextActionRow key={i} {...a} />)
            )}
          </div>

          {/* Type breakdown */}
          {!loading && stats.total > 0 && (
            <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-card">
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-3">
                לפי סוג משימה
              </div>
              <div className="space-y-2.5">
                {Object.entries(stats.byType).map(([k, count]) => {
                  const tm = TYPE_META[k];
                  if (!tm) return null;
                  const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={k} className="flex items-center gap-3 text-[12.5px]">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-marine-50 text-marine-600">
                        <tm.Icon size={13} aria-hidden />
                      </span>
                      <span className="w-16 shrink-0 font-medium text-slate-700">{tm.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-marine-600 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-10 shrink-0 text-end font-mono tabular-nums text-slate-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
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

// Lazy import sidestep — pull the NAV item that matches a module key.
import { NAV } from "../lib/tokens.js";
function findNav(key) {
  for (const grp of NAV) for (const it of grp.items) if (it.key === key) return it;
  return null;
}
