import React, { useState, useRef } from 'react';
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
  Dimensions,
  RefreshControl
} from 'react-native';
// import { BlurView } from 'expo-blur';
// import { LinearGradient } from 'expo-linear-gradient';
import { useProjectStore } from '@/src/stores/projectStore';
import { useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useCallback } from 'react';
import { formatDate, calculateProgress } from '@/src/utils/date';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/src/components/common/Button';
import GlassCard from '@/src/components/common/GlassCard';
import { Project, ProjectStatus } from '@/src/types';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';
import { useTheme } from '@/src/contexts/ThemeContext';
import { calculateProjectStats, ProjectStats } from '@/src/utils/calendar';
import { getRecipeById } from '@/src/data/presetRecipes';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'in_progress' | 'completed';

export default function HomeScreen() {
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const router = useRouter();
  const { theme } = useTheme();
  const { colors, brandColors } = useThemeValues();
  
  // State for search and filter
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
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
    },
    content: {
      flex: 1,
    },
    header: {
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 8,
      borderRadius: 20,
      backgroundColor: colors.background.glass,
      borderWidth: 1,
      borderColor: colors.border.glass,
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
    // 검색 관련 스타일
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
    // 간소화된 통계 카드 스타일
    statsContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      margin: 20,
      marginTop: 8,
      marginBottom: 12,
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
    // 필터 탭 스타일
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
    // 스크롤뷰 및 프로젝트 목록
    scrollView: {
      flex: 1,
    },
    projectList: {
      paddingHorizontal: 20,
      paddingBottom: 120, // FAB 공간 확보 증가
    },
    // 프로젝트 카드 스타일
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
    // 빈 상태 스타일
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
      paddingHorizontal: 40,
      marginHorizontal: 20,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border.glass,
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
    // 플로팅 액션 버튼
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
  }));

  useEffect(() => {
    const loadData = async () => {
      await fetchProjects();
      setIsInitialLoading(false);
      
      // 초기 애니메이션
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

  // 화면에 포커스될 때마다 프로젝트 목록 새로고침 (프로젝트 생성 후 돌아올 때)
  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [fetchProjects])
  );

  // 프로젝트가 변경될 때마다 통계 업데이트
  useEffect(() => {
    const stats = calculateProjectStats(projects);
    setProjectStats(stats);
  }, [projects]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  }, [fetchProjects]);
  
  const handleCreateProject = () => {
    router.push('/project/create');
  };

  // Filter and search logic
  const getFilteredProjects = (): Project[] => {
    let filteredProjects = projects;

    // Apply status filter
    if (activeFilter !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredProjects = filteredProjects.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.notes && p.notes.toLowerCase().includes(query))
      );
    }

    return filteredProjects;
  };

  const filteredProjects = getFilteredProjects();
  const inProgressProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');

  const renderProjectCard = (project: Project) => {
    const progress = calculateProgress(project.startDate, project.expectedEndDate);
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
            <Text style={styles.projectSubtitle}>
              {getRecipeDisplayName(project.recipeId)}
            </Text>
          </View>
          <View style={styles.cardRight}>
            {isCompleted ? (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>완료</Text>
              </View>
            ) : (
              <Text style={styles.progressPercentage}>{progress}%</Text>
            )}
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.projectDates}>
            {formatDate(project.startDate, 'MM/dd')} ~ {formatDate(project.expectedEndDate, 'MM/dd')}
          </Text>
          {project.notes && (
            <Text style={styles.projectNotes} numberOfLines={1}>
              {project.notes}
            </Text>
          )}
        </View>
        
        {!isCompleted && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: brandColor }]} />
            </View>
            <Text style={styles.progressLabel}>
              {progress < 100 ? `${Math.max(0, Math.ceil((new Date(project.expectedEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}일 남음` : '완료 대기'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getRecipeDisplayName = (recipeId: string | undefined) => {
    switch (recipeId) {
      case 'yareyare': return '야레야레 (위스키)';
      case 'blabla': return '블라블라 (진)';
      case 'oz': return '오즈 (럼)';
      case 'pachinko': return '파친코 (과실주)';
      case 'gyeaeba': return '계애바 (보드카)';
      default: return '알 수 없는 레시피';
    }
  };

  const renderCompactStats = () => (
    <GlassCard style={styles.statsContainer} intensity="light">
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
    </GlassCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background.primary} />
      
      {/* 배경 그라디언트 - 임시로 View 사용 */}
      <View style={styles.backgroundGradient} />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* 간소화된 통계 */}
        {projects.length > 0 && renderCompactStats()}

        {/* 검색 바 */}
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
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 필터 탭 */}
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
            <Text style={[styles.filterText, activeFilter === 'in_progress' && styles.activeFilterText]}>
              진행중 ({inProgressProjects.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'completed' && styles.activeFilterTab]}
            onPress={() => setActiveFilter('completed')}
          >
            <Text style={[styles.filterText, activeFilter === 'completed' && styles.activeFilterText]}>
              완료 ({completedProjects.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 프로젝트 목록 */}
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
                <Ionicons name="flask-outline" size={64} color={colors.text.muted} />
                <Text style={styles.emptyTitle}>
                  {searchQuery ? '검색 결과가 없습니다' : '프로젝트가 없습니다'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery 
                    ? '다른 검색어를 시도해보세요' 
                    : '첫 번째 담금주 프로젝트를 시작해보세요'}
                </Text>
                {!searchQuery && (
                  <Button
                    onPress={handleCreateProject}
                  >
                    프로젝트 만들기
                  </Button>
                )}
              </View>
          ) : (
            filteredProjects.map(renderProjectCard)
          )}
          </View>
        </ScrollView>

        {/* 플로팅 액션 버튼 */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={handleCreateProject}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

/*
// 기존 StyleSheet는 useThemedStyles로 이동됨
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.background.primary,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  header: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: BRAND_COLORS.background.glass,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border.glass,
    overflow: 'hidden',
    ...SHADOWS.glass.light,
  },
  headerContent: {
    padding: 24,
  },
  greeting: {
    color: BRAND_COLORS.text.primary,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    color: BRAND_COLORS.accent.primary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: BRAND_COLORS.text.secondary,
    fontSize: 15,
    fontWeight: '400',
  },
  // 검색 관련 스타일
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInputContainer: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border.glass,
    backgroundColor: BRAND_COLORS.background.glass,
    overflow: 'hidden',
    ...SHADOWS.glass.light,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: BRAND_COLORS.text.primary,
    fontSize: 16,
    paddingVertical: 16,
    fontWeight: '400',
  },
  clearButton: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 12,
  },
  // 필터 탭 스타일
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
    backgroundColor: BRAND_COLORS.background.surface,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border.primary,
    alignItems: 'center',
    ...SHADOWS.neumorphism.outset,
  },
  activeFilterTab: {
    backgroundColor: BRAND_COLORS.accent.primary,
    borderColor: BRAND_COLORS.border.accent,
    ...SHADOWS.neumorphism.pressed,
  },
  filterText: {
    color: BRAND_COLORS.text.secondary,
    fontSize: 13,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // 스크롤뷰 및 프로젝트 목록
  scrollView: {
    flex: 1,
  },
  projectList: {
    paddingHorizontal: 20,
    paddingBottom: 120, // FAB 공간 확보 증가
  },
  // 프로젝트 카드 스타일
  projectCard: {
    backgroundColor: BRAND_COLORS.background.glass,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border.glass,
    overflow: 'hidden',
    ...SHADOWS.glass.medium,
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
    color: BRAND_COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  projectSubtitle: {
    color: BRAND_COLORS.accent.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentage: {
    color: BRAND_COLORS.accent.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  completedBadge: {
    backgroundColor: BRAND_COLORS.semantic.success,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    ...SHADOWS.glass.light,
  },
  completedText: {
    color: BRAND_COLORS.text.primary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardContent: {
    marginBottom: 16,
  },
  projectDates: {
    color: BRAND_COLORS.text.tertiary,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '400',
  },
  projectNotes: {
    color: BRAND_COLORS.text.secondary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  progressContainer: {
    gap: 10,
  },
  progressBar: {
    backgroundColor: BRAND_COLORS.background.surface,
    borderRadius: 8,
    height: 8,
    overflow: 'hidden',
    ...SHADOWS.neumorphism.inset,
  },
  progressFill: {
    backgroundColor: BRAND_COLORS.accent.primary,
    borderRadius: 8,
    height: 8,
    shadowColor: BRAND_COLORS.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  progressLabel: {
    color: BRAND_COLORS.text.muted,
    fontSize: 12,
    textAlign: 'right',
    fontWeight: '500',
  },
  // 빈 상태 스타일
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border.glass,
    overflow: 'hidden',
    ...SHADOWS.glass.light,
  },
  emptyTitle: {
    color: BRAND_COLORS.text.primary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    color: BRAND_COLORS.text.secondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: '400',
  },
  emptyButton: {
    marginTop: 8,
  },
  // 플로팅 액션 버튼
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BRAND_COLORS.accent.primary,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glass.heavy,
  },
});
*/