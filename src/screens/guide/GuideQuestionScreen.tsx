import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  MoodId,
  PeopleCount,
  FruitId,
  HerbId,
  SweetnessLevel,
  DrinkTiming,
  ProjectType,
  GuideAnswers,
} from '@/src/types';
import {
  MOODS,
  PEOPLE_LABELS,
  SWEETNESS_LABELS,
  DRINK_TIMING_LABELS,
  BASE_TYPE_LABELS,
  getMoodById,
  getFruitById,
} from '@/src/data/recipeGuideData';
import { getFruitsForMood, getHerbsForFruit, generateRecipe } from '@/src/utils/recipeGuide';
import { useCustomRecipeStore } from '@/src/stores/customRecipeStore';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

const TOTAL_STEPS = 7;
const SELECTED_BG = '#FFF5ED';

const GuideQuestionScreen: React.FC = () => {
  const router = useRouter();
  const { colors, brandColors } = useThemeValues();
  const params = useLocalSearchParams<{
    applyProfile?: string;
    tasteTypeTitle?: string;
  }>();

  const applyProfile = params.applyProfile === 'true';
  const tasteTypeTitle = params.tasteTypeTitle;

  const { setPendingRecipe } = useCustomRecipeStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [mood, setMood] = useState<MoodId | null>(null);
  const [people, setPeople] = useState<PeopleCount | null>(null);
  const [fruit, setFruit] = useState<FruitId | null>(null);
  const [selectedHerbs, setSelectedHerbs] = useState<HerbId[]>([]);
  const [baseType, setBaseType] = useState<ProjectType | null>(null);
  const [sweetness, setSweetness] = useState<SweetnessLevel | null>(null);
  const [drinkTiming, setDrinkTiming] = useState<DrinkTiming | null>(null);

  const fruitsForMood = useMemo(() => (mood ? getFruitsForMood(mood, 8) : []), [mood]);
  const herbsForFruit = useMemo(() => (fruit ? getHerbsForFruit(fruit, 5) : []), [fruit]);
  const recommendedBase = useMemo(
    () => (mood ? getMoodById(mood)?.recommendedBase : null),
    [mood],
  );

  const canProceed = (() => {
    switch (currentStep) {
      case 1: return !!mood;
      case 2: return !!people;
      case 3: return !!fruit;
      case 4: return true;
      case 5: return !!baseType;
      case 6: return !!sweetness;
      case 7: return !!drinkTiming;
      default: return false;
    }
  })();

  useEffect(() => {
    if (currentStep === 5 && recommendedBase && !baseType) {
      setBaseType(recommendedBase);
    }
  }, [currentStep, recommendedBase, baseType]);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    } else {
      if (!mood || !people || !fruit || !baseType || !sweetness || !drinkTiming) return;

      const answers: GuideAnswers = {
        mood,
        people,
        fruit,
        herbs: selectedHerbs,
        baseType,
        sweetness,
        drinkTiming,
        applyTasteProfile: applyProfile,
        tasteTypeTitle,
      };

      const result = generateRecipe(answers);
      setPendingRecipe(result);
      router.replace('/guide/result' as never);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const toggleHerb = (id: HerbId) => {
    setSelectedHerbs((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id],
    );
  };

  const styles = useThemedStyles(({ colors, brandColors, shadows }) =>
    StyleSheet.create({
      container: { flex: 1, backgroundColor: colors.background.primary },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        justifyContent: 'space-between',
      },
      backButton: { padding: 4 },
      stepIndicator: { fontSize: 14, fontWeight: '600', color: colors.text.secondary },
      progressBarContainer: {
        height: 4,
        backgroundColor: colors.border.secondary,
        marginHorizontal: 24,
        borderRadius: 2,
        marginBottom: 24,
      },
      progressBarFill: {
        height: 4,
        backgroundColor: brandColors.accent.primary,
        borderRadius: 2,
      },
      content: { paddingHorizontal: 24, flex: 1 },
      question: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 8,
        lineHeight: 30,
      },
      subQuestion: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 24,
        lineHeight: 20,
      },
      scrollArea: { flex: 1 },
      optionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
      },
      optionCard: {
        width: '50%',
        paddingHorizontal: 6,
        marginBottom: 12,
      },
      optionInner: {
        backgroundColor: colors.background.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1.5,
        borderColor: colors.border.primary,
        minHeight: 90,
        ...shadows.glass.light,
      },
      optionInnerSelected: {
        borderColor: brandColors.accent.primary,
        backgroundColor: SELECTED_BG,
      },
      optionEmoji: { fontSize: 24, marginBottom: 8 },
      optionLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 2,
      },
      optionDescription: {
        fontSize: 12,
        color: colors.text.secondary,
        lineHeight: 16,
      },
      rowOption: {
        backgroundColor: colors.background.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1.5,
        borderColor: colors.border.primary,
        marginBottom: 12,
        ...shadows.glass.light,
      },
      rowOptionSelected: {
        borderColor: brandColors.accent.primary,
        backgroundColor: SELECTED_BG,
      },
      rowOptionLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.primary,
      },
      rowOptionDesc: {
        fontSize: 12,
        color: colors.text.secondary,
        marginTop: 2,
      },
      footer: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 24,
        backgroundColor: colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: colors.border.secondary,
      },
      nextButton: {
        backgroundColor: brandColors.accent.primary,
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
      },
      nextButtonDisabled: { opacity: 0.4 },
      nextButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
      skipText: {
        fontSize: 13,
        color: brandColors.accent.primary,
        textAlign: 'center',
        marginBottom: 12,
      },
      recommendedBadge: {
        marginLeft: 8,
        backgroundColor: brandColors.accent.primary,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
      },
      recommendedText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
      },
    }),
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text style={styles.question}>완성된 후, 어떤 순간에 마시고 싶나요?</Text>
            <Text style={styles.subQuestion}>당신이 상상하는 그 장면을 선택해주세요.</Text>
            <ScrollView style={styles.scrollArea}>
              <View style={styles.optionGrid}>
                {MOODS.map((m) => (
                  <View key={m.id} style={styles.optionCard}>
                    <TouchableOpacity
                      style={[styles.optionInner, mood === m.id && styles.optionInnerSelected]}
                      onPress={() => setMood(m.id)}
                    >
                      <Text style={styles.optionEmoji}>{m.emoji}</Text>
                      <Text style={styles.optionLabel}>{m.label}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.question}>몇 명과 함께 마실 예정인가요?</Text>
            <Text style={styles.subQuestion}>용량과는 무관하게, 상상하는 자리의 규모를 알려주세요.</Text>
            <ScrollView style={styles.scrollArea}>
              {(['alone', 'two', 'small_group', 'big_group'] as PeopleCount[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.rowOption, people === p && styles.rowOptionSelected]}
                  onPress={() => setPeople(p)}
                >
                  <Text style={styles.rowOptionLabel}>{PEOPLE_LABELS[p]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.question}>어떤 과일에 끌리세요?</Text>
            <Text style={styles.subQuestion}>
              {getMoodById(mood!)?.label}에 잘 어울리는 과일들이에요.
            </Text>
            <ScrollView style={styles.scrollArea}>
              <View style={styles.optionGrid}>
                {fruitsForMood.map((f) => (
                  <View key={f.id} style={styles.optionCard}>
                    <TouchableOpacity
                      style={[styles.optionInner, fruit === f.id && styles.optionInnerSelected]}
                      onPress={() => setFruit(f.id)}
                    >
                      <Text style={styles.optionLabel}>{f.name}</Text>
                      <Text style={styles.optionDescription}>{f.description}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </>
        );

      case 4:
        return (
          <>
            <Text style={styles.question}>함께 우려낼 향초는?</Text>
            <Text style={styles.subQuestion}>
              {getFruitById(fruit!)?.name}에 어울리는 허브들이에요. 최대 2개까지 선택 가능. 건너뛰어도 돼요.
            </Text>
            <ScrollView style={styles.scrollArea}>
              {herbsForFruit.map((h) => {
                const isSelected = selectedHerbs.includes(h.id);
                const canSelect = isSelected || selectedHerbs.length < 2;
                return (
                  <TouchableOpacity
                    key={h.id}
                    style={[styles.rowOption, isSelected && styles.rowOptionSelected]}
                    onPress={() => canSelect && toggleHerb(h.id)}
                    disabled={!canSelect}
                  >
                    <Text style={styles.rowOptionLabel}>{h.name}</Text>
                    <Text style={styles.rowOptionDesc}>{h.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Text style={styles.skipText}>선택 안 하고 넘어가도 괜찮아요</Text>
          </>
        );

      case 5:
        return (
          <>
            <Text style={styles.question}>베이스 술을 선택해주세요</Text>
            <Text style={styles.subQuestion}>
              {recommendedBase
                ? `${BASE_TYPE_LABELS[recommendedBase]}를 추천해요. 변경 가능합니다.`
                : '원하는 베이스를 선택해주세요.'}
            </Text>
            <ScrollView style={styles.scrollArea}>
              {(['damgeumSoju25', 'damgeumSoju30', 'vodka'] as ProjectType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.rowOption, baseType === t && styles.rowOptionSelected]}
                  onPress={() => setBaseType(t)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.rowOptionLabel}>{BASE_TYPE_LABELS[t]}</Text>
                    {t === recommendedBase && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>추천</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        );

      case 6:
        return (
          <>
            <Text style={styles.question}>단맛 정도는?</Text>
            <Text style={styles.subQuestion}>빙탕의 양을 결정합니다.</Text>
            <ScrollView style={styles.scrollArea}>
              {(['light', 'normal', 'strong'] as SweetnessLevel[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.rowOption, sweetness === s && styles.rowOptionSelected]}
                  onPress={() => setSweetness(s)}
                >
                  <Text style={styles.rowOptionLabel}>{SWEETNESS_LABELS[s]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        );

      case 7:
        return (
          <>
            <Text style={styles.question}>언제 마시고 싶나요?</Text>
            <Text style={styles.subQuestion}>숙성 기간을 결정합니다.</Text>
            <ScrollView style={styles.scrollArea}>
              {(['within_month', 'two_three_months', 'after_season'] as DrinkTiming[]).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.rowOption, drinkTiming === d && styles.rowOptionSelected]}
                  onPress={() => setDrinkTiming(d)}
                >
                  <Text style={styles.rowOptionLabel}>{DRINK_TIMING_LABELS[d]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>{currentStep} / {TOTAL_STEPS}</Text>
        <View style={{ width: 32 }} />
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${(currentStep / TOTAL_STEPS) * 100}%` }]} />
      </View>
      <View style={styles.content}>{renderStep()}</View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === TOTAL_STEPS ? '결과 보기' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GuideQuestionScreen;
