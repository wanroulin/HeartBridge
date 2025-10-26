'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeType } from "@/lib/types";

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: {children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeType>('neutral');

    // 讀取主題(from localStorage)
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as ThemeType;
        if (savedTheme) {
            setThemeState(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }, []);

    const setTheme = (newTheme: ThemeType) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{theme, setTheme}}>
            {children}
        </ThemeContext.Provider>
    );

}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider.');
    }
    return context;
}