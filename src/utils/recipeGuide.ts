import {
  FruitId,
  HerbId,
  MoodId,
  GuideAnswers,
  GuideResult,
  RecipeAdjustments,
  ProjectType,
} from '@/src/types';
import {
  FRUITS,
  FRUIT_HERB_PAIRINGS,
  BASE_DURATION_DAYS,
  getFruitById,
  getHerbById,
  getMoodById,
  FruitInfo,
  HerbInfo,
} from '@/src/data/recipeGuideData';

const BASE_FRUIT_G = 160;
const BASE_HERB_G = 3;
const BASE_VOLUME_ML = 500;

const SWEETNESS_GRAMS: Record<RecipeAdjustments['sweetness'], number> = {
  light: 15,
  normal: 25,
  strong: 40,
};

const AROMA_GRAMS: Record<RecipeAdjustments['aroma'], number> = {
  subtle: 2,
  normal: 3,
  intense: 10,
};

const STRENGTH_BASE_TYPES: Record<RecipeAdjustments['strength'], ProjectType> = {
  soft: 'damgeumSoju25',
  normal: 'damgeumSoju30',
  strong: 'vodka',
};

export function getFruitsForMood(mood: MoodId, limit: number): FruitInfo[] {
  const moodInfo = getMoodById(mood);
  if (!moodInfo) return FRUITS.slice(0, limit);

  const preferred = FRUITS.filter((f) => moodInfo.preferredFruits.includes(f.id));
  if (preferred.length >= limit) return preferred.slice(0, limit);

  const others = FRUITS.filter((f) => !moodInfo.preferredFruits.includes(f.id));
  return [...preferred, ...others].slice(0, limit);
}

export function getHerbsForFruit(fruit: FruitId, limit: number): HerbInfo[] {
  const herbIds = FRUIT_HERB_PAIRINGS[fruit] || [];
  const result: HerbInfo[] = [];
  for (const id of herbIds) {
    const herb = getHerbById(id);
    if (herb) result.push(herb);
    if (result.length >= limit) break;
  }
  return result;
}

function getSugarAmount(answers: GuideAnswers): number {
  return SWEETNESS_GRAMS[answers.sweetness];
}

function getDurationDays(answers: GuideAnswers): number {
  const baseDuration = BASE_DURATION_DAYS[answers.baseType];

  if (answers.drinkTiming === 'within_month') {
    return 30;
  }
  if (answers.drinkTiming === 'after_season') {
    return baseDuration + 15;
  }
  return baseDuration;
}

function applyTasteProfileAdjustments(
  result: GuideResult,
  answers: GuideAnswers,
): GuideResult {
  if (!answers.applyTasteProfile || !answers.tasteTypeTitle) return result;

  const title = answers.tasteTypeTitle;
  const adjusted = { ...result };

  if (title === '여운을 음미하는 감성가') {
    adjusted.herbs = adjusted.herbs.map((h) => ({ ...h, amountG: h.amountG + 2 }));
  } else if (title === '풍미를 추구하는 미식가') {
    adjusted.fruitAmountG = adjusted.fruitAmountG + 20;
  } else if (title === '깊이를 탐구하는 감별사') {
    adjusted.durationDays = adjusted.durationDays + 15;
  } else if (title === '무게감을 아는 감식가') {
    if (adjusted.baseType === 'damgeumSoju25') adjusted.baseType = 'damgeumSoju30';
    else if (adjusted.baseType === 'damgeumSoju30') adjusted.baseType = 'vodka';
    adjusted.durationDays = BASE_DURATION_DAYS[adjusted.baseType];
  }

  return adjusted;
}

function buildRecipeName(fruitId: FruitId, herbIds: HerbId[]): string {
  const fruitName = getFruitById(fruitId)?.name || '';
  const herbNames = herbIds
    .map((id) => getHerbById(id)?.name)
    .filter((n): n is string => !!n);
  if (herbNames.length === 0) return `${fruitName}주`;
  return `${fruitName} × ${herbNames.join(' × ')}`;
}

function buildTagline(mood: MoodId, fruitId: FruitId): string {
  const moodInfo = getMoodById(mood);
  const fruitInfo = getFruitById(fruitId);
  return `${moodInfo?.label || ''}의 ${fruitInfo?.name || ''} 담금주`;
}

export function generateRecipe(answers: GuideAnswers): GuideResult {
  const fruit = getFruitById(answers.fruit);
  const sugarG = getSugarAmount(answers);
  const durationDays = getDurationDays(answers);

  const base: GuideResult = {
    name: buildRecipeName(answers.fruit, answers.herbs),
    tagline: buildTagline(answers.mood, answers.fruit),
    baseType: answers.baseType,
    baseAmountMl: BASE_VOLUME_ML,
    fruitId: answers.fruit,
    fruitAmountG: BASE_FRUIT_G,
    herbs: answers.herbs.map((id) => ({ id, amountG: BASE_HERB_G })),
    sugarG,
    durationDays,
    colorDescription: fruit?.colorDescription || '은은한 호박색',
    brandColor: fruit?.brandColor || '#D4A574',
    moodTag: answers.mood,
  };

  return applyTasteProfileAdjustments(base, answers);
}

export function adjustRecipe(
  base: GuideResult,
  adjustments: RecipeAdjustments,
): GuideResult {
  const newBaseType = STRENGTH_BASE_TYPES[adjustments.strength];
  return {
    ...base,
    sugarG: SWEETNESS_GRAMS[adjustments.sweetness],
    herbs: base.herbs.map((h) => ({ ...h, amountG: AROMA_GRAMS[adjustments.aroma] })),
    baseType: newBaseType,
    durationDays: BASE_DURATION_DAYS[newBaseType],
  };
}
