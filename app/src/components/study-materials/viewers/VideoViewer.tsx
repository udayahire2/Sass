import type { StudyMaterial } from "../types";

export function VideoViewer({ resource }: { resource: StudyMaterial }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-black/95 sm:p-4 md:p-8">
      <iframe
        src={resource.url}
        className="aspect-video h-full w-full max-w-5xl rounded-none border border-border/20 shadow-2xl sm:rounded-[12px]"
        title={resource.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
