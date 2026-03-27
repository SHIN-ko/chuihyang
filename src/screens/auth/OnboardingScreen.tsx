import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/src/stores/authStore';
import { useThemedStyles } from '@/src/hooks/useThemedStyles';
import { Button } from '@/src/components/common/Button';

const { width, height } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const { setOnboardingCompleted } = useAuthStore();

  const styles = useThemedStyles(({ colors, shadows, brandColors }) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background.primary,
      },
      content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
      },
      logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
      },
      logo: {
        color: colors.text.primary,
        fontSize: 48,
        fontWeight: '800',
        letterSpacing: -1,
        marginBottom: 4,
      },
      brandTagline: {
        color: brandColors.accent.primary,
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 3,
        textTransform: 'uppercase',
      },
      welcomeCard: {
        marginBottom: 32,
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border.primary,
        ...shadows.glass.light,
      },
      title: {
        color: colors.text.primary,
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
      },
      subtitle: {
        color: colors.text.secondary,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 26,
        fontWeight: '400',
        opacity: 0.9,
      },
      buttonContainer: {
        paddingTop: 24,
      },
      bottomSpacing: {
        height: 20,
      },
    }),
  );

  const handleGetStarted = () => {
    setOnboardingCompleted(); // 온보딩 완료 상태 저장
    router.push('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>취향</Text>
          <Text style={styles.brandTagline}>TIME, TASTE & STORY</Text>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.title}>시간이 빚어내는{'\n'}나만의 취향</Text>
          <Text style={styles.subtitle}>
            야레야레부터 파친코까지, 5가지 특별한 레시피로{'\n'}
            당신만의 담금주 이야기를 시작하세요.{'\n'}
            {'\n'}
            기다림 끝에 만나는 완벽한 그 순간까지.
          </Text>
        </View>

        {/* 시작 버튼 */}
        <View style={styles.buttonContainer}>
          <Button onPress={handleGetStarted} fullWidth>
            나의 취향 시작하기
          </Button>

          <View style={styles.bottomSpacing} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
