import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemedStyles } from '@/src/hooks/useThemedStyles';
import { GoogleAuthService } from '@/src/services/googleAuthService';
import { useAuthStore } from '@/src/stores/authStore';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const styles = useThemedStyles(({ colors, shadows, brandColors }) => StyleSheet.create({
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background.surface,
      borderWidth: 1,
      borderColor: colors.border.primary,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginVertical: 8,
      ...shadows.glass.light,
    },
    googleButtonPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    googleIcon: {
      marginRight: 12,
    },
    googleText: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    loadingText: {
      color: colors.text.secondary,
    },
  }));

  const handleGoogleLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      console.log('구글 로그인 시작');
      const { loginWithGoogle } = useAuthStore.getState();
      const success = await loginWithGoogle();
      
      if (success) {
        console.log('구글 OAuth URL 열기 성공');
        // OAuth 플로우가 시작되었음을 사용자에게 알림
        // 실제 로그인 완료는 Deep Link 콜백에서 처리됨
        onSuccess?.();
        
        // 사용자에게 브라우저에서 로그인하라는 안내 메시지 표시
        Alert.alert(
          '구글 로그인',
          '브라우저가 열립니다. 구글 계정으로 로그인한 후 앱으로 돌아와 주세요.',
          [{ text: '확인' }]
        );
      } else {
        throw new Error('구글 로그인을 시작할 수 없습니다. 네트워크 연결을 확인해주세요.');
      }
    } catch (error) {
      console.error('구글 로그인 오류:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : '구글 로그인 중 오류가 발생했습니다.';
      
      Alert.alert('로그인 실패', errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.googleButton,
        isLoading && styles.googleButtonPressed,
      ]}
      onPress={handleGoogleLogin}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <View style={styles.googleIcon}>
        <Ionicons 
          name="logo-google" 
          size={20} 
          color="#4285F4" 
        />
      </View>
      <Text style={[
        styles.googleText,
        isLoading && styles.loadingText,
      ]}>
        {isLoading ? '로그인 중...' : 'Google로 계속하기'}
      </Text>
    </TouchableOpacity>
  );
};

export default GoogleLoginButton;
