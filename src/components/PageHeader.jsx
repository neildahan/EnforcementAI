import { BRAND } from "../lib/brand.js";

// Shared page header so every view's title block reads identically:
// marine eyebrow, 26px display title, slate subtitle. The client logo sits at
// the top-end as a co-brand anchor (swappable via lib/brand.js → Settings).
// `actions` renders extra controls before the logo when a view needs them.
// `underLogo` renders directly below the logo on the same column — used by
// views that want a small per-page secondary control aligned with the logo.
export default function PageHeader({ eyebrow, title, subtitle, actions, underLogo }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-marine-600">
          {eyebrow}
        </div>
        <h1 className="mt-1 font-display text-[26px] font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <div className="flex items-center gap-3">
          {actions}
          <img
            src={BRAND.clientLogo}
            alt={BRAND.clientName || "לוגו הלקוח"}
            className="h-9 w-auto max-w-[160px] object-contain"
          />
        </div>
        {underLogo && <div className="mt-6">{underLogo}</div>}
      </div>
    </div>
  );
}
