import { X, RefreshCw } from "lucide-react";

export default function ConfirmModal({ open, year, busy, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="אישור החלפת תוכנית"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-bold text-slate-800">כבר קיימת תוכנית ל-{year}</h2>
          <button
            onClick={onCancel}
            aria-label="סגירה"
            className="text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 rounded"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          הרצה חוזרת של מחולל תוכנית העבודה תחליף את התוכנית הקיימת. זו פעולה שמשנה נתונים — להמשיך?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            להשאיר את הקיימת
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-rose-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            {busy && <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />} להחליף
          </button>
        </div>
      </div>
    </div>
  );
}
