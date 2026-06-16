// Mock candidates for the onboarding wizard — what the extraction engine
// WOULD return after parsing סקר ציות (Excel) + תוכנית אכיפה (PDF). Shape
// matches the Candidate contract from SPEC_ONBOARDING_WIZARD.md § "Data shapes".
//
// Required core fields per D11: id, type, title, source.{file, section, sheet?}.
// Everything else is optional and rendered only when present.
//
// Source: candidates are modeled on the real files reviewed for the spec —
// the OPC Energy enforcement plan PDF and the public-company compliance
// survey Excel ("לחוק החברות" sheet, 25 rows). They are not real client data.

export const MOCK_CANDIDATES = [
  // ─── Controls extracted from סקר ציות / לחוק החברות ─────────────────────
  {
    id: "ctrl-companies-92-1",
    type: "control",
    title: "דירקטוריון חברה ציבורית: מינימום 3 - מקסימום 8 חברים",
    description: "בדיקת תקנון; פרוטוקול דירקטוריון",
    source: { file: "survey", sheet: "לחוק החברות", section: "§92(1)", locator: "שורה 3",
      snippet: "סעיף 92(1) לחוק החברות: דירקטוריון חברה ציבורית — מינימום 3, מקסימום 8 חברים." },
    suggested: { quarter: 1, frequency: null, priority: "low", audience: "דירקטוריון" },
    included: true,
  },
  {
    id: "ctrl-companies-92-12",
    type: "control",
    title: "קביעת מספר מזערי של דירקטורים בעלי מומחיות חשבונאית/כלכלית",
    description: "בדיקת קורות חיים; הערכת כישורים",
    source: { file: "survey", sheet: "לחוק החברות", section: "§92(12)", locator: "שורה 4",
      snippet: "סעיף 92(12) לחוק החברות: קביעת מספר מזערי של דירקטורים בעלי מומחיות חשבונאית/כלכלית." },
    suggested: { quarter: 1, frequency: null, priority: "low", audience: "דירקטוריון" },
    included: true,
  },
  {
    id: "ctrl-companies-93",
    type: "control",
    title: "דירקטור לא יכול להשתתף בהחלטה בעניין שיש לו ניגוד עניינים",
    description: "בדיקת פרוטוקולים; בדיקת תיעוד מושב",
    source: { file: "survey", sheet: "לחוק החברות", section: "§93", locator: "שורה 5",
      snippet: "סעיף 93: דירקטור לא יכול להשתתף בהחלטה בעניין שיש לו ניגוד עניינים." },
    suggested: { quarter: 2, frequency: null, priority: "medium", audience: "דירקטוריון" },
    included: true,
  },
  {
    id: "ctrl-companies-115",
    type: "control",
    title: "דירקטור חיצוני חייב להיות בעל ניסיון והבנה בחשבונאות או כלכלה",
    description: "בדיקת קורות חיים; בדיקה של כישורים וניסיון",
    source: { file: "survey", sheet: "לחוק החברות", section: "§115(א)", locator: "שורה 12",
      snippet: "סעיף 115(א): דירקטור חיצוני חייב להיות בעל ניסיון והבנה בחשבונאות או כלכלה." },
    suggested: { quarter: 1, frequency: null, priority: "low", audience: "דירקטוריון" },
    included: true,
  },
  {
    id: "ctrl-companies-119",
    type: "control",
    title: "ועדת ביקורת תתקיים פעם ברבעון לפחות",
    description: "בדיקת פרוטוקולים של ישיבות; בדיקה של היעדרויות",
    source: { file: "survey", sheet: "לחוק החברות", section: "§120", locator: "שורה 19",
      snippet: "סעיף 120: ועדת ביקורת תתקיים פעם ברבעון לפחות." },
    suggested: { quarter: 1, frequency: "quarterly", priority: "medium", audience: "ועדת ביקורת" },
    included: true,
  },
  {
    id: "ctrl-companies-146",
    type: "control",
    title: "מדיניות בקרות פנימיות על דיווח כלכלי",
    description: "בדיקת מדיניות; בדיקה של בקרות תפעוליות",
    source: { file: "survey", sheet: "לחוק החברות", section: "§146(א)", locator: "שורה 20",
      snippet: "סעיף 146(א): הדירקטוריון יקבע מדיניות בקרות פנימיות על דיווח כלכלי." },
    suggested: { quarter: 2, frequency: "annual", priority: "medium", audience: "מנהל כללי / CFO" },
    included: true,
  },
  {
    id: "ctrl-companies-148",
    type: "control",
    title: "ביקורת פנימית — תוכנית עבודה ועצמאות",
    description: "בדיקת כישורים; בדיקת עצמאות; בדיקה של תוכנית",
    source: { file: "survey", sheet: "לחוק החברות", section: "§148(א)", locator: "שורה 22",
      snippet: "סעיף 148(א): בחברה תהיה ביקורת פנימית שתבדוק פעולות וביקורות." },
    suggested: { quarter: 3, frequency: "annual", priority: "medium", audience: "ממונה אכיפה / דירקטוריון" },
    included: true,
  },
  {
    id: "ctrl-companies-239",
    type: "control",
    title: "תאגיד מדווח יגלה מידע רציף חומרי בתוך 5 ימים",
    description: "בדיקת מערכת זיהוי; בדיקה של גילויים; בדיקה של מיידיות",
    source: { file: "survey", sheet: "לחוק החברות", section: "§239", locator: "שורה 24",
      snippet: "סעיף 239: תאגיד מדווח יגלה מידע רציף חומרי בתוך 5 ימים." },
    suggested: { quarter: 1, frequency: "quarterly", priority: "high", audience: "ממונה אכיפה / יועמ\"ש" },
    included: true,
  },
  {
    id: "ctrl-companies-260",
    type: "control",
    title: "עסקה בין חברה לבעל עניין דורשת אישור דירקטוריון וועדה",
    description: "בדיקת נהל; בדיקה של אישורים; בדיקה של עצמאות",
    source: { file: "survey", sheet: "לחוק החברות", section: "§260", locator: "שורה 26",
      snippet: "סעיף 260: עסקה בין חברה לבעל עניין דורשת אישור דירקטוריון וועדה." },
    suggested: { quarter: 3, frequency: "quarterly", priority: "high", audience: "ממונה אכיפה / דירקטוריון" },
    included: true,
  },

  // ─── Trainings: PDF cadence × canonical catalog topics (per D1) ─────────
  {
    id: "train-insider-officers-q1",
    type: "training",
    title: "ריענון: איסור שימוש במידע פנים — נושאי משרה והנהלה",
    description: "ריענון שנתי לאוכלוסיית סיכון גבוה — הרצאה פרונטלית + לומדה + מבחן ידע",
    source: { file: "plan", section: "§57.9.1", locator: "עמ' 44",
      snippet: "סעיף 57.9.1: ריענון שנתי. נושאי המשרה בחברה וכן מנהלים נוספים בקבוצה ככל שיידרש, יעברו ריענון שנתי..." },
    suggested: { quarter: 1, frequency: "annual", priority: "high", audience: "דירקטורים, נושאי משרה" },
    included: true,
  },
  {
    id: "train-enforcement-officers-q2",
    type: "training",
    title: "הדרכת נהלי אכיפה — נושאי משרה והנהלה",
    description: "הרצאה פרונטלית + חתימה על הצהרה",
    source: { file: "plan", section: "§57.9.1", locator: "עמ' 44",
      snippet: "סעיף 57.9.1: ריענון שנתי על נהלי תכנית האכיפה." },
    suggested: { quarter: 2, frequency: "annual", priority: "high", audience: "דירקטורים, נושאי משרה" },
    included: true,
  },
  {
    id: "train-related-party-officers-q3",
    type: "training",
    title: "הדרכת עסקאות בעלי עניין — הנהלה + ועדת ביקורת",
    description: "הרצאה + סדנה אינטראקטיבית + לומדה",
    source: { file: "plan", section: "§57.9.1", locator: "עמ' 44",
      snippet: "סעיף 57.9.1 + סעיף ז' של התכנית: הדרכה על עסקאות בעלי עניין." },
    suggested: { quarter: 3, frequency: "annual", priority: "high", audience: "דירקטורים, ועדת ביקורת, יועמ\"ש" },
    included: true,
  },
  {
    id: "train-onboarding-new-hire",
    type: "training",
    title: "הדרכת קליטה — תוכנית האכיפה לעובדים חדשים",
    description: "תוך 7 ימים ממועד תחילת ההעסקה — לומדה + חתימה על נספח ד",
    source: { file: "plan", section: "§57.9.3", locator: "עמ' 44",
      snippet: "סעיף 57.9.3: עובד חדש בחברה יקבל לעיונו תכנית אכיפה זו על נספחיה ויאשר בחתימתו..." },
    suggested: { quarter: null, frequency: "ongoing", priority: "high", audience: "עובדים חדשים" },
    included: true,
  },

  // ─── Reminders + folded annexes (per D3) ────────────────────────────────
  {
    id: "rem-closed-window-annual",
    type: "reminder",
    title: "הודעת חלון סגור — לקראת דוח שנתי",
    description: "שליחת הודעה 30 יום לפני פרסום הדוח השנתי",
    source: { file: "plan", section: "§13", locator: "עמ' 20",
      snippet: "סעיף 13: 'חלונות' לביצוע ולהימנעות מעסקה — חלון סגור 30 יום לפני דוח שנתי." },
    suggested: { quarter: 1, frequency: "annual", priority: "medium", audience: "כלל העובדים" },
    included: true,
  },
  {
    id: "rem-closed-window-quarterly",
    type: "reminder",
    title: "הודעת חלון סגור — לקראת דוחות רבעוניים",
    description: "שליחת הודעה 20 יום לפני פרסום כל דוח רבעוני",
    source: { file: "plan", section: "§13", locator: "עמ' 20",
      snippet: "סעיף 13: 'חלונות' לביצוע ולהימנעות מעסקה — חלון סגור 20 יום לפני דוח רבעוני." },
    suggested: { quarter: 2, frequency: "quarterly", priority: "medium", audience: "כלל העובדים" },
    included: true,
  },
  {
    id: "rem-quarterly-questionnaire",
    type: "reminder",
    title: "שאלון רבעוני — נושאי משרה בכירה (נספח ו')",
    description: "הפצה ואיסוף שאלון פרטי בעלי עניין לפני אישור הדוח הכספי",
    source: { file: "plan", section: "§37.1 + נספח ו'", locator: "עמ' 36",
      snippet: "סעיף 37.1: יישלח אחת לרבעון שאלון לנושאי המשרה הבכירה בחברה אשר יכלול בקשה לפרטים בקשר להיות מקבל השאלון בעל עניין בתאגידים שונים..." },
    suggested: { quarter: 1, frequency: "quarterly", priority: "medium", audience: "נושאי משרה בכירה" },
    included: true,
  },
  {
    id: "rem-annex-d-acknowledgment",
    type: "reminder",
    title: "וידוא חתימת אישור קבלת התכנית (נספח ד') — עובדים חדשים",
    description: "מעקב חתימות עובדים חדשים תוך 7 ימים מהקליטה",
    source: { file: "plan", section: "§57.9.3 + נספח ד'", locator: "עמ' 44",
      snippet: "סעיף 57.9.3: העובד הנקלט יאשר בחתימתו, כי קרא את התכנית, הבין את האמור בה..." },
    suggested: { quarter: null, frequency: "quarterly", priority: "medium", audience: "סמנכ\"ל משאבי אנוש" },
    included: true,
  },
  {
    id: "rem-annex-bc-confidentiality",
    type: "reminder",
    title: "וידוא חתימות סודיות (נספח ב'/ג') — עובדים וספקים חדשים",
    description: "מעקב חתימת כתבי סודיות לעובדים חדשים ולנותני שירותים",
    source: { file: "plan", section: "נספח ב'/ג'", locator: "עמ' 51 + 76",
      snippet: "נספח ב'/ג': כתבי סודיות לעובדים ולספקים — לצרף לכל קליטה / התקשרות חדשה." },
    suggested: { quarter: 2, frequency: "quarterly", priority: "low", audience: "סמנכ\"ל משאבי אנוש, מזכירות החברה" },
    included: true,
  },
  {
    id: "rem-annual-report",
    type: "reminder",
    title: "דוח שנתי של הממונה לדירקטוריון",
    description: "ריכוז פעילות התכנית — הדרכות, בקרות, ליקויים ותיקונים",
    source: { file: "plan", section: "§57.9 + §57.10", locator: "עמ' 44-45",
      snippet: "סעיף 57.10: הממונה יבצע ניטור שוטף וידווח לדירקטוריון / ועדת הביקורת." },
    suggested: { quarter: 4, frequency: "annual", priority: "high", audience: "ועדת ביקורת, דירקטוריון" },
    included: true,
  },
];

