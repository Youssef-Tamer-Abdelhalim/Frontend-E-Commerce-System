import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials, RegisterData } from '@/types';
import { authApi, usersApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pendingVerificationEmail: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setPendingVerificationEmail: (email: string | null) => void;
  fetchUser: () => Promise<void>;
  clearError: () => void;
  hydrateAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      pendingVerificationEmail: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          const { accessToken, user } = response.data;
          
          // Store accessToken in localStorage for API client
          localStorage.setItem('accessToken', accessToken);
          
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
            pendingVerificationEmail: null,
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'حدث خطأ أثناء تسجيل الدخول';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.signup(data);
          
          // No token returned — user must verify email first
          set({
            isLoading: false,
            pendingVerificationEmail: data.email,
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'حدث خطأ أثناء إنشاء الحساب';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      verifyEmail: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.verifyEmail({ verificationCode: code });
          const { accessToken, user } = response.data;
          
          localStorage.setItem('accessToken', accessToken);
          
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
            pendingVerificationEmail: null,
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'كود التحقق غير صحيح';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      resendVerification: async () => {
        const email = get().pendingVerificationEmail;
        if (!email) return;

        set({ isLoading: true, error: null });
        try {
          await authApi.resendVerification({ email });
          set({ isLoading: false });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'فشل في إعادة إرسال الكود';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Continue with local logout even if API call fails
        }
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('auth-storage');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          pendingVerificationEmail: null,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        localStorage.setItem('accessToken', token);
        set({ token, isAuthenticated: true });
      },

      setPendingVerificationEmail: (email: string | null) => {
        set({ pendingVerificationEmail: email });
      },

      fetchUser: async () => {
        const token = get().token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await usersApi.getMe();
          set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch {
          // Token might be invalid, clear auth
          get().logout();
          set({ isLoading: false });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      hydrateAuth: () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (token) {
          set({ token, isAuthenticated: true });
          get().fetchUser();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        pendingVerificationEmail: state.pendingVerificationEmail,
      }),
    }
  )
);
