"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Separator } from "@/components/ui/separator";

// ---------- Slot Variants ----------
const inputOTPSlotVariants = cva(
  [
    "relative inline-flex items-center justify-center rounded-lg border border-input bg-background text-foreground shadow-xs/5 outline-none ring-ring/24 transition-shadow",
    "before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)]",
    "not-data-[active=true]:not-aria-invalid:before:shadow-[0_1px_theme(colors.black/4%)]",
    "aria-invalid:border-destructive/36",
    "data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-[3px] data-[active=true]:ring-ring/24",
    "data-[active=true]:aria-invalid:border-destructive/64 data-[active=true]:aria-invalid:ring-destructive/16",
    "dark:bg-input/32 dark:not-data-[active=true]:not-aria-invalid:before:shadow-[0_-1px_theme(colors.white/6%)]",
    "dark:data-[active=true]:aria-invalid:ring-destructive/24",
    "[[data-active=true],[aria-invalid]]:shadow-none",
  ],
  {
    variants: {
      size: {
        default: "size-9 text-base sm:size-8 sm:text-sm",
        lg: "size-10 text-lg sm:size-9 sm:text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

// ---------- Types ----------
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type InputOTPProps = DistributiveOmit<
  React.ComponentProps<typeof OTPInput>,
  "size" | "data-size"
> & {
  containerClassName?: string;
};

export interface InputOTPGroupProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof inputOTPSlotVariants> {}

export interface InputOTPSlotProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof inputOTPSlotVariants> {
  index: number;
}

// ---------- Components ----------
const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  InputOTPProps
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    className={className}
    containerClassName={cn(
      "flex items-center gap-2 has-disabled:opacity-64 has-disabled:**:data-[slot=input-otp-slot]:shadow-none has-disabled:**:data-[slot=input-otp-slot]:before:shadow-none!",
      containerClassName
    )}
    data-slot="input-otp"
    spellCheck={false}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<HTMLDivElement, InputOTPGroupProps>(
  ({ className, size = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2", className)}
      data-size={size}
      data-slot="input-otp-group"
      {...props}
    />
  )
);
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<HTMLDivElement, InputOTPSlotProps>(
  ({ index, className, size, ...props }, ref) => {
    const inputOTPContext = React.useContext(OTPInputContext);
    const slot = inputOTPContext?.slots[index];
    const { char, hasFakeCaret, isActive } = slot ?? {};

    return (
      <div
        ref={ref}
        className={cn(inputOTPSlotVariants({ size }), className)}
        data-active={isActive ? true : undefined}
        data-slot="input-otp-slot"
        {...props}
      >
        {char}
        {hasFakeCaret && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-px animate-caret-blink bg-foreground" />
          </div>
        )}
      </div>
    );
  }
);
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator
    ref={ref}
    className={cn(
      "rounded-full bg-input data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:w-3",
      className
    )}
    {...props}
  />
));
InputOTPSeparator.displayName = "InputOTPSeparator";

// ---------- Exports ----------
export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
export { OTPInput as InputOTPPrimitive };