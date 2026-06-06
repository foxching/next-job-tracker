"use client";

import { Moon, SunMedium } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "./theme-provider";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <Button
            variant="ghost"
            className="h-8 w-8 text-foreground transition-colors hover:bg-muted/50"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            type="button"
        >
            {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    );
}
