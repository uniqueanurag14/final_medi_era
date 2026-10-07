import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  preference: ThemePreference;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  setPreference: (pref: ThemePreference) => void;
}

export const THEME_STORAGE_KEY = 'clinic_crm_theme_preference';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getSystemTheme = (): ThemeMode => {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return 'system';
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return 'system';
  });

  const [systemTheme, setSystemTheme] = useState<ThemeMode>(getSystemTheme);

  // Resolved theme is either the explicit light/dark or systemTheme
  const theme: ThemeMode = preference === 'system' ? systemTheme : preference;

  // Sync DOM with resolved theme
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    root.classList.add('theme-transition');

    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }

    const timer = setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 250);

    return () => clearTimeout(timer);
  }, [theme]);

  // Persist preference to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // ignore
    }
  }, [preference]);

  // Listen to OS prefers-color-scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setPreference = useCallback((newPref: ThemePreference) => {
    setPreferenceState(newPref);
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setPreferenceState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setPreferenceState((currentPref) => {
      const currentResolved = currentPref === 'system' ? getSystemTheme() : currentPref;
      return currentResolved === 'dark' ? 'light' : 'dark';
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, preference, toggleTheme, setTheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
