import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  StatusBar 
} from 'react-native';
import { useProjectStore } from '@/src/stores/projectStore';
import { useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useCallback } from 'react';
import { formatDate, calculateProgress } from '@/src/utils/date';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/src/components/common/Button';
import { Project, ProjectStatus } from '@/src/types';

type FilterType = 'all' | 'in_progress' | 'completed';

export default function HomeScreen() {
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const router = useRouter();
  
  // State for search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // 화면에 포커스될 때마다 프로젝트 목록 새로고침 (프로젝트 생성 후 돌아올 때)
  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [fetchProjects])
  );
  
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
    
    return (
      <TouchableOpacity
        key={project.id}
        style={styles.projectCard}
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
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111811" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.greeting}>취향 🍷</Text>
        <Text style={styles.subtitle}>
          총 {projects.length}개 프로젝트 • 진행중 {inProgressProjects.length}개
        </Text>
      </View>

      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9db89d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="프로젝트 검색..."
            placeholderTextColor="#9db89d"
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
              <Ionicons name="close-circle" size={20} color="#9db89d" />
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.projectList}>
          {filteredProjects.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="flask-outline" size={64} color="#6b7280" />
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
                  style={styles.emptyButton}
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
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111811',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#9db89d',
    fontSize: 16,
  },
  // 검색 관련 스타일
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInputContainer: {
    backgroundColor: '#1c261c',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 14,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  // 필터 탭 스타일
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1c261c',
    borderWidth: 1,
    borderColor: '#3c533c',
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  filterText: {
    color: '#9db89d',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#111811',
    fontWeight: '600',
  },
  // 스크롤뷰 및 프로젝트 목록
  scrollView: {
    flex: 1,
  },
  projectList: {
    paddingHorizontal: 20,
    paddingBottom: 100, // FAB 공간 확보
  },
  // 프로젝트 카드 스타일
  projectCard: {
    backgroundColor: '#1c261c',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3c533c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardLeft: {
    flex: 1,
    marginRight: 12,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  projectName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  projectSubtitle: {
    color: '#9db89d',
    fontSize: 14,
  },
  progressPercentage: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completedBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    color: '#111811',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    marginBottom: 12,
  },
  projectDates: {
    color: '#9db89d',
    fontSize: 14,
    marginBottom: 6,
  },
  projectNotes: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    backgroundColor: '#374151',
    borderRadius: 6,
    height: 6,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#22c55e',
    borderRadius: 6,
    height: 6,
  },
  progressLabel: {
    color: '#9db89d',
    fontSize: 12,
    textAlign: 'right',
  },
  // 빈 상태 스타일
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#9db89d',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 8,
  },
  // 플로팅 액션 버튼
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});