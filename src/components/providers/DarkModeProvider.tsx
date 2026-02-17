// Dark Mode Context Provider for Admin Panel
// Location: src/components/providers/DarkModeProvider.tsx
// Purpose: Manage dark mode state across admin panel

import React, { createContext, useContext, useEffect, useState } from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check localStorage first
    const stored = typeof window !== 'undefined' ? localStorage.getItem('dark-mode') : null;
    if (stored !== null) {
      return stored === 'true';
    }

    // Check system preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    return false;
  });

  // Update DOM and localStorage when dark mode changes
  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('dark-mode', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export const useDarkMode = (): DarkModeContextType => {
  const context = useContext(DarkModeContext);

  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider');
  }

  return context;
};

// ============================================================================
// DARK MODE TOGGLE COMPONENT
// ============================================================================

export const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="
        inline-flex items-center justify-center
        w-10 h-10 rounded-lg
        bg-gray-100 dark:bg-gray-800
        text-gray-600 dark:text-gray-300
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
      "
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        // Sun icon (light mode)
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.657-9.193a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zm2.828 9.193a1 1 0 101.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        // Moon icon (dark mode)
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};
