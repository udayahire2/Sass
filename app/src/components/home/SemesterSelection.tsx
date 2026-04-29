import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SemesterSelectionProps {
  selectedSemester: number | null;
  onSelect: (semester: number) => void;
}

const semesters = [1, 2, 3, 4, 5, 6];

export function SemesterSelection({ selectedSemester, onSelect }: SemesterSelectionProps) {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 space-y-1">
        <h2 className="text-base font-medium text-foreground">Select semester</h2>
        <p className="text-sm text-muted-foreground">Choose your current academic term</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
        {semesters.map((semester) => (
          <Button
            key={semester}
            onClick={() => onSelect(semester)}
            className={cn(
              "flex flex-col items-center justify-center rounded-md border border-border/40 py-4 transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              selectedSemester === semester
                ? "border-foreground/30 bg-muted text-foreground"
                : "bg-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
            )}
            aria-pressed={selectedSemester === semester}
          >
            <span className="text-xs text-muted-foreground">Sem</span>
            <span className="text-xl font-normal">{semester}</span>
          </Button>
        ))}
      </div>
    </section>
  );
}

export default SemesterSelection;