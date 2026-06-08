import { useState, useMemo, useEffect, useCallback } from "react";
import { AlertTriangle, RefreshCw, Check } from "lucide-react";
import { dataverseService } from "./services/dataverse.js";
import Sidebar from "./components/Sidebar.jsx";
import TaskCard from "./components/TaskCard.jsx";
import ConfirmModal from "./components/ConfirmModal.jsx";
import { YearSelect, QuarterTabs, Progress, TypeSelect, StatusFilter } from "./components/Controls.jsx";

export default function EnforcementDashboard() {
  const [year, setYear] = useState(2026);
  const [quarter, setQuarter] = useState("Q2");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [regenBusy, setRegenBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await dataverseService.getWorkPlanItems({ year, quarter });
      setItems(data);
    } catch (e) {
      setError(e?.message || String(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [year, quarter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

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

  const changeStatus = async (item, next) => {
    const prevStatus = item.status;
    setBusyId(item.id);
    setError("");
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, status: next } : x))); // optimistic
    try {
      await dataverseService.updateItemStatus(item.id, next);
      setToast("נשמר ב-Dataverse");
    } catch (e) {
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, status: prevStatus } : x))); // revert
      setError(e?.message || String(e));
    } finally {
      setBusyId(null);
    }
  };

  const addNote = () => setToast("ההערה נשמרה");
  const skipItem = () => setToast("המשימה דולגה");

  const setFrequency = async (item, freq) => {
    const targetQ = quarter === "all" ? "Q1" : quarter;
    setError("");
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, quarter: targetQ, frequency: freq.label } : x)));
    try {
      await dataverseService.setFrequency(item, freq.label, targetQ);
      setToast(`נקבעה תדירות: ${freq.label}`);
    } catch (e) {
      setError(e?.message || String(e));
      load();
    }
  };

  const regenerate = async () => {
    setRegenBusy(true);
    const res = await dataverseService.regenerateWorkPlan({ year, replace: false }); // ask-before-replace
    setRegenBusy(false);
    if (res.result === "exists") setModalOpen(true);
    else { setToast("נוצרה תוכנית חדשה"); load(); }
  };
  const confirmReplace = async () => {
    setRegenBusy(true);
    await dataverseService.regenerateWorkPlan({ year, replace: true });
    setRegenBusy(false);
    setModalOpen(false);
    setToast("התוכנית הוחלפה");
    load();
  };

  return (
    <div dir="rtl" className="flex h-screen w-full bg-slate-50 text-slate-900">
      <Sidebar query={query} setQuery={setQuery} />

      <main className="flex-1 overflow-y-auto">
        <div className="px-8 pt-7 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">משימות הממונה</h1>
              <p className="mt-1 text-sm text-slate-400">חילוץ אוטומטי של משימות מתוכנית העבודה — מעקב ביצוע רבעוני</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <YearSelect year={year} setYear={setYear} />
              <button
                onClick={regenerate}
                disabled={regenBusy}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white cursor-pointer shadow-sm hover:bg-indigo-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                <RefreshCw className={`h-4 w-4 ${regenBusy ? "animate-spin" : ""}`} aria-hidden />
                רענון תוכנית
              </button>
            </div>
          </div>

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
                  <TaskCard key={item.id} item={item} index={idx} late busy={busyId === item.id} onChangeStatus={(s) => changeStatus(item, s)} onNote={addNote} onSkip={skipItem} />
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
                  <TaskCard key={item.id} item={item} index={idx} onSetFrequency={(f) => setFrequency(item, f)} onNote={addNote} />
                ))}
              </div>
            </div>
          )}

          {loading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="h-[78px] rounded-2xl border border-slate-100 bg-white shadow-card animate-pulse" />
            ))
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-card">
              <p className="text-sm text-slate-400">
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
              <TaskCard key={item.id} item={item} index={idx} busy={busyId === item.id} onChangeStatus={(s) => changeStatus(item, s)} onNote={addNote} onSkip={skipItem} />
            ))
          )}
        </div>
      </main>

      <div aria-live="polite" className="fixed bottom-5 left-5 z-40">
        {toast && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white shadow-lg">
            <Check className="h-4 w-4 text-emerald-400" aria-hidden /> {toast}
          </div>
        )}
      </div>

      <ConfirmModal open={modalOpen} year={year} busy={regenBusy} onConfirm={confirmReplace} onCancel={() => setModalOpen(false)} />
    </div>
  );
}
