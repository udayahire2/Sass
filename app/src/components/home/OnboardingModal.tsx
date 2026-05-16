import { useState, useEffect } from "react";
import { BookOpen, Search, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useLocalAuth } from "@/hooks/use-local-auth";

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useLocalAuth();

  useEffect(() => {
    // Only show to students or unauthenticated users, and only once
    const hasSeenOnboarding = localStorage.getItem("has_seen_onboarding");
    if (!hasSeenOnboarding && (!user || user.role === "student")) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem("has_seen_onboarding", "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/50 bg-background shadow-2xl"
            >
              <div className="absolute right-4 top-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Header Image/Pattern */}
              <div className="h-32 w-full bg-gradient-to-br from-primary/20 via-primary/5 to-background p-6 flex items-end">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-border/50">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Before you start...
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Welcome to NMU Study Hub! Here's everything you need to know to get the most out of the platform.
                </p>

                <div className="mt-8 space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Find exactly what you need</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Search syllabus by subject code (e.g., EC-101). Use bookmarks to save materials for later.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Share and help others</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Upload notes, papers, or study guides. They'll be reviewed within 24-48 hours.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {["Computer", "IT", "Civil", "Mechanical", "Electrical"].map(branch => (
                          <span key={branch} className="inline-flex items-center rounded-md bg-muted/50 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                            {branch}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border/40">
                  <Button className="w-full" size="lg" onClick={handleDismiss}>
                    Got it, let's start
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
