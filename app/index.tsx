import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuthStore } from '@/src/stores/authStore';

export default function IndexScreen() {
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = useAuthStore();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    // 15초 후 타임아웃 표시 (로딩이 계속되는 경우에만)
    const timeout = setTimeout(() => {
      if (isLoading) {
        setTimeoutReached(true);
      }
    }, 15000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isLoading]);



  // 인증 상태가 확정되지 않은 경우 로딩 유지
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#111811',
        padding: 20
      }}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={{ color: 'white', marginTop: 16, textAlign: 'center' }}>
          앱을 초기화하는 중...
        </Text>
        {timeoutReached && (
          <Text style={{ color: '#ff6b6b', marginTop: 8, textAlign: 'center', fontSize: 12 }}>
            로딩이 오래 걸리고 있습니다.{'\n'}
            네트워크 연결을 확인해주세요.
          </Text>
        )}
      </View>
    );
  }

  // 인증 상태에 따라 적절한 화면으로 리다이렉트
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else if (hasCompletedOnboarding) {
    // 온보딩을 완료한 사용자는 바로 로그인 화면으로
    return <Redirect href="/auth/login" />;
  } else {
    // 처음 사용자는 온보딩 화면으로
    return <Redirect href="/auth/onboarding" />;
  }
}
