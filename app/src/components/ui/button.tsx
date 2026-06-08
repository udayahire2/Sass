"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Slot } from "@radix-ui/react-slot";

export const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-medium text-base outline-none transition-all duration-200 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[loading=true]:pointer-events-none data-[loading=true]:cursor-not-allowed data-[loading=true]:select-none data-[loading=true]:text-transparent active:not-disabled:not-data-[loading=true]:scale-[0.98] pointer-coarse:after:absolute pointer-coarse:after:inset-0 pointer-coarse:after:content-[''] pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 sm:text-sm [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 px-[calc(--spacing(3)-1px)] sm:h-8",
        icon: "size-9 sm:size-8",
        "icon-lg": "size-10 sm:size-9",
        "icon-sm": "size-8 sm:size-7",
        "icon-xl":
          "size-11 sm:size-10 [&_svg:not([class*='size-'])]:size-5 sm:[&_svg:not([class*='size-'])]:size-4.5",
        "icon-xs":
          "size-7 rounded-md before:rounded-[calc(var(--radius-md)-1px)] sm:size-6 [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 px-[calc(--spacing(3.5)-1px)] sm:h-9",
        sm: "h-8 gap-1.5 px-[calc(--spacing(2.5)-1px)] sm:h-7",
        xl: "h-11 px-[calc(--spacing(4)-1px)] text-lg sm:h-10 sm:text-base [&_svg:not([class*='size-'])]:size-5 sm:[&_svg:not([class*='size-'])]:size-4.5",
        xs: "h-7 gap-1 rounded-md px-[calc(--spacing(2)-1px)] text-sm before:rounded-[calc(var(--radius-md)-1px)] sm:h-6 sm:text-xs [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5",
      },
      variant: {
        default:
          "not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] border-[#121212]/20 bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(18,18,18,0.25)] hover:bg-primary/90 data-pressed:bg-primary/90 active:bg-primary/95 *:data-[slot=button-loading-indicator]:text-primary-foreground dark:shadow-[0_0_0_2px_rgba(255,255,255,0.1)]",
        destructive:
          "not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] border-destructive bg-destructive text-white shadow-destructive/24 shadow-xs hover:bg-destructive/90 data-pressed:bg-destructive/90 active:bg-destructive/95 *:data-[slot=button-loading-indicator]:text-white",
        "destructive-outline":
          "border-input bg-popover text-destructive-foreground shadow-xs/5 hover:border-destructive/32 hover:bg-destructive/4 data-pressed:border-destructive/32 data-pressed:bg-destructive/4 active:bg-destructive/8 *:data-[slot=button-loading-indicator]:text-foreground dark:bg-input/32",
        ghost:
          "border-transparent text-foreground hover:bg-accent data-pressed:bg-accent active:bg-accent/80 *:data-[slot=button-loading-indicator]:text-foreground",
        link: "border-transparent text-foreground underline-offset-4 hover:underline data-pressed:underline active:underline *:data-[slot=button-loading-indicator]:text-foreground",
        outline:
          "border-input bg-popover text-foreground shadow-xs/5 hover:bg-accent/50 data-pressed:bg-accent/50 active:bg-accent/70 *:data-[slot=button-loading-indicator]:text-foreground dark:bg-input/32 dark:hover:bg-input/64 dark:active:bg-input/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90 data-pressed:bg-secondary/90 active:bg-secondary/95 *:data-[slot=button-loading-indicator]:text-secondary-foreground",
      },
    },
  },
);

export interface ButtonProps
  extends Omit<useRender.ComponentProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
  /** Optional icon to display inside the button */
  icon?: React.ReactNode;
  /** Position of the icon (default: left) */
  iconPosition?: "left" | "right";
  /** Makes the button take full width of its container */
  fullWidth?: boolean;
  /** Manually override children (icon + children are merged automatically) */
  children?: React.ReactNode;
}

const getSpinnerSize = (size: ButtonProps["size"]): string => {
  switch (size) {
    case "xs":
    case "sm":
    case "icon-xs":
    case "icon-sm":
      return "size-3.5";
    case "lg":
    case "xl":
    case "icon-lg":
    case "icon-xl":
      return "size-5";
    default:
      return "size-4";
  }
};

export function Button({
  className,
  variant,
  size = "default",
  render,
  children,
  icon,
  iconPosition = "left",
  fullWidth = false,
  loading = false,
  disabled: disabledProp,
  asChild,
  ...props
}: ButtonProps): React.ReactElement {
  const isDisabled = loading || disabledProp;
  const typeValue =
    render || asChild ? undefined : ("button" as const);
  const spinnerSize = getSpinnerSize(size);
  const showSpinner = loading;

  // Build children with icon if provided
  let content = children;
  if (icon) {
    const iconElement = (
      <span className="shrink-0" aria-hidden="true">
        {icon}
      </span>
    );
    if (iconPosition === "left") {
      content = (
        <>
          {iconElement}
          {children}
        </>
      );
    } else {
      content = (
        <>
          {children}
          {iconElement}
        </>
      );
    }
  }

  const defaultProps = {
    children: (
      <>
        {showSpinner && (
          <Spinner
            className={cn(
              "pointer-events-none absolute",
              spinnerSize,
              // Ensure spinner is centered when button has no text (icon only)
              !children && "inset-0 m-auto"
            )}
            data-slot="button-loading-indicator"
          />
        )}
        <span className={cn(showSpinner && "invisible", "flex items-center gap-2")}>
          {content}
        </span>
      </>
    ),
    className: cn(
      buttonVariants({ className, size, variant }),
      fullWidth && "w-full",
      // Add extra class to hide original text when loading (already handled by data-[loading=true] but we keep as fallback)
      loading && "data-[loading=true]"
    ),
    "aria-disabled": isDisabled,
    "aria-busy": loading,
    "data-loading": loading ? "true" : undefined,
    "data-slot": "button",
    disabled: isDisabled,
    type: typeValue,
  };

  // If asChild is used, ensure we forward the correct props to the child element
  const finalRender = render || (asChild ? <Slot /> : undefined);

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render: finalRender,
  });
}