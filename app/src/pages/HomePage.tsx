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
      {/* Decorative background gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 opacity-60 blur-[120px] mix-blend-screen" />
        <div className="absolute right-[-10%] top-[30%] -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/10 opacity-50 blur-[100px] mix-blend-screen" />
      </div>
      
      <Hero />
      {user && <RecentActivitySection userName={user.name} />}
      <FeatureGrid />
      <HowItWorksSection />
      <CallToAction />
    </main>
  );
}
