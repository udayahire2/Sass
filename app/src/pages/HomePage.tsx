import { Hero } from "@/components/home/Hero";

export default function HomePage() {

  return (
    <main className="flex min-h-screen w-full flex-col sm:pt-8">
      <Hero />

      {/* Show recent activity for logged-in students */}
      {/* {user && user.role === "student" && (
        <RecentActivitySection userName={user.name} />
      )}

      <FeatureGrid /> */}

      {/* Show how-to guide only for non-authenticated users or faculty/admin */}
      {/* {user && <HowItWorksSection />} */}
    </main>
  );
}

