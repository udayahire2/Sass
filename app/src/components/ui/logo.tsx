import React from "react"
import { cn } from "@/lib/utils"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
    showText?: boolean
}

export function Logo({ className, showText = true, ...props }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-3", className)} {...props}>
            {/* Logo Icon */}
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 40 40"
                    fill="none"
                >
                    {/* Back/Left Shape - Darker */}
                    <rect x="2" y="2" width="26" height="36" rx="8" className="fill-logo-back" />
                    {/* Front/Right Shape - Lighter */}
                    <rect x="12" y="2" width="26" height="36" rx="8" className="fill-logo-front" />
                </svg>
            </div>

            {/* Text Lockup */}
            {showText && (
                <div className="flex flex-col justify-center -space-y-0.5">
                    <span className="font-extrabold text-[18px] leading-none tracking-tight text-foreground sm:text-xl">
                        NMU
                    </span>
                    <span className="text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase sm:text-[11px]">
                        StudyHub
                    </span>
                </div>
            )}
        </div>
    )
}
