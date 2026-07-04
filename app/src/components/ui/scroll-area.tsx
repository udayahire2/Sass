import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import { cn } from "@/lib/utils";

export function ScrollArea({
  className,
  children,
  scrollFade = false,
  scrollbarGutter = false,
  disableLenis = false,
  ...props
}: ScrollAreaPrimitive.Root.Props & {
  scrollFade?: boolean;
  scrollbarGutter?: boolean;
  disableLenis?: boolean;
}): React.ReactElement {
  const viewportRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (disableLenis) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const content = viewport.firstElementChild as HTMLElement;
    if (!content) return;

    // UI/UX Fix: Tightened duration for snappier, less "floaty" scroll response
    const lenis = new Lenis({
      wrapper: viewport,
      content: content,
      duration: 0.6, // Reduced from 0.8 to prevent text-blurring momentum
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0, // Reduced from 1.2 to feel more native
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Dev Fix: Observe viewport, not content. If React swaps the content node, 
    // observing firstElementChild causes memory leaks and broken sizing.
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    resizeObserver.observe(viewport);
    resizeObserver.observe(content);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [disableLenis]);

  return (
    <ScrollAreaPrimitive.Root
      className={cn("size-full min-h-0", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        className={cn(
          "h-full w-full rounded-[inherit] outline-none transition-shadows focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background data-[has-overflow-y]:overscroll-y-contain data-[has-overflow-x]:overscroll-x-contain",
          scrollFade &&
            "mask-t-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-y-start)))] mask-b-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-y-end)))] mask-l-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-x-start)))] mask-r-from-[calc(100%-min(var(--fade-size),var(--scroll-area-overflow-x-end)))] [--fade-size:1.5rem]",
          scrollbarGutter &&
            "data-[has-overflow-y]:pe-3 data-[has-overflow-x]:pb-3", // Increased gutter slightly
        )}
        data-slot="scroll-area-viewport"
      >
        <div className="min-h-full min-w-full w-fit">{children}</div>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation="vertical" />
      <ScrollBar orientation="horizontal" />
      <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
    </ScrollAreaPrimitive.Root>
  );
}

export function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props): React.ReactElement {
  return (
    <ScrollAreaPrimitive.Scrollbar
      className={cn(
        // UI/UX Fix: The track is now a wider invisible hit area (w-2.5/h-2.5) 
        // with padding. We use a group hover to expand the thumb inside it.
        "group flex touch-none select-none transition-colors",
        orientation === "vertical" && "h-full w-3 border-l border-l-transparent p-[1px] right-0",
        orientation === "horizontal" && "h-3 w-full flex-col border-t border-t-transparent p-[1px] bottom-0",
        className,
      )}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        className={cn(
          // Default: thin (bg-clip-padding + transparent border) and low opacity
          "relative flex-1 rounded-full bg-foreground/20 bg-clip-padding transition-all duration-300 ease-out",
          // Hover state: Darker and visually thicker (via group hover on the parent track)
          "group-hover:bg-foreground/50 active:bg-foreground/70"
        )}
        data-slot="scroll-area-thumb"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollAreaPrimitive };