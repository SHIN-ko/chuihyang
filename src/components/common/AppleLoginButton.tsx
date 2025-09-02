import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from '@/src/hooks/useThemedStyles';
import { AppleAuthService } from '@/src/services/appleAuthService';
import { useAuthStore } from '@/src/stores/authStore';

interface AppleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const AppleLoginButton: React.FC<AppleLoginButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const styles = useThemedStyles(({ colors, shadows, brandColors }) => StyleSheet.create({
    appleButton: {
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
    appleButtonPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    appleIcon: {
      marginRight: 12,
    },
    appleText: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    loadingText: {
      color: colors.text.secondary,
    },
  }));

  // Apple 로그인 사용 가능 여부 확인
  useEffect(() => {
    const checkAvailability = async () => {
      if (Platform.OS === 'ios') {
        console.log('Apple 로그인 사용 가능 여부 확인 중...');
        const available = await AppleAuthService.isAvailable();
        console.log('Apple 로그인 사용 가능:', available);
        setIsAvailable(available);
      } else {
        console.log('iOS가 아니므로 Apple 로그인 비활성화');
        setIsAvailable(false);
      }
    };
    
    checkAvailability();
  }, []);

  const handleAppleLogin = async () => {
    if (isLoading || !isAvailable) return;

    setIsLoading(true);
    try {
      console.log('Apple 로그인 시작');
      const result = await AppleAuthService.signInWithApple();
      
      if (result.success && result.user) {
        console.log('Apple 로그인 성공');
        
        // 사용자 정보 설정
        setUser({
          id: result.user.id,
          email: result.user.email || 'apple-user@example.com',
          nickname: result.user.user_metadata?.nickname || result.user.user_metadata?.full_name || result.user.user_metadata?.name || 'Apple 사용자',
          createdAt: result.user.created_at || new Date().toISOString(),
          updatedAt: result.user.updated_at || new Date().toISOString(),
        });
        
        onSuccess?.();
      } else {
        throw new Error('Apple 로그인 결과가 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('Apple 로그인 오류:', error);
      
      // 사용자가 취소한 경우는 알림을 표시하지 않음
      if (error?.message?.includes('취소') || error?.message?.includes('canceled')) {
        console.log('사용자가 Apple 로그인을 취소했습니다.');
        return;
      }
      
      // Apple 로그인을 사용할 수 없는 경우
      if (error?.message?.includes('사용할 수 없습니다')) {
        Alert.alert('Apple 로그인 불가', 'Apple 로그인을 사용할 수 없습니다. iOS 13 이상에서만 지원됩니다.');
        return;
      }
      
      // "The authorization attempt failed for an unknown reason" 오류 처리
      if (error?.message?.includes('authorization attempt failed')) {
        Alert.alert(
          'Apple 로그인 설정 문제', 
          'Apple Developer 계정 설정이 필요합니다. 다음을 확인해주세요:\n\n' +
          '1. Apple Developer 계정에 Bundle ID 등록\n' +
          '2. Sign In with Apple capability 활성화\n' +
          '3. 실제 기기에서 테스트 (시뮬레이터 제한)',
          [{ text: '확인' }]
        );
        return;
      }
      
      const errorMessage = error?.message || 'Apple 로그인 중 오류가 발생했습니다.';
      Alert.alert('로그인 실패', errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  // iOS가 아니거나 Apple 로그인을 사용할 수 없는 경우 버튼을 숨김
  if (Platform.OS !== 'ios') {
    console.log('iOS가 아니므로 Apple 로그인 버튼 숨김');
    return null;
  }
  
  if (!isAvailable) {
    console.log('Apple 로그인을 사용할 수 없으므로 버튼 숨김');
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.appleButton,
        isLoading && styles.appleButtonPressed,
      ]}
      onPress={handleAppleLogin}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <View style={styles.appleIcon}>
        <Ionicons 
          name="logo-apple" 
          size={20} 
          color="#000000" 
        />
      </View>
      <Text style={[
        styles.appleText,
        isLoading && styles.loadingText,
      ]}>
        {isLoading ? '로그인 중...' : 'Apple로 계속하기'}
      </Text>
    </TouchableOpacity>
  );
};

export default AppleLoginButton;
