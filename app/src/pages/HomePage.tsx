import { useLocalAuth } from "@/hooks/use-local-auth";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { Hero } from "@/components/home/Hero";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { RecentActivitySection } from "@/components/home/RecentActivitySection";

export default function HomePage() {
  const { user } = useLocalAuth();

  return (
    <main className="flex min-h-screen w-full flex-col pb-8 pt-6 sm:pt-8">
      <Hero />

      {/* Show recent activity for logged-in students */}
      {user && user.role === "student" && (
        <RecentActivitySection userName={user.name} />
      )}

      <FeatureGrid />

      {/* Show how-to guide only for non-authenticated users or faculty/admin */}
      {!user && <HowItWorksSection />}
    </main>
  );
}

