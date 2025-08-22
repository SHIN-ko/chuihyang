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
      paddingHorizontal: 20,
      paddingVertical: 20,
      alignItems: 'center',
      marginBottom: 16,
    },
    projectImageContainer: {
      marginBottom: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    projectImage: {
      width: 160,
      height: 160,
      borderRadius: 12,
    },
    placeholderImage: {
      width: 160,
      height: 160,
      borderRadius: 12,
      backgroundColor: colors.background.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },
    projectInfo: {
      alignItems: 'center',
      gap: 8,
    },
    projectName: {
      color: colors.text.primary,
      fontSize: 26,
      fontWeight: 'bold',
      marginBottom: 4,
      textAlign: 'center',
    },
    projectSubtitle: {
      color: colors.text.secondary,
      fontSize: 18,
      marginBottom: 4,
      textAlign: 'center',
    },
    projectDescription: {
      color: colors.text.tertiary,
      fontSize: 16,
      fontWeight: '400',
      marginBottom: 8,
      lineHeight: 22,
      letterSpacing: -0.1,
      textAlign: 'center',
    },
    projectDates: {
      color: colors.text.secondary,
      fontSize: 17,
      textAlign: 'center',
    },
    section: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      marginBottom: 16,
      alignItems: 'center',
    },
    sectionTitle: {
      color: colors.text.primary,
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 8,
      letterSpacing: -0.3,
      textAlign: 'center',
      alignSelf: 'stretch',
      width: '100%',
    },
    ingredientsContainer: {
      backgroundColor: 'transparent',
    },
    ingredientRow: {
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border.secondary,
    },
    ingredientName: {
      color: colors.text.primary,
      fontSize: 15,
      fontWeight: '500',
    },
    ingredientsList: {
      color: colors.text.primary,
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 22,
      textAlign: 'center',
      alignSelf: 'stretch',
      width: '100%',
      marginTop: 0,
    },

    noIngredientsContainer: {
      alignItems: 'center',
      paddingVertical: 24,
      backgroundColor: colors.background.secondary,
      borderRadius: 8,
    },
    noIngredientsText: {
      color: colors.text.muted,
      fontSize: 14,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 0,
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
      gap: 12,
      paddingVertical: 8,
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
      height: 260,
      gap: 6,
      borderRadius: 16,
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
      color: '#FFFFFF',
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
      marginBottom: 16,
      paddingBottom: 4,
      minHeight: 50, // 버튼 높이 보장
      width: '100%', // 전체 너비 사용
    },
    addLogButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#7C9885', // 더 뚜렷한 색상으로 임시 변경
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 18,
      gap: 4,
      borderWidth: 2,
      borderColor: '#6B8F71',
      minWidth: 80, // 최소 너비 보장
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
      // 디버깅을 위한 임시 스타일
      position: 'relative',
      zIndex: 999,
    },
    addLogButtonText: {
      color: '#FFFFFF', // 흰색으로 명확하게
      fontSize: 14,
      fontWeight: '700',
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
      // 개별 카드의 marginBottom으로 간격 처리
    },

    logContent: {
      backgroundColor: colors.background.elevated,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderWidth: 1,
      borderColor: colors.border.secondary,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      marginBottom: 16, // 개별 카드 간 간격
    },
    logHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
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
      fontSize: 18,
      fontWeight: '600',
      flex: 1,
      letterSpacing: 0.2,
    },
    logDate: {
      color: colors.text.secondary,
      fontSize: 15,
      fontWeight: '500',
    },
    logDescription: {
      color: colors.text.secondary,
      fontSize: 16,
      lineHeight: 22,
      marginBottom: 12,
    },
    ratingsContainer: {
      marginBottom: 16,
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
      marginBottom: 16,
      gap: 8,
    },
    colorText: {
      color: colors.text.primary,
      fontSize: 14,
    },
    logImages: {
      marginBottom: 16,
    },
    logImage: {
      width: 100,
      height: 100,
      borderRadius: 12,
      marginRight: 12,
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
  const brandColor = recipe?.brandColor || brandColors.accent.primary;
  
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
      case 'damgeumSoju25': return '담금소주 25도';
      case 'damgeumSoju30': return '담금소주 30도';
      case 'vodka': return '보드카';
      case 'whiskey': return '위스키';
      case 'gin': return '진';
      case 'rum': return '럼';
      case 'fruit_wine': return '과실주';
      default: return '알 수 없는 타입';
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${displayProgress}%`, backgroundColor: brandColor }
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

    console.log('프로젝트 이미지 배열:', project.images);
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
              onError={(error) => {
                console.error(`프로젝트 이미지 로드 실패 [${index}]:`, imageUri, error.nativeEvent.error);
              }}
              onLoad={(event) => {
                // 이미지 크기가 0이면 에러로 처리
                const { width, height } = event.nativeEvent.source;
                if (width === 0 || height === 0) {
                  console.error(`프로젝트 이미지 크기 오류 [${index}]:`, imageUri, 'width:', width, 'height:', height);
                } else {
                  console.log(`프로젝트 이미지 로드 성공 [${index}]:`, imageUri, 'size:', width, 'x', height);
                }
              }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderProgressLogs = () => {
    const logs = project.progressLogs || [];
    
    console.log('진행 로그 렌더링:', {
      projectId: project.id,
      projectName: project.name,
      logsCount: logs.length,
      logs: logs.map(log => ({ id: log.id, title: log.title, date: log.date }))
    });
    
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
          <View 
            key={log.id} 
            style={[
              styles.logContent,
              index === sortedLogs.length - 1 && { marginBottom: 0 } // 마지막 카드는 여백 없음
            ]}
          >
              <View style={styles.logHeader}>
                <View style={styles.logHeaderLeft}>
                  <Text style={styles.logTitle}>{log.title}</Text>
                  <Text style={styles.logDate}>{formatDate(log.date, 'YYYY.MM.DD')}</Text>
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
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background.primary} />
      
      {/* 배경 그라디언트 */}
      <View style={styles.backgroundGradient} />
      
      {/* 헤더 - 뒤로 가기 버튼 */}
      <GlassCard style={styles.header} intensity="medium">
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
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
            <Text style={styles.projectSubtitle} numberOfLines={1}>
              {recipe ? `${recipe.name} (${getProjectTypeLabel(project.type)})` : getProjectTypeLabel(project.type)}
            </Text>
            {recipe?.description && (
              <Text style={styles.projectDescription} numberOfLines={2}>
                {recipe.description}
              </Text>
            )}
            <Text style={styles.projectDates}>
              {formatDate(project.startDate, 'YYYY.MM.DD')} - {formatDate(project.expectedEndDate, 'YYYY.MM.DD')}
            </Text>
            {project.actualEndDate && (
              <Text style={[styles.projectDates, { color: brandColors.semantic.success, fontWeight: '600' }]}>
                실제 완료: {formatDate(project.actualEndDate, 'YYYY.MM.DD')}
              </Text>
            )}
          </View>

          {/* 재료 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>재료</Text>
            {project.ingredients && project.ingredients.length > 0 ? (
              <Text style={styles.ingredientsList}>
                {project.ingredients
                  .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
                  .map(ingredient => ingredient.name)
                  .join(', ')}
              </Text>
            ) : (
              <Text style={styles.noIngredientsText}>등록된 재료가 없습니다</Text>
            )}
          </View>
          </GlassCard>

          {/* 진행 상황 섹션 */}
          <GlassCard style={{...styles.section, alignItems: 'stretch'}} intensity="light">
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
            <GlassCard style={{...styles.section, alignItems: 'stretch'}} intensity="light">
              <Text style={styles.sectionTitle}>노트</Text>
              <Text style={styles.notesText}>{project.notes}</Text>
            </GlassCard>
          )}

          {/* 이미지 섹션 */}
          <GlassCard style={{...styles.section, alignItems: 'stretch'}} intensity="light">
            <Text style={styles.sectionTitle}>이미지</Text>
            {renderImageGrid()}
          </GlassCard>

          {/* 진행 로그 섹션 */}
          <GlassCard style={{...styles.section, alignItems: 'stretch'}} intensity="medium">
          <View style={styles.logsSectionHeader}>
            <Text style={[styles.sectionTitle, { flex: 1, marginRight: 8, textAlign: 'left' }]}>
              진행 로그 ({project.progressLogs?.length || 0})
            </Text>
            <TouchableOpacity 
              style={styles.addLogButton}
              onPress={handleAddLog}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
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