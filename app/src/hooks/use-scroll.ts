import { useState, useEffect, useCallback } from "react"

/**
 * Hook to track scroll position and return whether page is scrolled past threshold
 * @param threshold - Scroll position in pixels to trigger scrolled state (default: 20)
 * @returns boolean indicating if page is scrolled past threshold
 */
export function useScroll(threshold: number = 20): boolean {
    const [scrolled, setScrolled] = useState(false)

    const handleScroll = useCallback(() => {
        setScrolled(window.scrollY > threshold)
    }, [threshold])

    useEffect(() => {
        handleScroll() // Check initial state
        window.addEventListener('scroll', handleScroll)

        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    return scrolled
}
