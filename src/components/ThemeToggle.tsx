import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
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
    <div className="flex bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 p-1 rounded-full transition-colors relative">
      <div 
        className={cn(
          "absolute inset-y-1 w-1/2 bg-slate-600 rounded-full transition-transform duration-300 ease-in-out shadow-sm",
          isDark ? "translate-x-full" : "translate-x-0"
        )}
      />
      <button
        onClick={() => toggleTheme(false)}
        className={cn(
          "relative z-10 w-8 h-6 flex items-center justify-center rounded-full transition-colors",
          !isDark ? "text-white" : "text-slate-400 hover:text-slate-200"
        )}
        aria-label="Light theme"
      >
        <Sun size={12} />
      </button>
      <button
        onClick={() => toggleTheme(true)}
        className={cn(
          "relative z-10 w-8 h-6 flex items-center justify-center rounded-full transition-colors",
          isDark ? "text-white" : "text-slate-400 hover:text-slate-200"
        )}
        aria-label="Dark theme"
      >
        <Moon size={12} />
      </button>
    </div>
  );
};
