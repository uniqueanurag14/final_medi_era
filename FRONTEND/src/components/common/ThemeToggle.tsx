import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  id?: string;
  size?: 'sm' | 'md';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  id = 'theme-toggle-button',
  size = 'md',
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const sizeClasses = size === 'sm' ? 'p-1.5' : 'p-2';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4';

  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      className={`rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer flex items-center justify-center select-none ${sizeClasses} ${
        isDark
          ? 'text-amber-300 hover:text-amber-200 hover:bg-slate-800 bg-slate-800/80 border border-slate-700 shadow-xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 border border-slate-200/80 shadow-xs'
      } ${className}`}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className={`${iconSize} transition-transform duration-300 hover:rotate-45`} aria-hidden="true" />
      ) : (
        <Moon className={`${iconSize} transition-transform duration-300 -rotate-12 hover:rotate-0`} aria-hidden="true" />
      )}
    </button>
  );
};
