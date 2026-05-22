import {
  HelpCircle,
  Search,
  UploadCloud,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

const sections = [
  {
    title: "Finding study materials",
    description:
      "Browse syllabus, notes, and previous papers organized by semester and branch.",

    icon: Search,

    iconClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400",

    numberClass:
      "border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400",

    steps: [
      "Open the Resources section from the navigation bar.",
      "Select your branch, semester, and subject.",
      "Use global search (Ctrl + K) to quickly find topics.",
      "Bookmark important materials for later access.",
    ],
  },

  {
    title: "Contributing content",
    description:
      "Upload notes, PDFs, and academic resources for other students.",

    icon: UploadCloud,

    iconClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",

    numberClass:
      "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",

    steps: [
      "Open your profile dashboard.",
      "Navigate to the Add Content section.",
      "Fill in resource details and upload your file.",
      "Submitted resources are reviewed before publishing.",
    ],
  },

  {
    title: "Faculty workflows",
    description:
      "Dedicated tools and faster publishing flow for faculty members.",

    icon: Users,

    iconClass:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400",

    numberClass:
      "border-violet-500/20 bg-violet-500/5 text-violet-600 dark:text-violet-400",

    steps: [
      "Faculty accounts include a dedicated dashboard.",
      "Track uploaded resources and engagement.",
      "Faculty uploads receive faster moderation review.",
      "Manage assigned subjects and academic contributions.",
    ],
  },

  {
    title: "Need more help?",
    description:
      "Send feedback, report issues, or request platform improvements.",

    icon: HelpCircle,

    iconClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400",

    numberClass:
      "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400",

    steps: [
      "Use the Feedback page to report bugs.",
      "Request new features or subjects.",
      "Share suggestions to improve the platform experience.",
      "All feedback submissions are actively reviewed.",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function HowToUsePage() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4">
        
        {/* Header */}
        <div className="mb-14 flex flex-col items-center text-center">
          
          <Badge
            variant="secondary"
            className="mb-5 rounded-full px-3 py-1 font-medium"
          >
            Help Center
          </Badge>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              Learn how to use
              <span className="text-muted-foreground">
                {" "}
                NMU Study Hub.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              A quick guide to navigating study materials,
              uploading resources, and using platform features
              effectively.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <Card
                key={section.title}
                className="group border-border/60 bg-background shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/30"
              >
                <CardContent className="flex h-full flex-col p-6 lg:p-8">
                  
                  {/* Icon */}
                  <div
                    className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 transition-transform duration-200 group-hover:scale-105 ${section.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    
                    {/* Title */}
                    <div className="space-y-2">
                      <h2 className="text-xl font-medium tracking-tight">
                        {section.title}
                      </h2>

                      <p className="text-sm leading-6 text-muted-foreground md:text-base">
                        {section.description}
                      </p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-3 pt-1">
                      {section.steps.map(
                        (step, index) => (
                          <div
                            key={step}
                            className="flex items-start gap-3"
                          >
                            <div
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${section.numberClass}`}
                            >
                              {index + 1}
                            </div>

                            <p className="text-sm leading-6 text-muted-foreground">
                              {step}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}