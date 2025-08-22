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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProjectStore } from '@/src/stores/projectStore';
import Button from '@/src/components/common/Button';
import StarRating from '@/src/components/common/StarRating';
import { Ionicons } from '@expo/vector-icons';
import { ProgressLog } from '@/src/types';
import ImageUpload from '@/src/components/common/ImageUpload';
import { getRecipeById } from '@/src/data/presetRecipes';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

const AddProgressLogScreen: React.FC = () => {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { addProgressLog, isLoading, projects } = useProjectStore();
  const { colors, brandColors } = useThemeValues();
  
  const project = projects.find(p => p.id === projectId);
  const recipe = project?.recipeId ? getRecipeById(project.recipeId) : null;
  const brandColor = recipe?.brandColor || brandColors.accent.primary;
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  // 평가 점수들
  const [tasteRating, setTasteRating] = useState(0);
  const [aromaRating, setAromaRating] = useState(0);
  const [appearanceRating, setAppearanceRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);

  const handleClose = () => {
    router.back();
  };

  const handleAddProgressLog = async () => {
    // 기본 검증
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
      },
    };

    console.log('진행 로그 추가 요청:', logData);

    const success = await addProgressLog(logData);
    
    console.log('진행 로그 추가 결과:', success);
    
    if (success) {
      Alert.alert(
        '로그 추가 완료',
        '진행 로그가 추가되었습니다!',
        [
          {
            text: '확인',
            onPress: () => {
              console.log('진행 로그 추가 후 화면 뒤로가기');
              router.back();
            },
          },
        ]
      );
    } else {
      Alert.alert('오류', '진행 로그 추가에 실패했습니다.');
    }
  };

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
  };

  const styles = useThemedStyles(({ colors, shadows, brandColors }) => StyleSheet.create({
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
      width: 60,
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
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <View style={[styles.recipeBadge, { backgroundColor: brandColor }]} />
            <Text style={styles.headerTitle}>진행 로그 추가</Text>
            {recipe && (
              <Text style={styles.recipeSubtitle}>{recipe.name}</Text>
            )}
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* 날짜 */}
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

            {/* 제목 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>제목 *</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 첫 시음, 색깔 확인, 향 체크 등"
                placeholderTextColor={colors.text.muted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* 상세 내용 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>상세 내용</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="오늘의 상태나 변화에 대해 자세히 기록해보세요&#10;&#10;예:&#10;• 드디어 첫 맛을 봤는데 생각보다 부드럽고 좋다!&#10;• 색이 조금 더 진해진 것 같아요&#10;• 향이 훨씬 풍부해졌네요"
                placeholderTextColor={colors.text.muted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* 평가 섹션 */}
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
                <Text style={styles.ratingLabel}>전체</Text>
                <StarRating
                  rating={overallRating}
                  onRatingChange={setOverallRating}
                  color={brandColor}
                />
              </View>
            </View>

            {/* 색깔 */}
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

            {/* 추가 메모 */}
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

            {/* 이미지 업로드 */}
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
          </View>
        </ScrollView>

        {/* 하단 저장 버튼 */}
        <View style={styles.bottomContainer}>
          <Button
            onPress={handleAddProgressLog}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            로그 저장
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddProgressLogScreen;
