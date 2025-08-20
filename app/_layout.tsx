import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/src/stores/authStore';
import { useNotificationStore } from '@/src/stores/notificationStore';
import { ThemeProvider as CustomThemeProvider } from '@/src/contexts/ThemeContext';
import { supabase } from '@/src/lib/supabase';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { isAuthenticated, checkAuthState, isLoading } = useAuthStore();
  const { initializeNotifications } = useNotificationStore();

  useEffect(() => {
    // 앱 시작 시 인증 상태 확인 (한 번만)
    checkAuthState();
  }, []);

  useEffect(() => {
    // 사용자가 인증된 경우에만 알림 시스템 초기화
    if (isAuthenticated) {
      initializeNotifications();
    }
  }, [isAuthenticated, initializeNotifications]);

  // Deep Link 처리
  useEffect(() => {
    // URL에서 토큰 추출하는 함수
    const extractTokensFromUrl = (url: string) => {
      try {
        const urlObj = new URL(url);
        
        // Query parameters에서 토큰 추출
        const access_token = urlObj.searchParams.get('access_token');
        const refresh_token = urlObj.searchParams.get('refresh_token');
        
        // Hash fragment에서 토큰 추출 (일부 경우)
        if (!access_token && urlObj.hash) {
          const hashParams = new URLSearchParams(urlObj.hash.substring(1));
          return {
            access_token: hashParams.get('access_token'),
            refresh_token: hashParams.get('refresh_token'),
          };
        }
        
        return { access_token, refresh_token };
      } catch (error) {
        console.error('URL 파싱 오류:', error);
        return { access_token: null, refresh_token: null };
      }
    };

    // URL 변경 리스너 설정
    const handleDeepLink = (url: string) => {
      console.log('Deep Link 수신:', url);
      
      // 비밀번호 재설정 링크 확인 (myapp scheme과 다양한 패턴 지원)
      if (url.includes('/auth/reset-password') || 
          url.includes('type=recovery') || 
          url.includes('myapp://')) {
        
        const { access_token, refresh_token } = extractTokensFromUrl(url);
        
        console.log('추출된 토큰:', { access_token: !!access_token, refresh_token: !!refresh_token });
        
        // 약간의 딜레이 후 화면 이동 (앱 초기화 대기)
        setTimeout(() => {
          if (access_token && refresh_token) {
            router.push({
              pathname: '/auth/reset-password',
              params: {
                access_token,
                refresh_token,
              },
            });
          } else {
            // 토큰이 없어도 화면으로 이동 (세션 복구 시도)
            router.push('/auth/reset-password');
          }
        }, 500);
      }
    };

    // 초기 URL 확인 (앱이 닫힌 상태에서 링크로 열린 경우)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // URL 변경 이벤트 리스너 (앱이 열린 상태에서 링크 클릭 시)
    const linkingListener = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Supabase Auth 상태 변화 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth 상태 변화:', event, session);
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('패스워드 복구 세션 감지');
        // 비밀번호 복구 세션이 설정된 경우
        router.push('/auth/reset-password');
      }
    });

    return () => {
      linkingListener?.remove();
      subscription?.unsubscribe();
    };
  }, [router]);

  // 로딩 중에는 null 반환 (스플래시 스크린 유지)
  if (isLoading) {
    return null;
  }

  return (
    <CustomThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="project" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </CustomThemeProvider>
  );
}
