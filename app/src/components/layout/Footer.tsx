import { cn } from "@/lib/utils";
import { BookOpen, FileText, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";

// Content from the second footer (unchanged)
const studyLinks = [
  { label: "Study Materials", to: "/resources", icon: BookOpen },
  { label: "Syllabus", to: "/syllabus", icon: FileText },
  { label: "Profile", to: "/profile", icon: UserCircle },
];

export function Footer() {
  return (
    <footer
      className={cn(
        "relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center rounded-t-4xl border-t px-6 md:rounded-t-6xl md:px-8",
        "dark:bg-[radial-gradient(35%_128px_at_50%_0%,--theme(--color-foreground/.1),transparent)]"
      )}
    >
      {/* Decorative top line */}
      <div className="absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/20 blur" />

      <div className="grid w-full gap-8 py-6 md:py-8 lg:grid-cols-3 lg:gap-8">
        {/* Brand column */}
        <div className="space-y-4">
          <Logo className="h-4" />
          <p className="mt-8 text-sm text-muted-foreground md:mt-0">
            A lighter study space for students who want notes, syllabus details,
            and previous papers without extra clutter.
          </p>
          <p className="text-sm text-muted-foreground">
            Built for quick study sessions on phone and laptop.
          </p>
        </div>

        {/* Right side – two columns (Study & Help) */}
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:col-span-2 lg:mt-0">
          {/* Study links */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider">
              Study
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {studyLinks.map(({ label, to, icon: Icon }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="inline-flex items-center gap-2 duration-250 hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help column */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider">
              Help
            </h3>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>
                Choose the subject, open the topic, and start reading in a clean
                layout.
              </p>
              <a
                href="mailto:contribute@example.com"
                className="inline-flex text-foreground underline underline-offset-4"
              >
                Contact support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom separator and copyright */}
      <div className="h-px w-full bg-linear-to-r via-border" />
      <div className="flex w-full items-center justify-center py-4">
        <p className="text-sm text-muted-foreground">
          © 2026 NMU Study Hub · Built by Students For Students
        </p>
      </div>
    </footer>
  );
}