import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useProjectStore } from '@/src/stores/projectStore';
import { TastingNote, TastingNoteRatings, RATING_DIMENSIONS } from '@/src/types';
import { getRecipeById } from '@/src/data/presetRecipes';
import StarRating from '@/src/components/common/StarRating';
import RadarChart from '@/src/components/common/RadarChart';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

const TastingNoteScreen: React.FC = () => {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { colors, brandColors } = useThemeValues();
  const { projects, saveTastingNote, isLoading } = useProjectStore();

  const project = projects.find((p) => p.id === projectId);
  const existingNote = project?.tastingNote;
  const recipe = project?.recipeId ? getRecipeById(project.recipeId) : undefined;
  const brandColor = project?.customBrandColor || recipe?.brandColor || brandColors.accent.primary;

  const [ratings, setRatings] = useState<TastingNoteRatings>(
    existingNote?.ratings || { taste: 0, aroma: 0, appearance: 0, body: 0, finish: 0, overall: 0 },
  );
  const [color, setColor] = useState(existingNote?.color || '');
  const [memo, setMemo] = useState(existingNote?.memo || '');
  const [tastingDate, setTastingDate] = useState(
    existingNote?.tastingDate ? new Date(existingNote.tastingDate) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const radarData = useMemo(
    () => RATING_DIMENSIONS.map((dim) => ({ label: dim.label, value: ratings[dim.key] })),
    [ratings],
  );
  const hasAnyRating = Object.values(ratings).some((v) => v > 0);

  const handleRatingChange = (key: keyof TastingNoteRatings, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!projectId) return;

    const hasRatings = Object.values(ratings).some((v) => v > 0);
    if (!hasRatings) {
      Alert.alert('알림', '최소 하나 이상의 평가를 입력해주세요.');
      return;
    }

    const now = new Date().toISOString();
    const note: TastingNote = {
      ratings,
      color,
      memo,
      tastingDate: tastingDate.toISOString().split('T')[0],
      createdAt: existingNote?.createdAt || now,
      updatedAt: now,
    };

    const success = await saveTastingNote(projectId, note);
    if (success) {
      Alert.alert('저장 완료', '시음 노트가 저장되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('오류', '시음 노트 저장에 실패했습니다.');
    }
  };

  const formatDate = (date: Date): string => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const styles = useThemedStyles(({ colors, brandColors }) =>
    StyleSheet.create({
      container: { flex: 1, backgroundColor: colors.background.primary },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
      },
      backButton: { padding: 4, marginRight: 12 },
      headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
      content: { paddingHorizontal: 24, paddingBottom: 120 },
      projectInfo: {
        backgroundColor: colors.background.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: brandColor,
      },
      projectName: { fontSize: 17, fontWeight: '600', color: colors.text.primary, marginBottom: 4 },
      projectMeta: { fontSize: 13, color: colors.text.secondary },
      section: { marginBottom: 24 },
      sectionTitle: { fontSize: 15, fontWeight: '600', color: colors.text.primary, marginBottom: 16 },
      ratingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      },
      ratingLabel: { fontSize: 15, fontWeight: '500', color: colors.text.primary, width: 60 },
      radarContainer: { alignItems: 'center', marginBottom: 24 },
      input: {
        backgroundColor: colors.background.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.text.primary,
      },
      memoInput: { height: 100, textAlignVertical: 'top' },
      dateButton: {
        backgroundColor: colors.background.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border.primary,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
      },
      dateText: { fontSize: 15, color: colors.text.primary, marginLeft: 8, flex: 1 },
      saveButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: colors.border.secondary,
      },
      saveButton: {
        backgroundColor: brandColors.accent.primary,
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
      },
      saveButtonDisabled: { opacity: 0.5 },
      saveButtonText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
    }),
  );

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>프로젝트를 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {existingNote ? '시음 노트 수정' : '시음 노트 작성'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.projectInfo}>
          <Text style={styles.projectName}>{project.name}</Text>
          <Text style={styles.projectMeta}>
            {recipe?.name || project.customRecipeName || ''} · {project.startDate} ~ {project.actualEndDate || project.expectedEndDate}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>평가</Text>
          {RATING_DIMENSIONS.map((dim) => (
            <View key={dim.key} style={styles.ratingRow}>
              <Text style={styles.ratingLabel}>{dim.label}</Text>
              <StarRating
                rating={ratings[dim.key]}
                onRatingChange={(value) => handleRatingChange(dim.key, value)}
                size={28}
                color={brandColor}
              />
            </View>
          ))}
        </View>

        {hasAnyRating && (
          <View style={styles.radarContainer}>
            <RadarChart data={radarData} size={200} color={brandColor} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>색상</Text>
          <TextInput
            style={styles.input}
            placeholder="연한 황금색, 맑은 호박색 등"
            placeholderTextColor={colors.text.muted}
            value={color}
            onChangeText={setColor}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메모</Text>
          <TextInput
            style={[styles.input, styles.memoInput]}
            placeholder="맛, 느낌, 함께 마신 사람 등 자유롭게 기록하세요"
            placeholderTextColor={colors.text.muted}
            value={memo}
            onChangeText={setMemo}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>시음 날짜</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
            <Text style={styles.dateText}>{formatDate(tastingDate)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={tastingDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                setShowDatePicker(Platform.OS !== 'ios');
                if (date) setTastingDate(date);
              }}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? '저장 중...' : existingNote ? '시음 노트 수정' : '시음 노트 저장'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TastingNoteScreen;
