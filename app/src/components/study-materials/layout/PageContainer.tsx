import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: "default" | "wide";
}

export function PageContainer({
  children,
  className,
  maxWidth = "default",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 sm:px-6 md:py-12 space-y-8",
        maxWidth === "default" ? "max-w-270" : "max-w-7xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
