import { BookOpen, CheckCircle2, FileText } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Choose branch",
    description: "Select your branch and semester. See only what matters.",
    icon: BookOpen,
  },
  {
    id: "02",
    title: "Open subject",
    description: "Access curated material specifically for your curriculum.",
    icon: FileText,
  },
  {
    id: "03",
    title: "Start studying",
    description: "Find notes, lectures, and key points in one unified place.",
    icon: CheckCircle2,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        
        {/* Header */}
        <div className="mb-16 md:mb-20 text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">
            How it works
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Get started in 3 steps
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            A simple, noise-free flow designed to get you from searching to studying in seconds.
          </p>
        </div>

        {/* Minimal Steps Layout */}
        <div className="grid gap-10 md:grid-cols-3 md:gap-x-12">
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
      </div>
    </section>
  );
}
