import React, { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import logoimage from '../../assets/brandlogo/logo.png'
interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
    showText?: boolean
}

export function Logo({ className, showText = true, ...props }: LogoProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const iconRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!showText || !textRef.current) return

        // Initial state: text hidden, icon at normal scale
        gsap.set(textRef.current, {
            opacity: 0,
            x: -8,
            visibility: "visible",
        })

        const container = containerRef.current
        if (!container) return

        const handleMouseEnter = () => {
            // Animate text in
            gsap.to(textRef.current, {
                opacity: 1,
                x: 0,
                duration: 0.4,
                ease: "power2.out",
            })
            // Optional: subtle icon scale on hover
            gsap.to(iconRef.current, {
                scale: 1.05,
                duration: 0.4,
                ease: "power2.out",
            })
        }

        const handleMouseLeave = () => {
            // Animate text out
            gsap.to(textRef.current, {
                opacity: 0,
                x: -8,
                duration: 0.3,
                ease: "power2.in",
            })
            // Reset icon scale
            gsap.to(iconRef.current, {
                scale: 1,
                duration: 0.3,
                ease: "power2.in",
            })
        }

        container.addEventListener("mouseenter", handleMouseEnter)
        container.addEventListener("mouseleave", handleMouseLeave)

        return () => {
            container.removeEventListener("mouseenter", handleMouseEnter)
            container.removeEventListener("mouseleave", handleMouseLeave)
            gsap.killTweensOf([textRef.current, iconRef.current])
        }
    }, [showText])

    return (
        <div
            ref={containerRef}
            className={cn("flex items-center gap-3", className)}
            {...props}
        >
            {/* Logo Icon */}
            <div
                ref={iconRef}
                className="relative flex h-9 w-9 shrink-0 items-center justify-center"
            >
                <img src={logoimage} alt="logo  " />
            </div>

            {/* Text Lockup – rendered only if showText is true */}
            {showText && (
                <div
                    ref={textRef}
                    className="flex flex-col justify-center -space-y-0.5 will-change-transform"
                >
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