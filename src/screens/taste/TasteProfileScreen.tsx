import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProjectStore } from '@/src/stores/projectStore';
import { getRecipeById } from '@/src/data/presetRecipes';
import { calculateAverageRatings, analyzeTasteType, calculateTasteStats } from '@/src/utils/tasteAnalysis';
import RadarChart from '@/src/components/common/RadarChart';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

const TasteProfileScreen: React.FC = () => {
  const router = useRouter();
  const { colors, brandColors } = useThemeValues();
  const { projects } = useProjectStore();

  const completedProjects = useMemo(
    () => projects.filter((p) => p.status === 'completed'),
    [projects],
  );
  const projectsWithNotes = useMemo(
    () => completedProjects.filter((p) => p.tastingNote?.ratings),
    [completedProjects],
  );
  const projectsWithoutNotes = useMemo(
    () => completedProjects.filter((p) => !p.tastingNote?.ratings),
    [completedProjects],
  );

  const avgRatings = useMemo(() => calculateAverageRatings(projects), [projects]);
  const tasteType = useMemo(() => analyzeTasteType(projects), [projects]);
  const stats = useMemo(() => calculateTasteStats(projects), [projects]);

  const styles = useThemedStyles(({ colors, brandColors, shadows }) =>
    StyleSheet.create({
      container: { flex: 1, backgroundColor: colors.background.primary },
      header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
      headerTitle: { fontSize: 28, fontWeight: '800', color: colors.text.primary },
      content: { paddingHorizontal: 24, paddingBottom: 40 },
      card: {
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        ...shadows.glass.light,
      },
      cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text.secondary, marginBottom: 16 },
      radarContainer: { alignItems: 'center' },
      typeTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
      typeDescription: { fontSize: 15, color: colors.text.secondary, lineHeight: 22 },
      statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.secondary,
      },
      statsRowLast: { borderBottomWidth: 0 },
      statsLabel: { fontSize: 14, color: colors.text.secondary },
      statsValue: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
      projectCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.glass.light,
      },
      colorBar: { width: 4, height: 48, borderRadius: 2, marginRight: 12 },
      projectInfo: { flex: 1 },
      projectName: { fontSize: 15, fontWeight: '600', color: colors.text.primary, marginBottom: 2 },
      projectDate: { fontSize: 12, color: colors.text.muted },
      overallScore: { fontSize: 20, fontWeight: '700', marginRight: 8 },
      emptyContainer: { alignItems: 'center', paddingVertical: 60 },
      emptyText: { fontSize: 15, color: colors.text.muted, marginTop: 12, textAlign: 'center', lineHeight: 22 },
      nudgeCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: brandColors.accent.secondary,
        borderStyle: 'dashed',
      },
      nudgeText: { flex: 1, fontSize: 14, color: colors.text.secondary, marginLeft: 12 },
      infoText: {
        fontSize: 14,
        color: colors.text.muted,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 16,
        lineHeight: 20,
      },
      sectionHeader: { fontSize: 17, fontWeight: '600', color: colors.text.primary, marginBottom: 12, marginTop: 8 },
    }),
  );

  if (projectsWithNotes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>취향</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="wine-outline" size={48} color={colors.text.muted} />
          <Text style={styles.emptyText}>
            {'첫 담금주를 완성하고\n시음 노트를 남겨보세요'}
          </Text>
        </View>
        {projectsWithoutNotes.length > 0 && (
          <View style={styles.content}>
            <Text style={styles.sectionHeader}>시음 노트를 남겨보세요</Text>
            {projectsWithoutNotes.map((p) => {
              const rec = p.recipeId ? getRecipeById(p.recipeId) : undefined;
              const bc = p.customBrandColor || rec?.brandColor || brandColors.accent.primary;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={styles.nudgeCard}
                  onPress={() => router.push(`/project/tasting-note/${p.id}`)}
                >
                  <View style={[styles.colorBar, { backgroundColor: bc }]} />
                  <Text style={styles.nudgeText}>{p.name}</Text>
                  <Ionicons name="create-outline" size={20} color={brandColors.accent.primary} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>취향</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>나의 취향 프로필</Text>
          <View style={styles.radarContainer}>
            <RadarChart data={avgRatings} size={200} color={brandColors.accent.primary} />
          </View>
        </View>

        {tasteType && (
          <View style={styles.card}>
            <Text style={styles.typeTitle}>{tasteType.title}</Text>
            <Text style={styles.typeDescription}>{tasteType.description}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>통계</Text>
          {stats.totalTastings < 2 && (
            <Text style={styles.infoText}>
              더 많은 시음 기록이 쌓이면 정확한 분석이 가능해요
            </Text>
          )}
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>총 시음 횟수</Text>
            <Text style={styles.statsValue}>{stats.totalTastings}회</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>평균 전체 평점</Text>
            <Text style={styles.statsValue}>{stats.averageOverall} / 5.0</Text>
          </View>
          {stats.highestDimension.label && (
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>가장 높은 항목</Text>
              <Text style={styles.statsValue}>
                {stats.highestDimension.label} ({stats.highestDimension.average})
              </Text>
            </View>
          )}
          {stats.lowestDimension.label && (
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>가장 낮은 항목</Text>
              <Text style={styles.statsValue}>
                {stats.lowestDimension.label} ({stats.lowestDimension.average})
              </Text>
            </View>
          )}
          {stats.favoriteRecipe && (
            <View style={[styles.statsRow, styles.statsRowLast]}>
              <Text style={styles.statsLabel}>가장 많이 담근 레시피</Text>
              <Text style={styles.statsValue}>
                {stats.favoriteRecipe.name} ({stats.favoriteRecipe.count}회)
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionHeader}>시음 기록</Text>
        {projectsWithNotes.map((p) => {
          const rec = p.recipeId ? getRecipeById(p.recipeId) : undefined;
          const bc = p.customBrandColor || rec?.brandColor || brandColors.accent.primary;
          return (
            <TouchableOpacity
              key={p.id}
              style={styles.projectCard}
              onPress={() => router.push(`/project/${p.id}`)}
            >
              <View style={[styles.colorBar, { backgroundColor: bc }]} />
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{p.name}</Text>
                <Text style={styles.projectDate}>{p.tastingNote?.tastingDate}</Text>
              </View>
              <Text style={[styles.overallScore, { color: bc }]}>
                {p.tastingNote?.ratings.overall}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </TouchableOpacity>
          );
        })}

        {projectsWithoutNotes.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>시음 노트를 남겨보세요</Text>
            {projectsWithoutNotes.map((p) => {
              const rec = p.recipeId ? getRecipeById(p.recipeId) : undefined;
              const bc = p.customBrandColor || rec?.brandColor || brandColors.accent.primary;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={styles.nudgeCard}
                  onPress={() => router.push(`/project/tasting-note/${p.id}`)}
                >
                  <View style={[styles.colorBar, { backgroundColor: bc }]} />
                  <Text style={styles.nudgeText}>{p.name}</Text>
                  <Ionicons name="create-outline" size={20} color={brandColors.accent.primary} />
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TasteProfileScreen;
