import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/src/types';
import { SupabaseService } from '@/src/services/supabaseService';
import { supabase } from '@/src/lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setOnboardingCompleted: () => void;
  checkAuthState: () => Promise<void>;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, birthdate?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Expo SecureStore adapter for zustand persist
const secureStorage = {
  getItem: async (name: string) => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {
      // Handle error silently
    }
  },
  removeItem: async (name: string) => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // Handle error silently
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasCompletedOnboarding: false,

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      clearUser: () => {
        set({ user: null, isAuthenticated: false });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setOnboardingCompleted: () => {
        set({ hasCompletedOnboarding: true });
      },

      checkAuthState: async () => {
        set({ isLoading: true });
        try {
          const user = await SupabaseService.getCurrentUser();
          
          if (user) {
            set({ user: user as User, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('인증 상태 확인 실패:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      refreshUser: async () => {
        try {
          const user = await SupabaseService.getCurrentUser();
          
          if (user) {
            set({ user: user as User });
          }
        } catch (error) {
          console.error('사용자 정보 새로고침 실패:', error);
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { session, user: authUser } = await SupabaseService.signIn(email, password);
          
          if (session && authUser) {
            const user = await SupabaseService.getCurrentUser();
            if (user) {
              set({ 
                user: user as User, 
                isAuthenticated: true, 
                isLoading: false,
                hasCompletedOnboarding: true // 로그인 성공 시에도 온보딩 완료 처리
              });
              return true;
            }
          }
          
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('로그인 실패:', error);
          set({ isLoading: false });
          return false;
        }
      },

      signup: async (email: string, password: string, name: string, birthdate?: string) => {
        set({ isLoading: true });
        try {
          const { user: authUser, session } = await SupabaseService.signUp(email, password, name, birthdate);
          
          if (authUser && session) {
            const user = await SupabaseService.getCurrentUser();
            if (user) {
              set({ 
                user: user as User, 
                isAuthenticated: true, 
                isLoading: false,
                hasCompletedOnboarding: true // 회원가입 성공 시 온보딩 완료 처리
              });
              return true;
            }
          } else if (authUser && !session) {
            // 이메일 확인 필요한 경우도 온보딩 완료 처리
            set({ 
              isLoading: false,
              hasCompletedOnboarding: true
            });
            return true;
          }
          
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('회원가입 실패:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await SupabaseService.signOut();
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('로그아웃 실패:', error);
          // 오류가 발생해도 로컬 상태는 초기화
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding
      }),
    }
  )
);
