import { useState } from "react";
import { BookOpen, CheckCircle2, FileText, Search, Upload, Filter, Share2, Layers } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const roleSteps = {
  students: [
    {
      id: "01",
      title: "Choose branch",
      description: "Select your branch and semester. See only what matters.",
      icon: Layers,
    },
    {
      id: "02",
      title: "Pick subject",
      description: "Access curated material specifically for your curriculum.",
      icon: BookOpen,
    },
    {
      id: "03",
      title: "Start studying",
      description: "Find notes, lectures, and key points in one unified place.",
      icon: CheckCircle2,
    },
  ],
  uploaders: [
    {
      id: "01",
      title: "Prepare material",
      description: "Get your notes, PDFs, or links ready to share.",
      icon: FileText,
    },
    {
      id: "02",
      title: "Submit for review",
      description: "Upload content. It gets reviewed in 24-48 hours.",
      icon: Upload,
    },
    {
      id: "03",
      title: "Help classmates",
      description: "Once approved, your material helps hundreds of students.",
      icon: Share2,
    },
  ],
  searchers: [
    {
      id: "01",
      title: "Use search bar",
      description: "Press Ctrl+K or use the search bar to find topics instantly.",
      icon: Search,
    },
    {
      id: "02",
      title: "Filter by type",
      description: "Narrow down by syllabus, notes, or previous papers.",
      icon: Filter,
    },
    {
      id: "03",
      title: "Find what you need",
      description: "Jump straight to the exact material without browsing.",
      icon: CheckCircle2,
    },
  ],
};

export function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState("students");

  return (
    <section className="py-24 bg-background">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        
        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">
            How it works
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Simple workflows for everyone
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Whether you're studying for an exam or sharing your notes, we've made it effortless.
          </p>
        </div>

        <Tabs defaultValue="students" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted/50 p-1">
              <TabsTrigger value="students" className="rounded-md">For Students</TabsTrigger>
              <TabsTrigger value="uploaders" className="rounded-md">For Uploaders</TabsTrigger>
              <TabsTrigger value="searchers" className="rounded-md">For Searchers</TabsTrigger>
            </TabsList>
          </div>

          {Object.entries(roleSteps).map(([role, steps]) => (
            <TabsContent key={role} value={role} className="mt-0 outline-none">
              <div className="grid gap-10 md:grid-cols-3 md:gap-x-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {steps.map((step) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.title}
                      className="group flex flex-col"
                    >
                      {/* Structural Top Divider & Icon Box */}
                      <div className="flex items-end justify-between border-b border-border/60 pb-5 mb-6 transition-colors duration-300 group-hover:border-foreground/20">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-border/80 bg-card shadow-sm text-foreground transition-all duration-300 group-hover:bg-muted/50 group-hover:shadow-md">
                          <Icon className="h-[22px] w-[22px] text-foreground/80 transition-colors group-hover:text-foreground" />
                        </div>
                        <div className="text-3xl font-light tracking-tighter text-muted-foreground/30 font-mono transition-colors duration-300 group-hover:text-muted-foreground/50">
                          {step.id}
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold tracking-tight text-foreground mb-3">
                          {step.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground max-w-[95%]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
