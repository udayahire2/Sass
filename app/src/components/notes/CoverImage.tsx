import React from "react";

interface CoverImageProps {
  cover: string;
  onChangeCover: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onRemoveCover: () => void;
}

export function CoverImage({ cover, onChangeCover, onRemoveCover }: CoverImageProps) {
  return (
    <div className="group relative w-full h-[30vh] min-h-[200px] max-h-[280px] shrink-0 overflow-hidden bg-muted/20">
      {cover.startsWith("#") || cover.startsWith("rgb") || cover.startsWith("hsl") ? (
        <div className="absolute inset-0" style={{ backgroundColor: cover }} />
      ) : (
        <img
          src={cover}
          alt="Note cover"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onChangeCover}
          className="rounded-[5px] bg-background px-2.5 py-1 text-[11px] font-medium text-foreground/70 hover:bg-muted border border-border transition-colors"
        >
          Change cover
        </button>
        <button
          onClick={onRemoveCover}
          className="rounded-[5px] bg-background px-2.5 py-1 text-[11px] font-medium text-foreground/70 hover:bg-muted border border-border transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