// Hybrid extraction with confidence threshold (per D6). High confidence = pre-
// filled and the user just confirms; low confidence = empty and the user fills.
export const MOCK_COMPANY_PROFILE = {
  companyName: { value: "או.פי.סי אנרגיה בע\"מ", confidence: "high" },
  enforcementOfficer: {
    name: { value: "עו\"ד עירית שדר טוביאס", confidence: "high" },
    title: { value: "סמנכ\"לית ומזכירת החברה", confidence: "high" },
  },
  reportingTeam: [
    { name: "מנכ\"ל החברה", title: "מנכ\"ל", confidence: "high" },
    { name: "סמנכ\"ל הכספים", title: "CFO", confidence: "high" },
    { name: "סמנכ\"לית ומזכירת החברה", title: "מזכירת החברה", confidence: "high" },
  ],
};

// Source-sheet families that appear in the candidate list — used to populate
// the left-rail "law family" filter on the review screen.
export const SOURCE_SHEETS = ["לחוק החברות"];

// Frequency-key → Hebrew label for items written to the work plan.
const FREQ_LABEL = {
  daily: "יומי",
  weekly: "שבועי",
  monthly: "חודשי",
  quarterly: "רבעוני",
  annual: "שנתי",
  ongoing: "שוטף",
};

// Convert a candidate (review-screen shape) into a WorkPlanItem (the shape
// the rest of the app — tasks view, dashboard — expects from dataverseService).
// Items with no frequency get the existing NeedsReview convention so the
// unscheduled section in TasksView keeps surfacing them.
export function candidateToWorkPlanItem(candidate) {
  const q = candidate.suggested.quarter;
  const fkey = candidate.suggested.frequency;
  const hasFreq = fkey != null && fkey !== "";
  return {
    id: candidate.id,
    title: candidate.title,
    description: candidate.description || "",
    type: candidate.type,
    priority: candidate.suggested.priority || "medium",
    quarter: hasFreq && q ? `Q${q}` : null,
    status: "todo",
    frequency: hasFreq ? (FREQ_LABEL[fkey] || fkey) : "NeedsReview",
    dueDate: hasFreq && q ? quarterEndDate(q) : null,
    regulatoryBasis: [candidate.source.section, candidate.source.sheet].filter(Boolean).join(" · "),
    audience: candidate.suggested.audience || "",
    sourceLaw: candidate.source.sheet || "",
    sourceSection: candidate.source.section || "",
  };
}

// Use the work plan's year (passed in by the wizard) — defaults to "this year"
// when not present, which is fine for mock previews.
function quarterEndDate(q, year = new Date().getFullYear()) {
  const month = q * 3;
  const last = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
}

// Mock the streaming-analysis progress lines for Step 2.
export const ANALYZE_STEPS = [
  { label: "מקבל את הקבצים…", duration: 600 },
  { label: "מחלץ דרישות מסקר הציות (גיליון 'לחוק החברות')…", duration: 1200 },
  { label: "מחלץ נהלים, הדרכות ונספחים מתוכנית האכיפה…", duration: 1400 },
  { label: "ממפה לקטלוג הרגולטורי ומציע תדירות + עדיפות…", duration: 1000 },
  { label: "מאתר את הממונה ופרטי החברה מהמסמך…", duration: 700 },
  { label: "מכין את רשימת המועמדים…", duration: 500 },
];
