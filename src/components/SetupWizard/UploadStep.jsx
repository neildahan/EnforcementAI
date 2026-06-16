import { useRef } from "react";
import { FileSpreadsheet, FileText, CheckCircle2, ArrowLeft, UploadCloud } from "lucide-react";

// Step 1 — drop the two source files. Mock-friendly: accepts any selection
// without actually parsing. The extraction happens (or is mocked) in step 2.
//
// Per-file card explains what the agent does with that file (helps the user
// understand why both are needed and what they'll see in step 3).
export default function UploadStep({ files, setFiles, onNext }) {
  const surveyRef = useRef(null);
  const planRef = useRef(null);
  const bothReady = files.survey && files.plan;

  function pick(kind, file) {
    if (!file) return;
    setFiles((prev) => ({ ...prev, [kind]: { name: file.name, size: file.size } }));
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <Dropzone
          icon={FileSpreadsheet}
          label="סקר ציות"
          accept=".xlsx,.csv"
          hint="Excel — דרישות חוק, בקרות מומלצות, אחראים, חשיפה שיורית"
          file={files.survey}
          inputRef={surveyRef}
          onPick={(f) => pick("survey", f)}
        />
        <Dropzone
          icon={FileText}
          label="תוכנית אכיפה"
          accept=".pdf,.docx"
          hint="PDF/DOCX — נהלים, הדרכות, תזכורות, נספחים"
          file={files.plan}
          inputRef={planRef}
          onPick={(f) => pick("plan", f)}
        />

        <div className="flex items-center justify-end">
          <button
            onClick={onNext}
            disabled={!bothReady}
            className="inline-flex items-center gap-2 rounded-lg bg-marine-600 px-5 py-2.5 font-display text-sm font-semibold text-white cursor-pointer shadow-[0_2px_10px_rgba(58,69,216,0.35)] hover:bg-marine-700 disabled:opacity-50 disabled:cursor-not-allowed transition focus:outline-none focus-visible:ring-2 focus-visible:ring-marine-300"
          >
            המשך לניתוח
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card h-fit">
        <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">מה הסוכן יעשה</div>
        <ul className="mt-3 space-y-3 text-[13px] leading-relaxed text-slate-600">
          <Bullet>
            מהסקר — יחלץ דרישות חוק לפי גיליון, כולל חוק החברות וכל גיליון נוסף שתעלה
          </Bullet>
          <Bullet>
            מהתוכנית — יזהה הדרכות, נהלים, תזכורות, נספחים ופרטי הממונה
          </Bullet>
          <Bullet>
            ימזג עם הקטלוג הרגולטורי ויציע: תדירות, עדיפות, אוכלוסיית יעד
          </Bullet>
          <Bullet>
            תקבל רשימת מועמדים לבחירה — אתה החלטת מה ייכנס לתוכנית
          </Bullet>
        </ul>
        <div className="mt-4 rounded-xl bg-marine-50 p-3 text-[12px] leading-relaxed text-marine-800">
          <strong className="font-semibold">בלי לחיצה שלך — שום דבר לא נוצר.</strong> כל הניתוח הוא רק הצעות עד שתאשר.
        </div>
      </aside>
    </div>
  );
}

function Dropzone({ icon: Icon, label, accept, hint, file, inputRef, onPick }) {
  const ready = !!file;
  return (
    <div
      className={`group relative rounded-2xl border-2 border-dashed p-5 transition cursor-pointer ${
        ready
          ? "border-emerald-300 bg-emerald-50/40"
          : "border-slate-300 bg-white hover:border-marine-300 hover:bg-marine-50/30"
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      <div className="flex items-center gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
          ready ? "bg-emerald-100 text-emerald-700" : "bg-marine-50 text-marine-600"
        }`}>
          {ready ? <CheckCircle2 className="h-6 w-6" aria-hidden /> : <Icon className="h-6 w-6" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[15px] font-semibold tracking-tight text-slate-900">{label}</h3>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">{accept}</span>
          </div>
          {ready ? (
            <p className="mt-0.5 text-[12.5px] text-emerald-700 truncate">
              <span className="font-semibold">{file.name}</span>
              {file.size != null && <span className="text-emerald-600/70"> · {formatSize(file.size)}</span>}
            </p>
          ) : (
            <p className="mt-0.5 text-[12.5px] text-slate-500">{hint}</p>
          )}
        </div>
        <div className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 group-hover:border-marine-300 group-hover:text-marine-700">
          <UploadCloud className="h-3.5 w-3.5" aria-hidden />
          {ready ? "החלף" : "בחר קובץ"}
        </div>
      </div>
    </div>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-marine-500" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
