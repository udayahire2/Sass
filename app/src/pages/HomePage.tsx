import { Hero } from "@/components/home/Hero";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { CallToAction } from "@/components/home/CallToAction";

export default function HomePage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <Hero />
      <FeatureGrid />
      <CallToAction />
    </main>
  );
}
