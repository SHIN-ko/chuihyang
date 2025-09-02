import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/src/types';
import { SupabaseService } from '@/src/services/supabaseService';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

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
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
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
          // Supabase가 설정되지 않은 경우 로컬 상태만 확인
          if (!isSupabaseConfigured()) {
            console.warn('Supabase가 설정되지 않아 로컬 인증 상태만 확인합니다.');
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          // 네트워크 연결 상태 확인을 위한 타임아웃 추가
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth check timeout')), 10000)
          );
          
          const authPromise = SupabaseService.getCurrentUser();
          const user = await Promise.race([authPromise, timeoutPromise]);
          
          if (user) {
            set({ user: user as User, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('인증 상태 확인 실패:', error);
          // 인증 실패해도 앱은 계속 실행되도록 처리
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      refreshUser: async () => {
        try {
          if (!isSupabaseConfigured()) {
            console.warn('Supabase가 설정되지 않아 사용자 정보를 새로고침할 수 없습니다.');
            return;
          }

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
          if (!isSupabaseConfigured()) {
            console.warn('Supabase가 설정되지 않아 로그인할 수 없습니다.');
            set({ isLoading: false });
            return false;
          }

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
          if (!isSupabaseConfigured()) {
            console.warn('Supabase가 설정되지 않아 회원가입할 수 없습니다.');
            set({ isLoading: false });
            return false;
          }

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

      loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
          if (!isSupabaseConfigured()) {
            console.warn('Supabase가 설정되지 않아 구글 로그인할 수 없습니다.');
            set({ isLoading: false });
            return false;
          }

          const { GoogleAuthService } = await import('@/src/services/googleAuthService');
          const result = await GoogleAuthService.signInWithGoogle();
          
          if (result.success) {
            // OAuth 프로세스가 시작됨을 표시
            // 실제 로그인 완료는 deep link 콜백에서 처리됨
            console.log('구글 OAuth 프로세스 시작됨');
            set({ isLoading: false });
            return true;
          }
          
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('구글 로그인 실패:', error);
          set({ isLoading: false });
          return false;
        }
      },

      loginWithApple: async () => {
        set({ isLoading: true });
        try {
          if (!isSupabaseConfigured()) {
            console.warn('Supabase가 설정되지 않아 Apple 로그인할 수 없습니다.');
            set({ isLoading: false });
            return false;
          }

          const { AppleAuthService } = await import('@/src/services/appleAuthService');
          const result = await AppleAuthService.signInWithApple();
          
          if (result.success) {
            // Apple OAuth 프로세스가 시작됨을 표시
            // 실제 로그인 완료는 deep link 콜백에서 처리됨
            console.log('Apple OAuth 프로세스 시작됨');
            set({ isLoading: false });
            return true;
          }
          
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Apple 로그인 실패:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          if (isSupabaseConfigured()) {
            await SupabaseService.signOut();
          }
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
