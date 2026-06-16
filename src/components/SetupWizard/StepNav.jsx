import { Check } from "lucide-react";

// Top step indicator — visual breadcrumb. Doesn't navigate; the user moves
// forward via CTAs in each step.
const STEPS = [
  { n: 1, label: "העלאה" },
  { n: 2, label: "ניתוח" },
  { n: 3, label: "סקירה" },
  { n: 4, label: "אישור" },
  { n: 5, label: "סיום" },
];

export default function StepNav({ step }) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      {STEPS.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        return (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
              active
                ? "bg-marine-600 text-white border-marine-600 shadow-[0_2px_10px_rgba(58,69,216,0.25)] font-semibold"
                : done
                ? "bg-marine-50 border-marine-100 text-marine-700"
                : "bg-white border-slate-200 text-slate-500"
            }`}>
              <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold ${
                active ? "bg-white/20" : done ? "bg-marine-600 text-white" : "bg-slate-100"
              }`}>
                {done ? <Check className="h-3 w-3" aria-hidden /> : s.n}
              </span>
              <span>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={`h-px w-6 ${done ? "bg-marine-200" : "bg-slate-200"}`} aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}
