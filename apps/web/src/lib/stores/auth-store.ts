import { create } from "zustand";
import { api, type UserInfo } from "@/lib/api";

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: UserInfo) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.login(email, password);
      if (res.data?.user) {
        set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Login failed",
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.register(name, email, password);
      if (res.data?.user) {
        set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Registration failed",
        isLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    await api.logout();
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const res = await api.getMe();
      if (res.data) {
        set({ user: res.data, isAuthenticated: true, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user: UserInfo) => set({ user }),

  clearError: () => set({ error: null }),
}));
