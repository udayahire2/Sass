import { Link } from "react-router-dom";
import { BookOpen, FileText, UserCircle, Search } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Separator } from "@/components/ui/separator";

const studyLinks = [
  { label: "Study Materials", to: "/resources", icon: BookOpen },
  { label: "Search Notes", to: "/search", icon: Search },
  { label: "Syllabus Breakdown", to: "/syllabus", icon: FileText },
  { label: "Student Dashboard", to: "/dashboard/student", icon: UserCircle },
];

export function Footer() {
  return (
    <footer className="w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-8 pt-16 pb-12">
        <Separator className="mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {/* Brand Column */}
          <div className="flex flex-col items-start space-y-4">
            <Logo className="h-5" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A streamlined study hub for university students to access notes, syllabus details, and previous exam papers quickly.
            </p>
          </div>

          {/* Navigation Links Column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {studyLinks.map(({ label, to, icon: Icon }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                  >
                    <Icon className="h-4 w-4 opacity-70" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Support Column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              Community & Support
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Have questions or want to contribute study materials to your branch?
            </p>
            <a
              href="mailto:support@nmuhub.edu"
              className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              Contact Support & Contributions
            </a>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} NMU Study Hub. Built for students, by students.</p>
          <div className="flex items-center gap-4">
            <Link to="/how-to-use" className="hover:text-foreground transition-colors">
              How it works
            </Link>
            <Separator orientation="vertical" className="h-3" />
            <Link to="/resources" className="hover:text-foreground transition-colors">
              All Materials
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}