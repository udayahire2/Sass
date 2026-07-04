import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardPanel } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ThemeCard({
  currentTheme,
  onThemeChange,
}: {
  currentTheme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
}) {
  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
  ] as const;

  return (
    <Card className="border shadow-none">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm font-medium">Appearance</CardTitle>
      </CardHeader>
      <CardPanel className="px-4 pb-4 space-y-1">
        {options.map(({ value, icon: Icon, label }) => (
          <Button
            key={value}
            variant="ghost"
            onClick={() => onThemeChange(value)}
            className={cn(
              "w-full justify-start",
              currentTheme === value ? "bg-muted/60 font-semibold" : "font-normal",
            )}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
            {currentTheme === value && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </Button>
        ))}
      </CardPanel>
    </Card>
  );
}
