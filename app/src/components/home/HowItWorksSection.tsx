import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";

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

const roles = Object.keys(roleSteps);

export function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState(roles[0]);

  // Auto-rotate tabs
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
    <section className="relative py-16 md:py-20">
      <div className="relative mx-auto max-w-5xl px-6 md:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge variant="outline" className="border-border/60 text-muted-foreground">
            Platform Workflow
          </Badge>

          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            How Study Mate Works
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Access notes, previous year papers, practical files and study
            resources through a simple and structured workflow designed for
            engineering students.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Navigation */}
          <div className="mb-14 flex justify-center">
            <TabsList>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="uploaders">Contributors</TabsTrigger>
              <TabsTrigger value="searchers">Searchers</TabsTrigger>
            </TabsList>
          </div>

          {/* Cards Container */}
          <div>
            {Object.entries(roleSteps).map(([role, steps]) => (
              <TabsContent key={role} value={role} className="mt-0">
                <div className="grid gap-6 md:grid-cols-3">
                  {steps.map((step) => {
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.title}
                        className="group relative rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-300"
                      >
                        {/* Card Header */}
                        <div className="mb-6 flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="select-none text-4xl font-bold text-primary/15">
                            {step.id}
                          </span>
                        </div>

                        {/* Card Content */}
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