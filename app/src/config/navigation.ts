import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  BookOpen,
  FileQuestion,
  Files,
  Sparkles,
} from "lucide-react";

export const ROUTES = {
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_APPROVALS: "/admin/approvals",
  ADMIN_STUDENTS: "/admin/students",
  ADMIN_SUBJECTS: "/admin/subjects",
  ADMIN_SYLLABUS: "/admin/syllabus",
  ADMIN_RESOURCES: "/admin/resources",
  ADMIN_EXAM_INTELLIGENCE: "/admin/exam-intelligence",
  ADMIN_IMP_QUESTIONS: "/admin/imp-questions",
  ADMIN_SAMPLE_PAPERS: "/admin/sample-papers",
  ADMIN_FACULTY: "/admin/faculty",
  ADMIN_FEEDBACK: "/admin/feedback",
} as const;

export const ADMIN_NAV_SECTIONS = [
  {
    label: "Workspace",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD },
      { icon: ClipboardCheck, label: "Approvals", path: ROUTES.ADMIN_APPROVALS },
      { icon: Users, label: "Students", path: ROUTES.ADMIN_STUDENTS },
    ],
  },
  {
    label: "Content",
    items: [
      { icon: BookOpen, label: "Curriculum", path: ROUTES.ADMIN_SUBJECTS },
      { icon: BookOpen, label: "Syllabus", path: ROUTES.ADMIN_SYLLABUS },
      { icon: BookOpen, label: "Resources", path: ROUTES.ADMIN_RESOURCES },
      { icon: Sparkles, label: "Exam Intelligence", path: ROUTES.ADMIN_EXAM_INTELLIGENCE },
      { icon: FileQuestion, label: "IMP Questions", path: ROUTES.ADMIN_IMP_QUESTIONS },
      { icon: Files, label: "Sample Papers", path: ROUTES.ADMIN_SAMPLE_PAPERS },
      { icon: Users, label: "Faculty", path: ROUTES.ADMIN_FACULTY },
      { icon: Users, label: "Feedback", path: ROUTES.ADMIN_FEEDBACK },
    ],
  },
];

// O(1) lookup map for breadcrumbs
export const ROUTE_LABELS = ADMIN_NAV_SECTIONS.reduce((acc, section) => {
  section.items.forEach((item) => {
    acc[item.path] = item.label;
  });
  return acc;
}, {} as Record<string, string>);