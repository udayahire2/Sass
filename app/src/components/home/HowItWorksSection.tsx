import { useState, useEffect, useRef } from "react";
import { BookOpen, CheckCircle2, FileText, Search, Upload, Filter, Share2, Layers } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import gsap from "gsap";

const roleSteps = {
  students: [
    {
      id: "01", 
      title: "Choose branch",
      description: "Select your engineering branch and semester to view a filtered subject list.",
      icon: Layers,
    },
    {
      id: "02",
      title: "Pick subject",
      description: "Access curated notes, previous papers, and syllabus relevant to that subject.",
      icon: BookOpen,
    },
    {
      id: "03",
      title: "Start studying",
      description: "Read documents with our centered viewer and review peer ratings.",
      icon: CheckCircle2,
    },
  ],
  uploaders: [
    {
      id: "01",
      title: "Prepare material",
      description: "Format your notes, previous question papers, or syllabus files.",
      icon: FileText,
    },
    {
      id: "02",
      title: "Submit for review",
      description: "Upload via your dashboard. The content enters the moderation queue.",
      icon: Upload,
    },
    {
      id: "03",
      title: "Publish to hub",
      description: "Once approved by administrators, your contribution goes live.",
      icon: Share2,
    },
  ],
  searchers: [
    {
      id: "01",
      title: "Instant query",
      description: "Use global search (Ctrl+K) to find topics or subjects instantly.",
      icon: Search,
    },
    {
      id: "02",
      title: "Filter contents",
      description: "Narrow results down by document type, branch, or semester.",
      icon: Filter,
    },
    {
      id: "03",
      title: "Direct access",
      description: "Jump straight into the document view without navigating hierarchies.",
      icon: CheckCircle2,
    },
  ],
};

export function HowItWorksSection() {
  const roles = Object.keys(roleSteps);
  const [activeTab, setActiveTab] = useState(roles[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP stagger entry animation
  useEffect(() => {
    if (containerRef.current) {
      const stepCards = containerRef.current.querySelectorAll(".gsap-step-card");
      
      gsap.killTweensOf(stepCards);
      gsap.set(stepCards, { opacity: 0, y: 10 });
      
      gsap.to(stepCards, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        overwrite: "auto"
      });
    }
  }, [activeTab]);

  // Automated tab rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((currentTab) => {
        const currentIndex = roles.indexOf(currentTab);
        const nextIndex = (currentIndex + 1) % roles.length;
        return roles[nextIndex];
      });
    }, 4500); // 4.5 seconds rotation threshold for relaxed reading

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="mb-14 space-y-4 max-w-2xl">
          <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
            Platform Workflow
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, automated steps.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We've eliminated complicated steps. Pick a tab below to see how different users navigate and utilize StudyHub.
          </p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full space-y-12"
        >
          {/* Minimalist Tabs List */}
          <div className="flex border-b border-border/60">
            <TabsList className="flex bg-transparent rounded-none p-0 h-auto gap-6 sm:gap-10">
              <TabsTrigger 
                value="students" 
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none border-b-2 border-transparent px-1 pb-4 pt-0 text-xs font-semibold text-muted-foreground transition-all duration-200 cursor-pointer shadow-none"
              >
                For Students
              </TabsTrigger>
              <TabsTrigger 
                value="uploaders" 
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none border-b-2 border-transparent px-1 pb-4 pt-0 text-xs font-semibold text-muted-foreground transition-all duration-200 cursor-pointer shadow-none"
              >
                For Contributors
              </TabsTrigger>
              <TabsTrigger 
                value="searchers" 
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground rounded-none border-b-2 border-transparent px-1 pb-4 pt-0 text-xs font-semibold text-muted-foreground transition-all duration-200 cursor-pointer shadow-none"
              >
                For Searchers
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Steps */}
          <div ref={containerRef}>
            {Object.entries(roleSteps).map(([role, steps]) => (
              <TabsContent key={role} value={role} className="mt-0 outline-none">
                <div className="grid gap-8 sm:grid-cols-3">
                  {steps.map((step) => {
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.title}
                        className="gsap-step-card group flex flex-col space-y-4 will-change-transform"
                      >
                        {/* Number & Icon Wrapper */}
                        <div className="flex items-center justify-between pb-3 border-b border-border/40 group-hover:border-primary/30 transition-colors duration-200">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-muted/10 text-muted-foreground transition-colors duration-200 group-hover:text-primary group-hover:border-primary/20">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xl font-light font-mono text-muted-foreground/30 group-hover:text-primary/30 transition-colors duration-200">
                            {step.id}
                          </span>
                        </div>

                        {/* Text Content */}
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-foreground">
                            {step.title}
                          </h3>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
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