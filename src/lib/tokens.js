import {
  LayoutDashboard, ClipboardList, ClipboardCheck, BarChart3, ShieldCheck,
  FileEdit, AlertTriangle, Bell, Settings, GraduationCap, FileText,
} from "lucide-react";

export const TYPE_META = {
  training: { label: "הדרכה", dot: "text-violet-500", Icon: GraduationCap, tile: "bg-violet-50 text-violet-600" },
  control:  { label: "בקרה",  dot: "text-blue-500",   Icon: ShieldCheck,   tile: "bg-blue-50 text-blue-600" },
  reminder: { label: "תזכורת", dot: "text-amber-500",  Icon: Bell,          tile: "bg-amber-50 text-amber-600" },
  report:   { label: "דוח",   dot: "text-emerald-500", Icon: FileText,      tile: "bg-emerald-50 text-emerald-600" },
};

export const PRIORITY_META = {
  high:   { label: "עדיפות גבוהה",  short: "גבוהה",  accent: "bg-rose-500",  dot: "bg-rose-500",  chip: "bg-rose-50 text-rose-700" },
  medium: { label: "עדיפות בינונית", short: "בינונית", accent: "bg-amber-400", dot: "bg-amber-400", chip: "bg-amber-50 text-amber-700" },
  low:    { label: "עדיפות נמוכה",   short: "נמוכה",  accent: "bg-slate-300", dot: "bg-slate-400", chip: "bg-slate-100 text-slate-600" },
};

export const STATUS_META = {
  todo:        { label: "לביצוע",  dot: "text-slate-400" },
  in_progress: { label: "בתהליך",  dot: "text-blue-500" },
  done:        { label: "הושלם",   dot: "text-emerald-500" },
};
export const STATUS_ORDER = ["todo", "in_progress", "done"];

export const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

export const YEARS = [2024, 2025, 2026, 2027];

// Stored as free text in the Control's hl_reviewfrequency (the label is written).
export const FREQUENCY_OPTIONS = [
  { key: "daily", label: "יומי" },
  { key: "weekly", label: "שבועי" },
  { key: "monthly", label: "חודשי" },
  { key: "quarterly", label: "רבעוני" },
  { key: "annual", label: "שנתי" },
];

export const TYPE_FILTERS = [
  { key: "all", label: "הכל" },
  { key: "training", label: "הדרכה" },
  { key: "control", label: "בקרה" },
  { key: "reminder", label: "תזכורת" },
  { key: "report", label: "דוח" },
];

export const NAV = [
  { section: "תכנון ובקרה", items: [
    { key: "dash", label: "לוח בקרה", Icon: LayoutDashboard },
    { key: "tasks", label: "משימות אכיפה", Icon: ClipboardList, active: true },
    // Hidden for now — restore as the screens come online:
    // { key: "plan", label: "תוכנית עבודה", Icon: ClipboardCheck },
    // { key: "subjects", label: "נושאי בקרה", Icon: BarChart3 },
    // { key: "check", label: "בדיקת ציות", Icon: ShieldCheck },
  ]},
  // { section: "דיווח", items: [
  //   { key: "report", label: "דוח בקרה", Icon: FileEdit },
  //   { key: "gaps", label: "מעקב ליקויים", Icon: AlertTriangle },
  //   { key: "alerts", label: "תזכורות", Icon: Bell },
  // ]},
  // { section: "הגדרות", items: [
  //   { key: "setup", label: "הגדרה ראשונית", Icon: Settings },
  // ]},
];
