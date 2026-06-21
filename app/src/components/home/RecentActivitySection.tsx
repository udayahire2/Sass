import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookmarkIcon,
  History,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface RecentActivityProps {
  userName?: string;
}

const activities = [
  {
    title: "Continue Studying",
    description:
      "Resume your learning journey and quickly access recently viewed study materials.",
    buttonText: "Resume",
    icon: History,
    path: "/resources",
  },
  {
    title: "Bookmarks",
    description:
      "Open your saved notes, practical files, question papers and important resources.",
    buttonText: "View Bookmarks",
    icon: BookmarkIcon,
    path: "/dashboard/student/bookmarks",
  },
  {
    title: "Upload Resources",
    description:
      "Contribute notes, PYQs and study materials to help fellow students.",
    buttonText: "Upload Now",
    icon: Upload,
    path: "/dashboard/student/uploads",
  },
];

export function RecentActivitySection({
  userName,
}: RecentActivityProps) {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-24 dark:bg-[radial-gradient(35%_128px_at_50%_0%,--theme(--color-foreground/.04),transparent)]">
      {/* Top Divider & Decoration */}
      <div className="absolute top-0 right-1/2 left-1/2 h-px w-full max-w-5xl -translate-x-1/2 bg-linear-to-r via-border/60" />

      <div className="relative mx-auto max-w-5xl px-6 md:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div
            className="
              inline-flex
              items-center
              rounded-full
              border
              border-border
              bg-muted/40
              px-4
              py-1.5
              text-xs
              font-medium
              text-primary
            "
          >
            Personal Workspace
          </div>

          <h2 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {userName
              ? `Welcome back, ${userName.split(" ")[0]}`
              : "Continue Your Study Journey"}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Access your recent activity, saved resources and contribution tools
            from one place.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {activities.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-border
                  bg-card
                  p-7
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-primary/20
                  hover:shadow-lg
                "
              >
                {/* Background Accent */}
                <div
                  className="
                    absolute
                    inset-x-0
                    top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-primary/40
                    to-transparent
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                  "
                />

                <div className="flex h-full flex-col">
                  {/* Icon */}
                  <div
                    className="
                      mb-6
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-xl
                      bg-primary/10
                      text-primary
                    "
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <Button
                    variant="outline"
                    className="
                      mt-8
                      justify-between
                      rounded-lg
                      border-border
                      transition-all
                      duration-300
                      group-hover:border-primary/20
                    "
                    onClick={() => navigate(item.path)}
                  >
                    <span>{item.buttonText}</span>

                    <ArrowRight
                      className="
                        h-4
                        w-4
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                      "
                    />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
