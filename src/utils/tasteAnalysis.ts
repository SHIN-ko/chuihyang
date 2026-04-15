import { Project, TastingNoteRatings, TasteType, TasteStats, RATING_DIMENSIONS } from '@/src/types';
import { getRecipeById } from '@/src/data/presetRecipes';

function getProjectsWithTastingNotes(projects: Project[]): Project[] {
  return projects.filter(
    (p) => p.status === 'completed' && p.tastingNote?.ratings,
  );
}

export function calculateAverageRatings(
  projects: Project[],
): { label: string; value: number }[] {
  const withNotes = getProjectsWithTastingNotes(projects);
  if (withNotes.length === 0) return [];

  const sums: Record<string, number> = {};
  for (const dim of RATING_DIMENSIONS) {
    sums[dim.key] = 0;
  }

  for (const p of withNotes) {
    const ratings = p.tastingNote!.ratings;
    for (const dim of RATING_DIMENSIONS) {
      sums[dim.key] += ratings[dim.key];
    }
  }

  return RATING_DIMENSIONS.map((dim) => ({
    label: dim.label,
    value: Math.round((sums[dim.key] / withNotes.length) * 10) / 10,
  }));
}

const TASTE_TYPE_RULES: { keys: [keyof TastingNoteRatings, keyof TastingNoteRatings]; type: TasteType }[] = [
  {
    keys: ['aroma', 'finish'],
    type: { title: '여운을 음미하는 감성가', description: '향과 뒷맛의 깊이를 중시하는 섬세한 취향' },
  },
  {
    keys: ['taste', 'body'],
    type: { title: '풍미를 추구하는 미식가', description: '강렬하고 묵직한 맛을 선호하는 대담한 취향' },
  },
  {
    keys: ['appearance', 'aroma'],
    type: { title: '오감으로 즐기는 탐험가', description: '보는 즐거움과 향의 조화를 추구하는 취향' },
  },
  {
    keys: ['taste', 'finish'],
    type: { title: '깊이를 탐구하는 감별사', description: '첫 맛부터 끝 맛까지 전체 여정을 중시하는 취향' },
  },
  {
    keys: ['body', 'finish'],
    type: { title: '무게감을 아는 감식가', description: '묵직한 질감과 긴 여운을 사랑하는 취향' },
  },
];

const DEFAULT_TASTE_TYPE: TasteType = {
  title: '자신만의 취향을 만드는 양조가',
  description: '균형 잡힌 시선으로 담금주를 즐기는 취향',
};

export function analyzeTasteType(projects: Project[]): TasteType | null {
  const avgRatings = calculateAverageRatings(projects);
  if (avgRatings.length === 0) return null;

  const dimensionScores = RATING_DIMENSIONS
    .filter((d) => d.key !== 'overall')
    .map((dim) => ({
      key: dim.key,
      value: avgRatings.find((r) => r.label === dim.label)?.value ?? 0,
    }))
    .sort((a, b) => b.value - a.value);

  const top2Keys = new Set([dimensionScores[0].key, dimensionScores[1].key]);

  for (const rule of TASTE_TYPE_RULES) {
    if (top2Keys.has(rule.keys[0]) && top2Keys.has(rule.keys[1])) {
      return rule.type;
    }
  }

  return DEFAULT_TASTE_TYPE;
}

export function calculateTasteStats(projects: Project[]): TasteStats {
  const withNotes = getProjectsWithTastingNotes(projects);

  if (withNotes.length === 0) {
    return {
      totalTastings: 0,
      averageOverall: 0,
      highestDimension: { label: '', average: 0 },
      lowestDimension: { label: '', average: 0 },
      favoriteRecipe: null,
    };
  }

  const avgRatings = calculateAverageRatings(projects);

  const nonOverall = avgRatings.filter((r) => r.label !== '전체');
  const sorted = [...nonOverall].sort((a, b) => b.value - a.value);

  const recipeCounts: Record<string, number> = {};
  for (const p of withNotes) {
    const recipeId = p.recipeId || 'custom';
    recipeCounts[recipeId] = (recipeCounts[recipeId] || 0) + 1;
  }

  let favoriteRecipe: TasteStats['favoriteRecipe'] = null;
  let maxCount = 0;
  for (const [recipeId, count] of Object.entries(recipeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      const recipe = getRecipeById(recipeId);
      favoriteRecipe = { name: recipe?.name || '커스텀 레시피', count };
    }
  }

  const overallAvg = avgRatings.find((r) => r.label === '전체')?.value ?? 0;

  return {
    totalTastings: withNotes.length,
    averageOverall: Math.round(overallAvg * 10) / 10,
    highestDimension: { label: sorted[0].label, average: sorted[0].value },
    lowestDimension: { label: sorted[sorted.length - 1].label, average: sorted[sorted.length - 1].value },
    favoriteRecipe,
  };
}
