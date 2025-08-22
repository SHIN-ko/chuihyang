import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProjectStore } from '@/src/stores/projectStore';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/src/components/common/Button';
import GlassCard from '@/src/components/common/GlassCard';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getRecipeById } from '@/src/data/presetRecipes';

const EditProjectScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { projects, updateProjectData, isLoading } = useProjectStore();
  const { theme } = useTheme();
  const { colors, brandColors } = useThemeValues();
  
  const project = projects.find(p => p.id === id);
  const recipe = project?.recipeId ? getRecipeById(project.recipeId) : null;
  const brandColor = recipe?.brandColor || brandColors.accent.primary;
  
  const [formData, setFormData] = useState({
    name: '',
    notes: '',
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        notes: project.notes || '',
      });
    }
  }, [project]);

  useEffect(() => {
    // 화면 진입 애니메이션
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
  }, []);

  const styles = useThemedStyles(() => ({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    backgroundGradient: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background.primary,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.background.glass,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.secondary,
      borderRadius: 16,
      marginHorizontal: 20,
      marginTop: 8,
      marginBottom: 16,
    },
    closeButton: {
      width: 44,
      height: 44,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: 12,
      backgroundColor: colors.background.elevated,
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
    },
    recipeBadge: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    headerTitle: {
      color: colors.text.primary,
      fontSize: 20,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
    },
    recipeSubtitle: {
      color: colors.text.secondary,
      fontSize: 12,
      fontWeight: '500' as const,
      marginLeft: 8,
    },
    placeholderView: {
      width: 44,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    section: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      marginBottom: 16,
    },
    sectionTitle: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: '600' as const,
      marginBottom: 16,
      letterSpacing: -0.2,
    },
    recipeInfo: {
      backgroundColor: colors.background.elevated,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border.accent,
      borderLeftWidth: 4,
      borderLeftColor: brandColors.accent.primary,
    },
    recipeInfoTitle: {
      color: brandColors.accent.primary,
      fontSize: 16,
      fontWeight: '600' as const,
      marginBottom: 12,
      letterSpacing: -0.1,
    },
    recipeInfoText: {
      color: colors.text.secondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 6,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      color: colors.text.primary,
      fontSize: 14,
      fontWeight: '500' as const,
      marginBottom: 8,
      letterSpacing: -0.1,
    },
    input: {
      backgroundColor: colors.background.glass,
      color: colors.text.primary,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 12,
      fontSize: 16,
      minHeight: 56,
      borderWidth: 1,
      borderColor: colors.border.secondary,
      backdropFilter: 'blur(8px)',
    },
    inputFocused: {
      borderColor: brandColors.accent.primary,
      shadowColor: brandColors.accent.primary,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    textArea: {
      minHeight: 120,
      paddingTop: 16,
      textAlignVertical: 'top' as const,
    },
    helpText: {
      color: colors.text.muted,
      fontSize: 12,
      marginTop: 8,
      textAlign: 'right' as const,
      letterSpacing: 0.2,
    },
    bottomContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: colors.background.primary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      color: colors.text.muted,
      textAlign: 'center' as const,
    },
  }));

  const handleClose = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!project) return;

    if (!formData.name.trim()) {
      Alert.alert('오류', '프로젝트 이름을 입력해주세요.');
      return;
    }

    try {
      // 변경된 값만 업데이트
      const updates: { name?: string; notes?: string } = {};
      
      if (formData.name.trim() !== project.name) {
        updates.name = formData.name.trim();
      }
      
      if (formData.notes.trim() !== (project.notes || '')) {
        updates.notes = formData.notes.trim();
      }

      if (Object.keys(updates).length === 0) {
        Alert.alert('알림', '변경된 내용이 없습니다.');
        return;
      }

      const success = await updateProjectData(project.id, updates);
      
      if (!success) {
        Alert.alert('오류', '프로젝트 수정에 실패했습니다.');
        return;
      }
      
      Alert.alert('완료', '프로젝트가 수정되었습니다!', [
        {
          text: '확인',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('프로젝트 수정 실패:', error);
      Alert.alert('오류', '프로젝트 수정에 실패했습니다.');
    }
  };

  const getRecipeName = (recipeId: string | undefined) => {
    if (!recipeId) return '알 수 없는 레시피';
    
    switch (recipeId) {
      case 'yareyare': return '야레야레 (위스키, 60일)';
      case 'blabla': return '블라블라 (진, 30일)';
      case 'oz': return '오즈 (럼, 90일)';
      case 'pachinko': return '파친코 (과실주, 45일)';
      case 'gyeaeba': return '계애바 (보드카, 21일)';
      default: return '알 수 없는 레시피';
    }
  };

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background.primary} />
        <View style={styles.backgroundGradient} />
        
        <GlassCard style={{...styles.header, borderLeftWidth: 4, borderLeftColor: brandColor}} intensity="medium">
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <View style={[styles.recipeBadge, { backgroundColor: brandColor }]} />
            <Text style={styles.headerTitle}>프로젝트 수정</Text>
            {recipe && (
              <Text style={styles.recipeSubtitle}>{recipe.name}</Text>
            )}
          </View>
          <View style={styles.placeholderView} />
        </GlassCard>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>프로젝트를 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background.primary} />
      
      {/* 배경 그라디언트 */}
      <View style={styles.backgroundGradient} />
      
      {/* 헤더 */}
      <GlassCard style={{...styles.header, borderLeftWidth: 4, borderLeftColor: brandColor}} intensity="medium">
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <View style={[styles.recipeBadge, { backgroundColor: brandColor }]} />
          <Text style={styles.headerTitle}>프로젝트 수정</Text>
          {recipe && (
            <Text style={styles.recipeSubtitle}>{recipe.name}</Text>
          )}
        </View>
        <View style={styles.placeholderView} />
      </GlassCard>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
          >
            {/* 수정 불가능한 정보 표시 */}
            <GlassCard style={styles.section} intensity="light">
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeInfoTitle}>기본 정보 (수정 불가)</Text>
                <Text style={styles.recipeInfoText}>🧪 레시피: {getRecipeName(project.recipeId)}</Text>
                <Text style={styles.recipeInfoText}>
                  📅 시작일: {new Date(project.startDate).toLocaleDateString('ko-KR')}
                </Text>
                <Text style={styles.recipeInfoText}>
                  🏁 완료 예정일: {new Date(project.expectedEndDate).toLocaleDateString('ko-KR')}
                </Text>
                <Text style={styles.recipeInfoText}>
                  📊 상태: {project.status === 'completed' ? '✅ 완료됨' : '🔄 진행 중'}
                </Text>
              </View>
            </GlassCard>

            {/* 수정 가능한 정보 */}
            <GlassCard style={styles.section} intensity="light">
              <Text style={styles.sectionTitle}>수정 가능한 정보</Text>
              
              {/* 프로젝트 이름 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>프로젝트 이름</Text>
                <TextInput
                  style={styles.input}
                  placeholder="프로젝트 이름을 입력하세요"
                  placeholderTextColor={colors.text.muted}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  maxLength={50}
                />
              </View>

              {/* 메모/목적 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>프로젝트 노트</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={`프로젝트의 목적이나 특별한 의미를 적어보세요.

예시:
• 2024년 크리스마스에 가족들과 함께 마시고 싶어요
• 친구 생일선물용으로 특별히 제조
• 회사 동료들과 신년회에서 시음 예정`}
                  placeholderTextColor={colors.text.muted}
                  value={formData.notes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.helpText}>
                  {formData.notes.length}/500자
                </Text>
              </View>
            </GlassCard>
          </ScrollView>
        </Animated.View>

        {/* 하단 수정 버튼 */}
        <View style={styles.bottomContainer}>
          <Button
            onPress={handleSave}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            수정 완료
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProjectScreen;
