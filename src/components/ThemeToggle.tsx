import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = (dark: boolean) => {
    setIsDark(dark);
    if (!dark) {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    } else {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <div className="relative flex rounded-full border p-1 shadow-sm transition-colors bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-800/50 dark:border-slate-700/50 dark:hover:bg-slate-800">
      <div
        className={cn(
          'absolute inset-y-1 w-1/2 rounded-full transition-transform duration-300 ease-in-out',
          'bg-slate-900 shadow-sm dark:bg-slate-600',
          isDark ? 'translate-x-full' : 'translate-x-0'
        )}
      />
      <button
        onClick={() => toggleTheme(false)}
        className={cn(
          'relative z-10 h-6 w-8 rounded-full flex items-center justify-center transition-colors',
          !isDark ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        )}
        aria-label="Light theme"
      >
        <Sun size={12} />
      </button>
      <button
        onClick={() => toggleTheme(true)}
        className={cn(
          'relative z-10 h-6 w-8 rounded-full flex items-center justify-center transition-colors',
          isDark ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        )}
        aria-label="Dark theme"
      >
        <Moon size={12} />
      </button>
    </div>
  );
};
