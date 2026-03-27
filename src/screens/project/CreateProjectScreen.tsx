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
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProjectStore } from '@/src/stores/projectStore';
import Button from '@/src/components/common/Button';
import DatePicker from '@/src/components/common/DatePicker';
import { Ionicons } from '@expo/vector-icons';
import { ProjectType, Ingredient } from '@/src/types';
import ImageUpload from '@/src/components/common/ImageUpload';
import {
  PRESET_RECIPES,
  getAllProjectTypes,
  getTypeDisplayName,
  getDurationByType,
  calculateFinalDuration,
  getTypeDescription,
} from '@/src/data/presetRecipes';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

type RecipeMode = 'preset' | 'custom';

interface CustomIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

const BRAND_COLOR_OPTIONS = [
  '#025830',
  '#20407c',
  '#ab1e4b',
  '#eaa728',
  '#921e22',
  '#5B4F9E',
  '#2E8B57',
  '#D2691E',
];

const TOTAL_STEPS = 4;

const CreateProjectScreen: React.FC = () => {
  const router = useRouter();
  const { createProject, isLoading } = useProjectStore();
  const { colors, brandColors } = useThemeValues();

  const [currentStep, setCurrentStep] = useState(1);

  const [name, setName] = useState('');
  const [recipeMode, setRecipeMode] = useState<RecipeMode>('preset');
  const [selectedRecipe, setSelectedRecipe] = useState<(typeof PRESET_RECIPES)[0] | null>(null);
  const [selectedType, setSelectedType] = useState<ProjectType | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const [customRecipeName, setCustomRecipeName] = useState('');
  const [customIngredients, setCustomIngredients] = useState<CustomIngredient[]>([
    { id: `ing-${Date.now()}`, name: '', quantity: '', unit: '' },
  ]);
  const [customDuration, setCustomDuration] = useState('14');
  const [customBrandColor, setCustomBrandColor] = useState(BRAND_COLOR_OPTIONS[0]);

  const progressAnim = useState(() => new Animated.Value(1 / TOTAL_STEPS))[0];

  const styles = useThemedStyles(({ colors, shadows, brandColors }) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background.primary,
      },
      keyboardView: {
        flex: 1,
      },
      topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 8 : 16,
        paddingBottom: 12,
      },
      closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: colors.background.surface,
        ...shadows.glass.light,
      },
      stepIndicator: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.secondary,
      },
      placeholder40: {
        width: 40,
      },
      progressBarContainer: {
        height: 4,
        backgroundColor: colors.border.secondary,
        marginHorizontal: 24,
        borderRadius: 2,
        marginBottom: 8,
      },
      progressBarFill: {
        height: 4,
        backgroundColor: brandColors.accent.primary,
        borderRadius: 2,
      },
      scrollView: {
        flex: 1,
      },
      stepContent: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
      },
      stepTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 8,
      },
      stepDescription: {
        fontSize: 15,
        color: colors.text.secondary,
        lineHeight: 22,
        marginBottom: 32,
      },
      modeToggleContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.background.surface,
        ...shadows.glass.light,
      },
      modeToggleButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
      },
      modeToggleButtonActive: {
        backgroundColor: brandColors.accent.primary,
      },
      modeToggleText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.secondary,
      },
      modeToggleTextActive: {
        color: '#FFFFFF',
      },
      recipeCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        ...shadows.glass.light,
      },
      recipeCardSelected: {
        borderColor: brandColors.accent.primary,
      },
      recipeCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      recipeBadge: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
      },
      recipeName: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.primary,
        flex: 1,
      },
      recipeCheck: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: brandColors.accent.primary,
        alignItems: 'center',
        justifyContent: 'center',
      },
      recipeDescription: {
        fontSize: 14,
        color: colors.text.secondary,
        lineHeight: 20,
        marginTop: 8,
        marginLeft: 24,
      },
      recipeIngredients: {
        fontSize: 13,
        color: colors.text.tertiary,
        marginTop: 4,
        marginLeft: 24,
      },
      typeCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        ...shadows.glass.light,
      },
      typeCardSelected: {
        borderColor: brandColors.accent.primary,
      },
      typeCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      typeName: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.primary,
      },
      typeDuration: {
        fontSize: 14,
        fontWeight: '500',
        color: brandColors.accent.primary,
      },
      typeDescription: {
        fontSize: 14,
        color: colors.text.secondary,
        marginTop: 6,
      },
      inputGroup: {
        marginBottom: 20,
      },
      label: {
        color: colors.text.primary,
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
      },
      input: {
        backgroundColor: colors.background.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border.primary,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 15,
        color: colors.text.primary,
        ...shadows.glass.light,
      },
      textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
      },
      summaryCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        padding: 20,
        ...shadows.glass.light,
      },
      summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.secondary,
      },
      summaryRowLast: {
        borderBottomWidth: 0,
      },
      summaryLabel: {
        fontSize: 15,
        color: colors.text.secondary,
      },
      summaryValue: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.primary,
        maxWidth: '60%',
        textAlign: 'right',
      },
      bottomBar: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 24 : 16,
        gap: 12,
        backgroundColor: colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: colors.border.secondary,
      },
      backButton: {
        flex: 1,
      },
      nextButton: {
        flex: 2,
      },
      ingredientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
      },
      ingredientNameInput: {
        flex: 3,
        backgroundColor: colors.background.surface,
        color: colors.text.primary,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 15,
        borderWidth: 1,
        borderColor: colors.border.primary,
      },
      ingredientSmallInput: {
        flex: 1.5,
        backgroundColor: colors.background.surface,
        color: colors.text.primary,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 15,
        borderWidth: 1,
        borderColor: colors.border.primary,
      },
      ingredientUnitInput: {
        flex: 1,
        backgroundColor: colors.background.surface,
        color: colors.text.primary,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 15,
        borderWidth: 1,
        borderColor: colors.border.primary,
      },
      removeIngredientButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${brandColors.semantic.error}15`,
      },
      addIngredientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: brandColors.accent.primary + '60',
        borderStyle: 'dashed',
        gap: 6,
      },
      addIngredientText: {
        color: brandColors.accent.primary,
        fontSize: 15,
        fontWeight: '500',
      },
      durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      },
      durationInput: {
        flex: 1,
        backgroundColor: colors.background.surface,
        color: colors.text.primary,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.border.primary,
        textAlign: 'center',
      },
      durationLabel: {
        color: colors.text.secondary,
        fontSize: 16,
        fontWeight: '500',
      },
      colorPickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 4,
      },
      colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
      },
      colorOptionSelected: {
        borderColor: colors.text.primary,
        borderWidth: 3,
      },
    }),
  );

  const animateProgress = (step: number) => {
    Animated.timing(progressAnim, {
      toValue: step / TOTAL_STEPS,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const goNext = () => {
    if (currentStep < TOTAL_STEPS) {
      const next = currentStep + 1;
      setCurrentStep(next);
      animateProgress(next);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      animateProgress(prev);
    } else {
      router.back();
    }
  };

  const calculateEndDate = (start: string, days: number): string => {
    const d = new Date(start);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const addIngredient = () => {
    setCustomIngredients((prev) => [
      ...prev,
      { id: `ing-${Date.now()}-${prev.length}`, name: '', quantity: '', unit: '' },
    ]);
  };

  const removeIngredient = (id: string) => {
    if (customIngredients.length <= 1) return;
    setCustomIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const updateIngredient = (id: string, field: keyof CustomIngredient, value: string) => {
    setCustomIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        if (recipeMode === 'preset') return !!selectedRecipe;
        return !!customRecipeName.trim() && customIngredients.some((i) => i.name.trim());
      case 2:
        return !!selectedType;
      case 3:
        return !!name.trim() && !!startDate;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleCreateProject = async () => {
    if (!selectedType || !name.trim() || !startDate) return;

    if (recipeMode === 'preset') {
      if (!selectedRecipe) return;

      let finalEndDate = expectedEndDate;
      if (!finalEndDate) {
        finalEndDate = calculateEndDate(
          startDate,
          calculateFinalDuration(selectedRecipe.id, selectedType),
        );
      }

      const ingredientList = selectedRecipe.ingredients.map((ingredientName, index) => ({
        id: `ingredient-${Date.now()}-${index}`,
        projectId: '',
        name: ingredientName,
        quantity: '',
        unit: '',
      }));

      const success = await createProject({
        name: name.trim(),
        type: selectedType,
        startDate,
        expectedEndDate: finalEndDate,
        status: 'in_progress' as const,
        notes: notes.trim() || undefined,
        images,
        ingredients: ingredientList,
        progressLogs: [],
        recipeId: selectedRecipe.id,
      });

      if (success) {
        Alert.alert('프로젝트 생성 완료', `${selectedRecipe.name} 프로젝트가 생성되었습니다!`, [
          { text: '확인', onPress: () => router.replace('/(tabs)') },
        ]);
      } else {
        Alert.alert('오류', '프로젝트 생성에 실패했습니다.');
      }
    } else {
      const validIngredients = customIngredients.filter((i) => i.name.trim());
      const duration = parseInt(customDuration, 10);
      const finalEndDate = calculateEndDate(startDate, duration || 14);

      const ingredientList: Ingredient[] = validIngredients.map((ing, index) => ({
        id: `ingredient-${Date.now()}-${index}`,
        projectId: '',
        name: ing.name.trim(),
        quantity: ing.quantity.trim(),
        unit: ing.unit.trim(),
      }));

      const success = await createProject({
        name: name.trim(),
        type: selectedType,
        startDate,
        expectedEndDate: finalEndDate,
        status: 'in_progress' as const,
        notes: notes.trim() || undefined,
        images,
        ingredients: ingredientList,
        progressLogs: [],
        recipeId: 'custom',
        customRecipeName: customRecipeName.trim(),
        customDuration: duration || 14,
        customBrandColor,
      });

      if (success) {
        Alert.alert('프로젝트 생성 완료', `${customRecipeName.trim()} 프로젝트가 생성되었습니다!`, [
          { text: '확인', onPress: () => router.replace('/(tabs)') },
        ]);
      } else {
        Alert.alert('오류', '프로젝트 생성에 실패했습니다.');
      }
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>레시피 선택</Text>
      <Text style={styles.stepDescription}>어떤 담금주를 만들어볼까요?</Text>

      <View style={styles.modeToggleContainer}>
        <TouchableOpacity
          style={[
            styles.modeToggleButton,
            recipeMode === 'preset' && styles.modeToggleButtonActive,
          ]}
          onPress={() => setRecipeMode('preset')}
        >
          <Text
            style={[styles.modeToggleText, recipeMode === 'preset' && styles.modeToggleTextActive]}
          >
            프리셋 레시피
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeToggleButton,
            recipeMode === 'custom' && styles.modeToggleButtonActive,
          ]}
          onPress={() => setRecipeMode('custom')}
        >
          <Text
            style={[styles.modeToggleText, recipeMode === 'custom' && styles.modeToggleTextActive]}
          >
            나만의 레시피
          </Text>
        </TouchableOpacity>
      </View>

      {recipeMode === 'preset' ? (
        PRESET_RECIPES.map((recipe) => (
          <TouchableOpacity
            key={recipe.id}
            style={[
              styles.recipeCard,
              selectedRecipe?.id === recipe.id && styles.recipeCardSelected,
            ]}
            onPress={() => {
              setSelectedRecipe(recipe);
              if (startDate && selectedType) {
                const duration = calculateFinalDuration(recipe.id, selectedType);
                setExpectedEndDate(calculateEndDate(startDate, duration));
              }
            }}
          >
            <View style={styles.recipeCardHeader}>
              <View style={[styles.recipeBadge, { backgroundColor: recipe.brandColor }]} />
              <Text style={styles.recipeName}>{recipe.name}</Text>
              {selectedRecipe?.id === recipe.id && (
                <View style={styles.recipeCheck}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text style={styles.recipeDescription}>{recipe.description}</Text>
            <Text style={styles.recipeIngredients}>재료: {recipe.ingredients.join(', ')}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>레시피 이름</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 나만의 매실주"
              placeholderTextColor={colors.text.muted}
              value={customRecipeName}
              onChangeText={setCustomRecipeName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>재료 목록</Text>
            {customIngredients.map((ingredient) => (
              <View key={ingredient.id} style={styles.ingredientRow}>
                <TextInput
                  style={styles.ingredientNameInput}
                  placeholder="재료명"
                  placeholderTextColor={colors.text.muted}
                  value={ingredient.name}
                  onChangeText={(v) => updateIngredient(ingredient.id, 'name', v)}
                />
                <TextInput
                  style={styles.ingredientSmallInput}
                  placeholder="양"
                  placeholderTextColor={colors.text.muted}
                  value={ingredient.quantity}
                  onChangeText={(v) => updateIngredient(ingredient.id, 'quantity', v)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.ingredientUnitInput}
                  placeholder="단위"
                  placeholderTextColor={colors.text.muted}
                  value={ingredient.unit}
                  onChangeText={(v) => updateIngredient(ingredient.id, 'unit', v)}
                />
                <TouchableOpacity
                  style={styles.removeIngredientButton}
                  onPress={() => removeIngredient(ingredient.id)}
                  disabled={customIngredients.length <= 1}
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color={
                      customIngredients.length <= 1 ? colors.text.muted : brandColors.semantic.error
                    }
                  />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addIngredientButton} onPress={addIngredient}>
              <Ionicons name="add" size={18} color={brandColors.accent.primary} />
              <Text style={styles.addIngredientText}>재료 추가</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>숙성 기간</Text>
            <View style={styles.durationRow}>
              <TextInput
                style={styles.durationInput}
                value={customDuration}
                onChangeText={(v) => {
                  const cleaned = v.replace(/[^0-9]/g, '');
                  setCustomDuration(cleaned);
                  const days = parseInt(cleaned, 10);
                  if (days > 0 && startDate) {
                    setExpectedEndDate(calculateEndDate(startDate, days));
                  }
                }}
                keyboardType="number-pad"
                maxLength={4}
              />
              <Text style={styles.durationLabel}>일</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>브랜드 컬러</Text>
            <View style={styles.colorPickerContainer}>
              {BRAND_COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    customBrandColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setCustomBrandColor(color)}
                />
              ))}
            </View>
          </View>
        </>
      )}
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>담금주 타입</Text>
      <Text style={styles.stepDescription}>어떤 베이스를 사용할까요?</Text>

      {getAllProjectTypes().map((type) => {
        const duration =
          recipeMode === 'preset' && selectedRecipe
            ? calculateFinalDuration(selectedRecipe.id, type)
            : getDurationByType(type);

        return (
          <TouchableOpacity
            key={type}
            style={[styles.typeCard, selectedType === type && styles.typeCardSelected]}
            onPress={() => {
              setSelectedType(type);
              if (startDate) {
                setExpectedEndDate(calculateEndDate(startDate, duration));
              }
            }}
          >
            <View style={styles.typeCardHeader}>
              <Text style={styles.typeName}>{getTypeDisplayName(type)}</Text>
              <Text style={styles.typeDuration}>{duration}일 숙성</Text>
            </View>
            <Text style={styles.typeDescription}>{getTypeDescription(type)}</Text>
          </TouchableOpacity>
        );
      })}
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>프로젝트 정보</Text>
      <Text style={styles.stepDescription}>이름과 일정을 정해주세요.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>프로젝트 이름</Text>
        <TextInput
          style={styles.input}
          placeholder="나만의 프로젝트 이름"
          placeholderTextColor={colors.text.muted}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>시작일</Text>
        <DatePicker
          value={startDate}
          onDateChange={(date) => {
            setStartDate(date);
            if (date && selectedType) {
              const duration =
                recipeMode === 'preset' && selectedRecipe
                  ? calculateFinalDuration(selectedRecipe.id, selectedType)
                  : parseInt(customDuration, 10) || 14;
              setExpectedEndDate(calculateEndDate(date, duration));
            }
          }}
          placeholder="시작일 선택"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>완료 예정일</Text>
        <DatePicker
          value={expectedEndDate}
          onDateChange={setExpectedEndDate}
          placeholder="자동 설정됨 (변경 가능)"
          minimumDate={startDate || new Date().toISOString().split('T')[0]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>메모 (선택)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="프로젝트에 대한 메모를 남겨보세요"
          placeholderTextColor={colors.text.muted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>이미지 (선택)</Text>
        <ImageUpload
          images={images}
          onImagesChange={setImages}
          maxImages={5}
          title="이미지 추가"
          subtitle="프로젝트 관련 사진을 추가하세요"
          bucket="project-images"
          uploadPath="projects"
        />
      </View>
    </>
  );

  const getRecipeDisplayName = () => {
    if (recipeMode === 'preset') return selectedRecipe?.name || '';
    return customRecipeName || '';
  };

  const getIngredientsSummary = () => {
    if (recipeMode === 'preset') return selectedRecipe?.ingredients.join(', ') || '';
    return (
      customIngredients
        .filter((i) => i.name.trim())
        .map((i) => (i.quantity ? `${i.name} ${i.quantity}${i.unit}` : i.name))
        .join(', ') || '미입력'
    );
  };

  const getDuration = () => {
    if (recipeMode === 'preset' && selectedRecipe && selectedType) {
      return `${calculateFinalDuration(selectedRecipe.id, selectedType)}일`;
    }
    return `${customDuration}일`;
  };

  const renderStep4 = () => (
    <>
      <Text style={styles.stepTitle}>최종 확인</Text>
      <Text style={styles.stepDescription}>모든 정보가 맞는지 확인해주세요.</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>레시피</Text>
          <Text style={styles.summaryValue}>{getRecipeDisplayName()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>타입</Text>
          <Text style={styles.summaryValue}>
            {selectedType ? getTypeDisplayName(selectedType) : ''}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>이름</Text>
          <Text style={styles.summaryValue}>{name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>재료</Text>
          <Text style={styles.summaryValue}>{getIngredientsSummary()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>숙성 기간</Text>
          <Text style={styles.summaryValue}>{getDuration()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>시작일</Text>
          <Text style={styles.summaryValue}>{startDate}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryRowLast]}>
          <Text style={styles.summaryLabel}>완료 예정일</Text>
          <Text style={styles.summaryValue}>{expectedEndDate}</Text>
        </View>
        {notes.trim() && (
          <View style={[styles.summaryRow, styles.summaryRowLast]}>
            <Text style={styles.summaryLabel}>메모</Text>
            <Text style={styles.summaryValue} numberOfLines={2}>
              {notes}
            </Text>
          </View>
        )}
      </View>
    </>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  const isLastStep = currentStep === TOTAL_STEPS;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={goBack} style={styles.closeButton}>
          <Ionicons
            name={currentStep === 1 ? 'close' : 'chevron-back'}
            size={22}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>
          {currentStep} / {TOTAL_STEPS}
        </Text>
        <View style={styles.placeholder40} />
      </View>

      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.stepContent}>{renderCurrentStep()}</View>
        </ScrollView>

        <View style={styles.bottomBar}>
          {currentStep > 1 && (
            <View style={styles.backButton}>
              <Button onPress={goBack} variant="secondary" fullWidth>
                이전
              </Button>
            </View>
          )}
          <View style={currentStep > 1 ? styles.nextButton : { flex: 1 }}>
            <Button
              onPress={isLastStep ? handleCreateProject : goNext}
              disabled={!canProceed() || (isLastStep && isLoading)}
              loading={isLastStep && isLoading}
              fullWidth
              size="lg"
            >
              {isLastStep ? '프로젝트 생성' : '다음'}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateProjectScreen;
