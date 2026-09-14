import { create } from 'zustand';
import { api } from '../api/client';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.login(username, password);
      if (res.success && res.user) {
        set({
          user: res.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      }
      set({
        error: res.error || 'Invalid credentials',
        isLoading: false,
        isAuthenticated: false,
      });
      return false;
    } catch (e: any) {
      const message =
        e?.response?.data?.error || e?.message || 'Network error. Please try again.';
      set({ error: message, isLoading: false, isAuthenticated: false });
      return false;
    }
  },

  logout: async () => {
    await api.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const token = await api.getToken();
      if (!token) {
        set({ isLoading: false, isAuthenticated: false, user: null });
        return;
      }
      const user = await api.me();
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        await api.clearToken();
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      await api.clearToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
