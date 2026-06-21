import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Search,
  Upload,
  Filter,
  Share2,
  Layers,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import gsap from "gsap";

const roleSteps = {
  students: [
    {
      id: "01",
      title: "Choose Branch",
      description:
        "Select your engineering branch and semester to instantly access relevant study materials.",
      icon: Layers,
    },
    {
      id: "02",
      title: "Pick Subject",
      description:
        "Browse notes, previous year papers, practicals, syllabus and important resources.",
      icon: BookOpen,
    },
    {
      id: "03",
      title: "Start Learning",
      description:
        "Study directly inside the platform with a distraction-free reading experience.",
      icon: CheckCircle2,
    },
  ],

  uploaders: [
    {
      id: "01",
      title: "Prepare Material",
      description:
        "Create clean notes, question papers, practical files or academic resources.",
      icon: FileText,
    },
    {
      id: "02",
      title: "Submit Review",
      description:
        "Upload your content through the contributor dashboard for moderation.",
      icon: Upload,
    },
    {
      id: "03",
      title: "Publish Resource",
      description:
        "After approval, your material becomes available to thousands of students.",
      icon: Share2,
    },
  ],

  searchers: [
    {
      id: "01",
      title: "Search Instantly",
      description:
        "Use global search to quickly find subjects, topics or study documents.",
      icon: Search,
    },
    {
      id: "02",
      title: "Apply Filters",
      description:
        "Filter by branch, semester, document type or specific academic category.",
      icon: Filter,
    },
    {
      id: "03",
      title: "Open & Study",
      description:
        "Jump directly into the document without navigating multiple pages.",
      icon: CheckCircle2,
    },
  ],
};

export function HowItWorksSection() {
  const roles = Object.keys(roleSteps);

  const [activeTab, setActiveTab] = useState("students");

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cards =
      containerRef.current.querySelectorAll(".workflow-card");

    gsap.killTweensOf(cards);

    gsap.set(cards, {
      opacity: 0,
      y: 20,
    });

    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: "power2.out",
    });
  }, [activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = roles.indexOf(current);
        return roles[(currentIndex + 1) % roles.length];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-20 md:py-24 dark:bg-[radial-gradient(35%_128px_at_50%_0%,--theme(--color-foreground/.04),transparent)]">
      {/* Top Divider & Decoration */}
      <div className="absolute top-0 right-1/2 left-1/2 h-px w-full max-w-5xl -translate-x-1/2 bg-linear-to-r via-border/60" />

      <div className="relative mx-auto max-w-5xl px-6 md:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-primary">
            Platform Workflow
          </div>

          <h2 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            How Study Mate Works
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Access notes, previous year papers, practical files and study
            resources through a simple and structured workflow designed for
            engineering students.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* Tabs */}
          <div className="mb-14 flex justify-center">
            <TabsList className="h-auto rounded-xl border border-border bg-card p-1 shadow-sm">
              <TabsTrigger
                value="students"
                className="
                  rounded-lg
                  px-6
                  py-2.5
                  text-sm
                  font-medium
                  transition-all
                  data-[state=active]:bg-primary
                  data-[state=active]:text-white
                "
              >
                Students
              </TabsTrigger>

              <TabsTrigger
                value="uploaders"
                className="
                  rounded-lg
                  px-6
                  py-2.5
                  text-sm
                  font-medium
                  transition-all
                  data-[state=active]:bg-primary
                  data-[state=active]:text-white
                "
              >
                Contributors
              </TabsTrigger>

              <TabsTrigger
                value="searchers"
                className="
                  rounded-lg
                  px-6
                  py-2.5
                  text-sm
                  font-medium
                  transition-all
                  data-[state=active]:bg-primary
                  data-[state=active]:text-white
                "
              >
                Searchers
              </TabsTrigger>
            </TabsList>
          </div>

          <div ref={containerRef}>
            {Object.entries(roleSteps).map(([role, steps]) => (
              <TabsContent
                key={role}
                value={role}
                className="mt-0"
              >
                <div className="grid gap-6 md:grid-cols-3">
                  {steps.map((step, index) => {
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.title}
                        className="
                          workflow-card
                          group
                          relative
                          rounded-2xl
                          border
                          border-border
                          bg-card
                          p-7
                          transition-all
                          duration-300
                          hover:-translate-y-0.5
                          hover:border-primary/30
                          hover:shadow-lg
                        "
                      >
                        {/* connector */}
                        {index !== steps.length - 1 && (
                          <div
                            className="
                              absolute
                              left-full
                              top-10
                              hidden
                              h-px
                              w-6
                              bg-border/60
                              md:block
                            "
                          />
                        )}

                        {/* top */}
                        <div className="mb-6 flex items-center justify-between">
                          <div
                            className="
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

                          <span
                            className="
                              text-4xl
                              font-bold
                              text-primary/15
                              select-none
                            "
                          >
                            {step.id}
                          </span>
                        </div>

                        {/* content */}
                        <h3 className="mb-2 text-lg font-semibold text-foreground">
                          {step.title}
                        </h3>

                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
}
