import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookmarkIcon,
  History,
  Upload
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface RecentActivityProps {
  userName?: string;
}

const activities = [
  {
    title: "Continue studying",
    description: "Resume from Data Structures - Unit 3",
    buttonText: "Resume",
    icon: History,
    path: "/resources",
  },
  {
    title: "Your bookmarks",
    description: "8 saved materials ready to revisit",
    buttonText: "View all",
    icon: BookmarkIcon,
    path: "/profile/bookmarks",
  },
  {
    title: "Share materials",
    description: "Upload notes and help classmates learn faster",
    buttonText: "Upload now",
    icon: Upload,
    path: "/profile/",
  },
];

export function RecentActivitySection({
  userName,
}: RecentActivityProps) {
  const navigate = useNavigate();

  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <Badge
            variant="outline"
            className="border-border/60 text-muted-foreground mb-5 rounded-full px-3 py-1 font-medium"
          >
            Dashboard
          </Badge>

          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-heading tracking-tight text-balance  text-foreground">
              {userName
                ? `Welcome back, ${userName.split(" ")[0]}`
                : "Continue your study journey"}
            </h2>

            <p className="text-base leading-7 text-muted-foreground">
              Quickly access your recent learning activity, saved resources,
              and uploaded study materials.
            </p>
          </div>
        </div>

        {/* Activity Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                className="group overflow-hidden border-border bg-card shadow-sm transition-all hover:shadow-md"
              >
                <CardContent className="flex h-full flex-col p-6">
                  {/* Icon */}
                  <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-muted/30">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-medium tracking-tight text-foreground">
                      {item.title}
                    </h3>

                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <Button
                    variant="outline"
                    className="mt-8 justify-between border-border/60 hover:bg-muted/30"
                    onClick={() => navigate(item.path)}
                  >
                    {item.buttonText}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}