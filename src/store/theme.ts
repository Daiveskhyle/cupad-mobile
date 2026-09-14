import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { lightColors, darkColors, type ThemeColors } from '../constants/config';

const THEME_KEY = 'cupad_theme';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  isReady: boolean;
  loadTheme: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggle: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  colors: lightColors,
  isReady: false,

  loadTheme: async () => {
    try {
      const saved = await SecureStore.getItemAsync(THEME_KEY);
      const mode: ThemeMode = saved === 'dark' ? 'dark' : 'light';
      set({
        mode,
        colors: mode === 'dark' ? darkColors : lightColors,
        isReady: true,
      });
    } catch {
      set({ isReady: true });
    }
  },

  setMode: async (mode) => {
    await SecureStore.setItemAsync(THEME_KEY, mode);
    set({
      mode,
      colors: mode === 'dark' ? darkColors : lightColors,
    });
  },

  toggle: async () => {
    const next = get().mode === 'dark' ? 'light' : 'dark';
    await get().setMode(next);
  },
}));
