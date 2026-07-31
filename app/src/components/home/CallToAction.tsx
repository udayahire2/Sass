import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CallToAction() {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 md:px-8 text-center flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          Ready to boost your grades?
        </h2>
        
        <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
          Join thousands of students using NMU Study Hub to study smarter. Instant access to all materials.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Button 
            size="lg" 
            className="w-full sm:w-auto h-11 px-6 font-medium shadow-sm hover:shadow transition-all"
            onClick={() => navigate("/login")}
          >
            Create free account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto h-11 px-6 font-medium border-border/60 hover:bg-muted/30"
            onClick={() => navigate("/resources")}
          >
            Explore materials
          </Button>
        </div>
      </div>
    </section>
  );
}