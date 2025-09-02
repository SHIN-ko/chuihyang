import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from '@/src/hooks/useThemedStyles';
import { DemoAccountService } from '@/src/services/demoAccountService';
import { useAuthStore } from '@/src/stores/authStore';

interface DemoLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const DemoLoginButton: React.FC<DemoLoginButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const styles = useThemedStyles(({ colors, shadows, brandColors }) => StyleSheet.create({
    demoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brandColors.accent.secondary,
      borderWidth: 1,
      borderColor: brandColors.accent.secondary,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginVertical: 8,
      ...shadows.glass.light,
    },
    demoButtonPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    demoIcon: {
      marginRight: 12,
    },
    demoText: {
      color: colors.background.primary,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    loadingText: {
      color: colors.background.primary,
      opacity: 0.7,
    },
  }));

  const handleDemoLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      console.log('데모 계정 로그인 시작');
      
      // 먼저 데모 계정이 존재하는지 확인하고 없으면 생성
      try {
        await DemoAccountService.createDemoAccount();
      } catch (error) {
        console.log('데모 계정 생성 실패, 기존 계정으로 로그인 시도:', error);
      }
      
      // 데모 계정으로 로그인
      const result = await DemoAccountService.signInWithDemoAccount();
      
      if (result.success && result.user) {
        console.log('데모 계정 로그인 성공');
        
        // 사용자 정보 설정
        setUser({
          id: result.user.id,
          email: result.user.email || 'shs28100@naver.com',
          nickname: result.user.user_metadata?.nickname || result.user.user_metadata?.full_name || result.user.user_metadata?.name || '데모 사용자',
          createdAt: result.user.created_at || new Date().toISOString(),
          updatedAt: result.user.updated_at || new Date().toISOString(),
        });
        
        onSuccess?.();
      }
    } catch (error) {
      console.error('데모 계정 로그인 오류:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : '데모 계정 로그인 중 오류가 발생했습니다.';
      
      Alert.alert('로그인 실패', errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.demoButton,
        isLoading && styles.demoButtonPressed,
      ]}
      onPress={handleDemoLogin}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <View style={styles.demoIcon}>
        <Ionicons 
          name="person-circle-outline" 
          size={20} 
          color="#FFFFFF" 
        />
      </View>
      <Text style={[
        styles.demoText,
        isLoading && styles.loadingText,
      ]}>
        {isLoading ? '로그인 중...' : '데모 계정으로 로그인'}
      </Text>
    </TouchableOpacity>
  );
};

export default DemoLoginButton;
