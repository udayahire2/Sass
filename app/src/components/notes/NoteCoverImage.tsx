interface CoverImageProps {
  cover: string;
  onChangeCover: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onRemoveCover: () => void;
}

export function CoverImage({ cover, onChangeCover, onRemoveCover }: CoverImageProps) {
  return (
    <div className="group relative w-full h-[30vh] min-h-[200px] max-h-[280px] shrink-0">
      <div
        className="absolute inset-0"
        style={
          cover.startsWith("linear-gradient") ||
          cover.startsWith("radial-gradient")
            ? { background: cover }
            : {
                backgroundImage: `url(${cover})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
        }
      />
      <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onChangeCover}
          className="rounded-[5px] bg-background/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-foreground/70 hover:bg-background/95 shadow-sm border border-border/50 transition-all"
        >
          Change cover
        </button>
        <button
          onClick={onRemoveCover}
          className="rounded-[5px] bg-background/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-foreground/70 hover:bg-background/95 shadow-sm border border-border/50 transition-all"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
