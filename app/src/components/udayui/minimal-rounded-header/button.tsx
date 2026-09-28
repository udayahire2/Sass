"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

export const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2",
    "whitespace-nowrap rounded-lg border font-medium text-base outline-none",
    "transition-[color,background-color,border-color,box-shadow,transform] duration-150 active:scale-[0.98]",

    // Smooth inner layer
    "before:pointer-events-none before:absolute before:inset-0",
    "before:rounded-[calc(var(--radius-lg)-1px)]",

    // Figma / iOS style smooth corners
    "[corner-shape:squircle]",
    "[&::before]:[corner-shape:squircle]",

    // Touch target
    "pointer-coarse:after:absolute",
    "pointer-coarse:after:size-full",
    "pointer-coarse:after:min-h-11",
    "pointer-coarse:after:min-w-11",

    // Focus
    "focus-visible:ring-2",
    "focus-visible:ring-ring",
    "focus-visible:ring-offset-1",
    "focus-visible:ring-offset-background",

    // Disabled / loading
    "disabled:pointer-events-none",
    "disabled:opacity-64",
    "data-loading:select-none",
    "data-loading:text-transparent",

    // Typography
    "sm:text-sm",

    // SVG
    "[&>svg:not([class*='opacity-'])]:opacity-80",
    "[&>svg:not([class*='size-'])]:size-4.5",
    "sm:[&>svg:not([class*='size-'])]:size-4",

    "[&>svg]:pointer-events-none",
    "[&>svg]:-mx-0.5",
    "[&>svg]:shrink-0",
  ].join(" "),
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },

    variants: {
      size: {
        default: [
          "h-9 px-[calc(--spacing(3)-1px)]",
          "sm:h-8",
        ].join(" "),

        icon: [
          "size-9",
          "sm:size-8",
        ].join(" "),

        "icon-lg": [
          "size-10",
          "sm:size-9",
        ].join(" "),

        "icon-sm": [
          "size-8",
          "sm:size-7",
        ].join(" "),

        "icon-xl": [
          "size-11",
          "sm:size-10",
          "[&>svg:not([class*='size-'])]:size-5",
          "sm:[&>svg:not([class*='size-'])]:size-4.5",
        ].join(" "),

        "icon-xs": [
          "size-7 rounded-md",
          "before:rounded-[calc(var(--radius-md)-1px)]",
          "sm:size-6",
          "not-in-data-[slot=input-group]:[&>svg:not([class*='size-'])]:size-4",
          "sm:not-in-data-[slot=input-group]:[&>svg:not([class*='size-'])]:size-3.5",
        ].join(" "),

        lg: [
          "h-10 px-[calc(--spacing(3.5)-1px)]",
          "sm:h-9",
        ].join(" "),

        sm: [
          "h-8 gap-1.5 px-[calc(--spacing(2.5)-1px)]",
          "sm:h-7",
        ].join(" "),

        xl: [
          "h-11 px-[calc(--spacing(4)-1px)]",
          "text-lg",
          "sm:h-10",
          "sm:text-base",
          "[&>svg:not([class*='size-'])]:size-5",
          "sm:[&>svg:not([class*='size-'])]:size-4.5",
        ].join(" "),

        xs: [
          "h-7 gap-1 rounded-md px-[calc(--spacing(2)-1px)]",
          "text-sm",
          "before:rounded-[calc(var(--radius-md)-1px)]",
          "sm:h-6",
          "sm:text-xs",
          "[&>svg:not([class*='size-'])]:size-4",
          "sm:[&>svg:not([class*='size-'])]:size-3.5",
        ].join(" "),
      },

      variant: {
        default: [
          "not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)]",
          "border-primary",
          "bg-primary",
          "text-primary-foreground",
          "shadow-primary/24",
          "shadow-xs",

          "hover:bg-primary/90",
          "data-pressed:bg-primary/90",

          "*:data-[slot=button-loading-indicator]:text-primary-foreground",

          "[&:active,[data-pressed]]:inset-shadow-[0_1px_--theme(--color-black/8%)]",
          "[&:disabled,&:active,[data-pressed]]:shadow-none",
        ].join(" "),

        destructive: [
          "not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)]",
          "border-destructive",
          "bg-destructive",
          "text-white",
          "shadow-destructive/24",
          "shadow-xs",

          "hover:bg-destructive/90",
          "data-pressed:bg-destructive/90",

          "*:data-[slot=button-loading-indicator]:text-white",

          "[&:active,[data-pressed]]:inset-shadow-[0_1px_--theme(--color-black/8%)]",
          "[&:disabled,&:active,[data-pressed]]:shadow-none",
        ].join(" "),

        "destructive-outline": [
          "border-input",
          "bg-popover",
          "not-dark:bg-clip-padding",
          "text-destructive-foreground",
          "shadow-xs/5",

          "not-disabled:not-active:not-data-pressed:before:shadow-[0_1px_--theme(--color-black/4%)]",

          "hover:border-destructive/48",
          "hover:bg-destructive/6",

          "data-pressed:border-destructive/48",
          "data-pressed:bg-destructive/6",

          "*:data-[slot=button-loading-indicator]:text-foreground",

          "dark:bg-input/32",
          "dark:not-disabled:before:shadow-[0_-1px_--theme(--color-white/2%)]",
          "dark:not-disabled:not-active:not-data-pressed:before:shadow-[0_-1px_--theme(--color-white/6%)]",

          "[&:disabled,&:active,[data-pressed]]:shadow-none",
        ].join(" "),

        ghost: [
          "border-transparent",
          "text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "data-pressed:bg-accent",
          "*:data-[slot=button-loading-indicator]:text-foreground",
        ].join(" "),

        link: [
          "border-transparent",
          "text-foreground",
          "underline-offset-4",
          "hover:underline",
          "data-pressed:underline",
          "*:data-[slot=button-loading-indicator]:text-foreground",
        ].join(" "),

        outline: [
          "border-input",
          "bg-popover",
          "not-dark:bg-clip-padding",
          "text-foreground",
          "shadow-xs/5",

          "not-disabled:not-active:not-data-pressed:before:shadow-[0_1px_--theme(--color-black/4%)]",

          "hover:bg-accent/60",
          "hover:border-foreground/20",
          "data-pressed:bg-accent/60",

          "*:data-[slot=button-loading-indicator]:text-foreground",

          "dark:bg-input/32",
          "dark:data-pressed:bg-input/64",
          "dark:hover:bg-input/64",
          "dark:hover:border-foreground/25",

          "dark:not-disabled:before:shadow-[0_-1px_--theme(--color-white/2%)]",
          "dark:not-disabled:not-active:not-data-pressed:before:shadow-[0_-1px_--theme(--color-white/6%)]",

          "[&:disabled,&:active,[data-pressed]]:shadow-none",
        ].join(" "),

        secondary: [
          "border-transparent",
          "bg-secondary",
          "text-secondary-foreground",

          "hover:bg-secondary/90 hover:border-border/60",
          "data-pressed:bg-secondary/90",

          "*:data-[slot=button-loading-indicator]:text-secondary-foreground",

          "[&:active,[data-pressed]]:bg-secondary/80",
        ].join(" "),
      },
    },
  },
);

export interface ButtonProps
  extends useRender.ComponentProps<"button"> {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  render,
  children,
  loading = false,
  disabled: disabledProp,
  ...props
}: ButtonProps): React.ReactElement {
  const isDisabled = Boolean(loading || disabledProp);

  const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] =
    render ? undefined : "button";

  const defaultProps = {
    children: (
      <>
        {children}

        {loading && (
          <Spinner
            data-slot="button-loading-indicator"
            className="absolute"
          />
        )}
      </>
    ),

    className: cn(
      buttonVariants({
        variant,
        size,
        className,
      }),
    ),

    "aria-disabled": loading || undefined,
    "data-loading": loading ? "" : undefined,
    "data-slot": "button",

    disabled: isDisabled,
    type: typeValue,
  };

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  });
}
