import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProjectStore } from '@/src/stores/projectStore';
import { Ionicons } from '@expo/vector-icons';
import { Project, ProgressLog } from '@/src/types';
import { getRecipeById } from '@/src/data/presetRecipes';
import { formatDate, calculateDetailedProgress } from '@/src/utils/date';
import StarRating from '@/src/components/common/StarRating';

const { width } = Dimensions.get('window');

const ProjectDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { projects, updateProject, deleteProject, deleteProjectData, updateProjectStatus, isLoading } = useProjectStore();
  
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (id) {
      const foundProject = projects.find(p => p.id === id);
      setProject(foundProject || null);
    }
  }, [id, projects]);

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#111811" />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>프로젝트를 찾을 수 없습니다.</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const recipe = project.recipeId ? getRecipeById(project.recipeId) : null;
  const progress = calculateDetailedProgress(project.startDate, project.expectedEndDate);
  const progressPercentage = Math.min(progress.percentage, 100);
  
  // 프로젝트 상태에 따른 진행률 조정
  const displayProgress = project.status === 'completed' ? 100 : progressPercentage;

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/project/edit/${project.id}`);
  };

  const handleAddLog = () => {
    router.push(`/project/add-log/${project.id}`);
  };

  const handleComplete = () => {
    Alert.alert(
      '프로젝트 완료',
      '이 프로젝트를 완료 처리하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '완료',
          style: 'default',
          onPress: async () => {
            const success = await updateProjectStatus(project.id, 'completed');
            
            if (success) {
              Alert.alert('완료', '프로젝트가 완료 처리되었습니다!', [
                {
                  text: '확인',
                  onPress: () => router.replace('/(tabs)'),
                },
              ]);
            } else {
              Alert.alert('오류', '프로젝트 완료 처리에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      '⚠️ 프로젝트 삭제',
      `"${project.name}" 프로젝트를 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 진행 로그와 데이터가 영구적으로 삭제됩니다.`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteProjectData(project.id);
            
            if (success) {
              Alert.alert('삭제 완료', '프로젝트가 삭제되었습니다.', [
                {
                  text: '확인',
                  onPress: () => router.replace('/(tabs)'),
                },
              ]);
            } else {
              Alert.alert('오류', '프로젝트 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const getProjectTypeLabel = (type: string) => {
    switch (type) {
      case 'whiskey': return '위스키';
      case 'gin': return '진';
      case 'rum': return '럼';
      case 'fruit_wine': return '과실주';
      case 'vodka': return '보드카';
      default: return '기타';
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${displayProgress}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        {project.status === 'completed' 
          ? `완료됨 (${progress.totalDays}일)`
          : `${progress.daysElapsed}/${progress.totalDays}일 (${progress.remainingDays}일 남음)`
        }
      </Text>
    </View>
  );

  const renderImageGrid = () => {
    if (!project.images || project.images.length === 0) {
      return (
        <View style={styles.noImagesContainer}>
          <Text style={styles.noImagesText}>업로드된 이미지가 없습니다</Text>
        </View>
      );
    }

    const images = project.images.slice(0, 3); // 최대 3개

    return (
      <View style={styles.imageGrid}>
        {images.map((imageUri, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.imageGridItem,
              index === 0 ? styles.mainImage : styles.subImage
            ]}
          >
            <Image 
              source={{ uri: imageUri }} 
              style={styles.gridImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderProgressLogs = () => {
    const logs = project.progressLogs || [];
    
    // 날짜순으로 정렬 (최신 순)
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (sortedLogs.length === 0) {
      return (
        <View style={styles.noLogsContainer}>
          <Ionicons name="document-text-outline" size={32} color="#9db89d" />
          <Text style={styles.noLogsText}>아직 진행 로그가 없습니다</Text>
          <Text style={styles.noLogsSubText}>첫 번째 로그를 추가해보세요!</Text>
        </View>
      );
    }

    return (
      <View style={styles.logsContainer}>
        {sortedLogs.map((log, index) => (
          <View key={log.id} style={styles.logItem}>
            {/* 타임라인 라인 */}
            <View style={styles.timelineContainer}>
              <View style={styles.timelineCircle} />
              {index < sortedLogs.length - 1 && <View style={styles.timelineLine} />}
            </View>
            
            {/* 로그 내용 */}
            <View style={styles.logContent}>
              <View style={styles.logHeader}>
                <Text style={styles.logTitle}>{log.title}</Text>
                <Text style={styles.logDate}>{formatDate(log.date, 'MM.dd')}</Text>
              </View>
              
              {log.description && (
                <Text style={styles.logDescription}>{log.description}</Text>
              )}
              
              {/* 평가 표시 */}
              {log.ratings && (
                <View style={styles.ratingsContainer}>
                  {log.ratings.overall && (
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingLabel}>전체</Text>
                      <StarRating rating={log.ratings.overall} readonly size={16} />
                    </View>
                  )}
                  {log.ratings.taste && log.ratings.taste > 0 && (
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingLabel}>맛</Text>
                      <StarRating rating={log.ratings.taste} readonly size={16} />
                    </View>
                  )}
                </View>
              )}
              
              {/* 색깔 정보 */}
              {log.color && (
                <View style={styles.colorInfo}>
                  <Ionicons name="color-palette-outline" size={16} color="#9db89d" />
                  <Text style={styles.colorText}>{log.color}</Text>
                </View>
              )}
              
              {/* 이미지 */}
              {log.images && log.images.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.logImages}
                >
                  {log.images.map((imageUri, imgIndex) => (
                    <Image
                      key={imgIndex}
                      source={{ uri: imageUri }}
                      style={styles.logImage}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              )}
              
              {/* 추가 메모 */}
              {log.notes && (
                <Text style={styles.logNotes}>{log.notes}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111811" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로젝트 상세</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 프로젝트 메인 정보 */}
        <View style={styles.mainInfoContainer}>
          <View style={styles.projectImageContainer}>
            {project.images && project.images.length > 0 ? (
              <Image 
                source={{ uri: project.images[0] }} 
                style={styles.projectImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={48} color="#9db89d" />
              </View>
            )}
          </View>
          
          <View style={styles.projectInfo}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectSubtitle}>
              {recipe ? recipe.name : getProjectTypeLabel(project.type)}
            </Text>
            <Text style={styles.projectDates}>
              시작: {formatDate(project.startDate)} · 완료 예정: {formatDate(project.expectedEndDate)}
            </Text>
          </View>
        </View>

        {/* 재료 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>재료</Text>
          <View style={styles.ingredientsContainer}>
            {project.ingredients.map((ingredient, index) => (
              <View key={ingredient.id} style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientQuantity}>
                  {ingredient.quantity || '적당량'} {ingredient.unit || ''}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 진행 상황 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>진행 상황</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusLabel}>숙성 진행률</Text>
              <Text style={styles.statusPercentage}>{displayProgress.toFixed(0)}%</Text>
            </View>
            {renderProgressBar()}
          </View>
        </View>

        {/* 노트 섹션 */}
        {project.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>노트</Text>
            <Text style={styles.notesText}>{project.notes}</Text>
          </View>
        )}

        {/* 이미지 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이미지</Text>
          {renderImageGrid()}
        </View>

        {/* 진행 로그 섹션 */}
        <View style={styles.section}>
          <View style={styles.logsSectionHeader}>
            <Text style={styles.sectionTitle}>
              진행 로그 ({project.progressLogs?.length || 0})
            </Text>
            <TouchableOpacity 
              style={styles.addLogButton}
              onPress={handleAddLog}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addLogButtonText}>추가</Text>
            </TouchableOpacity>
          </View>
          {renderProgressLogs()}
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 액션 버튼들 */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEdit}
        >
          <Text style={styles.editButtonText}>수정</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={isLoading}
        >
          <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.completeButton}
          onPress={handleComplete}
          disabled={project.status === 'completed' || isLoading}
        >
          <Text style={styles.completeButtonText}>
            {project.status === 'completed' ? '완료됨' : '완료 처리'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111811',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#293829',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#111811',
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 48,
  },
  scrollView: {
    flex: 1,
  },
  mainInfoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  projectImageContainer: {
    marginBottom: 16,
  },
  projectImage: {
    width: 128,
    height: 128,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 128,
    height: 128,
    borderRadius: 8,
    backgroundColor: '#1c261c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  projectInfo: {
    alignItems: 'center',
  },
  projectName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  projectSubtitle: {
    color: '#9db89d',
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  projectDates: {
    color: '#9db89d',
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ingredientsContainer: {
    backgroundColor: 'transparent',
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#3c533c',
  },
  ingredientName: {
    color: '#9db89d',
    fontSize: 14,
    flex: 1,
  },
  ingredientQuantity: {
    color: 'white',
    fontSize: 14,
  },
  statusContainer: {
    backgroundColor: 'transparent',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  statusPercentage: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    gap: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#3c533c',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  progressText: {
    color: '#9db89d',
    fontSize: 14,
  },
  notesText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
  },
  imageGrid: {
    flexDirection: 'row',
    height: 200,
    gap: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageGridItem: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  mainImage: {
    flex: 2,
  },
  subImage: {
    flex: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  noImagesContainer: {
    backgroundColor: '#1c261c',
    borderRadius: 8,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  noImagesText: {
    color: '#9db89d',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#111811',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#293829',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#111811',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
  },
  // 진행 로그 관련 스타일
  logsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#293829',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addLogButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  noLogsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#1c261c',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  noLogsText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
  },
  noLogsSubText: {
    color: '#9db89d',
    fontSize: 14,
    marginTop: 4,
  },
  logsContainer: {
    backgroundColor: '#1c261c',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  logItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineContainer: {
    alignItems: 'center',
    marginRight: 16,
    paddingTop: 4,
  },
  timelineCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#3c533c',
    marginTop: 8,
    marginBottom: -24,
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  logDate: {
    color: '#9db89d',
    fontSize: 14,
  },
  logDescription: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  ratingsContainer: {
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingLabel: {
    color: '#9db89d',
    fontSize: 12,
    width: 40,
  },
  colorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  colorText: {
    color: 'white',
    fontSize: 14,
  },
  logImages: {
    marginBottom: 12,
  },
  logImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 8,
  },
  logNotes: {
    color: '#9db89d',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default ProjectDetailScreen;
