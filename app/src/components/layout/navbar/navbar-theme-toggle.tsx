import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"

export function NavbarThemeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-10 w-10 shrink-0 rounded-xl border border-border/70 bg-card/80 hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors group"
            aria-label="Toggle theme"
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                {theme === 'dark' ? (
                    <Sun className="h-[18px] w-[18px] text-muted-foreground transition-colors group-hover:text-foreground" strokeWidth={2} />
                ) : (
                    <Moon className="h-[18px] w-[18px] text-muted-foreground transition-colors group-hover:text-foreground" strokeWidth={2} />
                )}
            </motion.div>
        </Button>
    )
}
