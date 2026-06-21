import { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  FileText,
  GraduationCap,
  X,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useLocalAuth } from "@/hooks/use-local-auth";

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useLocalAuth();

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(
      "has_seen_onboarding"
    );

    if (!hasSeenOnboarding && (!user || user.role === "student")) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleDismiss = () => {
    localStorage.setItem("has_seen_onboarding", "true");
    setIsOpen(false);
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
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
          />

          {/* Modal */}

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 24,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 24,
              }}
              transition={{
                duration: 0.25,
                ease: "easeOut",
              }}
              className="
                pointer-events-auto
                relative
                w-full
                max-w-xl
                overflow-hidden
                rounded-3xl
                border
                border-border
                bg-card
                shadow-2xl
              "
            >
              {/* Close */}

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="
                  absolute
                  right-4
                  top-4
                  z-10
                  h-8
                  w-8
                  rounded-full
                  text-muted-foreground
                "
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Top Section */}

              <div className="relative overflow-hidden border-b border-border">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />

                <div className="relative p-8">
                  <div
                    className="
                      mb-5
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-primary/10
                      text-primary
                    "
                  >
                    <GraduationCap className="h-7 w-7" />
                  </div>

                  <div className="space-y-3">
                    <div
                      className="
                        inline-flex
                        items-center
                        rounded-full
                        border
                        border-border
                        bg-background/70
                        px-3
                        py-1
                        text-xs
                        font-medium
                        text-primary
                      "
                    >
                      Welcome to Study Mate
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                      Everything you need for your semester.
                    </h2>

                    <p className="max-w-lg text-muted-foreground">
                      Access notes, previous year question papers,
                      practical files and syllabus resources organized
                      by branch and semester.
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}

              <div className="p-8">
                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-primary/10
                        text-primary
                      "
                    >
                      <Search className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground">
                        Find resources instantly
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Search subjects, notes and materials in
                        seconds using our fast search experience.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-primary/10
                        text-primary
                      "
                    >
                      <BookOpen className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground">
                        Semester-wise organization
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Browse study materials neatly organized by
                        branch, semester and subject.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-primary/10
                        text-primary
                      "
                    >
                      <FileText className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground">
                        Community powered
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Students and contributors upload notes,
                        papers and practical files to help others.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}

                <div
                  className="
                    mt-8
                    grid
                    grid-cols-3
                    gap-3
                    rounded-2xl
                    border
                    border-border
                    bg-muted/30
                    p-4
                  "
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">Notes</div>
                    <div className="text-xs text-muted-foreground">
                      Study Material
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold">PYQs</div>
                    <div className="text-xs text-muted-foreground">
                      Previous Papers
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold">Free</div>
                    <div className="text-xs text-muted-foreground">
                      For Students
                    </div>
                  </div>
                </div>

                {/* Footer */}

                <div className="mt-8">
                  <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={handleDismiss}
                  >
                    Start Exploring
                    <ArrowRight className="h-4 w-4" />
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
