import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";

interface SemesterSelectionProps {
  selectedSemester: number | null;
  onSelect: (semester: number) => void;
}

const semesters = [1, 2, 3, 4, 5, 6];

export function SemesterSelection({ selectedSemester, onSelect }: SemesterSelectionProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Select semester</CardTitle>
        <CardDescription>Choose your current academic term</CardDescription>
      </CardHeader>
      <CardPanel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {semesters.map((semester) => {
            const isSelected = selectedSemester === semester;
            return (
              <Button
                key={semester}
                variant={isSelected ? "default" : "outline"}
                size="lg"
                onClick={() => onSelect(semester)}
                aria-pressed={isSelected}
                className="flex-col h-auto py-3 gap-1"
              >
                <span className="text-[11px] opacity-75">Sem</span>
                <span className="text-xl font-semibold">{semester}</span>
              </Button>
            );
          })}
        </div>
      </CardPanel>
    </Card>
  );
}

export default SemesterSelection;