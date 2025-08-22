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
import { useTheme } from '@/src/contexts/ThemeContext';
import { useThemedStyles } from '@/src/hooks/useThemedStyles';
import { GlassCard } from '@/src/components/common/GlassCard';
import { Button } from '@/src/components/common/Button';

const { width, height } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const { setOnboardingCompleted } = useAuthStore();
  const { theme } = useTheme();

  const styles = useThemedStyles(({ colors, shadows, brandColors }) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    backgroundGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: colors.background.secondary,
      opacity: 0.5,
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
      lineHeight: 24,
      fontWeight: '400',
    },
    buttonContainer: {
      paddingTop: 24,
    },
    bottomSpacing: {
      height: 20,
    },
  }));

  const handleGetStarted = () => {
    setOnboardingCompleted(); // 온보딩 완료 상태 저장
    router.push('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* 배경 그라디언트 */}
      <View style={styles.backgroundGradient} />
      
      <View style={styles.content}>
        {/* 로고 섹션 */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>취향</Text>
          <Text style={styles.brandTagline}>CHUIHYANG</Text>
        </View>

        {/* 환영 메시지 카드 */}
        <GlassCard style={styles.welcomeCard} intensity="medium">
          <Text style={styles.title}>
            담금주 프로젝트 관리의{'\n'}새로운 경험
          </Text>
          <Text style={styles.subtitle}>
            나만의 담금주 프로젝트를 체계적으로 관리하고,{'\n'}
            처음부터 완성까지 모든 과정을 기록해보세요.
          </Text>
        </GlassCard>

        {/* 시작 버튼 */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleGetStarted}
            fullWidth
          >
            시작하기
          </Button>
          
          <View style={styles.bottomSpacing} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
