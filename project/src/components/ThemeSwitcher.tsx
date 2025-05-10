import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-[var(--mastil-bg-secondary)] 
                 active:bg-[var(--mastil-bg-primary)] transition-colors duration-150"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-[var(--mastil-text-primary)]" />
      ) : (
        <Moon size={20} className="text-[var(--mastil-text-primary)]" />
      )}
    </button>
  );
};

export default ThemeSwitcher;