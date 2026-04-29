import { FeatureGrid } from "@/components/home/FeatureGrid";
import { Hero } from "@/components/home/Hero";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";

export default function HomePage() {
  return (
    <main className="flex min-h-screen w-full flex-col pb-8 pt-6 sm:pt-8">
      <Hero />
      <FeatureGrid />
      <HowItWorksSection />
    </main>
  );
}
