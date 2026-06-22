import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { StudyMaterial } from "../types";

export function PDFViewer({ resource }: { resource: StudyMaterial }) {
  return (
    <div className="relative h-full w-full bg-muted/20 sm:p-2">
      <iframe
        src={resource.url}
        className="h-full w-full border-0 sm:rounded-[8px] sm:shadow-sm"
        title={resource.title}
      />
      <div className="absolute bottom-6 right-6 z-10 sm:hidden">
        <a href={resource.url} target="_blank" rel="noreferrer">
          <Button size="icon" className="h-12 w-12 rounded-full shadow-xl">
            <Download className="h-5 w-5" />
          </Button>
        </a>
      </div>
    </div>
  );
}
