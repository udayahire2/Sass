import type { StudyMaterial } from "../types";

export function VideoViewer({ resource }: { resource: StudyMaterial }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-black/95 p-2 sm:p-4 md:p-8">
      <div className="relative w-full max-w-5xl aspect-video">
        <iframe
          src={resource.url}
          className="absolute inset-0 h-full w-full rounded-md border border-border/20 shadow-2xl sm:rounded-xl"
          title={resource.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}