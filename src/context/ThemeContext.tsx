import React, { createContext, useContext, useState } from 'react';

export interface ThemeColors {
    primary: string;
    primaryLight: string;
    secondary: string;
    background: string;
    surface: string;
    surfaceSecondary: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderLight: string;
    success: string;
    successBg: string;
    warning: string;
    warningBg: string;
    danger: string;
    dangerBg: string;
    card: string;
    inputBg: string;
    tabBar: string;
    statusBar: 'light-content' | 'dark-content';
}

export const LightTheme: ThemeColors = {
    primary: '#4F46E5',
    primaryLight: '#EEF2FF',
    secondary: '#7C3AED',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    success: '#16A34A',
    successBg: '#F0FDF4',
    warning: '#F59E0B',
    warningBg: '#FFF7ED',
    danger: '#EF4444',
    dangerBg: '#FEF2F2',
    card: '#FFFFFF',
    inputBg: '#F8FAFC',
    tabBar: '#FFFFFF',
    statusBar: 'dark-content',
};

export const DarkTheme: ThemeColors = {
    primary: '#818CF8',
    primaryLight: '#1E1B4B',
    secondary: '#A78BFA',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    border: '#334155',
    borderLight: '#1E293B',
    success: '#4ADE80',
    successBg: '#14532D',
    warning: '#FBBF24',
    warningBg: '#78350F',
    danger: '#F87171',
    dangerBg: '#7F1D1D',
    card: '#1E293B',
    inputBg: '#334155',
    tabBar: '#1E293B',
    statusBar: 'light-content',
};

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
    colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => { },
    colors: LightTheme,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => setIsDark(prev => !prev);

    const colors = isDark ? DarkTheme : LightTheme;

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};
