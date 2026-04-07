import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { app } from '@/lib/firebase';

export type UserRole = 'candidate' | 'employer' | 'hr' | 'enterprise' | 'admin';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  auth_provider: string;
  photo_url?: string;
  company?: string;
  onboarding_complete?: boolean;
  created_at?: string;
}

interface AuthState {
  user: CurrentUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  signInWithGoogle: (role?: UserRole, company?: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string, role: UserRole, company?: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: CurrentUser | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
  refreshToken: () => Promise<string | null>;
  updateProfile: (data: Partial<CurrentUser>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const API = 'http://127.0.0.1:8000';
// Note: If API is '', then calls are relative. For local dev, Vite handles the proxy or you can set VITE_API_URL=http://localhost:8000 in your .env.local file.


export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      signInWithGoogle: async (role = 'candidate', company) => {
        set({ isLoading: true, error: null });
        try {
          const auth = getAuth(app);
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const idToken = await result.user.getIdToken();

          const resp = await fetch(`${API}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: idToken, role, company }),
          });
          if (!resp.ok) throw new Error('Backend auth failed');
          const data = await resp.json();
          set({ user: data.user, token: data.access_token, isLoading: false });
        } catch (err: any) {
          // UX-1 FIX: Always reset isLoading in finally — was only reset on success/specific catch
          set({ error: err.message || 'Google sign-in failed', isLoading: false });
          throw err;
        }
      },

      registerWithEmail: async (email, password, name, role, company) => {
        set({ isLoading: true, error: null });
        try {
          const resp = await fetch(`${API}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, role, company }),
          });
          if (!resp.ok) {
            const err = await resp.json();
            throw new Error(err.detail || 'Registration failed');
          }
          const data = await resp.json();
          set({ user: data.user, token: data.access_token, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        } finally {
          // UX-1 FIX: Guarantee isLoading is always reset even on network drop
          set(state => ({ isLoading: state.isLoading ? false : state.isLoading }));
        }
      },

      loginWithEmail: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const resp = await fetch(`${API}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (!resp.ok) {
            const err = await resp.json();
            throw new Error(err.detail || 'Login failed');
          }
          const data = await resp.json();
          set({ user: data.user, token: data.access_token, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        } finally {
          // UX-1 FIX: Guarantee isLoading reset
          set(state => ({ isLoading: state.isLoading ? false : state.isLoading }));
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          const auth = getAuth(app);
          await signOut(auth);
          // Call backend logout
          await fetch(`${API}/api/auth/logout`, { method: 'POST' }).catch(() => {});
          set({ user: null, token: null, isLoading: false, error: null });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        } finally {
          // UX-1 FIX: Always ensure clean state on logout
          set(state => ({ isLoading: false }));
        }
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      clearError: () => set({ error: null }),

      refreshToken: async () => {
        const { token } = get();
        if (!token) return null;
        try {
          const resp = await fetch(`${API}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!resp.ok) {
            get().logout();
            return null;
          }
          const data = await resp.json();
          set({ token: data.access_token });
          return data.access_token;
        } catch (err) {
          get().logout();
          return null;
        }
      },

      updateProfile: async (data) => {
        const { token } = get();
        if (!token) return;
        set({ isLoading: true, error: null });
        try {
          const resp = await fetch(`${API}/api/users/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data),
          });
          if (!resp.ok) {
            const err = await resp.json();
            throw new Error(err.detail || 'Could not update profile');
          }
          const updatedUser = await resp.json();
          set({ user: updatedUser, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      refreshProfile: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const resp = await fetch(`${API}/api/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resp.ok) {
            const updatedUser = await resp.json();
            set({ user: updatedUser });
          }
        } catch (err) {
          console.error("Failed to background refresh profile", err);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
