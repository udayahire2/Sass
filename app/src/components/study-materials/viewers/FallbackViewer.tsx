import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getIcon, getResourceColor } from "../utils";
import type { StudyMaterial } from "../types";
import { cn } from "@/lib/utils";

export function FallbackViewer({ resource }: { resource: StudyMaterial }) {
  const colors = getResourceColor(resource.type);
  
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <div className={cn("mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-border bg-card shadow-sm", colors.text)}>
        {getIcon(resource.type)}
      </div>
      <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
        Preview Not Available
      </h3>
      <p className="mb-8 max-w-[320px] text-[13px] leading-relaxed text-muted-foreground">
        This file type cannot be previewed natively in the browser. Please download it directly to view its contents.
      </p>
      <a href={resource.url} target="_blank" rel="noreferrer">
        <Button className="h-10 rounded-lg px-6 text-[13px] font-medium tracking-tight shadow-sm">
          <Download className="mr-2 h-4 w-4 opacity-90" />
          Download {resource.type}
        </Button>
      </a>
    </div>
  );
}