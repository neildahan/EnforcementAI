import { X, FileSpreadsheet, FileText } from "lucide-react";

const SOURCE_ICON = { survey: FileSpreadsheet, plan: FileText };
const SOURCE_LABEL = { survey: "סקר ציות", plan: "תוכנית אכיפה" };

// Slide-over drawer showing the verbatim snippet that produced a candidate.
// In live mode this would render the highlighted Excel row / PDF page; here
// we show the textual snippet returned by the (mocked) extraction.
export default function SourcePeek({ candidate, onClose }) {
  if (!candidate) return null;
  const Icon = SOURCE_ICON[candidate.source.file];

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="absolute inset-y-0 start-0 w-full max-w-md bg-white shadow-[0_12px_30px_rgba(13,17,23,0.18)] flex flex-col">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-marine-50 text-marine-600">
            <Icon className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-marine-600">
              {SOURCE_LABEL[candidate.source.file]}
            </div>
            <div className="font-display text-[14.5px] font-semibold tracking-tight text-slate-900 truncate">
              {candidate.source.section}
              {candidate.source.locator && <span className="text-slate-500 font-normal"> · {candidate.source.locator}</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="סגור"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-marine-300"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto thin-scroll px-5 py-5 space-y-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-2">קטע מהמסמך</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-[13.5px] leading-relaxed text-slate-700 whitespace-pre-wrap">
              {candidate.source.snippet || "—"}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-2">ההצעה של הסוכן</div>
            <ul className="rounded-xl border border-slate-200 bg-white text-[13px] divide-y divide-slate-100">
              <PeekRow k="כותרת" v={candidate.title} />
              {candidate.description && <PeekRow k="תיאור" v={candidate.description} />}
              {candidate.suggested.quarter && <PeekRow k="רבעון" v={`Q${candidate.suggested.quarter}`} />}
              {candidate.suggested.frequency && <PeekRow k="תדירות" v={candidate.suggested.frequency} />}
              <PeekRow k="עדיפות" v={candidate.suggested.priority} />
              {candidate.suggested.audience && <PeekRow k="אוכלוסיית יעד" v={candidate.suggested.audience} />}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function PeekRow({ k, v }) {
  return (
    <li className="flex items-start gap-3 px-3.5 py-2">
      <span className="w-28 shrink-0 text-[12px] font-semibold text-slate-500">{k}</span>
      <span className="flex-1 text-slate-700">{v}</span>
    </li>
  );
}
