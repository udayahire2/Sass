import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookmarkIcon,
  History,
  Upload
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface RecentActivityProps {
  userName?: string;
}

const activities = [
  {
    title: "Continue studying",
    description: "Resume from where you left off. Quick access to your last subject and unit.",
    buttonText: "Resume",
    icon: History,
    path: "/resources",
  },
  {
    title: "Your bookmarks",
    description: "Revisit your saved study resources, notes, and exam papers.",
    buttonText: "View bookmarks",
    icon: BookmarkIcon,
    path: "/dashboard/student/bookmarks",
  },
  {
    title: "Contribute notes",
    description: "Upload learning material or question banks to support your class peers.",
    buttonText: "Upload now",
    icon: Upload,
    path: "/dashboard/student/uploads",
  },
];

export function RecentActivitySection({
  userName,
}: RecentActivityProps) {
  const navigate = useNavigate();

  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-14 space-y-4 max-w-2xl">
          <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
            Personal Workspace
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {userName
              ? `Welcome back, ${userName.split(" ")[0]}.`
              : "Continue your study journey."}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Jump back into your recent activity, review bookmarks, or upload study resources directly from your student dashboard.
          </p>
        </div>

        {/* Activity Border-Grid */}
        <div className="grid grid-cols-1 border-t border-l border-border/60 sm:grid-cols-3">
          {activities.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group flex flex-col justify-between border-r border-b border-border/60 p-6 bg-card/10 hover:bg-muted/5 transition-colors duration-200"
              >
                <div className="space-y-6">
                  {/* Icon */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-muted/10 text-muted-foreground transition-colors duration-200 group-hover:text-primary group-hover:border-primary/20">
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Button CTA */}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-8 justify-between text-xs rounded font-medium border-border/80 hover:border-primary/40"
                  onClick={() => navigate(item.path)}
                >
                  <span>{item.buttonText}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
