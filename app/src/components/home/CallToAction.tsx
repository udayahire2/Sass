import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Background from "../../assets/images/back.png";

export function CallToAction() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-background/50 border-2 rounded-4xl">
      {/* Background Image – decorative, full‑cover */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          src={Background}
          alt=""
          className="h-full w-full object-fill"
          loading="lazy"
        />
      </div>

      {/* Content – with subtle backdrop for readability */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 md:px-8 text-center flex flex-col items-center backdrop-blur-sm bg-background/20 rounded-2xl p-6 sm:p-8">
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