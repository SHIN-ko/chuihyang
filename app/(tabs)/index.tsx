import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useProjectStore } from '@/src/stores/projectStore';
import { useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useCallback } from 'react';
import { formatDate, calculateProgress } from '@/src/utils/date';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/src/components/common/Button';

export default function HomeScreen() {
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const router = useRouter();

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

  const inProgressProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.greeting}>
              안녕하세요! 👋
            </Text>
            <Text style={styles.projectCount}>
              진행 중인 프로젝트: {inProgressProjects.length}개
            </Text>
          </View>

          {/* 진행 중인 프로젝트 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              진행 중인 프로젝트
            </Text>
            {inProgressProjects.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  진행 중인 프로젝트가 없습니다.
                </Text>
                <Button
                  onPress={handleCreateProject}
                  variant="outline"
                  size="sm"
                >
                  첫 프로젝트 만들기
                </Button>
              </View>
            ) : (
              inProgressProjects.map((project) => {
                const progress = calculateProgress(project.startDate, project.expectedEndDate);
                return (
                  <TouchableOpacity
                    key={project.id}
                    style={styles.projectCard}
                    onPress={() => router.push(`/project/${project.id}`)}
                  >
                    <View style={styles.projectHeader}>
                      <Text style={styles.projectName}>
                        {project.name}
                      </Text>
                      <Text style={styles.progressText}>
                        {progress}%
                      </Text>
                    </View>
                    <Text style={styles.projectInfo}>
                      {project.type} • {formatDate(project.startDate, 'MM/dd')} ~ {formatDate(project.expectedEndDate, 'MM/dd')}
                    </Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[styles.progressFill, { width: `${progress}%` }]}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* 완료된 프로젝트 */}
          {completedProjects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                완료된 프로젝트
              </Text>
              {completedProjects.slice(0, 3).map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectCard}
                  onPress={() => router.push(`/project/${project.id}`)}
                >
                  <Text style={styles.projectName}>
                    {project.name}
                  </Text>
                  <Text style={styles.projectInfo}>
                    {project.type} • 완료됨
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111811',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  projectCount: {
    color: 'white',
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 16,
  },
  emptyText: {
    color: 'white',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },

  projectCard: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectName: {
    color: 'white',
    fontWeight: '600',
    flex: 1,
  },
  progressText: {
    color: '#22c55e',
    fontSize: 14,
  },
  projectInfo: {
    color: 'white',
    opacity: 0.7,
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    backgroundColor: '#4b5563',
    borderRadius: 4,
    height: 8,
  },
  progressFill: {
    backgroundColor: '#22c55e',
    borderRadius: 4,
    height: 8,
  },
});