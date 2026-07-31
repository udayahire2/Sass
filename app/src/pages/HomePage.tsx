import { Hero } from "@/components/home/Hero";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { RecentActivitySection } from "@/components/home/RecentActivitySection";
import { CallToAction } from "@/components/home/CallToAction";
import { useLocalAuth } from "@/hooks/use-local-auth";

export default function HomePage() {
  const { user } = useLocalAuth();

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-background selection:bg-primary/20 selection:text-primary">
      {/* Very subtle background accent – Notion uses almost none */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 opacity-30 blur-[120px]" />
      </div>

      {/* Sections – each with consistent vertical spacing */}
      <Hero />

      {user && (
        <section className="border-t border-border/40 bg-card/50 py-16 md:py-20 rounded-4xl">
          <div className="container mx-auto px-4 sm:px-6">
            <RecentActivitySection userName={user.name} />
          </div>
        </section>
      )}

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <FeatureGrid />
        </div>
      </section>

      <section className="border-t border-border/40 py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <HowItWorksSection />
        </div>
      </section>

      <section className="border-t border-border/40 rounded-4xl bg-card/50 py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <CallToAction />
        </div>
      </section>
    </main>
  );
}