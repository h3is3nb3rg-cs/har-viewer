import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '../styles/theme';
import { lightTheme, darkTheme } from '../styles/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  themeMode: ThemeMode;
  theme: Theme;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'light',
      theme: lightTheme,
      toggleTheme: () =>
        set((state) => {
          const newMode = state.themeMode === 'light' ? 'dark' : 'light';
          const newTheme = newMode === 'dark' ? darkTheme : lightTheme;
          // Update HTML attribute for CSS
          document.documentElement.setAttribute('data-theme', newMode);
          return { themeMode: newMode, theme: newTheme };
        }),
      setThemeMode: (mode) =>
        set(() => {
          const newTheme = mode === 'dark' ? darkTheme : lightTheme;
          // Update HTML attribute for CSS
          document.documentElement.setAttribute('data-theme', mode);
          return { themeMode: mode, theme: newTheme };
        }),
    }),
    {
      name: 'theme-storage', // localStorage key
      partialize: (state: ThemeState) => ({ themeMode: state.themeMode }), // Only persist themeMode
      onRehydrateStorage: () => (state: ThemeState | undefined) => {
        // Set the theme after rehydration
        if (state) {
          document.documentElement.setAttribute('data-theme', state.themeMode);
        }
      },
    }
  )
);
