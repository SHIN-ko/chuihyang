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

interface SectionItem {
  label?: string;
  value: string;
}

interface PolicySection {
  title: string;
  description?: string;
  items?: SectionItem[];
  bullets?: string[];
}

const PRIVACY_SECTIONS: PolicySection[] = [
  {
    title: '1. 수집하는 개인정보 항목',
    items: [
      { label: '필수 항목', value: '이메일 주소, 비밀번호, 닉네임' },
      { label: '선택 항목', value: '생년월일, 성별' },
      { label: '자동 수집 항목', value: '앱 사용 기록, 기기 정보(OS, 기기모델명, 광고 ID 등)' },
    ],
  },
  {
    title: '2. 개인정보 수집 및 이용 목적',
    bullets: [
      '회원가입 및 관리',
      '담금주 키트 추천 및 관리 기능 제공',
      '알림 및 마케팅 정보 발송 (선택 동의 시)',
      '앱 서비스 개선 및 사용자 경험 분석',
    ],
  },
  {
    title: '3. 개인정보 보유 및 이용 기간',
    bullets: [
      '회원 탈퇴 시까지 보관 후 즉시 파기',
      '관련 법령에 따른 보존 필요 시, 해당 기간까지 보관',
    ],
  },
  {
    title: '4. 개인정보 제3자 제공',
    bullets: ['제공하지 않음 (단, 사전 동의 시에만 외부 마케팅/배송 업체 등에 제공)'],
  },
  {
    title: '5. 개인정보 처리 위탁',
    bullets: [
      'AWS (클라우드 서버, 데이터 저장소)',
      'Firebase (사용자 인증 및 데이터베이스 관리)',
    ],
  },
  {
    title: '6. 사용자 및 법정대리인의 권리와 그 행사 방법',
    bullets: [
      '개인정보 열람, 수정, 삭제, 처리정지 요청 가능',
      '만 14세 미만 아동의 경우 법정대리인이 권리 행사 가능',
    ],
  },
  {
    title: '7. 아동의 개인정보 처리',
    bullets: [
      '본 앱은 만 13세 미만 아동을 위한 서비스가 아니며, 해당 연령대의 개인정보는 수집하지 않음',
      '타겟층에 해당할 경우: 아동 개인정보 수집 시 보호자 동의 필수',
    ],
  },
  {
    title: '8. 개인정보 보호책임자',
    items: [
      { label: '이름', value: '신현수' },
      { label: '이메일', value: 'shs2810@gmail.com' },
      { label: '문의 전화', value: '010-8004-2810' },
    ],
  },
  {
    title: '9. 정책 변경 시 고지 방법',
    bullets: ['앱 공지사항 및 이메일을 통해 사전 고지'],
  },
];

const PrivacyPolicyScreen: React.FC = () => {
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
    detailRow: {
      marginBottom: 8,
    },
    detailLabel: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: brandColors.accent.primary,
      marginBottom: 4,
    },
    detailValue: {
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
          <Text style={styles.headerTitle}>개인정보처리방침</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          <GlassCard style={styles.introCard} intensity="light">
            <Text style={styles.introText}>
              담금주 취향 앱은 이용자 여러분의 개인정보를 소중하게 다루며, 아래 정책에 따라 안전하게
              관리합니다. 서비스 이용 중 궁금한 점이 있다면 언제든지 개인정보 보호책임자에게 문의해주세요.
            </Text>
            <Text style={styles.lastUpdated}>최종 업데이트: 2024년 10월 5일</Text>
          </GlassCard>

          {PRIVACY_SECTIONS.map(section => (
            <GlassCard key={section.title} style={styles.sectionCard} intensity="light">
              <Text style={styles.sectionTitle}>{section.title}</Text>

              {section.description && <Text style={styles.bulletText}>{section.description}</Text>}

              {section.items?.map(item => (
                <View key={`${section.title}-${item.label ?? item.value}`} style={styles.detailRow}>
                  {item.label && <Text style={styles.detailLabel}>{item.label}</Text>}
                  <Text style={styles.detailValue}>{item.value}</Text>
                </View>
              ))}

              {section.bullets?.map((bullet, index) => (
                <View key={`${section.title}-bullet-${index}`} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </GlassCard>
          ))}

          <GlassCard style={styles.sectionCard} intensity="medium">
            <Text style={styles.sectionTitle}>문의 및 권리 행사</Text>
            <Text style={styles.bulletText}>
              개인정보 관련 문의, 불만 처리, 권리 행사 요청은 앱 내 문의 또는 이메일(shs2810@gmail.com)로
              연락주시면 7일 이내에 답변드리겠습니다.
            </Text>
            <Text style={styles.footerNotice}>
              본 개인정보처리방침은 관련 법령 및 서비스 정책 변경에 따라 수정될 수 있으며, 변경 사항은 앱
              공지 및 이메일을 통해 사전 안내드립니다.
            </Text>
          </GlassCard>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;
