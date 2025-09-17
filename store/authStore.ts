import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        // Mock authentication - replace with real auth logic
        if (email && password.length >= 6) {
          const user: User = {
            id: '1',
            name: 'Admin User',
            email,
            role: 'admin',
          };
          set({ user, isAuthenticated: true });
        } else {
          throw new Error('Invalid credentials');
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        // Mock registration - replace with real auth logic
        if (name && email && password.length >= 6) {
          const user: User = {
            id: Date.now().toString(),
            name,
            email,
            role: 'admin',
          };
          set({ user, isAuthenticated: true });
        } else {
          throw new Error('Invalid registration data');
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      initializeAuth: () => {
        // This will be called on app startup to check persisted auth state
        const { user } = get();
        if (user) {
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);