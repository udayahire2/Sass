import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react"

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

type Theme = "dark" | "light" | "system" | "sepia" | "nord"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    )

    useIsomorphicLayoutEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark", "sepia", "nord")

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.classList.add(systemTheme)
            return
        }

        root.classList.add(theme)
    }, [theme])

    const value = {
        theme,
        setTheme: (nextTheme: Theme) => {
            localStorage.setItem(storageKey, nextTheme)
            const root = window.document.documentElement
            root.classList.remove("light", "dark", "sepia", "nord")
            if (nextTheme === "system") {
                const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
                root.classList.add(systemTheme)
            } else {
                root.classList.add(nextTheme)
            }
            setThemeState(nextTheme)
        },
    }

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
