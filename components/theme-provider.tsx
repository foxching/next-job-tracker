"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialTheme(): Theme {
    if (typeof window === "undefined") {
        return "light";
    }

    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
        return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");

    useEffect(() => {
        setThemeState(getInitialTheme());
    }, []);

    useEffect(() => {
        if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", theme === "dark");
        }
        window.localStorage.setItem("theme", theme);
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            setTheme: setThemeState,
            toggleTheme: () => setThemeState((current) => (current === "dark" ? "light" : "dark")),
        }),
        [theme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default ThemeProvider;

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }
    return context;
}
