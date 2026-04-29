import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    pauseOnHover?: boolean;
    direction?: "left" | "right";
    speed?: number;
}

const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
    (
        {
            className,
            children,
            pauseOnHover = false,
            direction = "left",
            speed = 20,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn("group flex overflow-hidden", className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Marquee.displayName = "Marquee";

interface MarqueeContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    pauseOnHover?: boolean;
    direction?: "left" | "right";
    speed?: number;
}

const MarqueeContent = React.forwardRef<HTMLDivElement, MarqueeContentProps>(
    (
        {
            className,
            children,
            pauseOnHover = false,
            direction = "left",
            speed = 20,
            // ...props
        },
        _ref
    ) => {
        // Duplicate children to create infinite effect
        const [content, setContent] = useState<React.ReactNode[]>([]);

        useEffect(() => {
            // Create 2 copies to ensure smooth looping
            setContent([children, children, children]);
        }, [children]);

        return (
            <motion.div
                className={cn("flex min-w-full shrink-0 items-center justify-around gap-4", className)}
                animate={{
                    x: direction === "left" ? ["0%", "-33.33%"] : ["-33.33%", "0%"],
                }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: speed,
                }}
                whileHover={pauseOnHover ? { animationPlayState: "paused" } : {}}
            >
                {content.map((child, index) => (
                    <React.Fragment key={index}>{child}</React.Fragment>
                ))}
            </motion.div>
        );
    }
);
MarqueeContent.displayName = "MarqueeContent";


interface MarqueeItemProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const MarqueeItem = React.forwardRef<HTMLDivElement, MarqueeItemProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("flex flex-shrink-0 items-center justify-center", className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
MarqueeItem.displayName = "MarqueeItem";

interface MarqueeFadeProps extends React.HTMLAttributes<HTMLDivElement> {
    side: "left" | "right";
}

const MarqueeFade = React.forwardRef<HTMLDivElement, MarqueeFadeProps>(
    ({ className, side, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "pointer-events-none absolute top-0 z-10 h-full w-32 bg-gradient-to-r from-background to-transparent",
                    side === "left" ? "left-0" : "right-0 rotate-180",
                    className
                )}
                {...props}
            />
        );
    }
);
MarqueeFade.displayName = "MarqueeFade";

export { Marquee, MarqueeContent, MarqueeItem, MarqueeFade };
