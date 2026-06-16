import { createElement } from "react";
import {
  LayoutDashboard, ClipboardList, ClipboardCheck, BarChart3,
  FileEdit, AlertTriangle, Bell as BellLucide, Settings,
} from "lucide-react";
import {
  GraduationCap as PhGraduationCap,
  ShieldCheck as PhShieldCheck,
  Bell as PhBell,
  FileText as PhFileText,
} from "@phosphor-icons/react";

// Content icons render in Phosphor's "duotone" weight — a softer, branded
// two-tone look (vs. flat single-stroke). Chrome icons (nav, chevrons) stay
// on Lucide so the contrast keeps the layout calm.
const ICON_WEIGHT = "duotone";
const ph = (PhosphorIcon) =>
  function Icon(props) {
    return createElement(PhosphorIcon, { weight: ICON_WEIGHT, ...props });
  };

// One accent for all task types: marine tile + duotone icon. The icon shape
// carries the type meaning; color isn't doing extra work, so the page reads
// as a product instead of a multicolored AI dashboard.
const TYPE_TILE = "bg-marine-50 text-marine-600";

export const TYPE_META = {
  training: { label: "הדרכה",  dot: "text-marine-500", Icon: ph(PhGraduationCap), tile: TYPE_TILE },
  control:  { label: "בקרה",   dot: "text-marine-500", Icon: ph(PhShieldCheck),   tile: TYPE_TILE },
  reminder: { label: "תזכורת", dot: "text-marine-500", Icon: ph(PhBell),          tile: TYPE_TILE },
  report:   { label: "דוח",    dot: "text-marine-500", Icon: ph(PhFileText),      tile: TYPE_TILE },
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

// Nav groups. `active` is derived from the current view in the Sidebar.
// `enabled` marks which keys actually route somewhere today; the others are
// rendered as placeholders so the menu reflects the full surface but the user
// can't navigate to dead screens.
export const NAV = [
  { section: "תכנון ובקרה", items: [
    { key: "dash",     label: "לוח בקרה",       Icon: LayoutDashboard, enabled: true  },
    { key: "tasks",    label: "משימות אכיפה",   Icon: ClipboardList,   enabled: true  },
    { key: "plan",     label: "תוכנית עבודה",   Icon: ClipboardCheck,  enabled: true  },
    { key: "subjects", label: "נושאי בקרה",     Icon: BarChart3,       enabled: true  },
  ]},
  { section: "דיווח", items: [
    { key: "report",   label: "דוח בקרה",       Icon: FileEdit,        enabled: false },
    { key: "gaps",     label: "מעקב ליקויים",   Icon: AlertTriangle,   enabled: false },
    { key: "alerts",   label: "תזכורות",        Icon: BellLucide,      enabled: false },
  ]},
  { section: "הגדרות", items: [
    { key: "setup",    label: "הגדרה ראשונית",  Icon: Settings,        enabled: true  },
  ]},
];

// Flat module list for the dashboard's "מודולי המערכת" grid — every screen
// the product exposes, with a one-line description. Keys match NAV keys.
export const MODULES = [
  { key: "tasks",    title: "משימות אכיפה",    desc: "תוכנית עבודה רבעונית — הדרכות, בקרות, תזכורות ודוחות" },
  { key: "plan",     title: "תוכנית עבודה",    desc: "הפקת תוכנית עבודה שנתית מתוך סקר הציות ותוכנית האכיפה" },
  { key: "subjects", title: "נושאי בקרה",      desc: "הצעת נושאים לבדיקה רבעונית לפי דירוג הסיכון השיורי" },
  { key: "report",   title: "דוח בקרה",        desc: "ריכוז ממצאי הרבעון והפקת דוח בקרה פנימי מובנה" },
  { key: "gaps",     title: "מעקב ליקויים",    desc: "רישום, מעקב וסגירה של ליקויים שזוהו בבקרה" },
  { key: "alerts",   title: "תזכורות",         desc: "התראות על חלונות שתיקה, הדרכות ויעדים מתקרבים" },
  { key: "setup",    title: "הגדרה ראשונית",   desc: "העלאת סקר ציות ותוכנית אכיפה למיפוי בקרות ראשוני" },
];
