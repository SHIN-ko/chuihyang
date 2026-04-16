import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GuideResult, RecipeAdjustments, SweetnessLevel } from '@/src/types';
import { useCustomRecipeStore } from '@/src/stores/customRecipeStore';
import { adjustRecipe } from '@/src/utils/recipeGuide';
import { getFruitById, getHerbById, BASE_TYPE_LABELS } from '@/src/data/recipeGuideData';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

const GuideResultScreen: React.FC = () => {
  const router = useRouter();
  const { colors } = useThemeValues();
  const { pendingRecipe, saveRecipe, setPendingRecipe, isLoading } = useCustomRecipeStore();

  const [baseRecipe, setBaseRecipe] = useState<GuideResult | null>(pendingRecipe);
  const [adjustments, setAdjustments] = useState<RecipeAdjustments>({
    sweetness: 'normal',
    aroma: 'normal',
    strength: 'normal',
  });

  useEffect(() => {
    if (pendingRecipe) {
      const sweetnessLevel: RecipeAdjustments['sweetness'] =
        pendingRecipe.sugarG <= 20 ? 'light' : pendingRecipe.sugarG >= 35 ? 'strong' : 'normal';
      const strengthLevel: RecipeAdjustments['strength'] =
        pendingRecipe.baseType === 'damgeumSoju25'
          ? 'soft'
          : pendingRecipe.baseType === 'vodka'
          ? 'strong'
          : 'normal';
      setAdjustments({ sweetness: sweetnessLevel, aroma: 'normal', strength: strengthLevel });
      setBaseRecipe(pendingRecipe);
    }
  }, [pendingRecipe]);

  const currentRecipe = useMemo(
    () => (baseRecipe ? adjustRecipe(baseRecipe, adjustments) : null),
    [baseRecipe, adjustments],
  );

  const handleStartProject = () => {
    if (!currentRecipe) return;
    setPendingRecipe(currentRecipe);
    router.replace('/project/create');
  };

  const handleSave = async () => {
    if (!currentRecipe) return;
    const success = await saveRecipe(currentRecipe);
    if (success) {
      Alert.alert('저장 완료', '내 레시피에 저장되었습니다.', [
        { text: '확인', onPress: () => router.replace('/(tabs)') },
      ]);
    } else {
      Alert.alert('오류', '레시피 저장에 실패했습니다.');
    }
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
      backButton: { padding: 4, marginRight: 12 },
      headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
      scroll: { flex: 1 },
      content: { paddingHorizontal: 24, paddingBottom: 140 },
      heroCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        alignItems: 'center',
        ...shadows.glass.medium,
      },
      recipeName: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: 8,
      },
      tagline: {
        fontSize: 14,
        color: colors.text.secondary,
        textAlign: 'center',
        fontStyle: 'italic',
      },
      sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text.muted,
        marginBottom: 8,
        marginTop: 4,
      },
      ingredientCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        ...shadows.glass.light,
      },
      ingredientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.secondary,
      },
      ingredientRowLast: { borderBottomWidth: 0 },
      ingredientLabel: { fontSize: 14, color: colors.text.secondary },
      ingredientValue: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
      adjustCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        ...shadows.glass.light,
      },
      adjustTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 16,
      },
      adjustRow: { marginBottom: 16 },
      adjustLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.text.secondary,
        marginBottom: 8,
      },
      levelButtonRow: {
        flexDirection: 'row',
        backgroundColor: colors.border.secondary,
        borderRadius: 12,
        padding: 3,
      },
      levelButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 9,
      },
      levelButtonActive: {
        backgroundColor: brandColors.accent.primary,
      },
      levelButtonText: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.text.secondary,
      },
      levelButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
      },
      footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 24,
        backgroundColor: colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: colors.border.secondary,
      },
      primaryButton: {
        backgroundColor: brandColors.accent.primary,
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 10,
      },
      secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: brandColors.accent.primary,
        borderRadius: 24,
        paddingVertical: 14,
        alignItems: 'center',
      },
      primaryText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
      secondaryText: { fontSize: 16, fontWeight: '600', color: brandColors.accent.primary },
      buttonDisabled: { opacity: 0.5 },
      emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      },
      emptyText: { color: colors.text.secondary, marginBottom: 24 },
      restartButton: {
        backgroundColor: brandColors.accent.primary,
        borderRadius: 24,
        paddingVertical: 14,
        paddingHorizontal: 32,
      },
      restartButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    }),
  );

  if (!currentRecipe) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>레시피 정보를 불러올 수 없어요.</Text>
          <TouchableOpacity style={styles.restartButton} onPress={() => router.replace('/guide')}>
            <Text style={styles.restartButtonText}>다시 시작하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const fruit = getFruitById(currentRecipe.fruitId);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>당신을 위한 레시피</Text>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.content}>
          <View
            style={[
              styles.heroCard,
              { borderLeftWidth: 4, borderLeftColor: currentRecipe.brandColor },
            ]}
          >
            <Text style={styles.recipeName}>{currentRecipe.name}</Text>
            <Text style={styles.tagline}>{currentRecipe.tagline}</Text>
          </View>

          <View style={styles.ingredientCard}>
            <Text style={styles.sectionLabel}>500ml 1병 기준</Text>
            <View style={styles.ingredientRow}>
              <Text style={styles.ingredientLabel}>🍶 베이스 술</Text>
              <Text style={styles.ingredientValue}>
                {BASE_TYPE_LABELS[currentRecipe.baseType]} {currentRecipe.baseAmountMl}ml
              </Text>
            </View>
            <View style={styles.ingredientRow}>
              <Text style={styles.ingredientLabel}>🍑 {fruit?.name}</Text>
              <Text style={styles.ingredientValue}>{currentRecipe.fruitAmountG}g</Text>
            </View>
            {currentRecipe.herbs.map((h) => {
              const herbInfo = getHerbById(h.id);
              return (
                <View key={h.id} style={styles.ingredientRow}>
                  <Text style={styles.ingredientLabel}>🌿 {herbInfo?.name}</Text>
                  <Text style={styles.ingredientValue}>{h.amountG}g</Text>
                </View>
              );
            })}
            <View style={styles.ingredientRow}>
              <Text style={styles.ingredientLabel}>🍯 빙탕</Text>
              <Text style={styles.ingredientValue}>{currentRecipe.sugarG}g</Text>
            </View>
            <View style={styles.ingredientRow}>
              <Text style={styles.ingredientLabel}>⏱ 숙성</Text>
              <Text style={styles.ingredientValue}>{currentRecipe.durationDays}일</Text>
            </View>
            <View style={[styles.ingredientRow, styles.ingredientRowLast]}>
              <Text style={styles.ingredientLabel}>🎨 예상 색감</Text>
              <Text style={styles.ingredientValue}>{currentRecipe.colorDescription}</Text>
            </View>
          </View>

          <View style={styles.adjustCard}>
            <Text style={styles.adjustTitle}>변형하기</Text>

            <View style={styles.adjustRow}>
              <Text style={styles.adjustLabel}>단맛</Text>
              <View style={styles.levelButtonRow}>
                {(['light', 'normal', 'strong'] as SweetnessLevel[]).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelButton,
                      adjustments.sweetness === level && styles.levelButtonActive,
                    ]}
                    onPress={() => setAdjustments((prev) => ({ ...prev, sweetness: level }))}
                  >
                    <Text
                      style={[
                        styles.levelButtonText,
                        adjustments.sweetness === level && styles.levelButtonTextActive,
                      ]}
                    >
                      {level === 'light' ? '가볍게' : level === 'normal' ? '보통' : '달달'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.adjustRow}>
              <Text style={styles.adjustLabel}>향</Text>
              <View style={styles.levelButtonRow}>
                {(['subtle', 'normal', 'intense'] as RecipeAdjustments['aroma'][]).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelButton,
                      adjustments.aroma === level && styles.levelButtonActive,
                    ]}
                    onPress={() => setAdjustments((prev) => ({ ...prev, aroma: level }))}
                  >
                    <Text
                      style={[
                        styles.levelButtonText,
                        adjustments.aroma === level && styles.levelButtonTextActive,
                      ]}
                    >
                      {level === 'subtle' ? '은은' : level === 'normal' ? '보통' : '진하게'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.adjustRow}>
              <Text style={styles.adjustLabel}>도수</Text>
              <View style={styles.levelButtonRow}>
                {(['soft', 'normal', 'strong'] as RecipeAdjustments['strength'][]).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelButton,
                      adjustments.strength === level && styles.levelButtonActive,
                    ]}
                    onPress={() => setAdjustments((prev) => ({ ...prev, strength: level }))}
                  >
                    <Text
                      style={[
                        styles.levelButtonText,
                        adjustments.strength === level && styles.levelButtonTextActive,
                      ]}
                    >
                      {level === 'soft' ? '부드럽' : level === 'normal' ? '보통' : '강함'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleStartProject}
          disabled={isLoading}
        >
          <Text style={styles.primaryText}>이 레시피로 프로젝트 시작</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.secondaryText}>
            {isLoading ? '저장 중...' : '내 레시피에 저장'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GuideResultScreen;
