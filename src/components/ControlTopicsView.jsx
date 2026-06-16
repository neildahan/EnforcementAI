import { useMemo, useState } from "react";
import {
  ChevronDown, ShieldAlert, Bot, Clipboard, BookOpen,
  Globe, Radio, FolderOpen, Cpu, Landmark,
} from "lucide-react";
import { ShieldCheck as PhShieldCheck } from "@phosphor-icons/react";
import {
  ALL_TOPICS, RISK_META, QUARTERS,
  totalAutoChecks, totalManualChecks, topicsByQuarter,
} from "../lib/controlTopics.js";
import PageHeader from "./PageHeader.jsx";

// Lucide icon per autoCheck data-source. Picks the visual cue for where the
// data will come from at audit time (MAYA / registrar / internal folder / etc.).
const SOURCE_ICON = {
  maya:      Globe,
  magna:     Radio,
  folder:    FolderOpen,
  web:       Cpu,
  registrar: Landmark,
};

// Top stats card — neutral surface, marine accent only when a number is
// "highlighted". Matches the dashboard's KpiCard shape so the two pages feel
// like the same product.
function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
      <div className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-bold tracking-tight text-marine-700">{value}</div>
      {hint && <div className="mt-1 text-[12px] text-slate-500">{hint}</div>}
    </div>
  );
}

// Quarter tab (Q1..Q4) — same segmented-pill style as the tasks page so the
// nav language is consistent across the app.
function QTab({ q, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 rounded-xl border px-4 py-3 text-center transition cursor-pointer ${
        active
          ? "border-marine-200 bg-white shadow-card font-semibold text-slate-900"
          : "border-transparent bg-slate-100/60 text-slate-500 hover:bg-slate-100"
      }`}
    >
      <div className="font-display text-base">Q{q}</div>
      <div className={`text-[11px] mt-0.5 ${active ? "text-marine-700" : "text-slate-400"}`}>
        {count} נושאים
      </div>
    </button>
  );
}

// One control topic. Collapsed = header with risk chip + counts. Expanded =
// exposure block + autoChecks + manualChecks. Pure read-only for v1.
function TopicCard({ topic, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const risk = RISK_META[topic.riskLevel] || RISK_META["נמוך"];
  return (
    <div className={`rounded-2xl border bg-white shadow-card transition ${risk.border}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-4 text-start cursor-pointer hover:bg-slate-50/50 rounded-2xl"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-marine-50 text-marine-600">
          <PhShieldCheck size={22} weight="duotone" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-[15px] font-semibold tracking-tight text-slate-900">{topic.label}</h3>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${risk.chip}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${risk.dot}`} aria-hidden />
              {risk.short}
            </span>
          </div>
          <p className="mt-0.5 text-[13px] leading-snug text-slate-500 line-clamp-2">{topic.desc}</p>
          <div className="mt-2 flex items-center gap-3 text-[11.5px] text-slate-500 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Bot className="h-3.5 w-3.5 text-marine-600" aria-hidden />
              {topic.autoChecks.length} בקרות אוטונומיות
            </span>
            <span className="text-slate-300" aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Clipboard className="h-3.5 w-3.5 text-slate-500" aria-hidden />
              {topic.manualChecks.length} בקרות ידניות
            </span>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-5">
          {/* Exposure */}
          <div className="rounded-xl border border-rose-200/60 bg-rose-50/50 p-3.5">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 mt-0.5 text-rose-600 shrink-0" aria-hidden />
              <div>
                <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-rose-700">חשיפה רגולטורית</div>
                <p className="mt-1 text-[13px] leading-relaxed text-rose-800">{topic.exposure}</p>
              </div>
            </div>
          </div>

          {/* Auto checks */}
          {topic.autoChecks.length > 0 && (
            <section>
              <h4 className="flex items-center gap-2 text-[12.5px] font-semibold text-marine-700 mb-2.5">
                <Bot className="h-3.5 w-3.5" aria-hidden />
                בקרות אוטונומיות — הסוכן מבצע באופן עצמאי
              </h4>
              <ul className="space-y-2">
                {topic.autoChecks.map((ac, i) => {
                  const SourceIcon = SOURCE_ICON[ac.icon] || Cpu;
                  return (
                    <li key={i} className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3.5">
                      <div className="flex items-start gap-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-marine-50 text-marine-600">
                          <SourceIcon className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] leading-relaxed text-slate-800">{ac.text}</p>
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            <SourceIcon className="h-3 w-3 text-marine-600" aria-hidden />
                            {ac.dataSource}
                          </div>
                          <CitationRow source={ac.source} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Manual checks */}
          {topic.manualChecks.length > 0 && (
            <section>
              <h4 className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-700 mb-2.5">
                <Clipboard className="h-3.5 w-3.5" aria-hidden />
                בקרות ידניות — דורשות סקירה של הממונה
              </h4>
              <ul className="space-y-2">
                {topic.manualChecks.map((mc, i) => (
                  <li key={i} className="rounded-xl border border-slate-200/70 bg-white p-3.5">
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] leading-relaxed text-slate-800">{mc.text}</p>
                        <CitationRow source={mc.source} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function CitationRow({ source }) {
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-snug text-slate-500">
      <BookOpen className="h-3 w-3 mt-0.5 shrink-0 text-slate-400" aria-hidden />
      <span>{source}</span>
    </p>
  );
}

export default function ControlTopicsView() {
  const [quarter, setQuarter] = useState(2);

  const perQuarter = useMemo(
    () => QUARTERS.map((q) => topicsByQuarter(q)),
    []
  );
  const quarterTopics = perQuarter[quarter - 1];

  return (
    <div className="px-8 pt-7 pb-10">
      {/* Header */}
      <PageHeader
        eyebrow="תכנון ובקרה"
        title="נושאי בקרה"
        subtitle={'קטלוג הבקרות הרגולטוריות — מעמדת סגל 199-9, חוק ני"ע וחוק החברות'}
      />

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={PhShieldCheck}
          label="נושאי בקרה"
          value={ALL_TOPICS.length}
          hint="לפי תוכנית אכיפה ועמדות סגל"
        />
        <StatCard
          icon={Bot}
          label="בקרות אוטונומיות"
          value={totalAutoChecks}
          hint="הסוכן יבצע בעצמו"
        />
        <StatCard
          icon={Clipboard}
          label="בקרות ידניות"
          value={totalManualChecks}
          hint="סקירת הממונה"
        />
        <StatCard
          icon={BookOpen}
          label={`ברבעון ${quarter}`}
          value={quarterTopics.length}
          hint="ממויינים לפי דירוג סיכון"
        />
      </div>

      {/* Quarter tabs */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        {QUARTERS.map((q) => (
          <QTab
            key={q}
            q={q}
            active={quarter === q}
            count={perQuarter[q - 1].length}
            onClick={() => setQuarter(q)}
          />
        ))}
      </div>

      {/* Topic list */}
      <div className="mt-5 space-y-3">
        {quarterTopics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-card">
            <p className="text-sm text-slate-500">אין נושאים לרבעון זה</p>
          </div>
        ) : (
          quarterTopics.map((topic) => <TopicCard key={topic.id} topic={topic} />)
        )}
      </div>
    </div>
  );
}
