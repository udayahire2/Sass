import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SheetClose } from "@/components/ui/sheet";
import { GitBranch, GraduationCap, RotateCcw } from "lucide-react";

export const SEMESTERS = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
];

export const BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
];

interface StudyMaterialFilterProps {
  selectedBranch: string;
  setSelectedBranch: (value: string) => void;
  selectedSemester: string;
  setSelectedSemester: (value: string) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export function StudyMaterialFilter({
  selectedBranch,
  setSelectedBranch,
  selectedSemester,
  setSelectedSemester,
  activeFiltersCount,
  onClearFilters,
}: StudyMaterialFilterProps) {
  return (
    <div className="flex h-full flex-col px-1 pb-2">
      {/* Filter Options */}
      <div className="flex-1 space-y-8 py-5">
        
        {/* Branch Section */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <GitBranch className="h-3.5 w-3.5" />
            Branch
          </Label>
          <Select value={selectedBranch} onValueChange={(val) => val && setSelectedBranch(val)}>
            <SelectTrigger className="h-10 w-full rounded-[8px] border border-border/80 bg-background shadow-sm transition-colors duration-200 hover:bg-muted/30 focus:ring-1 focus:ring-primary/20">
              <SelectValue placeholder="Select branch" className="text-[13px]" />
            </SelectTrigger>
            <SelectContent className="rounded-[8px] border-border/80 shadow-md">
              <SelectItem value="All" className="text-[13px] rounded-[6px]">All Branches</SelectItem>
              {BRANCHES.map((branch) => (
                <SelectItem key={branch} value={branch} className="text-[13px] rounded-[6px] py-2">
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Semester Section */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5" />
            Semester
          </Label>
          <Select value={selectedSemester} onValueChange={(val) => val && setSelectedSemester(val)}>
            <SelectTrigger className="h-10 w-full rounded-[8px] border border-border/80 bg-background shadow-sm transition-colors duration-200 hover:bg-muted/30 focus:ring-1 focus:ring-primary/20">
              <SelectValue placeholder="Select semester" className="text-[13px]" />
            </SelectTrigger>
            <SelectContent className="rounded-[8px] border-border/80 shadow-md">
              <SelectItem value="All" className="text-[13px] rounded-[6px]">All Semesters</SelectItem>
              {SEMESTERS.map((sem) => (
                <SelectItem key={sem} value={sem} className="text-[13px] rounded-[6px] py-2">
                  {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Footer - Minimalist Layout */}
      <div className="mt-auto space-y-5 border-t border-border/60 pt-5">
        
        {/* Active Filters Row */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-muted-foreground">Active filters</span>
          <Badge 
            variant="secondary" 
            className="h-5 min-w-[20px] items-center justify-center rounded-[6px] bg-muted/60 px-1.5 text-[11px] font-medium text-foreground transition-colors"
          >
            {activeFiltersCount}
          </Badge>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={onClearFilters}
            disabled={activeFiltersCount === 0}
            className="h-9 w-full rounded-[8px] border-border/80 text-[13px] font-medium tracking-tight transition-colors hover:bg-muted/60"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-muted-foreground opacity-80" />
            Reset
          </Button>
          <SheetClose render={
            <Button 
              variant="default"
              className="h-9 w-full rounded-[8px] text-[13px] font-medium tracking-tight shadow-sm"
            >
              Apply Filter
            </Button>
          } />
        </div>
      </div>
    </div>
  );
}