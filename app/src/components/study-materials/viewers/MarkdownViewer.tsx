import MarkdownPreview from "@/components/ui/markdown-preview";
import type { StudyMaterial } from "../types";

export function MarkdownViewer({ resource }: { resource: StudyMaterial }) {
  return (
    <div className="h-full min-h-0 w-full overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 sm:py-10 md:px-12 md:py-14">
      <div className="mx-auto max-w-4xl">
        <MarkdownPreview
          content={resource.content || resource.url || "# No content available"}
          className="prose prose-sm md:prose-base dark:prose-invert max-w-none"
        />
      </div>
    </div>
  );
}