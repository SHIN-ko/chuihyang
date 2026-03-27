import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
  Animated,
  RefreshControl,
} from 'react-native';
import { useProjectStore } from '@/src/stores/projectStore';
import { useRouter, useFocusEffect } from 'expo-router';
import { formatDate, calculateProgress, calculateDetailedProgress } from '@/src/utils/date';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/src/components/common/Button';
import CircularProgress from '@/src/components/common/CircularProgress';
import { Project } from '@/src/types';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';
import { calculateProjectStats, ProjectStats } from '@/src/utils/calendar';
import { getRecipeById } from '@/src/data/presetRecipes';

type FilterType = 'all' | 'in_progress' | 'completed';

export default function HomeScreen() {
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const router = useRouter();
  const { colors, brandColors } = useThemeValues();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    totalProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    upcomingDeadlines: 0,
    recentLogs: 0,
    completionRate: 0,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const styles = useThemedStyles(({ colors, shadows, brandColors }) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background.primary,
      },
      content: {
        flex: 1,
      },
      header: {
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 20,
        backgroundColor: colors.background.surface,
        borderWidth: 1,
        borderColor: colors.border.primary,
        overflow: 'hidden',
        ...shadows.glass.light,
      },
      headerContent: {
        padding: 24,
      },
      greeting: {
        color: colors.text.primary,
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: -0.5,
      },
      brandSubtitle: {
        color: brandColors.accent.primary,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        letterSpacing: 0.5,
      },
      subtitle: {
        color: colors.text.secondary,
        fontSize: 15,
        fontWeight: '400',
      },
      searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
      },
      searchInputContainer: {
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 4,
        backgroundColor: colors.background.surface,
        ...shadows.glass.medium,
        borderWidth: 0,
      },
      searchIcon: {
        marginRight: 12,
      },
      searchInput: {
        flex: 1,
        color: colors.text.primary,
        fontSize: 15,
        paddingVertical: 14,
        fontWeight: '400',
        height: 48,
      },
      clearButton: {
        padding: 6,
        marginLeft: 8,
        borderRadius: 12,
      },
      statsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        margin: 20,
        marginTop: 8,
        marginBottom: 12,
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border.primary,
        ...shadows.glass.light,
      },
      compactStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      compactStatItem: {
        alignItems: 'center',
        flex: 1,
      },
      compactStatNumber: {
        color: brandColors.accent.primary,
        fontSize: 18,
        fontWeight: '700',
      },
      compactStatLabel: {
        color: colors.text.secondary,
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
        textAlign: 'center',
      },
      statsDivider: {
        width: 1,
        height: 24,
        backgroundColor: colors.border.secondary,
        marginHorizontal: 8,
      },
      filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 16,
        gap: 12,
      },
      filterTab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: colors.background.surface,
        borderWidth: 1,
        borderColor: colors.border.primary,
        alignItems: 'center',
        ...shadows.neumorphism.outset,
      },
      activeFilterTab: {
        backgroundColor: brandColors.accent.primary,
        borderColor: colors.border.accent,
        ...shadows.neumorphism.pressed,
      },
      filterText: {
        color: colors.text.secondary,
        fontSize: 13,
        fontWeight: '500',
      },
      activeFilterText: {
        color: '#FFFFFF',
        fontWeight: '600',
      },
      scrollView: {
        flex: 1,
      },
      projectList: {
        paddingHorizontal: 20,
        paddingBottom: 120, // FAB 공간 확보 증가
      },
      projectCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderWidth: 0,
        overflow: 'hidden',
        ...shadows.glass.light,
      },
      cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
      },
      cardLeft: {
        flex: 1,
        marginRight: 16,
      },
      cardRight: {
        alignItems: 'flex-end',
      },
      projectName: {
        color: colors.text.primary,
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: -0.3,
      },
      projectSubtitle: {
        color: brandColors.accent.secondary,
        fontSize: 14,
        fontWeight: '500',
      },
      progressPercentage: {
        color: brandColors.accent.primary,
        fontSize: 20,
        fontWeight: '700',
      },
      dDayText: {
        color: colors.text.secondary,
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
      },
      completedBadge: {
        backgroundColor: brandColors.semantic.success,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        ...shadows.glass.light,
      },
      completedText: {
        color: colors.text.primary,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
      },
      cardContent: {
        marginBottom: 16,
      },
      projectDates: {
        color: colors.text.tertiary,
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '400',
      },
      projectNotes: {
        color: colors.text.secondary,
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '400',
      },
      progressContainer: {
        gap: 10,
      },
      progressBar: {
        backgroundColor: colors.background.surface,
        borderRadius: 8,
        height: 8,
        overflow: 'hidden',
        ...shadows.neumorphism.inset,
      },
      progressFill: {
        backgroundColor: brandColors.accent.primary,
        borderRadius: 8,
        height: 8,
        shadowColor: brandColors.accent.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 2,
      },
      progressLabel: {
        color: colors.text.muted,
        fontSize: 12,
        textAlign: 'right',
        fontWeight: '500',
      },
      emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
        marginHorizontal: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border.primary,
        overflow: 'hidden',
        ...shadows.glass.light,
      },
      emptyTitle: {
        color: colors.text.primary,
        fontSize: 22,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: -0.3,
      },
      emptySubtitle: {
        color: colors.text.secondary,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        fontWeight: '400',
      },
      emptyButton: {
        marginTop: 8,
      },
      fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: brandColors.accent.primary,
        borderWidth: 1,
        borderColor: colors.border.accent,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.glass.heavy,
      },
    }),
  );

  useEffect(() => {
    const loadData = async () => {
      await fetchProjects();
      setIsInitialLoading(false);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    };

    loadData();
  }, [fetchProjects]);

  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [fetchProjects]),
  );

  useEffect(() => {
    const stats = calculateProjectStats(projects);
    setProjectStats(stats);
  }, [projects]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  }, [fetchProjects]);

  const handleCreateProject = () => {
    router.push('/project/create');
  };

  const getFilteredProjects = (): Project[] => {
    let filteredProjects = projects;

    if (activeFilter !== 'all') {
      filteredProjects = filteredProjects.filter((p) => p.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredProjects = filteredProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.notes && p.notes.toLowerCase().includes(query)),
      );
    }

    return filteredProjects;
  };

  const filteredProjects = getFilteredProjects();
  const inProgressProjects = projects.filter((p) => p.status === 'in_progress');
  const completedProjects = projects.filter((p) => p.status === 'completed');

  const renderProjectCard = (project: Project) => {
    const progress = calculateProgress(project.startDate, project.expectedEndDate);
    const detailed = calculateDetailedProgress(project.startDate, project.expectedEndDate);
    const isCompleted = project.status === 'completed';
    const recipe = getRecipeById(project.recipeId || '');
    const brandColor = recipe?.brandColor || brandColors.accent.primary;

    return (
      <TouchableOpacity
        key={project.id}
        style={[styles.projectCard, { borderLeftColor: brandColor, borderLeftWidth: 4 }]}
        onPress={() => router.push(`/project/${project.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectSubtitle}>{getRecipeDisplayName(project.recipeId)}</Text>
          </View>
          <View style={styles.cardRight}>
            {isCompleted ? (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>완료</Text>
              </View>
            ) : (
              <CircularProgress
                progress={progress}
                size={52}
                strokeWidth={5}
                color={brandColor}
                label={`D+${detailed.daysElapsed}`}
              />
            )}
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.projectDates}>
            {formatDate(project.startDate, 'MM/dd')} ~{' '}
            {formatDate(project.expectedEndDate, 'MM/dd')}
          </Text>
          {project.notes && (
            <Text style={styles.projectNotes} numberOfLines={1}>
              {project.notes}
            </Text>
          )}
        </View>

        {!isCompleted && (
          <Text style={styles.progressLabel}>
            {detailed.remainingDays > 0
              ? `${detailed.remainingDays}일 남음 · ${progress}%`
              : '완료 대기'}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const getRecipeDisplayName = (recipeId: string | undefined) => {
    switch (recipeId) {
      case 'yareyare':
        return '야레야레 (위스키)';
      case 'blabla':
        return '블라블라 (진)';
      case 'oz':
        return '오즈 (럼)';
      case 'pachinko':
        return '파친코 (과실주)';
      case 'gyeaeba':
        return '계애바 (보드카)';
      default:
        return '알 수 없는 레시피';
    }
  };

  const renderCompactStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.compactStatsRow}>
        <View style={styles.compactStatItem}>
          <Text style={styles.compactStatNumber}>{projectStats.inProgressProjects}</Text>
          <Text style={styles.compactStatLabel}>진행중</Text>
        </View>

        <View style={styles.statsDivider} />

        <View style={styles.compactStatItem}>
          <Text style={styles.compactStatNumber}>{projectStats.upcomingDeadlines}</Text>
          <Text style={styles.compactStatLabel}>완료예정</Text>
        </View>

        <View style={styles.statsDivider} />

        <View style={styles.compactStatItem}>
          <Text style={styles.compactStatNumber}>{projectStats.completedProjects}</Text>
          <Text style={styles.compactStatLabel}>완료</Text>
        </View>

        <View style={styles.statsDivider} />

        <View style={styles.compactStatItem}>
          <Text style={styles.compactStatNumber}>{projectStats.completionRate}%</Text>
          <Text style={styles.compactStatLabel}>완료율</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {projects.length > 0 && renderCompactStats()}

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={colors.text.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="프로젝트를 검색해보세요"
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'all' && styles.activeFilterTab]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
              전체 ({projects.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'in_progress' && styles.activeFilterTab]}
            onPress={() => setActiveFilter('in_progress')}
          >
            <Text
              style={[styles.filterText, activeFilter === 'in_progress' && styles.activeFilterText]}
            >
              진행중 ({inProgressProjects.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'completed' && styles.activeFilterTab]}
            onPress={() => setActiveFilter('completed')}
          >
            <Text
              style={[styles.filterText, activeFilter === 'completed' && styles.activeFilterText]}
            >
              완료 ({completedProjects.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={brandColors.accent.primary}
              colors={[brandColors.accent.primary]}
              progressBackgroundColor={colors.background.surface}
            />
          }
        >
          <View style={styles.projectList}>
            {filteredProjects.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 64 }}>{searchQuery ? '🔍' : '🍶'}</Text>
                <Text style={styles.emptyTitle}>
                  {searchQuery ? '검색 결과가 없어요' : '아직 담금주가 없어요'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? '다른 검색어를 시도해보세요'
                    : '나만의 담금주 프로젝트를 시작해볼까요?\n레시피를 골라 첫 번째 담금주를 만들어보세요!'}
                </Text>
                {!searchQuery && (
                  <Button onPress={handleCreateProject} size="lg">
                    첫 담금주 시작하기
                  </Button>
                )}
              </View>
            ) : (
              filteredProjects.map(renderProjectCard)
            )}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={handleCreateProject} activeOpacity={0.8}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
