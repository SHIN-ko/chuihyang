import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Ionicons } from '@expo/vector-icons';
import { AppleAuthService } from '@/src/services/appleAuthService';
import { useAuthStore } from '@/src/stores/authStore';
import { useRouter } from 'expo-router';
import { useThemedStyles } from '@/src/hooks/useThemedStyles';

const AppleLoginButton: React.FC = () => {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(false);

  const styles = useThemedStyles(({ colors, shadows, brandColors }) =>
    StyleSheet.create({
      button: {
        backgroundColor: colors.background.primary,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border.secondary,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.glass.light,
      },
      buttonPressed: {
        opacity: 0.7,
        ...shadows.glass.medium,
      },
      icon: {
        marginRight: 12,
      },
      buttonText: {
        color: colors.text.primary,
        fontSize: 16,
        fontWeight: '600',
      },
    })
  );

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const isAvailable = await AppleAuthService.isAvailable();
    setAvailable(isAvailable);
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      const result = await AppleAuthService.signInWithApple();

      if (result.success && result.user) {
        console.log('Apple 로그인 성공:', result.user.email);
        setUser(result.user);
        router.replace('/(tabs)');
      } else if (result.cancelled) {
        console.log('사용자가 Apple 로그인을 취소했습니다.');
      }
    } catch (error: any) {
      console.error('Apple 로그인 실패:', error);
      Alert.alert(
        'Apple 로그인 실패',
        error.message || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  // iOS가 아니거나 Apple 로그인을 사용할 수 없는 경우 렌더링하지 않음
  if (!available) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.button, loading && { opacity: 0.6 }]}
      onPress={handleAppleLogin}
      disabled={loading}
      activeOpacity={0.7}
    >
      <Ionicons name="logo-apple" size={24} color="#000000" style={styles.icon} />
      <Text style={styles.buttonText}>
        {loading ? 'Apple로 로그인 중...' : 'Apple로 계속하기'}
      </Text>
    </TouchableOpacity>
  );
};

export default AppleLoginButton;