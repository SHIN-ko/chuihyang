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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProjectStore } from '@/src/stores/projectStore';
import Button from '@/src/components/common/Button';
import StarRating from '@/src/components/common/StarRating';
import RadarChart from '@/src/components/common/RadarChart';
import { Ionicons } from '@expo/vector-icons';
import { ProgressLog } from '@/src/types';
import ImageUpload from '@/src/components/common/ImageUpload';
import { getRecipeById } from '@/src/data/presetRecipes';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

type RecordMode = 'quick' | 'detailed';

const AddProgressLogScreen: React.FC = () => {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { addProgressLog, isLoading, projects } = useProjectStore();
  const { colors, brandColors } = useThemeValues();

  const project = projects.find((p) => p.id === projectId);
  const isCustomRecipe = project?.recipeId === 'custom';
  const recipe = !isCustomRecipe && project?.recipeId ? getRecipeById(project.recipeId) : null;
  const brandColor = isCustomRecipe
    ? project?.customBrandColor || brandColors.accent.primary
    : recipe?.brandColor || brandColors.accent.primary;

  const [mode, setMode] = useState<RecordMode>('quick');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const [tasteRating, setTasteRating] = useState(0);
  const [aromaRating, setAromaRating] = useState(0);
  const [appearanceRating, setAppearanceRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [bodyRating, setBodyRating] = useState(0);
  const [finishRating, setFinishRating] = useState(0);

  const handleClose = () => {
    router.back();
  };

  const handleAddProgressLog = async () => {
    if (!title.trim()) {
      Alert.alert('오류', '제목을 입력해주세요.');
      return;
    }

    if (!projectId) {
      Alert.alert('오류', '프로젝트 정보를 찾을 수 없습니다.');
      return;
    }

    const logData: Omit<ProgressLog, 'id' | 'createdAt' | 'updatedAt'> = {
      projectId,
      date,
      title: title.trim(),
      description: description.trim() || undefined,
      images,
      color: color.trim() || undefined,
      notes: notes.trim() || undefined,
      ratings: {
        taste: tasteRating || undefined,
        aroma: aromaRating || undefined,
        appearance: appearanceRating || undefined,
        overall: overallRating || undefined,
        body: bodyRating || undefined,
        finish: finishRating || undefined,
      },
    };

    console.log('진행 로그 추가 요청:', logData);

    const success = await addProgressLog(logData);

    console.log('진행 로그 추가 결과:', success);

    if (success) {
      Alert.alert('로그 추가 완료', '진행 로그가 추가되었습니다!', [
        {
          text: '확인',
          onPress: () => {
            console.log('진행 로그 추가 후 화면 뒤로가기');
            router.back();
          },
        },
      ]);
    } else {
      Alert.alert('오류', '진행 로그 추가에 실패했습니다.');
    }
  };

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
  };

  const styles = useThemedStyles(({ colors, shadows, brandColors }) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background.primary,
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
        backgroundColor: colors.background.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.primary,
        ...shadows.glass.light,
      },
      titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      },
      recipeBadge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
      },
      recipeSubtitle: {
        color: colors.text.tertiary,
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 8,
      },
      closeButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        backgroundColor: colors.background.secondary,
      },
      headerTitle: {
        color: colors.text.primary,
        fontSize: 18,
        fontWeight: '600',
      },
      placeholder: {
        width: 44,
      },
      scrollView: {
        flex: 1,
      },
      content: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 100,
      },
      inputContainer: {
        marginBottom: 24,
      },
      label: {
        color: colors.text.primary,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
      },
      input: {
        backgroundColor: colors.background.surface,
        color: colors.text.primary,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        fontSize: 16,
        minHeight: 56,
        borderWidth: 1,
        borderColor: colors.border.primary,
        ...shadows.glass.light,
      },
      textArea: {
        minHeight: 120,
        paddingTop: 16,
        textAlignVertical: 'top',
      },
      ratingSection: {
        marginBottom: 24,
        backgroundColor: colors.background.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border.primary,
        ...shadows.glass.light,
      },
      sectionTitle: {
        color: colors.text.primary,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
      },
      ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      },
      ratingLabel: {
        color: colors.text.secondary,
        fontSize: 16,
        fontWeight: '500',
        width: 70,
      },
      radarChartContainer: {
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border.secondary,
      },
      modeToggle: {
        flexDirection: 'row' as const,
        backgroundColor: colors.background.secondary,
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
      },
      modeTab: {
        flex: 1,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
      },
      modeTabText: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: colors.text.muted,
      },
      modeTabTextActive: {
        color: '#FFFFFF',
      },
      imageSection: {
        marginBottom: 24,
      },
      bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background.surface,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: colors.border.primary,
        ...shadows.glass.medium,
      },
    }),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <View style={[styles.recipeBadge, { backgroundColor: brandColor }]} />
            <Text style={styles.headerTitle}>진행 로그 추가</Text>
            {(recipe || isCustomRecipe) && (
              <Text style={styles.recipeSubtitle}>
                {isCustomRecipe ? project?.customRecipeName : recipe?.name}
              </Text>
            )}
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'quick' && { backgroundColor: brandColor }]}
                onPress={() => setMode('quick')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="flash"
                  size={16}
                  color={mode === 'quick' ? '#FFFFFF' : colors.text.muted}
                />
                <Text style={[styles.modeTabText, mode === 'quick' && styles.modeTabTextActive]}>
                  간편 기록
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'detailed' && { backgroundColor: brandColor }]}
                onPress={() => setMode('detailed')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="clipboard"
                  size={16}
                  color={mode === 'detailed' ? '#FFFFFF' : colors.text.muted}
                />
                <Text style={[styles.modeTabText, mode === 'detailed' && styles.modeTabTextActive]}>
                  상세 기록
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>날짜</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.text.muted}
                value={date}
                onChangeText={setDate}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>제목 *</Text>
              <TextInput
                style={styles.input}
                placeholder={
                  mode === 'quick' ? '오늘 한줄 메모' : '예: 첫 시음, 색깔 확인, 향 체크 등'
                }
                placeholderTextColor={colors.text.muted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.imageSection}>
              <Text style={styles.label}>사진</Text>
              <ImageUpload
                images={images}
                onImagesChange={handleImagesChange}
                maxImages={5}
                title="사진 추가"
                subtitle="현재 상태를 사진으로 기록하세요"
                bucket="progress-images"
                uploadPath="logs"
              />
            </View>

            {mode === 'detailed' && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>상세 내용</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder={
                      '오늘의 상태나 변화에 대해 자세히 기록해보세요\n\n예:\n• 드디어 첫 맛을 봤는데 생각보다 부드럽고 좋다!\n• 색이 조금 더 진해진 것 같아요\n• 향이 훨씬 풍부해졌네요'
                    }
                    placeholderTextColor={colors.text.muted}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.ratingSection}>
                  <Text style={styles.sectionTitle}>평가</Text>

                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingLabel}>맛</Text>
                    <StarRating
                      rating={tasteRating}
                      onRatingChange={setTasteRating}
                      color={brandColor}
                    />
                  </View>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingLabel}>향</Text>
                    <StarRating
                      rating={aromaRating}
                      onRatingChange={setAromaRating}
                      color={brandColor}
                    />
                  </View>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingLabel}>외관</Text>
                    <StarRating
                      rating={appearanceRating}
                      onRatingChange={setAppearanceRating}
                      color={brandColor}
                    />
                  </View>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingLabel}>바디감</Text>
                    <StarRating
                      rating={bodyRating}
                      onRatingChange={setBodyRating}
                      color={brandColor}
                    />
                  </View>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingLabel}>여운</Text>
                    <StarRating
                      rating={finishRating}
                      onRatingChange={setFinishRating}
                      color={brandColor}
                    />
                  </View>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingLabel}>전체</Text>
                    <StarRating
                      rating={overallRating}
                      onRatingChange={setOverallRating}
                      color={brandColor}
                    />
                  </View>

                  {(tasteRating > 0 ||
                    aromaRating > 0 ||
                    appearanceRating > 0 ||
                    bodyRating > 0 ||
                    finishRating > 0 ||
                    overallRating > 0) && (
                    <View style={styles.radarChartContainer}>
                      <RadarChart
                        data={[
                          { label: '맛', value: tasteRating },
                          { label: '향', value: aromaRating },
                          { label: '외관', value: appearanceRating },
                          { label: '바디감', value: bodyRating },
                          { label: '여운', value: finishRating },
                          { label: '전체', value: overallRating },
                        ]}
                        size={220}
                        color={brandColor}
                      />
                    </View>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>색깔</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="예: 연한 황금색, 짙은 호박색, 투명한 무색 등"
                    placeholderTextColor={colors.text.muted}
                    value={color}
                    onChangeText={setColor}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>추가 메모</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="특별한 관찰사항이나 다음에 시도해볼 것들을 메모하세요"
                    placeholderTextColor={colors.text.muted}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <Button onPress={handleAddProgressLog} loading={isLoading} disabled={isLoading} fullWidth>
            로그 저장
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddProgressLogScreen;
