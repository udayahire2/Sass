import React, { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"

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
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 31 31"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient
                            id="logoGradient"
                            x1="15.0574"
                            y1="0.12085"
                            x2="15.0574"
                            y2="14.3461"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#5CFF7D" />
                            <stop offset="0.5" stopColor="#489BBE" />
                            <stop offset="1" stopColor="#3337FF" />
                        </linearGradient>
                    </defs>

                    <g id="innerLogoPetal">
                        <ellipse
                            cx="15.0574"
                            cy="7.23348"
                            rx="1.90338"
                            ry="7.11263"
                            fill="url(#logoGradient)"
                        />
                    </g>

                    <use href="#innerLogoPetal" transform="translate(11.7262 -5.97478) rotate(36)" />
                    <use href="#innerLogoPetal" transform="translate(24.7247 -3.91601) rotate(72)" />
                    <use href="#innerLogoPetal" transform="translate(34.0306 5.38992) rotate(108)" />
                    <use href="#innerLogoPetal" transform="translate(36.0894 18.3885) rotate(144)" />
                    <use href="#innerLogoPetal" transform="translate(30.1146 30.1146) rotate(-180)" />
                    <use href="#innerLogoPetal" transform="translate(18.3885 36.0894) rotate(-144)" />
                    <use href="#innerLogoPetal" transform="translate(5.38993 34.0306) rotate(-108)" />
                    <use href="#innerLogoPetal" transform="translate(-3.91601 24.7247) rotate(-72)" />
                    <use href="#innerLogoPetal" transform="translate(-5.97477 11.7262) rotate(-36)" />
                </svg>
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