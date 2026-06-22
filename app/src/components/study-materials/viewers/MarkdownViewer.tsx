import MarkdownPreview from "@/components/ui/markdown-preview";
import type { StudyMaterial } from "../types";

export function MarkdownViewer({ resource }: { resource: StudyMaterial }) {
  return (
    <div className="mx-auto h-full w-full max-w-4xl overflow-y-auto px-6 py-10 md:px-16 md:py-16">
      <MarkdownPreview
        content={resource.content || resource.url || "# No content available"}
        className="prose prose-sm md:prose-base dark:prose-invert max-w-none"
      />
    </div>
  );
}
