import { useState, useEffect, useCallback } from "react";
import { Check } from "lucide-react";
import { dataverseService } from "./services/dataverse.js";
import Sidebar from "./components/Sidebar.jsx";
import TasksView from "./components/TasksView.jsx";
import DashboardView from "./components/DashboardView.jsx";
import ControlTopicsView from "./components/ControlTopicsView.jsx";
import SetupWizard from "./components/SetupWizard/SetupWizard.jsx";
import WorkPlanView from "./components/WorkPlanView.jsx";

export default function EnforcementDashboard() {
  const [view, setView] = useState("dash"); // "dash" | "tasks" | "subjects"
  const [focusTaskId, setFocusTaskId] = useState(null);

  // Cross-view navigation. The dashboard calls this with { focusTaskId } when
  // the user clicks a specific task; TasksView clears the focus once consumed.
  const selectView = useCallback((next, opts = {}) => {
    setView(next);
    setFocusTaskId(opts.focusTaskId ?? null);
  }, []);
  const [year, setYear] = useState(2026);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [planMeta, setPlanMeta] = useState({ published: false, publishedAt: null, total: 0 });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  // One load per year; both the dashboard and the tasks view share these items.
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [data, meta] = await Promise.all([
        dataverseService.getWorkPlanItems({ year }),
        dataverseService.getPlanMeta?.({ year }) ?? Promise.resolve({ published: false, publishedAt: null, total: 0 }),
      ]);
      setItems(data);
      setPlanMeta(meta);
    } catch (e) {
      setError(e?.message || String(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

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

  const addNote = async (item, text) => {
    setError("");
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, notes: text } : x)));
    try {
      await dataverseService.saveNote(item, text);
      setToast("ההערה נשמרה");
    } catch (e) {
      setError(e?.message || String(e));
      load();
    }
  };
  const skipItem = () => setToast("המשימה דולגה");

  const saveEdits = async (item, edits) => {
    setError("");
    setItems((prev) => prev.map((x) => (x.id === item.id ? {
      ...x,
      title: edits.title,
      description: edits.description,
      priority: edits.priority,
      type: edits.type,
      quarter: edits.quarter || null,
      frequency: edits.frequency || x.frequency,
      dueDate: edits.dueDate || null,
      audience: edits.audience,
      sourceLaw: edits.sourceLaw,
      sourceSection: edits.sourceSection,
      regulatoryBasis: [edits.sourceLaw, edits.sourceSection].filter(Boolean).join(" "),
    } : x)));
    try {
      await dataverseService.saveEdits(item, edits);
      setToast("הפרטים נשמרו");
    } catch (e) {
      setError(e?.message || String(e));
      load();
    }
  };

  const setFrequency = async (item, freq) => {
    const targetQ = "Q1";
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

  return (
    <div dir="rtl" className="flex h-screen w-full bg-canvas text-slate-900">
      <Sidebar
        query={query} setQuery={setQuery}
        view={view} onSelect={selectView}
        year={year} setYear={setYear}
      />

      <main className="thin-scroll flex-1 overflow-y-auto">
        {view === "dash" && (
          <DashboardView
            items={items} loading={loading}
            view={view} onSelect={selectView}
          />
        )}
        {view === "tasks" && (
          <TasksView
            query={query}
            items={items} loading={loading} busyId={busyId} error={error}
            changeStatus={changeStatus} addNote={addNote} skipItem={skipItem}
            saveEdits={saveEdits} setFrequency={setFrequency}
            focusTaskId={focusTaskId}
            onFocusConsumed={() => setFocusTaskId(null)}
          />
        )}
        {view === "subjects" && (
          <ControlTopicsView />
        )}
        {view === "setup" && (
          <SetupWizard
            year={year}
            onPublished={() => { setToast("תוכנית עבודה פורסמה"); load(); }}
          />
        )}
        {view === "plan" && (
          <WorkPlanView
            year={year}
            planMeta={planMeta}
            items={items}
            onPublished={() => { setToast("תוכנית עבודה פורסמה"); load(); }}
            onSelect={selectView}
            onRepublish={() => selectView("setup")}
          />
        )}
      </main>

      <div aria-live="polite" className="fixed bottom-5 left-5 z-40">
        {toast && (
          <div className="flex items-center gap-2 rounded-xl bg-[#131a2e] px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_30px_rgba(13,17,23,0.25)]">
            <Check className="h-4 w-4 text-emerald-400" aria-hidden /> {toast}
          </div>
        )}
      </div>
    </div>
  );
}
