import { cn } from "@/lib/utils";

interface GridLineProps {
    className?: string;
    direction?: "horizontal" | "vertical";
}

export function GridLine({ className, direction = "horizontal" }: GridLineProps) {
    return (
        <div
            className={cn(
                "relative flex items-center justify-center pointer-events-none",
                direction === "horizontal" ? "w-full h-px" : "h-full w-px",
                className
            )}
        >
            <svg
                className={cn(
                    "absolute overflow-visible",
                    direction === "horizontal" ? "left-0 w-full h-px" : "top-0 h-full w-px"
                )}
                preserveAspectRatio="none"
                width="100%"
                height="100%"
            >
                <line
                    x1="0"
                    y1="0"
                    x2={direction === "horizontal" ? "100%" : "0"}
                    y2={direction === "horizontal" ? "0" : "100%"}
                    className="stroke-border/40"
                    strokeWidth="1"
                />
            </svg>
        </div>
    );
}
