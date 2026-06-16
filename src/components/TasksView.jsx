import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import TaskCard from "./TaskCard.jsx";
import { QuarterTabs, Progress, TypeSelect, StatusFilter } from "./Controls.jsx";
import PageHeader from "./PageHeader.jsx";

// The original "משימות הממונה" screen, extracted so EnforcementDashboard can
// host more than one view. Owns the quarter/type/status filters because those
// are tasks-only; year + items + handlers come from the shell so the dashboard
// can share the same data load.
export default function TasksView({
  query,
  items, loading, busyId, error,
  changeStatus, addNote, skipItem, saveEdits, setFrequency,
  focusTaskId, onFocusConsumed,
}) {
  const [quarter, setQuarter] = useState("Q2");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // When the dashboard hands us a focus target, snap filters so the card is
  // guaranteed visible (right quarter, no type/status narrowing), then let the
  // shell know we consumed the focus so it doesn't keep reapplying on rerenders.
  useEffect(() => {
    if (!focusTaskId) return;
    const target = items.find((i) => i.id === focusTaskId);
    if (!target) return;
    const unscheduled = target.frequency === "NeedsReview" || target.quarter === null;
    setQuarter(unscheduled ? "all" : target.quarter || "all");
    setTypeFilter("all");
    setStatusFilter("all");
  }, [focusTaskId, items]);

  // The TaskCard does the smooth-scroll once it mounts expanded; we just need
  // to clear the focus after one render so it doesn't reapply on every state change.
  useEffect(() => {
    if (!focusTaskId) return;
    const id = window.setTimeout(() => onFocusConsumed?.(), 400);
    return () => window.clearTimeout(id);
  }, [focusTaskId, onFocusConsumed]);

  const scheduled = useMemo(
    () => items.filter((i) => i.frequency !== "NeedsReview" && i.quarter !== null),
    [items]
  );
  const unscheduled = useMemo(
    () => items.filter((i) => i.frequency === "NeedsReview" || i.quarter === null),
    [items]
  );
  const q = query.trim();
  const matchesQuery = (i) => !q || i.title.includes(q) || (i.description || "").includes(q);
  const todayStr = new Date().toISOString().slice(0, 10);
  const isLate = (i) => i.dueDate && i.dueDate < todayStr && i.status !== "done";
  const qItems = quarter === "all" ? scheduled : scheduled.filter((i) => i.quarter === quarter);
  const visible = qItems.filter(
    (i) => (typeFilter === "all" || i.type === typeFilter) && (statusFilter === "all" || i.status === statusFilter) && matchesQuery(i)
  );
  const lateVisible = visible.filter(isLate);
  const onTimeVisible = visible.filter((i) => !isLate(i));
  const unscheduledShown = unscheduled.filter(matchesQuery);
  const done = qItems.filter((i) => i.status === "done").length;
  const statusCounts = {
    all: qItems.length,
    todo: qItems.filter((i) => i.status === "todo").length,
    in_progress: qItems.filter((i) => i.status === "in_progress").length,
    done,
  };

  return (
    <>
      <div className="px-8 pt-7 pb-4">
        <PageHeader
          eyebrow="תכנון ובקרה"
          title="משימות הממונה"
          subtitle="חילוץ אוטומטי של משימות מתוכנית העבודה — מעקב ביצוע רבעוני"
        />

        <div className="mt-6 flex items-center justify-between gap-x-4 gap-y-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <QuarterTabs quarter={quarter} setQuarter={setQuarter} />
            <StatusFilter value={statusFilter} onChange={setStatusFilter} counts={statusCounts} />
            <TypeSelect value={typeFilter} onChange={setTypeFilter} />
          </div>
          <Progress done={done} total={qItems.length} />
        </div>
      </div>

      <div className="px-8 pb-10 space-y-3">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <div className="mb-1 font-semibold">שגיאה בטעינת הנתונים מ-Dataverse</div>
            <div dir="ltr" className="break-all font-mono text-xs text-rose-600">{error}</div>
          </div>
        )}

        {lateVisible.length > 0 && (
          <div className="rounded-2xl border border-rose-200/70 bg-rose-50/50 p-2.5">
            <div className="px-1.5 pb-2 text-xs font-semibold text-rose-700 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
              {lateVisible.length} משימות באיחור{quarter !== "all" ? ` ברבעון ${quarter}` : ""} — נדרש טיפול
            </div>
            <div className="space-y-3">
              {lateVisible.map((item, idx) => (
                <TaskCard key={item.id} item={item} index={idx} late busy={busyId === item.id} initialOpen={item.id === focusTaskId} onChangeStatus={(s) => changeStatus(item, s)} onNote={addNote} onSkip={skipItem} onSaveEdits={saveEdits} />
              ))}
            </div>
          </div>
        )}

        {unscheduledShown.length > 0 && (
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-2.5">
            <div className="px-1.5 pb-2 text-xs font-semibold text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> ללא שיבוץ — דורש קביעת תדירות ({unscheduledShown.length})
            </div>
            <div className="space-y-3">
              {unscheduledShown.map((item, idx) => (
                <TaskCard key={item.id} item={item} index={idx} initialOpen={item.id === focusTaskId} onSetFrequency={(f) => setFrequency(item, f)} onNote={addNote} onSaveEdits={saveEdits} />
              ))}
            </div>
          </div>
        )}

        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="h-[78px] rounded-2xl border border-slate-200/70 bg-white shadow-card animate-pulse" />
          ))
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-card">
            <p className="text-sm text-slate-500">
              {q
                ? `לא נמצאו תוצאות עבור "${q}".`
                : typeFilter !== "all" || statusFilter !== "all"
                ? "לא נמצאו משימות התואמות לסינון."
                : quarter === "all"
                ? "אין משימות מתוזמנות."
                : `אין משימות ב-${quarter}.`}
            </p>
          </div>
        ) : (
          onTimeVisible.map((item, idx) => (
            <TaskCard key={item.id} item={item} index={idx} busy={busyId === item.id} initialOpen={item.id === focusTaskId} onChangeStatus={(s) => changeStatus(item, s)} onNote={addNote} onSkip={skipItem} onSaveEdits={saveEdits} />
          ))
        )}
      </div>
    </>
  );
}
