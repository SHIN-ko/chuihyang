import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProjectStore } from '@/src/stores/projectStore';
import { analyzeTasteType } from '@/src/utils/tasteAnalysis';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

const GuideStartScreen: React.FC = () => {
  const router = useRouter();
  const { colors, brandColors } = useThemeValues();
  const { projects } = useProjectStore();

  const tastingCount = useMemo(
    () => projects.filter((p) => p.tastingNote?.ratings).length,
    [projects],
  );
  const tasteType = useMemo(() => analyzeTasteType(projects), [projects]);
  const canApplyProfile = tastingCount >= 2;

  const [applyProfile, setApplyProfile] = useState(canApplyProfile);

  const handleStart = () => {
    const params: Record<string, string> = {
      applyProfile: String(applyProfile && canApplyProfile),
    };
    if (applyProfile && canApplyProfile && tasteType) {
      params.tasteTypeTitle = tasteType.title;
    }
    router.push({ pathname: '/guide/question', params });
  };

  const styles = useThemedStyles(({ colors, brandColors, shadows }) =>
    StyleSheet.create({
      container: { flex: 1, backgroundColor: colors.background.primary },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
      },
      backButton: { padding: 4 },
      scroll: { flex: 1 },
      content: { paddingHorizontal: 24, paddingBottom: 40 },
      hero: { alignItems: 'center', paddingVertical: 40 },
      emoji: { fontSize: 64, marginBottom: 16 },
      title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: 12,
      },
      description: {
        fontSize: 15,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 16,
      },
      card: {
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        ...shadows.glass.light,
      },
      toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      toggleTextContainer: { flex: 1, marginRight: 12 },
      toggleTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 4,
      },
      toggleDescription: {
        fontSize: 13,
        color: colors.text.secondary,
        lineHeight: 18,
      },
      tasteTypeName: {
        fontSize: 13,
        fontWeight: '600',
        color: brandColors.accent.primary,
        marginTop: 4,
      },
      disabledNotice: {
        fontSize: 12,
        color: colors.text.muted,
        marginTop: 4,
      },
      startButton: {
        backgroundColor: brandColors.accent.primary,
        borderRadius: 24,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 24,
      },
      startButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
      },
    }),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.title}>나만의 담금주 가이드</Text>
            <Text style={styles.description}>
              7가지 질문으로 당신의 취향에 맞는{'\n'}시그니처 담금주를 찾아드려요.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>시음 데이터 반영</Text>
                <Text style={styles.toggleDescription}>
                  {canApplyProfile
                    ? '지난 시음 기록을 바탕으로 당신 취향에 맞춰 추천해요'
                    : '시음 노트 2개 이상 작성하면 이 옵션을 사용할 수 있어요'}
                </Text>
                {canApplyProfile && tasteType && applyProfile && (
                  <Text style={styles.tasteTypeName}>{tasteType.title}</Text>
                )}
                {!canApplyProfile && (
                  <Text style={styles.disabledNotice}>현재 시음 노트: {tastingCount}개</Text>
                )}
              </View>
              <Switch
                value={applyProfile && canApplyProfile}
                onValueChange={setApplyProfile}
                disabled={!canApplyProfile}
                trackColor={{ false: colors.border.secondary, true: brandColors.accent.primary }}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>시작하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GuideStartScreen;
