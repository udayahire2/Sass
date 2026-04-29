import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import React from "react";

interface AnnouncementProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const Announcement = React.forwardRef<HTMLDivElement, AnnouncementProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "group inline-flex items-center rounded-full border border-border bg-background px-1 py-1 pr-2.5 text-sm font-medium transition-colors hover:bg-muted/50",
                    className
                )}
                {...props}
            >
                {children} <ArrowRight className="ml-1 h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
        );
    }
);
Announcement.displayName = "Announcement";

interface AnnouncementTagProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const AnnouncementTag = React.forwardRef<HTMLDivElement, AnnouncementTagProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "mr-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
AnnouncementTag.displayName = "AnnouncementTag";

interface AnnouncementTitleProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode;
}

const AnnouncementTitle = React.forwardRef<
    HTMLSpanElement,
    AnnouncementTitleProps
>(({ className, children, ...props }, ref) => {
    return (
        <span
            ref={ref}
            className={cn("text-xs md:text-sm text-foreground", className)}
            {...props}
        >
            {children}
        </span>
    );
});
AnnouncementTitle.displayName = "AnnouncementTitle";

export { Announcement, AnnouncementTag, AnnouncementTitle };
