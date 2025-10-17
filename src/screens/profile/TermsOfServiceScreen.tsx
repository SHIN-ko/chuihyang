import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/src/components/common/GlassCard';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

interface TermsSection {
  title: string;
  bullets: string[];
}

const TERMS_SECTIONS: TermsSection[] = [
  {
    title: '1. 목적',
    bullets: [
      '본 약관은 담금주 취향(이하 “서비스”)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.',
    ],
  },
  {
    title: '2. 이용계약의 성립',
    bullets: [
      '이용자는 이메일, 비밀번호, 닉네임 등 필수 정보를 제공하여 회원가입을 신청합니다.',
      '회사는 필요한 경우 본인 확인 절차를 요청할 수 있으며, 이를 완료한 시점에 이용계약이 체결됩니다.',
      '거짓 정보 제공 또는 타인의 정보를 도용한 사실이 확인되면 가입 승인이 거절되거나 이용이 제한될 수 있습니다.',
    ],
  },
  {
    title: '3. 계정 관리 및 보안',
    bullets: [
      '계정과 비밀번호의 관리 책임은 이용자에게 있으며, 이를 제3자가 이용하지 않도록 주의해야 합니다.',
      '계정 도용이나 보안 침해가 의심되는 경우 즉시 앱 내 문의 또는 이메일(shs2810@gmail.com)로 알려야 합니다.',
      '오랜 기간 사용하지 않은 계정은 관련 법령에 따라 휴면 또는 삭제 처리될 수 있습니다.',
    ],
  },
  {
    title: '4. 서비스 이용',
    bullets: [
      '이용자는 담금주 레시피 추천, 숙성 알림, 프로젝트 관리 등 서비스가 제공하는 기능을 개인적인 용도로 사용할 수 있습니다.',
      '서비스 내 제공되는 콘텐츠와 데이터는 회사에 저작권이 있으며, 사전 동의 없이 복제·배포·판매할 수 없습니다.',
      '앱의 정상적인 운영을 방해하거나 시스템에 과도한 부하를 주는 행위는 금지됩니다.',
    ],
  },
  {
    title: '5. 알림 및 마케팅 수신',
    bullets: [
      '회사는 서비스 운영에 필요한 공지, 업데이트, 예약 알림을 앱 내 푸시 알림 또는 이메일로 발송할 수 있습니다.',
      '마케팅 정보 수신 동의는 선택 사항이며, 언제든지 앱 내 설정에서 수신 동의를 변경할 수 있습니다.',
    ],
  },
  {
    title: '6. 유료 서비스 및 결제',
    bullets: [
      '현재 서비스는 무료로 제공되며, 유료 기능 도입 시 별도의 결제 약관과 고지 절차를 통해 안내합니다.',
    ],
  },
  {
    title: '7. 이용제한 및 계약 해지',
    bullets: [
      '이용자가 약관을 위반하거나 불법 행위를 한 경우, 회사는 사전 통지 후 서비스 이용을 제한하거나 계약을 해지할 수 있습니다.',
      '이용자는 앱 내 계정 삭제 기능을 통해 언제든지 계약을 종료할 수 있으며, 탈퇴 시 관련 데이터는 개인정보처리방침에 따라 처리됩니다.',
    ],
  },
  {
    title: '8. 서비스 변경 및 중단',
    bullets: [
      '회사는 서비스의 품질 향상을 위해 기능을 수정하거나 중단할 수 있으며, 중요한 변경 사항은 사전에 공지합니다.',
      '서비스 중단 시 이용자가 보유한 데이터는 합리적인 기간 동안 열람·백업할 수 있도록 안내합니다.',
    ],
  },
  {
    title: '9. 책임의 한계',
    bullets: [
      '천재지변, 시스템 장애 등 회사의 합리적인 통제를 벗어난 사유로 발생한 손해에 대해 회사는 책임을 지지 않습니다.',
      '이용자가 약관을 위반하거나 법령을 위반하여 발생한 문제는 이용자에게 책임이 있습니다.',
    ],
  },
  {
    title: '10. 준거법 및 분쟁 해결',
    bullets: [
      '본 약관은 대한민국 법령을 준거법으로 합니다.',
      '회사와 이용자 사이에 분쟁이 발생한 경우, 상호 협의로 해결하며, 협의가 어려울 경우 관할 법원에 소송을 제기할 수 있습니다.',
    ],
  },
];

const TermsOfServiceScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { colors, brandColors } = useThemeValues();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const styles = useThemedStyles(() => ({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    backgroundGradient: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background.secondary,
      opacity: 0.3,
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: colors.background.glass,
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center' as const,
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.text.primary,
    },
    headerSpacer: {
      width: 44,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20,
    },
    introCard: {
      marginTop: 16,
      marginBottom: 12,
    },
    introText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.text.secondary,
    },
    sectionCard: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: colors.text.primary,
      marginBottom: 12,
    },
    bulletRow: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      marginBottom: 8,
    },
    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: brandColors.accent.primary,
      marginTop: 8,
      marginRight: 10,
    },
    bulletText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 22,
      color: colors.text.secondary,
    },
    footerNotice: {
      marginTop: 12,
      fontSize: 12,
      color: colors.text.muted,
    },
    lastUpdated: {
      fontSize: 12,
      color: colors.text.muted,
      marginTop: 12,
    },
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.primary}
      />

      <View style={styles.backgroundGradient} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>이용약관</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          <GlassCard style={styles.introCard} intensity="light">
            <Text style={styles.introText}>
              담금주 취향 앱을 이용해 주셔서 감사합니다. 본 약관은 서비스 이용과 관련하여 이용자와 회사가
              준수해야 할 사항을 담고 있으며, 서비스 이용을 시작함으로써 약관에 동의한 것으로 간주됩니다.
            </Text>
            <Text style={styles.lastUpdated}>최종 업데이트: 2024년 10월 5일</Text>
          </GlassCard>

          {TERMS_SECTIONS.map(section => (
            <GlassCard key={section.title} style={styles.sectionCard} intensity="light">
              <Text style={styles.sectionTitle}>{section.title}</Text>

              {section.bullets.map((bullet, index) => (
                <View key={`${section.title}-bullet-${index}`} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </GlassCard>
          ))}

          <GlassCard style={styles.sectionCard} intensity="medium">
            <Text style={styles.sectionTitle}>고객센터</Text>
            <Text style={styles.bulletText}>
              서비스 이용 중 문의 사항이 있다면 shs2810@gmail.com 또는 010-8004-2810으로 연락해주세요.
              신속하게 도와드리겠습니다.
            </Text>
            <Text style={styles.footerNotice}>
              약관은 관련 법령과 서비스 정책 변경에 따라 수정될 수 있으며, 중요한 변경 사항은 앱 공지 및
              이메일을 통해 안내드립니다.
            </Text>
          </GlassCard>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default TermsOfServiceScreen;
