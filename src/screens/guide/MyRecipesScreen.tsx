import React, { useEffect } from 'react';
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
import { useCustomRecipeStore } from '@/src/stores/customRecipeStore';
import { CustomRecipe, GuideResult } from '@/src/types';
import { BASE_TYPE_LABELS, getFruitById, getHerbById } from '@/src/data/recipeGuideData';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

const MyRecipesScreen: React.FC = () => {
  const router = useRouter();
  const { colors } = useThemeValues();
  const { recipes, fetchRecipes, deleteRecipe, setPendingRecipe, isLoading } = useCustomRecipeStore();

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleStartProject = (recipe: CustomRecipe) => {
    const guideResult: GuideResult = {
      name: recipe.name,
      tagline: '',
      baseType: recipe.baseType,
      baseAmountMl: recipe.baseAmountMl,
      fruitId: recipe.fruitId,
      fruitAmountG: recipe.fruitAmountG,
      herbs: recipe.herbs,
      sugarG: recipe.sugarG,
      durationDays: recipe.durationDays,
      colorDescription: '',
      brandColor: recipe.brandColor,
      moodTag: recipe.moodTag || 'quiet_night',
    };
    setPendingRecipe(guideResult);
    router.push('/project/create');
  };

  const handleDelete = (recipe: CustomRecipe) => {
    Alert.alert('레시피 삭제', `"${recipe.name}"을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await deleteRecipe(recipe.id);
        },
      },
    ]);
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
      headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
      content: { paddingHorizontal: 24, paddingBottom: 40 },
      emptyContainer: { alignItems: 'center', paddingVertical: 60 },
      emptyEmoji: { fontSize: 48, marginBottom: 16 },
      emptyText: {
        fontSize: 15,
        color: colors.text.muted,
        textAlign: 'center',
        lineHeight: 22,
      },
      emptyButton: {
        marginTop: 24,
        backgroundColor: brandColors.accent.primary,
        borderRadius: 24,
        paddingVertical: 14,
        paddingHorizontal: 32,
      },
      emptyButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
      recipeCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
        borderLeftWidth: 4,
        ...shadows.glass.light,
      },
      recipeName: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 6,
      },
      recipeMeta: {
        fontSize: 13,
        color: colors.text.secondary,
        marginBottom: 4,
      },
      recipeDate: {
        fontSize: 11,
        color: colors.text.muted,
        marginBottom: 12,
      },
      actionRow: {
        flexDirection: 'row',
        gap: 8,
      },
      actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
      },
      startActionButton: {
        backgroundColor: brandColors.accent.primary,
      },
      deleteActionButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: brandColors.semantic.error,
      },
      startActionText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
      deleteActionText: { fontSize: 14, fontWeight: '600', color: brandColors.semantic.error },
    }),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 레시피</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isLoading && recipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📖</Text>
            <Text style={styles.emptyText}>
              {'아직 저장된 레시피가 없어요\n가이드를 통해 나만의 레시피를 만들어보세요'}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/guide')}
            >
              <Text style={styles.emptyButtonText}>가이드 시작하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recipes.map((recipe) => {
            const fruit = getFruitById(recipe.fruitId);
            const herbNames = recipe.herbs
              .map((h) => getHerbById(h.id)?.name)
              .filter((n): n is string => !!n)
              .join(', ');

            return (
              <View
                key={recipe.id}
                style={[styles.recipeCard, { borderLeftColor: recipe.brandColor }]}
              >
                <Text style={styles.recipeName}>{recipe.name}</Text>
                <Text style={styles.recipeMeta}>
                  {BASE_TYPE_LABELS[recipe.baseType]} · {recipe.durationDays}일 숙성
                </Text>
                {herbNames && (
                  <Text style={styles.recipeMeta}>
                    {fruit?.name} + {herbNames}
                  </Text>
                )}
                <Text style={styles.recipeDate}>
                  {new Date(recipe.createdAt).toLocaleDateString('ko-KR')} 저장
                </Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.startActionButton]}
                    onPress={() => handleStartProject(recipe)}
                  >
                    <Text style={styles.startActionText}>프로젝트 시작</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteActionButton]}
                    onPress={() => handleDelete(recipe)}
                  >
                    <Text style={styles.deleteActionText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyRecipesScreen;
