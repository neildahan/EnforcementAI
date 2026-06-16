import { Search, Lock } from "lucide-react";
import { NAV } from "../lib/tokens.js";
import { YearSelect } from "./Controls.jsx";

export default function Sidebar({ query, setQuery, view, onSelect, year, setYear }) {
  return (
    <aside className="w-64 shrink-0 bg-[#131a2e] text-slate-300 flex flex-col border-e border-white/5">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/5">
        <img
          src="/icon_shield_ai.svg"
          alt="סוכן אכיפה"
          className="h-14 w-14 drop-shadow-[0_2px_10px_rgba(58,69,216,0.35)]"
        />
        <div className="leading-tight">
          <div className="font-display font-semibold text-white tracking-tight">סוכן אכיפה</div>
          <div className="text-[10px] tracking-[0.16em] text-slate-500 font-semibold uppercase">Enforcement AI</div>
        </div>
      </div>

      <div className="px-3 pt-3 pb-1">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 focus-within:border-marine-400/60 focus-within:bg-white/10 focus-within:ring-[3px] focus-within:ring-marine-500/15 transition">
          <Search className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש משימה…"
            aria-label="חיפוש משימה"
            className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Global work-year context — one plan load per year, shared across views. */}
      <div className="px-3 pt-2 pb-1">
        <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          שנת עבודה
        </div>
        <YearSelect year={year} setYear={setYear} dark />
      </div>

      <nav className="thin-scroll-dark flex-1 overflow-y-auto py-3">
        {NAV.map((grp) => (
          <div key={grp.section} className="px-3 mb-4">
            <div className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {grp.section}
            </div>
            {grp.items.map(({ key, label, Icon, enabled }) => {
              const active = view === key;
              const locked = !enabled;
              return (
                <button
                  key={key}
                  onClick={() => enabled && onSelect?.(key)}
                  disabled={locked}
                  aria-current={active ? "page" : undefined}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-marine-400/50 ${
                    active
                      ? "bg-white/[0.07] text-white font-semibold"
                      : locked
                      ? "text-slate-500/60 cursor-not-allowed"
                      : "text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
                  }`}
                >
                  {active && (
                    <span className="absolute inset-y-2 -start-1 w-0.5 rounded-full bg-marine-400" aria-hidden />
                  )}
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-md transition ${
                      active ? "bg-marine-600 text-white" : "bg-white/5 text-slate-400"
                    }`}
                  >
                    <Icon className="h-[15px] w-[15px]" aria-hidden />
                  </span>
                  <span className="flex-1 text-start">{label}</span>
                  {locked && <Lock className="h-3 w-3 text-slate-600 shrink-0" aria-hidden />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-[7px] w-[7px] rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
          <span className="text-xs text-slate-400">מערכת פעילה</span>
        </div>
        <span className="text-[10px] text-slate-500">v3.0</span>
      </div>
    </aside>
  );
}
