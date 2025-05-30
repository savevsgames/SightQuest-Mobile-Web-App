import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => Promise<void>;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: async () => {},
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('light');

  // Initialize theme based on user preferences or system theme
  useEffect(() => {
    if (user?.settings?.darkMode !== undefined) {
      setTheme(user.settings.darkMode ? 'dark' : 'light');
    } else {
      setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [user, systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (user) {
      await updateProfile({
        settings: {
          ...user.settings,
          darkMode: newTheme === 'dark'
        }
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme,
      isDark: theme === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// Theme configuration
export const colors = {
  light: {
    primary: '#0284C7',
    secondary: '#0EA5E9',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    error: '#DC2626',
    success: '#22C55E',
    warning: '#F59E0B',
  },
  dark: {
    primary: '#0EA5E9',
    secondary: '#38BDF8',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
    error: '#EF4444',
    success: '#4ADE80',
    warning: '#FBBF24',
  }
};