import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import type React from "react";
import { cn } from "@/lib/utils";

export function Separator({
  className,
  orientation = "horizontal",
  variant = "solid",
  ...props
}: SeparatorPrimitive.Props & {
  variant?: "solid" | "dashed" | "dotted";
}): React.ReactElement {
  return (
    <SeparatorPrimitive
      className={cn(
        "shrink-0",
        variant === "solid" &&
          "bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:not-[[class^='h-']]:not-[[class*='_h-']]:self-stretch",
        variant === "dashed" &&
          "bg-transparent data-[orientation=horizontal]:h-0 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-dashed data-[orientation=horizontal]:border-border/80 data-[orientation=vertical]:w-0 data-[orientation=vertical]:border-s data-[orientation=vertical]:border-dashed data-[orientation=vertical]:border-border/80 data-[orientation=vertical]:not-[[class^='h-']]:not-[[class*='_h-']]:self-stretch",
        variant === "dotted" &&
          "bg-transparent data-[orientation=horizontal]:h-0 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-dotted data-[orientation=horizontal]:border-border/80 data-[orientation=vertical]:w-0 data-[orientation=vertical]:border-s data-[orientation=vertical]:border-dotted data-[orientation=vertical]:border-border/80 data-[orientation=vertical]:not-[[class^='h-']]:not-[[class*='_h-']]:self-stretch",
        className,
      )}
      data-slot="separator"
      orientation={orientation}
      {...props}
    />
  );
}

export { SeparatorPrimitive };
