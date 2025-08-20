import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProjectStore } from '@/src/stores/projectStore';
import { Ionicons } from '@expo/vector-icons';
import { Project, ProgressLog } from '@/src/types';
import { getRecipeById } from '@/src/data/presetRecipes';
import { formatDate, calculateDetailedProgress } from '@/src/utils/date';
import StarRating from '@/src/components/common/StarRating';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';
import { useTheme } from '@/src/contexts/ThemeContext';
import GlassCard from '@/src/components/common/GlassCard';

const { width } = Dimensions.get('window');

const ProjectDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { colors, brandColors } = useThemeValues();
  const { projects, updateProject, deleteProject, deleteProjectData, updateProjectStatus, updateProgressLog, deleteProgressLog, isLoading } = useProjectStore();
  
  const [project, setProject] = useState<Project | null>(null);

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
      backgroundColor: colors.background.secondary,
      opacity: 0.3,
    },
    content: {
      flex: 1,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorCard: {
      alignItems: 'center',
      padding: 32,
    },
    errorText: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 24,
    },
    backButton: {
      backgroundColor: colors.background.surface,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    backButtonText: {
      color: colors.text.primary,
      fontSize: 15,
      fontWeight: '600',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      margin: 20,
      marginBottom: 0,
    },
    headerButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 22,
      backgroundColor: colors.background.surface,
      borderWidth: 1,
      borderColor: colors.border.secondary,
      ...shadows.neumorphism.outset,
    },
    headerTitle: {
      color: colors.text.primary,
      fontSize: 20,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center',
      marginRight: 44,
      letterSpacing: -0.3,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20,
    },
    mainInfoContainer: {
      padding: 24,
      alignItems: 'center',
      marginBottom: 16,
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
      backgroundColor: colors.background.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },
    projectInfo: {
      alignItems: 'center',
    },
    projectName: {
      color: colors.text.primary,
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 4,
      textAlign: 'center',
    },
    projectSubtitle: {
      color: colors.text.secondary,
      fontSize: 16,
      marginBottom: 4,
      textAlign: 'center',
    },
    projectDates: {
      color: colors.text.secondary,
      fontSize: 16,
      textAlign: 'center',
    },
    section: {
      padding: 20,
      marginBottom: 16,
    },
    sectionTitle: {
      color: colors.text.primary,
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 16,
      letterSpacing: -0.3,
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
      borderTopColor: colors.border.secondary,
    },
    ingredientName: {
      color: colors.text.secondary,
      fontSize: 14,
      flex: 1,
    },
    ingredientQuantity: {
      color: colors.text.primary,
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
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: '500',
    },
    statusPercentage: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    progressContainer: {
      gap: 8,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: colors.border.secondary,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: brandColors.accent.primary,
      borderRadius: 4,
    },
    progressText: {
      color: colors.text.secondary,
      fontSize: 14,
    },
    notesText: {
      color: colors.text.primary,
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
      backgroundColor: colors.background.surface,
      borderRadius: 8,
      paddingVertical: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },
    noImagesText: {
      color: colors.text.secondary,
      fontSize: 14,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
      backgroundColor: colors.background.primary,
    },
    editButton: {
      flex: 1,
      backgroundColor: colors.background.surface,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border.accent,
      ...shadows.neumorphism.outset,
    },
    editButtonText: {
      color: brandColors.accent.primary,
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    deleteButton: {
      flex: 1,
      backgroundColor: colors.background.surface,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: `${brandColors.semantic.error}40`,
      ...shadows.neumorphism.outset,
    },
    deleteButtonText: {
      color: brandColors.semantic.error,
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    completeButton: {
      flex: 1,
      backgroundColor: brandColors.accent.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: brandColors.accent.secondary,
      ...shadows.glass.medium,
    },
    completeButtonText: {
      color: colors.text.primary,
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: 0.3,
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
      backgroundColor: brandColors.accent.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
      borderWidth: 1,
      borderColor: brandColors.accent.secondary,
      ...shadows.glass.light,
    },
    addLogButtonText: {
      color: colors.text.primary,
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    noLogsContainer: {
      alignItems: 'center',
      paddingVertical: 48,
      backgroundColor: 'transparent',
      borderRadius: 12,
    },
    noLogsText: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
      textAlign: 'center',
    },
    noLogsSubText: {
      color: colors.text.secondary,
      fontSize: 14,
      marginTop: 6,
      textAlign: 'center',
    },
    logsContainer: {
      backgroundColor: colors.background.surface,
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border.secondary,
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
      backgroundColor: brandColors.accent.primary,
      zIndex: 1,
    },
    timelineLine: {
      width: 2,
      flex: 1,
      backgroundColor: colors.border.secondary,
      marginTop: 8,
      marginBottom: -24,
    },
    logContent: {
      flex: 1,
    },
    logHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    logHeaderLeft: {
      flex: 1,
    },
    logActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    logActionButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.background.elevated,
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },
    logTitle: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
      letterSpacing: 0.2,
    },
    logDate: {
      color: colors.text.secondary,
      fontSize: 14,
      fontWeight: '500',
    },
    logDescription: {
      color: colors.text.secondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 16,
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
      color: colors.text.secondary,
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
      color: colors.text.primary,
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
      color: colors.text.secondary,
      fontSize: 12,
      fontStyle: 'italic',
      marginTop: 8,
    },
  }));
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (id) {
      const foundProject = projects.find(p => p.id === id);
      setProject(foundProject || null);
      
      // 프로젝트가 로드되면 애니메이션 시작
      if (foundProject) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [id, projects]);

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background.primary} />
        <View style={styles.backgroundGradient} />
        <View style={styles.centerContainer}>
          <GlassCard style={styles.errorCard} intensity="medium">
            <Ionicons name="flask-outline" size={48} color={colors.text.muted} />
            <Text style={styles.errorText}>프로젝트를 찾을 수 없습니다.</Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>돌아가기</Text>
            </TouchableOpacity>
          </GlassCard>
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

  const handleEditLog = (logId: string) => {
    router.push(`/project/edit-log/${logId}?projectId=${project.id}`);
  };

  const handleDeleteLog = (logId: string, logTitle: string) => {
    Alert.alert(
      '로그 삭제',
      `"${logTitle}" 로그를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteProgressLog(project.id, logId);
            
            if (success) {
              Alert.alert('삭제 완료', '로그가 삭제되었습니다.');
            } else {
              Alert.alert('오류', '로그 삭제에 실패했습니다.');
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
          <Ionicons name="document-text-outline" size={32} color={colors.text.muted} />
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
                <View style={styles.logHeaderLeft}>
                  <Text style={styles.logTitle}>{log.title}</Text>
                  <Text style={styles.logDate}>{formatDate(log.date, 'MM.dd')}</Text>
                </View>
                <View style={styles.logActions}>
                  <TouchableOpacity 
                    style={styles.logActionButton}
                    onPress={() => handleEditLog(log.id)}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.text.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.logActionButton}
                    onPress={() => handleDeleteLog(log.id, log.title)}
                  >
                    <Ionicons name="trash-outline" size={18} color={brandColors.semantic.error} />
                  </TouchableOpacity>
                </View>
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
                  <Ionicons name="color-palette-outline" size={16} color={colors.text.secondary} />
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
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background.primary} />
      
      {/* 배경 그라디언트 */}
      <View style={styles.backgroundGradient} />
      
      {/* 헤더 */}
      <GlassCard style={styles.header} intensity="medium">
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로젝트 상세</Text>
      </GlassCard>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 프로젝트 메인 정보 */}
          <GlassCard style={styles.mainInfoContainer} intensity="medium">
          <View style={styles.projectImageContainer}>
            {project.images && project.images.length > 0 ? (
              <Image 
                source={{ uri: project.images[0] }} 
                style={styles.projectImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={48} color={colors.text.muted} />
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
          </GlassCard>

          {/* 진행 상황 섹션 */}
          <GlassCard style={styles.section} intensity="light">
          <Text style={styles.sectionTitle}>진행 상황</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusLabel}>숙성 진행률</Text>
              <Text style={styles.statusPercentage}>{displayProgress.toFixed(0)}%</Text>
            </View>
            {renderProgressBar()}
          </View>
          </GlassCard>

          {/* 노트 섹션 */}
          {project.notes && (
            <GlassCard style={styles.section} intensity="light">
              <Text style={styles.sectionTitle}>노트</Text>
              <Text style={styles.notesText}>{project.notes}</Text>
            </GlassCard>
          )}

          {/* 이미지 섹션 */}
          <GlassCard style={styles.section} intensity="light">
            <Text style={styles.sectionTitle}>이미지</Text>
            {renderImageGrid()}
          </GlassCard>

          {/* 진행 로그 섹션 */}
          <GlassCard style={styles.section} intensity="medium">
          <View style={styles.logsSectionHeader}>
            <Text style={styles.sectionTitle}>
              진행 로그 ({project.progressLogs?.length || 0})
            </Text>
            <TouchableOpacity 
              style={styles.addLogButton}
              onPress={handleAddLog}
            >
              <Ionicons name="add" size={20} color={colors.text.primary} />
              <Text style={styles.addLogButtonText}>추가</Text>
            </TouchableOpacity>
          </View>
          {renderProgressLogs()}
          </GlassCard>

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
      </Animated.View>
    </SafeAreaView>
  );
};

export default ProjectDetailScreen;