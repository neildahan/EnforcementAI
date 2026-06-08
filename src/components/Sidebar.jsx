import { ShieldCheck, Search } from "lucide-react";
import { NAV } from "../lib/tokens.js";

export default function Sidebar({ query, setQuery }) {
  return (
    <aside className="w-64 shrink-0 bg-[#0e1236] text-slate-300 flex flex-col">
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
          <ShieldCheck className="h-5 w-5 text-white" aria-hidden />
        </div>
        <div className="leading-tight">
          <div className="font-bold text-white">סוכן אכיפה</div>
          <div className="text-[10px] tracking-widest text-slate-400 font-medium">ENFORCEMENT AI</div>
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש משימה…"
            aria-label="חיפוש משימה"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pr-9 pl-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-400/50"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map((grp) => (
          <div key={grp.section} className="px-3 mb-4">
            <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{grp.section}</div>
            {grp.items.map(({ key, label, Icon, active }) => (
              <button
                key={key}
                aria-current={active ? "page" : undefined}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 ${
                  active ? "bg-white/10 text-white font-semibold" : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${active ? "text-indigo-300" : "text-slate-500"}`} aria-hidden />
                <span>{label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-slate-400">מערכת פעילה</span>
        </div>
        <span className="text-[10px] text-slate-500">v3.0</span>
      </div>
    </aside>
  );
}
