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
import { Badge } from "@/components/ui/badge";
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

// Moved outside to prevent recreation on every render
const roles = Object.keys(roleSteps);

export function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState(roles[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle GSAP Animations safely for React 18+
  useEffect(() => {
    if (!containerRef.current) return;

    // Use gsap.context for automatic cleanup in Strict Mode
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".workflow-card",
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.12,
          ease: "power1.out",
        }
      );
    }, containerRef);

    return () => ctx.revert(); // Cleanup function
  }, [activeTab]);

  // Handle auto-tab rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = roles.indexOf(current);
        return roles[(currentIndex + 1) % roles.length];
      });
    }, 5000);

    // Clears the interval on unmount OR if activeTab changes manually
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <section className="relative py-20 md:py-24">
      <div className="relative mx-auto max-w-5xl px-6 md:px-8">
        
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge variant="secondary" className="p-2">
            Platform Workflow
          </Badge>

          <h2 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
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
          <div ref={containerRef}>
            {Object.entries(roleSteps).map(([role, steps]) => (
              <TabsContent key={role} value={role} className="mt-0">
                <div className="grid gap-6 md:grid-cols-3">
                  {steps.map((step, index) => {
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.title}
                        className="workflow-card group relative rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
                      >
                        {/* Connector Line */}
                        {index !== steps.length - 1 && (
                          <div className="absolute left-full top-10 hidden h-px w-6 bg-border/60 md:block" />
                        )}

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