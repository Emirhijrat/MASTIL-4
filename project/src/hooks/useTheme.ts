import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'mastil_theme';

const getInitialTheme = (): Theme => {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    // Only accept explicit 'dark' as valid, otherwise default to 'light'
    return storedTheme === 'dark' ? 'dark' : 'light';
  } catch (error) {
    console.error("Error reading theme from localStorage, defaulting to light:", error);
    return 'light';
  }
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error("Error saving theme to localStorage:", error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme };
}