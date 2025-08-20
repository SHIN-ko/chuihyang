import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProjectStore } from '@/src/stores/projectStore';
import Button from '@/src/components/common/Button';
import GlassCard from '@/src/components/common/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { ProjectType, PresetRecipe } from '@/src/types';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { 
  PRESET_RECIPES, 
  getRecipeById, 
  getAllProjectTypes, 
  getTypeDisplayName, 
  getDurationByType,
  calculateFinalDuration 
} from '@/src/data/presetRecipes';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';
import { useTheme } from '@/src/contexts/ThemeContext';

const { width } = Dimensions.get('window');

const CreateProjectScreen: React.FC = () => {
  const router = useRouter();
  const { createProject, isLoading } = useProjectStore();
  const { theme } = useTheme();
  const { colors, brandColors } = useThemeValues();
  
  const [name, setName] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<PresetRecipe | null>(null);
  const [selectedType, setSelectedType] = useState<ProjectType | null>(null);
  const [startDate, setStartDate] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const handleClose = () => {
    router.back();
  };

  const handleCreateProject = async () => {
    // 기본 검증
    if (!name.trim()) {
      Alert.alert('오류', '프로젝트 이름을 입력해주세요.');
      return;
    }
    
    if (!selectedRecipe) {
      Alert.alert('오류', '담금주 레시피를 선택해주세요.');
      return;
    }
    
    if (!selectedType) {
      Alert.alert('오류', '담금주 타입을 선택해주세요.');
      return;
    }
    
    if (!startDate) {
      Alert.alert('오류', '시작일을 입력해주세요.');
      return;
    }

    // 자동으로 완료 예정일 계산 (선택한 타입의 기본 기간 사용)
    let calculatedEndDate = expectedEndDate;
    if (!expectedEndDate && selectedType) {
      const start = new Date(startDate);
      const duration = calculateFinalDuration(selectedRecipe.id, selectedType);
      start.setDate(start.getDate() + duration);
      calculatedEndDate = start.toISOString().split('T')[0];
      setExpectedEndDate(calculatedEndDate);
    }

    // 날짜 검증 (입력한 경우에만)
    if (expectedEndDate) {
      const start = new Date(startDate);
      const end = new Date(expectedEndDate);
      
      if (end <= start) {
        Alert.alert('오류', '완료 예정일은 시작일보다 늦어야 합니다.');
        return;
      }
    }

    // 선택한 레시피의 재료를 사용
    const ingredientList = selectedRecipe.ingredients.map((ingredientName, index) => ({
      id: `ingredient-${Date.now()}-${index}`,
      projectId: '', // 프로젝트 생성 후 설정됨
      name: ingredientName,
      quantity: '',
      unit: '',
    }));

    const projectData = {
      name: name.trim(),
      type: selectedType, // 사용자가 선택한 타입 사용
      startDate,
      expectedEndDate: calculatedEndDate,
      status: 'in_progress' as const, // 생성과 동시에 진행 중으로 변경
      notes: notes.trim() || undefined,
      images,
      ingredients: ingredientList,
      progressLogs: [],
      recipeId: selectedRecipe.id, // 선택한 레시피 ID 저장
    };

    const success = await createProject(projectData);
    
    if (success) {
      Alert.alert(
        '프로젝트 생성 완료',
        `${selectedRecipe.name} 프로젝트가 생성되었습니다!`,
        [
          {
            text: '확인',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } else {
      Alert.alert('오류', '프로젝트 생성에 실패했습니다.');
    }
  };

  const handleSelectImages = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 5, // 최대 5개
    } as any;

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets) {
        const newImages = response.assets
          .map(asset => asset.uri)
          .filter(uri => uri) as string[];
        
        setImages(prev => [...prev, ...newImages].slice(0, 5)); // 최대 5개까지
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

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
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginHorizontal: 20,
      marginTop: 10,
      marginBottom: 0,
    },
    closeButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 22,
      backgroundColor: colors.background.elevated,
      ...shadows.glass.light,
    },
    headerTitle: {
      color: colors.text.primary,
      fontSize: 24,
      fontWeight: '700',
      letterSpacing: -0.5,
      flex: 1,
      textAlign: 'center',
    },
    placeholderView: {
      width: 44,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20,
    },
    content: {
      paddingBottom: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
      letterSpacing: 0.2,
      paddingHorizontal: 4, // 텍스트 좌우 여백
    },
    inputContainer: {
      marginBottom: 16,
    },
    input: {
      backgroundColor: colors.background.glass,
      color: colors.text.primary,
      paddingHorizontal: 20,
      paddingVertical: 18,
      borderRadius: 12,
      fontSize: 16,
      minHeight: 56,
      borderWidth: 1,
      borderColor: colors.border.glass,
      ...shadows.glass.light,
    },
    inputFocused: {
      borderColor: brandColors.accent.primary,
      ...shadows.glass.medium,
    },
    inputText: {
      color: colors.text.primary,
      fontSize: 16,
      flex: 1,
    },
    placeholderStyle: {
      color: colors.text.muted,
    },
    textArea: {
      minHeight: 120,
      paddingTop: 18,
      textAlignVertical: 'top',
    },
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dropdown: {
      backgroundColor: colors.background.glass,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.glass,
      marginTop: 8,
      marginBottom: 12, // 드롭다운과 다음 요소 간 여백
      overflow: 'hidden',
      ...shadows.glass.medium,
    },
    dropdownItem: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.secondary,
    },
    dropdownItemSelected: {
      backgroundColor: brandColors.accent.primary + '20',
    },
    dropdownText: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: '500',
    },
    dropdownTextSelected: {
      color: brandColors.accent.primary,
      fontWeight: '600',
    },
    dropdownSubText: {
      color: colors.text.secondary,
      fontSize: 14,
      marginTop: 4,
      lineHeight: 18,
    },
    recipeInfo: {
      padding: 20,
      marginTop: 16,
      marginBottom: 24, // 다음 섹션과의 여백 확보
      borderRadius: 16,
      borderLeftWidth: 4,
      borderLeftColor: brandColors.accent.primary,
    },
    recipeInfoTitle: {
      color: brandColors.accent.primary,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
      letterSpacing: 0.2,
    },
    recipeInfoText: {
      color: colors.text.primary,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 8,
    },
    helpText: {
      color: colors.text.secondary,
      fontSize: 14,
      marginTop: 12,
      lineHeight: 18,
      fontStyle: 'italic',
    },
    imageSection: {
      marginTop: 8,
    },
    sectionCard: {
      padding: 20,
      paddingTop: 16, // 상단 여백을 조금 줄여서 제목과의 간격 조정
    },
    imageUploadArea: {
      borderWidth: 2,
      borderColor: colors.border.accent,
      borderStyle: 'dashed',
      borderRadius: 16,
      paddingHorizontal: 24,
      paddingVertical: 40,
      alignItems: 'center',
      gap: 20,
      backgroundColor: colors.background.glass,
    },
    imageUploadContent: {
      alignItems: 'center',
      gap: 8,
    },
    imageUploadIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: brandColors.accent.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    imageUploadTitle: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    imageUploadSubtitle: {
      color: colors.text.secondary,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 18,
    },
    imagePreviewContainer: {
      marginTop: 20,
    },
    imagePreviewScroll: {
      paddingVertical: 4,
    },
    imagePreview: {
      position: 'relative',
      marginRight: 12,
      borderRadius: 12,
      overflow: 'hidden',
      ...shadows.glass.light,
    },
    previewImage: {
      width: 80,
      height: 80,
      borderRadius: 12,
    },
    removeImageButton: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.background.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.glass.light,
    },
    bottomContainer: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 20,
    },
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background.primary} />
      
      {/* 배경 그라디언트 */}
      <View style={styles.backgroundGradient} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* 헤더 */}
        <GlassCard style={styles.header} intensity="medium">
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>새 프로젝트</Text>
          <View style={styles.placeholderView} />
        </GlassCard>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* 기본 정보 섹션 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>기본 정보</Text>
              <GlassCard style={styles.sectionCard} intensity="medium">
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="프로젝트 이름"
                    placeholderTextColor={colors.text.muted}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.input, styles.pickerButton]}
                  onPress={() => setShowRecipePicker(!showRecipePicker)}
                >
                  <Text style={[styles.inputText, !selectedRecipe && styles.placeholderStyle]}>
                    {selectedRecipe ? selectedRecipe.name : '담금주 레시피 선택'}
                  </Text>
                  <Ionicons 
                    name={showRecipePicker ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.text.secondary} 
                  />
                </TouchableOpacity>

                {/* 레시피 선택 드롭다운 */}
                {showRecipePicker && (
                  <GlassCard style={styles.dropdown} intensity="light">
                    {PRESET_RECIPES.map((recipe, index) => (
                      <TouchableOpacity
                        key={recipe.id}
                        style={[
                          styles.dropdownItem,
                          selectedRecipe?.id === recipe.id && styles.dropdownItemSelected,
                          index === PRESET_RECIPES.length - 1 && { borderBottomWidth: 0 }
                        ]}
                        onPress={() => {
                          setSelectedRecipe(recipe);
                          setShowRecipePicker(false);
                          // 완료 예정일을 자동으로 설정
                          if (startDate) {
                            const start = new Date(startDate);
                            start.setDate(start.getDate() + recipe.defaultDuration);
                            setExpectedEndDate(start.toISOString().split('T')[0]);
                          }
                        }}
                      >
                        <View>
                          <Text style={[
                            styles.dropdownText,
                            selectedRecipe?.id === recipe.id && styles.dropdownTextSelected
                          ]}>
                            {recipe.name}
                          </Text>
                          <Text style={[
                            styles.dropdownSubText,
                            selectedRecipe?.id === recipe.id && styles.dropdownTextSelected
                          ]}>
                            {recipe.description}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </GlassCard>
                )}
              </GlassCard>
            </View>

            {/* 타입 선택 섹션 */}
            {selectedRecipe && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>담금주 타입</Text>
                <GlassCard style={styles.sectionCard} intensity="medium">
                  <TouchableOpacity 
                    style={[styles.input, styles.pickerButton]}
                    onPress={() => setShowTypePicker(!showTypePicker)}
                  >
                    <Text style={[styles.inputText, !selectedType && styles.placeholderStyle]}>
                      {selectedType ? getTypeDisplayName(selectedType) : '담금주 타입 선택'}
                    </Text>
                    <Ionicons 
                      name={showTypePicker ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={colors.text.secondary} 
                    />
                  </TouchableOpacity>

                  {/* 타입 선택 드롭다운 */}
                  {showTypePicker && (
                    <GlassCard style={styles.dropdown} intensity="light">
                      {getAllProjectTypes().map((type, index) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.dropdownItem,
                            selectedType === type && styles.dropdownItemSelected,
                            index === getAllProjectTypes().length - 1 && { borderBottomWidth: 0 }
                          ]}
                          onPress={() => {
                            setSelectedType(type);
                            setShowTypePicker(false);
                            // 타입 선택시 완료 예정일을 자동으로 설정
                            if (startDate) {
                              const start = new Date(startDate);
                              const duration = getDurationByType(type);
                              start.setDate(start.getDate() + duration);
                              setExpectedEndDate(start.toISOString().split('T')[0]);
                            }
                          }}
                        >
                          <View>
                            <Text style={[
                              styles.dropdownText,
                              selectedType === type && styles.dropdownTextSelected
                            ]}>
                              {getTypeDisplayName(type)}
                            </Text>
                            <Text style={[
                              styles.dropdownSubText,
                              selectedType === type && styles.dropdownTextSelected
                            ]}>
                              기본 숙성 기간: {getDurationByType(type)}일
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </GlassCard>
                  )}
                </GlassCard>
              </View>
            )}

            {/* 선택된 레시피 정보 */}
            {selectedRecipe && selectedType && (
              <GlassCard style={styles.recipeInfo} intensity="light">
                <Text style={styles.recipeInfoTitle}>선택된 구성</Text>
                <Text style={styles.recipeInfoText}>📝 레시피: {selectedRecipe.name}</Text>
                <Text style={styles.recipeInfoText}>🍶 타입: {getTypeDisplayName(selectedType)}</Text>
                <Text style={styles.recipeInfoText}>⏱️ 예상 숙성 기간: {getDurationByType(selectedType)}일</Text>
                <Text style={styles.recipeInfoText}>🧪 재료: {selectedRecipe.ingredients.join(', ')}</Text>
              </GlassCard>
            )}

            {/* 일정 정보 섹션 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>일정 정보</Text>
              <GlassCard style={styles.sectionCard} intensity="medium">
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="시작일 (YYYY-MM-DD)"
                    placeholderTextColor={colors.text.muted}
                    value={startDate}
                    onChangeText={setStartDate}
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input, 
                      !selectedType && { opacity: 0.5 }
                    ]}
                    placeholder="완료 예정일 (YYYY-MM-DD) - 타입 선택 시 자동 설정"
                    placeholderTextColor={colors.text.muted}
                    value={expectedEndDate}
                    onChangeText={setExpectedEndDate}
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                    editable={!!selectedType}
                  />
                  {selectedType && (
                    <Text style={styles.helpText}>
                      💡 {getTypeDisplayName(selectedType)}의 권장 숙성 기간은 {getDurationByType(selectedType)}일입니다
                    </Text>
                  )}
                </View>
              </GlassCard>
            </View>

            {/* 노트 섹션 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>프로젝트 노트</Text>
              <GlassCard style={styles.sectionCard} intensity="medium">
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="프로젝트 목적이나 특별한 의미를 작성해보세요&#10;&#10;예시:&#10;• 2024년 크리스마스에 가족들과 함께 마시고 싶어요&#10;• 친구 생일선물용으로 특별히 제조&#10;• 회사 동료들과 신년회에서 시음 예정"
                  placeholderTextColor={colors.text.muted}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </GlassCard>
            </View>

            {/* 이미지 업로드 섹션 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>프로젝트 이미지</Text>
              <GlassCard style={styles.sectionCard} intensity="medium">
                <TouchableOpacity style={styles.imageUploadArea} onPress={handleSelectImages}>
                  <View style={styles.imageUploadIcon}>
                    <Ionicons name="camera" size={24} color={brandColors.accent.primary} />
                  </View>
                  <View style={styles.imageUploadContent}>
                    <Text style={styles.imageUploadTitle}>이미지 추가</Text>
                    <Text style={styles.imageUploadSubtitle}>프로젝트 관련 사진을 추가하세요 (최대 5장)</Text>
                  </View>
                </TouchableOpacity>

                {/* 선택된 이미지들 */}
                {images.length > 0 && (
                  <View style={styles.imagePreviewContainer}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.imagePreviewScroll}
                    >
                      {images.map((imageUri, index) => (
                        <View key={index} style={styles.imagePreview}>
                          <Image source={{ uri: imageUri }} style={styles.previewImage} />
                          <TouchableOpacity 
                            style={styles.removeImageButton}
                            onPress={() => removeImage(index)}
                          >
                            <Ionicons name="close" size={16} color={colors.text.primary} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </GlassCard>
            </View>
          </View>
        </ScrollView>

        {/* 하단 생성 버튼 */}
        <GlassCard style={styles.bottomContainer} intensity="medium">
          <Button
            onPress={handleCreateProject}
            loading={isLoading}
            disabled={isLoading || !name.trim() || !selectedRecipe || !selectedType || !startDate}
            fullWidth
          >
            프로젝트 생성
          </Button>
        </GlassCard>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateProjectScreen;
