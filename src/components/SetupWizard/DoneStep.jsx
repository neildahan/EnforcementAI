import { CheckCircle2, LayoutDashboard, ClipboardList, RefreshCw } from "lucide-react";

// Step 5 — calm confirmation. No celebration animations, no AI badges.
// Just: it's done, here's what got created, here's where to go next.
export default function DoneStep({ year, counts, onRestart }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.30)]">
        <CheckCircle2 className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="mt-5 font-display text-[28px] font-semibold tracking-tight text-slate-900">
        תוכנית עבודה ל-{year} פורסמה
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        נוצרו {counts.total} פריטים — {counts.control} בקרות · {counts.training} הדרכות · {counts.reminder} תזכורות
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href="#dashboard"
          onClick={(e) => { e.preventDefault(); window.location.hash = ""; }}
          className="group rounded-2xl border border-slate-200/70 bg-white p-4 shadow-card hover:shadow-card-lg hover:border-marine-200/70 transition cursor-pointer text-start"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-marine-50 text-marine-600 mb-2">
            <LayoutDashboard className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <div className="font-display text-[14.5px] font-semibold tracking-tight text-slate-900">לוח בקרה ראשי</div>
          <div className="text-[12.5px] text-slate-500 mt-0.5">סקירה כללית של ההתקדמות והמשימות</div>
        </a>
        <a
          href="#tasks"
          onClick={(e) => { e.preventDefault(); window.location.hash = ""; }}
          className="group rounded-2xl border border-slate-200/70 bg-white p-4 shadow-card hover:shadow-card-lg hover:border-marine-200/70 transition cursor-pointer text-start"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-marine-50 text-marine-600 mb-2">
            <ClipboardList className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <div className="font-display text-[14.5px] font-semibold tracking-tight text-slate-900">משימות הממונה</div>
          <div className="text-[12.5px] text-slate-500 mt-0.5">רשימת המשימות הרבעונית — מעקב ביצוע</div>
        </a>
      </div>

      <button
        onClick={onRestart}
        className="mt-8 inline-flex items-center gap-1.5 text-[12.5px] text-slate-500 hover:text-marine-700 cursor-pointer transition"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        העלה קבצים שוב והתחל מחדש
      </button>
    </div>
  );
}
