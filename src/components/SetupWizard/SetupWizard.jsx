import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MOCK_CANDIDATES, MOCK_COMPANY_PROFILE, ANALYZE_STEPS, candidateToWorkPlanItem } from "../../lib/setupMocks.js";
import { dataverseService } from "../../services/dataverse.js";
import PageHeader from "../PageHeader.jsx";
import StepNav from "./StepNav.jsx";
import SaveIndicator from "./SaveIndicator.jsx";
import UploadStep from "./UploadStep.jsx";
import AnalyzingStep from "./AnalyzingStep.jsx";
import ReviewStep from "./ReviewStep.jsx";
import ConfirmStep from "./ConfirmStep.jsx";
import DoneStep from "./DoneStep.jsx";

// The full wizard: upload → analyze → review → confirm → done.
// All state lives here; each step renders against props + callbacks.
//
// Auto-save (D7): every candidate change updates local state immediately and
// flips saveStatus to "saving"; a debounced timer (2s) flips to "saved". The
// real Dataverse seam will plug in where the timer fires.
// Year comes from the shell (sidebar owns the picker). Setup doesn't change it.
export default function SetupWizard({ year, onPublished }) {
  const [step, setStep] = useState(1); // 1..5
  const [files, setFiles] = useState({ survey: null, plan: null });
  const [candidates, setCandidates] = useState(() => MOCK_CANDIDATES.map((c) => ({ ...c })));
  const [profile, setProfile] = useState(() => structuredClone(MOCK_COMPANY_PROFILE));
  const [saveStatus, setSaveStatus] = useState("idle"); // 'idle' | 'saving' | 'saved' | 'error'

  const saveTimer = useRef(null);
  const queueSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(() => setSaveStatus("saved"), 1400);
  }, []);
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  // ── Candidate mutators (every change is debounced through queueSave) ────
  const patchCandidate = useCallback((id, patch) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch, suggested: patch.suggested ? { ...c.suggested, ...patch.suggested } : c.suggested } : c)));
    queueSave();
  }, [queueSave]);

  const bulkSetFrequency = useCallback((freq) => {
    setCandidates((prev) => prev.map((c) => (c.suggested.frequency == null ? { ...c, suggested: { ...c.suggested, frequency: freq } } : c)));
    queueSave();
  }, [queueSave]);

  // Derived view of what would actually publish (the live preview in the footer).
  const selectedCounts = useMemo(() => {
    const sel = candidates.filter((c) => c.included);
    const counts = { control: 0, training: 0, reminder: 0, total: sel.length, needsReview: 0 };
    const byQuarter = { 1: 0, 2: 0, 3: 0, 4: 0, unscheduled: 0 };
    for (const c of sel) {
      counts[c.type] = (counts[c.type] || 0) + 1;
      if (c.suggested.frequency == null) counts.needsReview += 1;
      const q = c.suggested.quarter;
      if (q && byQuarter[q] != null) byQuarter[q] += 1;
      else byQuarter.unscheduled += 1;
    }
    return { ...counts, byQuarter };
  }, [candidates]);

  // ── Step navigation ────────────────────────────────────────────────────
  const goTo = (s) => setStep(s);
  const next = () => setStep((s) => Math.min(5, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const restart = () => { setStep(1); setSaveStatus("idle"); };

  // Step 2 auto-advances when its progress finishes.
  const handleAnalyzeDone = useCallback(() => {
    setSaveStatus("saved"); // initial extraction counts as "saved"
    setStep(3);
  }, []);

  return (
    <div className="relative px-8 pt-7 pb-32">
      <PageHeader
        eyebrow="הגדרה ראשונית"
        title={`בניית תוכנית עבודה לשנת ${year}`}
        subtitle="העלאת סקר ציות ותוכנית אכיפה, בחירת מה ייכנס לתוכנית, ופרסום"
        actions={step >= 3 ? <SaveIndicator status={saveStatus} /> : null}
      />

      <div className="mt-6">
        <StepNav step={step} />
      </div>

      <div className="mt-8">
        {step === 1 && (
          <UploadStep files={files} setFiles={setFiles} onNext={next} />
        )}
        {step === 2 && (
          <AnalyzingStep steps={ANALYZE_STEPS} onDone={handleAnalyzeDone} />
        )}
        {step === 3 && (
          <ReviewStep
            candidates={candidates}
            patchCandidate={patchCandidate}
            bulkSetFrequency={bulkSetFrequency}
            counts={selectedCounts}
            onBack={back}
            onNext={next}
          />
        )}
        {step === 4 && (
          <ConfirmStep
            year={year}
            counts={selectedCounts}
            profile={profile}
            onBack={back}
            onPublish={async () => {
              const items = candidates.filter((c) => c.included).map(candidateToWorkPlanItem);
              await dataverseService.publishWorkPlan({ year, items });
              onPublished?.();
              next();
            }}
          />
        )}
        {step === 5 && (
          <DoneStep year={year} counts={selectedCounts} onRestart={restart} />
        )}
      </div>
    </div>
  );
}
