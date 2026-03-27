import React, { createContext, useContext, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';

export type ThemeMode = 'light' | 'dark'; // 하위 호환

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const noop = () => {};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const contextValue: ThemeContextType = {
    theme: 'light',
    toggleTheme: noop,
    setTheme: noop,
    isLoading: false,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <StatusBar style="dark" />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
