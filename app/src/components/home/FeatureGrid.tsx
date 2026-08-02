import { BookMarked, Layers, FileText, BrainCircuit } from "lucide-react";

export function FeatureGrid() {
  const features = [
    {
      title: "Digital Library",
      description: "Access curated notes, study guides, and reference materials tailored specifically for your university curriculum.",
      icon: <BookMarked className="h-5 w-5" />,
    },
    {
      title: "Syllabus Tracking",
      description: "Stay aligned with your coursework through structured syllabus breakdowns for every semester.",
      icon: <Layers className="h-5 w-5" />,
    },
    {
      title: "Past Papers",
      description: "Prepare effectively with real past examination papers to master question patterns and timing.",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Smart Recommendations",
      description: "Discover high-impact materials suggested for your specific current semester and subject list.",
      icon: <BrainCircuit className="h-5 w-5" />,
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl  font-heading tracking-tight text-foreground">
            Everything you need to excel
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Essential tools and materials organized intuitively to streamline your study process.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="shrink-0 p-2.5 rounded-lg border border-border/30 bg-muted/30 text-foreground">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}