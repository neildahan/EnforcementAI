import { Check, Loader2, AlertCircle } from "lucide-react";

// Visible "saved/saving/error" status (D7). Always present in the wizard
// chrome from step 3 onward so the user never wonders whether their picks
// were captured.
export default function SaveIndicator({ status }) {
  if (status === "idle") return null;

  const map = {
    saving: { icon: Loader2, text: "שומר טיוטה…", tone: "text-slate-500", spin: true },
    saved:  { icon: Check,   text: "טיוטה נשמרה",  tone: "text-emerald-600" },
    error:  { icon: AlertCircle, text: "שגיאה בשמירה — לחץ לנסות שוב", tone: "text-rose-600" },
  };
  const m = map[status] || map.saved;
  const Icon = m.icon;
  return (
    <div className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium ${m.tone}`}>
      <Icon className={`h-3.5 w-3.5 ${m.spin ? "animate-spin" : ""}`} aria-hidden />
      {m.text}
    </div>
  );
}
