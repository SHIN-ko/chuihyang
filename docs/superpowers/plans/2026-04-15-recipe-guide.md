# 나만의 담금주 가이드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 7단계 설문을 통해 사용자에게 담금주 레시피를 추천하고, 변형 슬라이더로 조정하여 프로젝트 시작 또는 "내 레시피"에 저장할 수 있는 기능

**Architecture:** 홈 탭에서 진입하는 가이드 플로우. 재료 데이터와 추천 로직은 순수 함수로 구현. 추천된 레시피는 별도 `custom_recipes` 테이블에 저장. 결과 화면에서 프로젝트 생성으로 바로 전환 가능.

**Tech Stack:** React Native, Expo Router, Zustand, Supabase, TypeScript

**Spec:** `docs/superpowers/specs/2026-04-15-recipe-guide-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|----------------|
| `src/types/customRecipe.ts` | CustomRecipe, GuideAnswers, GuideResult, MoodId, FruitId, HerbId 타입 |
| `src/data/recipeGuideData.ts` | 과일 13종, 허브 10종, 분위기 6종, 페어링 규칙, 타입별 숙성기간 |
| `src/utils/recipeGuide.ts` | 추천 로직 순수 함수 (generateRecipe, adjustRecipe, getFruitsForMood, getHerbsForFruit) |
| `src/services/customRecipeService.ts` | Supabase CRUD (custom_recipes 테이블) |
| `src/stores/customRecipeStore.ts` | Zustand store (내 레시피 상태 + pendingRecipe) |
| `src/screens/guide/GuideStartScreen.tsx` | 가이드 시작 화면 (토글 포함) |
| `src/screens/guide/GuideQuestionScreen.tsx` | 7단계 설문 화면 |
| `src/screens/guide/GuideResultScreen.tsx` | 결과 화면 + 3종 조정 |
| `src/screens/guide/MyRecipesScreen.tsx` | 내 레시피 라이브러리 |
| `app/guide/index.tsx` | 가이드 시작 라우트 |
| `app/guide/question.tsx` | 설문 라우트 |
| `app/guide/result.tsx` | 결과 라우트 |
| `app/profile/my-recipes.tsx` | 내 레시피 라우트 |
| `__tests__/recipeGuide.test.ts` | 추천 로직 단위 테스트 |

### Modified Files

| File | Change |
|------|--------|
| `src/types/index.ts` | CustomRecipe, MoodId 등 re-export |
| `src/lib/database.types.ts` | `custom_recipes` 테이블 타입 추가 |
| `app/(tabs)/index.tsx` | 홈 상단에 가이드 진입 카드 + 내 레시피 섹션 |
| `src/screens/project/CreateProjectScreen.tsx` | customRecipeStore의 pendingRecipe를 읽어 프리필 |

### DB Migration (사용자가 수동 실행)

```sql
CREATE TABLE custom_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  base_type TEXT NOT NULL,
  base_amount_ml INTEGER NOT NULL DEFAULT 500,
  fruit_id TEXT NOT NULL,
  fruit_amount_g INTEGER NOT NULL,
  herbs JSONB NOT NULL DEFAULT '[]'::jsonb,
  sugar_g INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  brand_color TEXT,
  mood_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE custom_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes" ON custom_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" ON custom_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON custom_recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON custom_recipes
  FOR DELETE USING (auth.uid() = user_id);
```

---

## Task 1: 타입 정의

**Files:**
- Create: `src/types/customRecipe.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: customRecipe.ts 파일 생성**

```typescript
// src/types/customRecipe.ts
import type { ProjectType } from './index';

export type MoodId =
  | 'quiet_night'
  | 'lively_friends'
  | 'romantic'
  | 'family'
  | 'picnic'
  | 'winter_warm';

export type PeopleCount = 'alone' | 'two' | 'small_group' | 'big_group';

export type SweetnessLevel = 'light' | 'normal' | 'strong';

export type DrinkTiming = 'within_month' | 'two_three_months' | 'after_season';

export type FruitId =
  | 'maesil'
  | 'bokbunja'
  | 'blueberry'
  | 'grapefruit'
  | 'lemon'
  | 'yuja'
  | 'moga'
  | 'apple'
  | 'greengrape'
  | 'raspberry'
  | 'fig'
  | 'halabong'
  | 'omija';

export type HerbId =
  | 'rosemary'
  | 'lavender'
  | 'mint'
  | 'basil'
  | 'thyme'
  | 'cinnamon'
  | 'clove'
  | 'ginger'
  | 'cardamom'
  | 'chrysanthemum';

export interface GuideAnswers {
  mood: MoodId;
  people: PeopleCount;
  fruit: FruitId;
  herbs: HerbId[];
  baseType: ProjectType;
  sweetness: SweetnessLevel;
  drinkTiming: DrinkTiming;
  applyTasteProfile: boolean;
  tasteTypeTitle?: string;
}

export interface GuideResultHerb {
  id: HerbId;
  amountG: number;
}

export interface GuideResult {
  name: string;
  tagline: string;
  baseType: ProjectType;
  baseAmountMl: number;
  fruitId: FruitId;
  fruitAmountG: number;
  herbs: GuideResultHerb[];
  sugarG: number;
  durationDays: number;
  colorDescription: string;
  brandColor: string;
  moodTag: MoodId;
}

export interface CustomRecipe {
  id: string;
  userId: string;
  name: string;
  baseType: ProjectType;
  baseAmountMl: number;
  fruitId: FruitId;
  fruitAmountG: number;
  herbs: GuideResultHerb[];
  sugarG: number;
  durationDays: number;
  brandColor: string;
  moodTag: MoodId | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeAdjustments {
  sweetness: 'light' | 'normal' | 'strong';
  aroma: 'subtle' | 'normal' | 'intense';
  strength: 'soft' | 'normal' | 'strong';
}
```

- [ ] **Step 2: index.ts에 re-export 추가**

In `src/types/index.ts`, at the bottom of the file add:

```typescript
// 담금주 가이드 타입
export type {
  MoodId,
  PeopleCount,
  SweetnessLevel,
  DrinkTiming,
  FruitId,
  HerbId,
  GuideAnswers,
  GuideResultHerb,
  GuideResult,
  CustomRecipe,
  RecipeAdjustments,
} from './customRecipe';
```

- [ ] **Step 3: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 4: Commit**

```bash
git add src/types/customRecipe.ts src/types/index.ts
git commit -m "feat: 담금주 가이드 기능용 타입 정의"
```

---

## Task 2: 재료 풀과 페어링 데이터

**Files:**
- Create: `src/data/recipeGuideData.ts`

- [ ] **Step 1: recipeGuideData.ts 파일 생성**

```typescript
// src/data/recipeGuideData.ts
import { FruitId, HerbId, MoodId, ProjectType } from '@/src/types';

export interface FruitInfo {
  id: FruitId;
  name: string;
  description: string;
  brandColor: string;
  colorDescription: string;
  moods: MoodId[];
}

export interface HerbInfo {
  id: HerbId;
  name: string;
  description: string;
}

export interface MoodInfo {
  id: MoodId;
  label: string;
  emoji: string;
  preferredFruits: FruitId[];
  preferredHerbs: HerbId[];
  recommendedBase: ProjectType;
}

export const FRUITS: FruitInfo[] = [
  {
    id: 'maesil',
    name: '매실',
    description: '새콤상큼한 한국의 맛',
    brandColor: '#7BA428',
    colorDescription: '연한 연두색',
    moods: ['family'],
  },
  {
    id: 'bokbunja',
    name: '복분자',
    description: '깊은 단맛의 루비빛',
    brandColor: '#B22046',
    colorDescription: '진한 루비색',
    moods: ['romantic'],
  },
  {
    id: 'blueberry',
    name: '블루베리',
    description: '은은한 보랏빛 부드러움',
    brandColor: '#4A4AAB',
    colorDescription: '깊은 보랏빛',
    moods: ['quiet_night'],
  },
  {
    id: 'grapefruit',
    name: '자몽',
    description: '쌉싸름 상큼',
    brandColor: '#E8654F',
    colorDescription: '분홍빛 감도는 주황색',
    moods: ['lively_friends', 'picnic'],
  },
  {
    id: 'lemon',
    name: '레몬',
    description: '깔끔한 산미',
    brandColor: '#E8C647',
    colorDescription: '밝은 레몬색',
    moods: ['picnic'],
  },
  {
    id: 'yuja',
    name: '유자',
    description: '향긋한 한국의 시트러스',
    brandColor: '#E8A347',
    colorDescription: '은은한 황금색',
    moods: ['winter_warm', 'family'],
  },
  {
    id: 'moga',
    name: '모과',
    description: '깊은 향의 황금빛',
    brandColor: '#C98B3A',
    colorDescription: '진한 황금색',
    moods: ['winter_warm', 'quiet_night'],
  },
  {
    id: 'apple',
    name: '사과',
    description: '부드럽고 달콤',
    brandColor: '#D44F3A',
    colorDescription: '은은한 호박색',
    moods: ['family', 'romantic'],
  },
  {
    id: 'greengrape',
    name: '청포도',
    description: '깔끔한 단맛',
    brandColor: '#8FB339',
    colorDescription: '연한 연둣빛',
    moods: ['quiet_night', 'romantic'],
  },
  {
    id: 'raspberry',
    name: '산딸기',
    description: '발랄한 붉은빛',
    brandColor: '#D93A5E',
    colorDescription: '선명한 붉은색',
    moods: ['lively_friends', 'picnic'],
  },
  {
    id: 'fig',
    name: '무화과',
    description: '묵직한 단맛',
    brandColor: '#6B3D4B',
    colorDescription: '깊은 자주색',
    moods: ['romantic'],
  },
  {
    id: 'halabong',
    name: '한라봉',
    description: '풍부한 향과 단맛',
    brandColor: '#F0993C',
    colorDescription: '진한 주황색',
    moods: ['lively_friends', 'picnic'],
  },
  {
    id: 'omija',
    name: '오미자',
    description: '다섯 가지 맛이 어우러진 한국 베리',
    brandColor: '#A63A50',
    colorDescription: '맑은 선홍색',
    moods: ['quiet_night', 'family'],
  },
];

export const HERBS: HerbInfo[] = [
  { id: 'rosemary', name: '로즈마리', description: '깊고 우디한 향' },
  { id: 'lavender', name: '라벤더', description: '부드럽고 플로럴' },
  { id: 'mint', name: '민트', description: '청량하고 시원함' },
  { id: 'basil', name: '바질', description: '산뜻한 허브' },
  { id: 'thyme', name: '타임', description: '은은한 약초향' },
  { id: 'cinnamon', name: '시나몬', description: '따뜻한 매콤함' },
  { id: 'clove', name: '정향', description: '강하고 깊은 향' },
  { id: 'ginger', name: '생강', description: '알싸한 따뜻함' },
  { id: 'cardamom', name: '카다멈', description: '이국적이고 은은' },
  { id: 'chrysanthemum', name: '국화', description: '부드러운 플로럴, 한국적' },
];

export const MOODS: MoodInfo[] = [
  {
    id: 'quiet_night',
    label: '조용한 밤',
    emoji: '🌙',
    preferredFruits: ['blueberry', 'greengrape', 'moga', 'omija'],
    preferredHerbs: ['lavender', 'chrysanthemum'],
    recommendedBase: 'damgeumSoju30',
  },
  {
    id: 'lively_friends',
    label: '시끌벅적',
    emoji: '🎉',
    preferredFruits: ['raspberry', 'halabong', 'grapefruit'],
    preferredHerbs: ['mint', 'basil'],
    recommendedBase: 'damgeumSoju25',
  },
  {
    id: 'romantic',
    label: '연인과 둘이',
    emoji: '💕',
    preferredFruits: ['bokbunja', 'fig', 'apple', 'greengrape'],
    preferredHerbs: ['rosemary', 'lavender'],
    recommendedBase: 'damgeumSoju30',
  },
  {
    id: 'family',
    label: '가족 모임',
    emoji: '🏡',
    preferredFruits: ['maesil', 'yuja', 'omija', 'apple'],
    preferredHerbs: ['cinnamon', 'ginger', 'chrysanthemum'],
    recommendedBase: 'damgeumSoju25',
  },
  {
    id: 'picnic',
    label: '피크닉',
    emoji: '🧺',
    preferredFruits: ['lemon', 'grapefruit', 'halabong', 'raspberry'],
    preferredHerbs: ['mint', 'basil'],
    recommendedBase: 'damgeumSoju25',
  },
  {
    id: 'winter_warm',
    label: '추운 겨울',
    emoji: '❄️',
    preferredFruits: ['yuja', 'moga', 'apple'],
    preferredHerbs: ['cinnamon', 'ginger', 'clove'],
    recommendedBase: 'vodka',
  },
];

/**
 * 과일별 어울리는 허브 (우선순위 순)
 */
export const FRUIT_HERB_PAIRINGS: Record<FruitId, HerbId[]> = {
  maesil: ['rosemary', 'cinnamon', 'ginger'],
  bokbunja: ['rosemary', 'thyme', 'cinnamon'],
  blueberry: ['lavender', 'rosemary', 'basil'],
  grapefruit: ['mint', 'basil', 'lavender'],
  lemon: ['mint', 'basil', 'thyme'],
  yuja: ['ginger', 'cinnamon', 'clove'],
  moga: ['cinnamon', 'clove', 'cardamom'],
  apple: ['cinnamon', 'cardamom', 'thyme'],
  greengrape: ['mint', 'basil', 'lavender'],
  raspberry: ['mint', 'basil', 'lavender'],
  fig: ['rosemary', 'cinnamon', 'thyme'],
  halabong: ['mint', 'ginger', 'lavender'],
  omija: ['ginger', 'chrysanthemum', 'cinnamon'],
};

/**
 * 베이스 타입별 기본 숙성 기간 (일)
 */
export const BASE_DURATION_DAYS: Record<ProjectType, number> = {
  damgeumSoju25: 30,
  damgeumSoju30: 45,
  vodka: 60,
};

export const BASE_TYPE_LABELS: Record<ProjectType, string> = {
  damgeumSoju25: '담금소주 25도',
  damgeumSoju30: '담금소주 30도',
  vodka: '보드카',
};

export const PEOPLE_LABELS: Record<string, string> = {
  alone: '혼자',
  two: '둘이서',
  small_group: '소수 모임',
  big_group: '큰 모임',
};

export const SWEETNESS_LABELS: Record<string, string> = {
  light: '가볍게',
  normal: '보통',
  strong: '달달하게',
};

export const DRINK_TIMING_LABELS: Record<string, string> = {
  within_month: '한 달 안에',
  two_three_months: '두세 달 후',
  after_season: '계절이 바뀐 후',
};

export function getFruitById(id: FruitId): FruitInfo | undefined {
  return FRUITS.find((f) => f.id === id);
}

export function getHerbById(id: HerbId): HerbInfo | undefined {
  return HERBS.find((h) => h.id === id);
}

export function getMoodById(id: MoodId): MoodInfo | undefined {
  return MOODS.find((m) => m.id === id);
}
```

- [ ] **Step 2: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 3: Commit**

```bash
git add src/data/recipeGuideData.ts
git commit -m "feat: 담금주 가이드 재료 풀 및 페어링 데이터 정의"
```

---

## Task 3: 추천 로직 구현 (TDD)

**Files:**
- Create: `src/utils/recipeGuide.ts`
- Create: `__tests__/recipeGuide.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

```typescript
// __tests__/recipeGuide.test.ts
import {
  generateRecipe,
  adjustRecipe,
  getFruitsForMood,
  getHerbsForFruit,
} from '@/src/utils/recipeGuide';
import { GuideAnswers } from '@/src/types';

const baseAnswers: GuideAnswers = {
  mood: 'quiet_night',
  people: 'alone',
  fruit: 'maesil',
  herbs: ['rosemary'],
  baseType: 'damgeumSoju30',
  sweetness: 'normal',
  drinkTiming: 'two_three_months',
  applyTasteProfile: false,
};

describe('getFruitsForMood', () => {
  it('returns fruits matching the mood', () => {
    const result = getFruitsForMood('quiet_night', 6);
    const ids = result.map((f) => f.id);
    expect(ids).toContain('blueberry');
    expect(ids).toContain('greengrape');
  });

  it('limits the number of results', () => {
    const result = getFruitsForMood('quiet_night', 3);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('fills with other fruits when preferred list is short', () => {
    const result = getFruitsForMood('winter_warm', 8);
    expect(result.length).toBeGreaterThanOrEqual(6);
  });
});

describe('getHerbsForFruit', () => {
  it('returns pairing herbs in priority order for maesil', () => {
    const result = getHerbsForFruit('maesil', 3);
    const ids = result.map((h) => h.id);
    expect(ids[0]).toBe('rosemary');
    expect(ids[1]).toBe('cinnamon');
    expect(ids[2]).toBe('ginger');
  });

  it('limits the number of results', () => {
    const result = getHerbsForFruit('maesil', 2);
    expect(result.length).toBe(2);
  });
});

describe('generateRecipe', () => {
  it('generates base recipe with default quantities', () => {
    const result = generateRecipe(baseAnswers);
    expect(result.baseAmountMl).toBe(500);
    expect(result.fruitAmountG).toBe(160);
    expect(result.sugarG).toBe(25);
    expect(result.herbs).toHaveLength(1);
    expect(result.herbs[0].id).toBe('rosemary');
    expect(result.herbs[0].amountG).toBe(3);
  });

  it('adjusts sugar for light sweetness', () => {
    const result = generateRecipe({ ...baseAnswers, sweetness: 'light' });
    expect(result.sugarG).toBe(15);
  });

  it('adjusts sugar for strong sweetness', () => {
    const result = generateRecipe({ ...baseAnswers, sweetness: 'strong' });
    expect(result.sugarG).toBe(40);
  });

  it('sets duration based on base type', () => {
    const result = generateRecipe({ ...baseAnswers, baseType: 'damgeumSoju25' });
    expect(result.durationDays).toBe(30);
  });

  it('reduces duration for within_month timing', () => {
    const result = generateRecipe({
      ...baseAnswers,
      baseType: 'damgeumSoju30',
      drinkTiming: 'within_month',
    });
    expect(result.durationDays).toBe(30);
  });

  it('extends duration for after_season timing', () => {
    const result = generateRecipe({
      ...baseAnswers,
      baseType: 'damgeumSoju30',
      drinkTiming: 'after_season',
    });
    expect(result.durationDays).toBe(60);
  });

  it('applies taste profile boost for aroma lover', () => {
    const result = generateRecipe({
      ...baseAnswers,
      applyTasteProfile: true,
      tasteTypeTitle: '여운을 음미하는 감성가',
    });
    expect(result.herbs[0].amountG).toBe(5);
  });

  it('applies taste profile boost for flavor seeker', () => {
    const result = generateRecipe({
      ...baseAnswers,
      applyTasteProfile: true,
      tasteTypeTitle: '풍미를 추구하는 미식가',
    });
    expect(result.fruitAmountG).toBe(180);
  });

  it('generates a recipe name', () => {
    const result = generateRecipe(baseAnswers);
    expect(result.name).toContain('매실');
    expect(result.name).toContain('로즈마리');
  });

  it('sets brand color from fruit', () => {
    const result = generateRecipe(baseAnswers);
    expect(result.brandColor).toBe('#7BA428');
  });

  it('preserves mood tag', () => {
    const result = generateRecipe(baseAnswers);
    expect(result.moodTag).toBe('quiet_night');
  });
});

describe('adjustRecipe', () => {
  it('adjusts sugar amount with sweetness slider', () => {
    const base = generateRecipe(baseAnswers);
    const light = adjustRecipe(base, { sweetness: 'light', aroma: 'normal', strength: 'normal' });
    expect(light.sugarG).toBe(15);

    const strong = adjustRecipe(base, { sweetness: 'strong', aroma: 'normal', strength: 'normal' });
    expect(strong.sugarG).toBe(40);
  });

  it('adjusts herb amount with aroma slider', () => {
    const base = generateRecipe(baseAnswers);
    const subtle = adjustRecipe(base, { sweetness: 'normal', aroma: 'subtle', strength: 'normal' });
    expect(subtle.herbs[0].amountG).toBe(2);

    const intense = adjustRecipe(base, { sweetness: 'normal', aroma: 'intense', strength: 'normal' });
    expect(intense.herbs[0].amountG).toBe(10);
  });

  it('adjusts base type and duration with strength slider', () => {
    const base = generateRecipe(baseAnswers);
    const soft = adjustRecipe(base, { sweetness: 'normal', aroma: 'normal', strength: 'soft' });
    expect(soft.baseType).toBe('damgeumSoju25');
    expect(soft.durationDays).toBe(30);

    const strong = adjustRecipe(base, { sweetness: 'normal', aroma: 'normal', strength: 'strong' });
    expect(strong.baseType).toBe('vodka');
    expect(strong.durationDays).toBe(60);
  });
});
```

- [ ] **Step 2: 테스트 실행하여 실패 확인**

Run: `TZ=UTC npx jest __tests__/recipeGuide.test.ts --no-coverage`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: recipeGuide.ts 구현**

```typescript
// src/utils/recipeGuide.ts
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
  HERBS,
  MOODS,
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
const BASE_SUGAR_G = 25;
const BASE_VOLUME_ML = 500;

const SWEETNESS_GRAMS = {
  light: 15,
  normal: 25,
  strong: 40,
};

const AROMA_GRAMS = {
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
```

- [ ] **Step 4: 테스트 실행**

Run: `TZ=UTC npx jest __tests__/recipeGuide.test.ts --no-coverage`
Expected: PASS (모든 테스트 통과)

- [ ] **Step 5: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 6: Commit**

```bash
git add src/utils/recipeGuide.ts __tests__/recipeGuide.test.ts
git commit -m "feat: 담금주 가이드 추천 로직 구현 및 테스트"
```

---

## Task 4: DB 타입 및 서비스 레이어

**Files:**
- Modify: `src/lib/database.types.ts`
- Create: `src/services/customRecipeService.ts`

- [ ] **Step 1: database.types.ts에 custom_recipes 테이블 타입 추가**

`src/lib/database.types.ts`의 `ingredients` 블록 뒤에 `custom_recipes` 블록을 추가합니다. 기존 `ingredients` 테이블 정의 끝 (Relationships 배열 끝) 뒤, `Views` 블록 전에 추가:

```typescript
      custom_recipes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          base_type: string;
          base_amount_ml: number;
          fruit_id: string;
          fruit_amount_g: number;
          herbs: Json;
          sugar_g: number;
          duration_days: number;
          brand_color: string | null;
          mood_tag: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          base_type: string;
          base_amount_ml?: number;
          fruit_id: string;
          fruit_amount_g: number;
          herbs: Json;
          sugar_g: number;
          duration_days: number;
          brand_color?: string | null;
          mood_tag?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          base_type?: string;
          base_amount_ml?: number;
          fruit_id?: string;
          fruit_amount_g?: number;
          herbs?: Json;
          sugar_g?: number;
          duration_days?: number;
          brand_color?: string | null;
          mood_tag?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'custom_recipes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
```

- [ ] **Step 2: customRecipeService.ts 파일 생성**

```typescript
// src/services/customRecipeService.ts
import { supabase } from '@/src/lib/supabase';
import { CustomRecipe, GuideResult, FruitId, HerbId, ProjectType, GuideResultHerb } from '@/src/types';
import { Database, Json } from '@/src/lib/database.types';

type CustomRecipeRow = Database['public']['Tables']['custom_recipes']['Row'];

export class CustomRecipeService {
  static async getMyRecipes(userId: string): Promise<CustomRecipe[]> {
    try {
      const { data, error } = await supabase
        .from('custom_recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(CustomRecipeService.transformRow);
    } catch (error) {
      console.error('내 레시피 조회 오류:', error);
      throw error;
    }
  }

  static async saveRecipe(userId: string, result: GuideResult): Promise<CustomRecipe> {
    try {
      const { data, error } = await supabase
        .from('custom_recipes')
        .insert({
          user_id: userId,
          name: result.name,
          base_type: result.baseType,
          base_amount_ml: result.baseAmountMl,
          fruit_id: result.fruitId,
          fruit_amount_g: result.fruitAmountG,
          herbs: result.herbs as unknown as Json,
          sugar_g: result.sugarG,
          duration_days: result.durationDays,
          brand_color: result.brandColor,
          mood_tag: result.moodTag,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('레시피 저장 실패');

      return CustomRecipeService.transformRow(data);
    } catch (error) {
      console.error('레시피 저장 오류:', error);
      throw error;
    }
  }

  static async deleteRecipe(recipeId: string): Promise<void> {
    try {
      const { error } = await supabase.from('custom_recipes').delete().eq('id', recipeId);
      if (error) throw error;
    } catch (error) {
      console.error('레시피 삭제 오류:', error);
      throw error;
    }
  }

  private static transformRow(row: CustomRecipeRow): CustomRecipe {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      baseType: row.base_type as ProjectType,
      baseAmountMl: row.base_amount_ml,
      fruitId: row.fruit_id as FruitId,
      fruitAmountG: row.fruit_amount_g,
      herbs: (row.herbs as unknown as GuideResultHerb[]) || [],
      sugarG: row.sugar_g,
      durationDays: row.duration_days,
      brandColor: row.brand_color || '#D4A574',
      moodTag: (row.mood_tag as CustomRecipe['moodTag']) || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
```

Note: HerbId is not used directly in transformRow - it's part of GuideResultHerb. If TS complains about unused import, remove HerbId from import.

- [ ] **Step 3: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 4: Commit**

```bash
git add src/lib/database.types.ts src/services/customRecipeService.ts
git commit -m "feat: custom_recipes 테이블 타입 및 서비스 레이어 추가"
```

---

## Task 5: Zustand Store

**Files:**
- Create: `src/stores/customRecipeStore.ts`

- [ ] **Step 1: customRecipeStore.ts 생성**

```typescript
// src/stores/customRecipeStore.ts
import { create } from 'zustand';
import { CustomRecipe, GuideResult } from '@/src/types';
import { CustomRecipeService } from '@/src/services/customRecipeService';
import { useAuthStore } from './authStore';

interface CustomRecipeState {
  recipes: CustomRecipe[];
  isLoading: boolean;
  pendingRecipe: GuideResult | null;

  fetchRecipes: () => Promise<void>;
  saveRecipe: (result: GuideResult) => Promise<boolean>;
  deleteRecipe: (recipeId: string) => Promise<boolean>;
  setPendingRecipe: (result: GuideResult | null) => void;
  consumePendingRecipe: () => GuideResult | null;
}

export const useCustomRecipeStore = create<CustomRecipeState>((set, get) => ({
  recipes: [],
  isLoading: false,
  pendingRecipe: null,

  fetchRecipes: async () => {
    try {
      set({ isLoading: true });
      const authState = useAuthStore.getState();
      if (!authState.user) {
        set({ recipes: [], isLoading: false });
        return;
      }
      const recipes = await CustomRecipeService.getMyRecipes(authState.user.id);
      set({ recipes, isLoading: false });
    } catch (error) {
      console.error('내 레시피 조회 실패:', error);
      set({ recipes: [], isLoading: false });
    }
  },

  saveRecipe: async (result: GuideResult) => {
    try {
      set({ isLoading: true });
      const authState = useAuthStore.getState();
      if (!authState.user) {
        set({ isLoading: false });
        return false;
      }
      const saved = await CustomRecipeService.saveRecipe(authState.user.id, result);
      set((state) => ({
        recipes: [saved, ...state.recipes],
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('레시피 저장 실패:', error);
      set({ isLoading: false });
      return false;
    }
  },

  deleteRecipe: async (recipeId: string) => {
    try {
      set({ isLoading: true });
      await CustomRecipeService.deleteRecipe(recipeId);
      set((state) => ({
        recipes: state.recipes.filter((r) => r.id !== recipeId),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('레시피 삭제 실패:', error);
      set({ isLoading: false });
      return false;
    }
  },

  setPendingRecipe: (result) => set({ pendingRecipe: result }),

  consumePendingRecipe: () => {
    const pending = get().pendingRecipe;
    set({ pendingRecipe: null });
    return pending;
  },
}));
```

- [ ] **Step 2: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 3: Commit**

```bash
git add src/stores/customRecipeStore.ts
git commit -m "feat: customRecipeStore 추가 (내 레시피 상태 관리)"
```

---

## Task 6: 가이드 시작 화면

**Files:**
- Create: `app/guide/index.tsx`
- Create: `src/screens/guide/GuideStartScreen.tsx`

- [ ] **Step 1: 라우트 엔트리 생성**

디렉토리 `app/guide/` 생성 후:

```typescript
// app/guide/index.tsx
import GuideStartScreen from '@/src/screens/guide/GuideStartScreen';

export default GuideStartScreen;
```

- [ ] **Step 2: GuideStartScreen 구현**

디렉토리 `src/screens/guide/` 생성 후:

```typescript
// src/screens/guide/GuideStartScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProjectStore } from '@/src/stores/projectStore';
import { analyzeTasteType } from '@/src/utils/tasteAnalysis';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

const GuideStartScreen: React.FC = () => {
  const router = useRouter();
  const { colors, brandColors } = useThemeValues();
  const { projects } = useProjectStore();

  const tastingCount = useMemo(
    () => projects.filter((p) => p.tastingNote?.ratings).length,
    [projects],
  );
  const tasteType = useMemo(() => analyzeTasteType(projects), [projects]);
  const canApplyProfile = tastingCount >= 2;

  const [applyProfile, setApplyProfile] = useState(canApplyProfile);

  const handleStart = () => {
    const params: Record<string, string> = {
      step: '1',
      applyProfile: String(applyProfile && canApplyProfile),
    };
    if (applyProfile && canApplyProfile && tasteType) {
      params.tasteTypeTitle = tasteType.title;
    }
    router.push({ pathname: '/guide/question', params });
  };

  const styles = useThemedStyles(({ colors, brandColors, shadows }) =>
    StyleSheet.create({
      container: { flex: 1, backgroundColor: colors.background.primary },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
      },
      backButton: { padding: 4 },
      scroll: { flex: 1 },
      content: { paddingHorizontal: 24, paddingBottom: 40 },
      hero: { alignItems: 'center', paddingVertical: 40 },
      emoji: { fontSize: 64, marginBottom: 16 },
      title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: 12,
      },
      description: {
        fontSize: 15,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 16,
      },
      card: {
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        ...shadows.glass.light,
      },
      toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      toggleTextContainer: { flex: 1, marginRight: 12 },
      toggleTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 4,
      },
      toggleDescription: {
        fontSize: 13,
        color: colors.text.secondary,
        lineHeight: 18,
      },
      tasteTypeName: {
        fontSize: 13,
        fontWeight: '600',
        color: brandColors.accent.primary,
        marginTop: 4,
      },
      disabledNotice: {
        fontSize: 12,
        color: colors.text.muted,
        marginTop: 4,
      },
      startButton: {
        backgroundColor: brandColors.accent.primary,
        borderRadius: 24,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 24,
      },
      startButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
      },
    }),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.title}>나만의 담금주 가이드</Text>
            <Text style={styles.description}>
              7가지 질문으로 당신의 취향에 맞는{'\n'}시그니처 담금주를 찾아드려요.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>시음 데이터 반영</Text>
                <Text style={styles.toggleDescription}>
                  {canApplyProfile
                    ? '지난 시음 기록을 바탕으로 당신 취향에 맞춰 추천해요'
                    : '시음 노트 2개 이상 작성하면 이 옵션을 사용할 수 있어요'}
                </Text>
                {canApplyProfile && tasteType && applyProfile && (
                  <Text style={styles.tasteTypeName}>{tasteType.title}</Text>
                )}
                {!canApplyProfile && (
                  <Text style={styles.disabledNotice}>현재 시음 노트: {tastingCount}개</Text>
                )}
              </View>
              <Switch
                value={applyProfile && canApplyProfile}
                onValueChange={setApplyProfile}
                disabled={!canApplyProfile}
                trackColor={{ false: colors.border.secondary, true: brandColors.accent.primary }}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>시작하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GuideStartScreen;
```

- [ ] **Step 3: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 4: Commit**

```bash
git add app/guide/index.tsx src/screens/guide/GuideStartScreen.tsx
git commit -m "feat: 가이드 시작 화면 구현"
```

---

## Task 7: 가이드 설문 화면 (7단계)

**Files:**
- Create: `app/guide/question.tsx`
- Create: `src/screens/guide/GuideQuestionScreen.tsx`

- [ ] **Step 1: 라우트 엔트리 생성**

```typescript
// app/guide/question.tsx
import GuideQuestionScreen from '@/src/screens/guide/GuideQuestionScreen';

export default GuideQuestionScreen;
```

- [ ] **Step 2: GuideQuestionScreen 구현**

```typescript
// src/screens/guide/GuideQuestionScreen.tsx
import React, { useState, useMemo } from 'react';
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
  FRUITS,
  HERBS,
  FRUIT_HERB_PAIRINGS,
  PEOPLE_LABELS,
  SWEETNESS_LABELS,
  DRINK_TIMING_LABELS,
  BASE_TYPE_LABELS,
  getMoodById,
  getFruitById,
  getHerbById,
} from '@/src/data/recipeGuideData';
import { getFruitsForMood, getHerbsForFruit } from '@/src/utils/recipeGuide';
import { useCustomRecipeStore } from '@/src/stores/customRecipeStore';
import { generateRecipe } from '@/src/utils/recipeGuide';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

const TOTAL_STEPS = 7;

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
      case 4: return true; // 허브는 건너뛸 수 있음
      case 5: return !!baseType;
      case 6: return !!sweetness;
      case 7: return !!drinkTiming;
      default: return false;
    }
  })();

  // 추천 베이스가 세팅되면 자동으로 baseType 미리 선택
  React.useEffect(() => {
    if (currentStep === 5 && recommendedBase && !baseType) {
      setBaseType(recommendedBase);
    }
  }, [currentStep, recommendedBase, baseType]);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // 완료 — 레시피 생성 후 결과 화면으로
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
      router.replace('/guide/result');
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
        backgroundColor: brandColors.accent.light,
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
      recommendedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
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
        backgroundColor: brandColors.accent.light,
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
            <Text style={styles.subQuestion}>{getMoodById(mood!)?.label}에 잘 어울리는 과일들이에요.</Text>
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
              {recommendedBase ? `${BASE_TYPE_LABELS[recommendedBase]}를 추천해요. 변경 가능합니다.` : '원하는 베이스를 선택해주세요.'}
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
                      <View style={{
                        marginLeft: 8,
                        backgroundColor: brandColors.accent.primary,
                        borderRadius: 10,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF' }}>추천</Text>
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
```

Note: `brandColors.accent.light` is referenced — check if it exists in theme. If not, substitute with a lighter amber color like `'#FFF5ED'` (accent bg).

- [ ] **Step 3: brandColors.accent.light 존재 확인 및 대체**

Run this check:
```bash
grep -rn "accent" /Users/shs/IdeaProjects/chuihyang/src/hooks/useThemedStyles.ts /Users/shs/IdeaProjects/chuihyang/constants/Colors.ts 2>/dev/null
```

If `accent.light` is NOT defined anywhere, in `GuideQuestionScreen.tsx` replace all `brandColors.accent.light` with `brandColors.accent.bg || '#FFF5ED'`. 

If `accent.bg` exists, use that. If neither, hardcode `'#FFF5ED'`:

Replace in style definitions:
```typescript
optionInnerSelected: {
  borderColor: brandColors.accent.primary,
  backgroundColor: '#FFF5ED',  // replace brandColors.accent.light
},
rowOptionSelected: {
  borderColor: brandColors.accent.primary,
  backgroundColor: '#FFF5ED',  // replace brandColors.accent.light
},
```

- [ ] **Step 4: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 5: Commit**

```bash
git add app/guide/question.tsx src/screens/guide/GuideQuestionScreen.tsx
git commit -m "feat: 가이드 7단계 설문 화면 구현"
```

---

## Task 8: 가이드 결과 화면

**Files:**
- Create: `app/guide/result.tsx`
- Create: `src/screens/guide/GuideResultScreen.tsx`

- [ ] **Step 1: 라우트 엔트리 생성**

```typescript
// app/guide/result.tsx
import GuideResultScreen from '@/src/screens/guide/GuideResultScreen';

export default GuideResultScreen;
```

- [ ] **Step 2: GuideResultScreen 구현**

```typescript
// src/screens/guide/GuideResultScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GuideResult, RecipeAdjustments, SweetnessLevel } from '@/src/types';
import { useCustomRecipeStore } from '@/src/stores/customRecipeStore';
import { adjustRecipe } from '@/src/utils/recipeGuide';
import { getFruitById, getHerbById, BASE_TYPE_LABELS } from '@/src/data/recipeGuideData';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

const GuideResultScreen: React.FC = () => {
  const router = useRouter();
  const { colors, brandColors } = useThemeValues();
  const { pendingRecipe, saveRecipe, setPendingRecipe, isLoading } = useCustomRecipeStore();

  const [baseRecipe, setBaseRecipe] = useState<GuideResult | null>(pendingRecipe);
  const [adjustments, setAdjustments] = useState<RecipeAdjustments>({
    sweetness: 'normal',
    aroma: 'normal',
    strength: 'normal',
  });

  useEffect(() => {
    // 최초 진입 시 pendingRecipe의 sweetness/strength를 adjustments 초기값으로
    if (pendingRecipe) {
      const sweetnessLevel: RecipeAdjustments['sweetness'] =
        pendingRecipe.sugarG <= 20 ? 'light' : pendingRecipe.sugarG >= 35 ? 'strong' : 'normal';
      const strengthLevel: RecipeAdjustments['strength'] =
        pendingRecipe.baseType === 'damgeumSoju25'
          ? 'soft'
          : pendingRecipe.baseType === 'vodka'
          ? 'strong'
          : 'normal';
      setAdjustments({ sweetness: sweetnessLevel, aroma: 'normal', strength: strengthLevel });
      setBaseRecipe(pendingRecipe);
    }
  }, [pendingRecipe]);

  const currentRecipe = useMemo(
    () => (baseRecipe ? adjustRecipe(baseRecipe, adjustments) : null),
    [baseRecipe, adjustments],
  );

  const handleStartProject = () => {
    if (!currentRecipe) return;
    setPendingRecipe(currentRecipe);
    router.replace('/project/create');
  };

  const handleSave = async () => {
    if (!currentRecipe) return;
    const success = await saveRecipe(currentRecipe);
    if (success) {
      Alert.alert('저장 완료', '내 레시피에 저장되었습니다.', [
        { text: '확인', onPress: () => router.replace('/(tabs)') },
      ]);
    } else {
      Alert.alert('오류', '레시피 저장에 실패했습니다.');
    }
  };

  const styles = useThemedStyles(({ colors, brandColors, shadows }) =>
    StyleSheet.create({
      container: { flex: 1, backgroundColor: colors.background.primary },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
      },
      backButton: { padding: 4, marginRight: 12 },
      headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
      scroll: { flex: 1 },
      content: { paddingHorizontal: 24, paddingBottom: 140 },
      heroCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        alignItems: 'center',
        ...shadows.glass.medium,
      },
      recipeName: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: 8,
      },
      tagline: {
        fontSize: 14,
        color: colors.text.secondary,
        textAlign: 'center',
        fontStyle: 'italic',
      },
      sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text.muted,
        marginBottom: 8,
        marginTop: 4,
      },
      ingredientCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        ...shadows.glass.light,
      },
      ingredientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.secondary,
      },
      ingredientRowLast: { borderBottomWidth: 0 },
      ingredientLabel: { fontSize: 14, color: colors.text.secondary },
      ingredientValue: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
      baseNote: {
        fontSize: 12,
        color: colors.text.muted,
        textAlign: 'center',
        marginTop: 8,
      },
      adjustCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        ...shadows.glass.light,
      },
      adjustTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 16,
      },
      adjustRow: { marginBottom: 16 },
      adjustLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.text.secondary,
        marginBottom: 8,
      },
      levelButtonRow: {
        flexDirection: 'row',
        backgroundColor: colors.border.secondary,
        borderRadius: 12,
        padding: 3,
      },
      levelButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 9,
      },
      levelButtonActive: {
        backgroundColor: brandColors.accent.primary,
      },
      levelButtonText: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.text.secondary,
      },
      levelButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
      },
      footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 24,
        backgroundColor: colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: colors.border.secondary,
      },
      primaryButton: {
        backgroundColor: brandColors.accent.primary,
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 10,
      },
      secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: brandColors.accent.primary,
        borderRadius: 24,
        paddingVertical: 14,
        alignItems: 'center',
      },
      primaryText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
      secondaryText: { fontSize: 16, fontWeight: '600', color: brandColors.accent.primary },
      buttonDisabled: { opacity: 0.5 },
    }),
  );

  if (!currentRecipe) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: colors.text.secondary }}>레시피 정보를 불러올 수 없어요.</Text>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 24, paddingHorizontal: 32 }]}
            onPress={() => router.replace('/guide')}
          >
            <Text style={styles.primaryText}>다시 시작하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const fruit = getFruitById(currentRecipe.fruitId);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>당신을 위한 레시피</Text>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.content}>
          <View style={[styles.heroCard, { borderLeftWidth: 4, borderLeftColor: currentRecipe.brandColor }]}>
            <Text style={styles.recipeName}>{currentRecipe.name}</Text>
            <Text style={styles.tagline}>{currentRecipe.tagline}</Text>
          </View>

          <View style={styles.ingredientCard}>
            <Text style={styles.sectionLabel}>500ml 1병 기준</Text>
            <View style={styles.ingredientRow}>
              <Text style={styles.ingredientLabel}>🍶 베이스 술</Text>
              <Text style={styles.ingredientValue}>
                {BASE_TYPE_LABELS[currentRecipe.baseType]} {currentRecipe.baseAmountMl}ml
              </Text>
            </View>
            <View style={styles.ingredientRow}>
              <Text style={styles.ingredientLabel}>🍑 {fruit?.name}</Text>
              <Text style={styles.ingredientValue}>{currentRecipe.fruitAmountG}g</Text>
            </View>
            {currentRecipe.herbs.map((h) => {
              const herbInfo = getHerbById(h.id);
              return (
                <View key={h.id} style={styles.ingredientRow}>
                  <Text style={styles.ingredientLabel}>🌿 {herbInfo?.name}</Text>
                  <Text style={styles.ingredientValue}>{h.amountG}g</Text>
                </View>
              );
            })}
            <View style={styles.ingredientRow}>
              <Text style={styles.ingredientLabel}>🍯 빙탕</Text>
              <Text style={styles.ingredientValue}>{currentRecipe.sugarG}g</Text>
            </View>
            <View style={styles.ingredientRow}>
              <Text style={styles.ingredientLabel}>⏱ 숙성</Text>
              <Text style={styles.ingredientValue}>{currentRecipe.durationDays}일</Text>
            </View>
            <View style={[styles.ingredientRow, styles.ingredientRowLast]}>
              <Text style={styles.ingredientLabel}>🎨 예상 색감</Text>
              <Text style={styles.ingredientValue}>{currentRecipe.colorDescription}</Text>
            </View>
          </View>

          <View style={styles.adjustCard}>
            <Text style={styles.adjustTitle}>변형하기</Text>

            <View style={styles.adjustRow}>
              <Text style={styles.adjustLabel}>단맛</Text>
              <View style={styles.levelButtonRow}>
                {(['light', 'normal', 'strong'] as SweetnessLevel[]).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.levelButton, adjustments.sweetness === level && styles.levelButtonActive]}
                    onPress={() => setAdjustments((prev) => ({ ...prev, sweetness: level }))}
                  >
                    <Text style={[
                      styles.levelButtonText,
                      adjustments.sweetness === level && styles.levelButtonTextActive,
                    ]}>
                      {level === 'light' ? '가볍게' : level === 'normal' ? '보통' : '달달'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.adjustRow}>
              <Text style={styles.adjustLabel}>향</Text>
              <View style={styles.levelButtonRow}>
                {(['subtle', 'normal', 'intense'] as RecipeAdjustments['aroma'][]).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.levelButton, adjustments.aroma === level && styles.levelButtonActive]}
                    onPress={() => setAdjustments((prev) => ({ ...prev, aroma: level }))}
                  >
                    <Text style={[
                      styles.levelButtonText,
                      adjustments.aroma === level && styles.levelButtonTextActive,
                    ]}>
                      {level === 'subtle' ? '은은' : level === 'normal' ? '보통' : '진하게'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.adjustRow}>
              <Text style={styles.adjustLabel}>도수</Text>
              <View style={styles.levelButtonRow}>
                {(['soft', 'normal', 'strong'] as RecipeAdjustments['strength'][]).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.levelButton, adjustments.strength === level && styles.levelButtonActive]}
                    onPress={() => setAdjustments((prev) => ({ ...prev, strength: level }))}
                  >
                    <Text style={[
                      styles.levelButtonText,
                      adjustments.strength === level && styles.levelButtonTextActive,
                    ]}>
                      {level === 'soft' ? '부드럽' : level === 'normal' ? '보통' : '강함'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleStartProject}
          disabled={isLoading}
        >
          <Text style={styles.primaryText}>이 레시피로 프로젝트 시작</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.secondaryText}>
            {isLoading ? '저장 중...' : '내 레시피에 저장'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GuideResultScreen;
```

- [ ] **Step 3: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 4: Commit**

```bash
git add app/guide/result.tsx src/screens/guide/GuideResultScreen.tsx
git commit -m "feat: 가이드 결과 화면 및 변형 조정 UI 구현"
```

---

## Task 9: 내 레시피 라이브러리

**Files:**
- Create: `app/profile/my-recipes.tsx`
- Create: `src/screens/guide/MyRecipesScreen.tsx`

- [ ] **Step 1: 라우트 엔트리 생성**

```typescript
// app/profile/my-recipes.tsx
import MyRecipesScreen from '@/src/screens/guide/MyRecipesScreen';

export default MyRecipesScreen;
```

- [ ] **Step 2: MyRecipesScreen 구현**

```typescript
// src/screens/guide/MyRecipesScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCustomRecipeStore } from '@/src/stores/customRecipeStore';
import { CustomRecipe, GuideResult } from '@/src/types';
import { BASE_TYPE_LABELS, getFruitById, getHerbById } from '@/src/data/recipeGuideData';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

const MyRecipesScreen: React.FC = () => {
  const router = useRouter();
  const { colors, brandColors } = useThemeValues();
  const { recipes, fetchRecipes, deleteRecipe, setPendingRecipe, isLoading } = useCustomRecipeStore();

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleStartProject = (recipe: CustomRecipe) => {
    const guideResult: GuideResult = {
      name: recipe.name,
      tagline: '',
      baseType: recipe.baseType,
      baseAmountMl: recipe.baseAmountMl,
      fruitId: recipe.fruitId,
      fruitAmountG: recipe.fruitAmountG,
      herbs: recipe.herbs,
      sugarG: recipe.sugarG,
      durationDays: recipe.durationDays,
      colorDescription: '',
      brandColor: recipe.brandColor,
      moodTag: recipe.moodTag || 'quiet_night',
    };
    setPendingRecipe(guideResult);
    router.push('/project/create');
  };

  const handleDelete = (recipe: CustomRecipe) => {
    Alert.alert('레시피 삭제', `"${recipe.name}"을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await deleteRecipe(recipe.id);
        },
      },
    ]);
  };

  const styles = useThemedStyles(({ colors, brandColors, shadows }) =>
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
      content: { paddingHorizontal: 24, paddingBottom: 40 },
      emptyContainer: { alignItems: 'center', paddingVertical: 60 },
      emptyEmoji: { fontSize: 48, marginBottom: 16 },
      emptyText: {
        fontSize: 15,
        color: colors.text.muted,
        textAlign: 'center',
        lineHeight: 22,
      },
      emptyButton: {
        marginTop: 24,
        backgroundColor: brandColors.accent.primary,
        borderRadius: 24,
        paddingVertical: 14,
        paddingHorizontal: 32,
      },
      emptyButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
      recipeCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
        borderLeftWidth: 4,
        ...shadows.glass.light,
      },
      recipeName: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 6,
      },
      recipeMeta: {
        fontSize: 13,
        color: colors.text.secondary,
        marginBottom: 4,
      },
      recipeDate: {
        fontSize: 11,
        color: colors.text.muted,
        marginBottom: 12,
      },
      actionRow: {
        flexDirection: 'row',
        gap: 8,
      },
      actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
      },
      startActionButton: {
        backgroundColor: brandColors.accent.primary,
      },
      deleteActionButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: brandColors.semantic.error,
      },
      startActionText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
      deleteActionText: { fontSize: 14, fontWeight: '600', color: brandColors.semantic.error },
    }),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 레시피</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isLoading && recipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📖</Text>
            <Text style={styles.emptyText}>
              {'아직 저장된 레시피가 없어요\n가이드를 통해 나만의 레시피를 만들어보세요'}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/guide')}
            >
              <Text style={styles.emptyButtonText}>가이드 시작하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recipes.map((recipe) => {
            const fruit = getFruitById(recipe.fruitId);
            const herbNames = recipe.herbs
              .map((h) => getHerbById(h.id)?.name)
              .filter((n): n is string => !!n)
              .join(', ');

            return (
              <View
                key={recipe.id}
                style={[styles.recipeCard, { borderLeftColor: recipe.brandColor }]}
              >
                <Text style={styles.recipeName}>{recipe.name}</Text>
                <Text style={styles.recipeMeta}>
                  {BASE_TYPE_LABELS[recipe.baseType]} · {recipe.durationDays}일 숙성
                </Text>
                {herbNames && (
                  <Text style={styles.recipeMeta}>
                    {fruit?.name} + {herbNames}
                  </Text>
                )}
                <Text style={styles.recipeDate}>
                  {new Date(recipe.createdAt).toLocaleDateString('ko-KR')} 저장
                </Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.startActionButton]}
                    onPress={() => handleStartProject(recipe)}
                  >
                    <Text style={styles.startActionText}>프로젝트 시작</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteActionButton]}
                    onPress={() => handleDelete(recipe)}
                  >
                    <Text style={styles.deleteActionText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyRecipesScreen;
```

- [ ] **Step 3: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 4: Commit**

```bash
git add app/profile/my-recipes.tsx src/screens/guide/MyRecipesScreen.tsx
git commit -m "feat: 내 레시피 라이브러리 화면 구현"
```

---

## Task 10: 홈 탭에 가이드 카드 추가

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: 가이드 카드 스타일 추가**

`app/(tabs)/index.tsx`의 `useThemedStyles` 내부 StyleSheet에 다음 스타일을 추가합니다. 기존 `emptyButton` 스타일 뒤에 추가:

```typescript
      guideCard: {
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 12,
        borderRadius: 20,
        backgroundColor: brandColors.accent.primary,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.glass.medium,
      },
      guideCardContent: {
        flex: 1,
      },
      guideCardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
      },
      guideCardDescription: {
        fontSize: 13,
        color: '#FFFFFF',
        opacity: 0.9,
      },
      guideCardIcon: {
        marginLeft: 12,
      },
      myRecipesLink: {
        marginHorizontal: 20,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: colors.background.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border.primary,
      },
      myRecipesLinkContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },
      myRecipesLinkText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text.primary,
        marginLeft: 10,
      },
      myRecipesCount: {
        fontSize: 12,
        fontWeight: '600',
        color: brandColors.accent.primary,
        marginRight: 8,
      },
```

- [ ] **Step 2: customRecipeStore import 및 사용**

`app/(tabs)/index.tsx` 상단 import 섹션에 추가:

```typescript
import { useCustomRecipeStore } from '@/src/stores/customRecipeStore';
```

`HomeScreen` 함수 내부 시작 부분에 추가:

```typescript
  const { recipes: customRecipes, fetchRecipes: fetchCustomRecipes } = useCustomRecipeStore();
```

`useEffect` (loadData) 내부의 fetchProjects 호출 뒤에 추가:

```typescript
      await fetchCustomRecipes();
```

의존성 배열에 `fetchCustomRecipes` 추가:

```typescript
  }, [fetchProjects, fetchCustomRecipes]);
```

`useFocusEffect`의 콜백에도 추가:

```typescript
  useFocusEffect(
    useCallback(() => {
      fetchProjects();
      fetchCustomRecipes();
    }, [fetchProjects, fetchCustomRecipes]),
  );
```

- [ ] **Step 3: JSX에 가이드 카드와 내 레시피 링크 추가**

`return` 구문 내부의 `Animated.View` 안, `{projects.length > 0 && renderCompactStats()}` 바로 전에 가이드 카드와 내 레시피 링크를 추가합니다:

```tsx
        <TouchableOpacity
          style={styles.guideCard}
          onPress={() => router.push('/guide')}
          activeOpacity={0.85}
        >
          <View style={styles.guideCardContent}>
            <Text style={styles.guideCardTitle}>✨ 나만의 담금주 가이드</Text>
            <Text style={styles.guideCardDescription}>
              7가지 질문으로 당신의 시그니처 담금주를 찾아보세요
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" style={styles.guideCardIcon} />
        </TouchableOpacity>

        {customRecipes.length > 0 && (
          <TouchableOpacity
            style={styles.myRecipesLink}
            onPress={() => router.push('/profile/my-recipes')}
            activeOpacity={0.85}
          >
            <View style={styles.myRecipesLinkContent}>
              <Ionicons name="book-outline" size={18} color={colors.text.primary} />
              <Text style={styles.myRecipesLinkText}>내 레시피</Text>
            </View>
            <Text style={styles.myRecipesCount}>{customRecipes.length}개</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
          </TouchableOpacity>
        )}

        {projects.length > 0 && renderCompactStats()}
```

- [ ] **Step 4: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 5: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "feat: 홈 탭에 담금주 가이드 카드 및 내 레시피 링크 추가"
```

---

## Task 11: CreateProjectScreen에 pendingRecipe 프리필

**Files:**
- Modify: `src/screens/project/CreateProjectScreen.tsx`

- [ ] **Step 1: customRecipeStore에서 pendingRecipe 소비하는 useEffect 추가**

`src/screens/project/CreateProjectScreen.tsx` 상단 import 섹션에 추가:

```typescript
import { useCustomRecipeStore } from '@/src/stores/customRecipeStore';
import { getFruitById, getHerbById, BASE_TYPE_LABELS } from '@/src/data/recipeGuideData';
```

`CreateProjectScreen` 함수 내부, state 선언들이 끝난 직후(약 `progressAnim` 선언 근처)에 다음 `useEffect`를 추가합니다:

```typescript
  // 가이드에서 넘어온 레시피 프리필
  useEffect(() => {
    const pending = useCustomRecipeStore.getState().consumePendingRecipe();
    if (!pending) return;

    setRecipeMode('custom');
    setCustomRecipeName(pending.name);
    setSelectedType(pending.baseType);
    setCustomDuration(String(pending.durationDays));
    setCustomBrandColor(pending.brandColor);

    const fruitInfo = getFruitById(pending.fruitId);
    const ingredients = [
      {
        id: `ing-fruit-${Date.now()}`,
        name: fruitInfo?.name || '',
        quantity: String(pending.fruitAmountG),
        unit: 'g',
      },
      ...pending.herbs.map((h, idx) => {
        const herbInfo = getHerbById(h.id);
        return {
          id: `ing-herb-${idx}-${Date.now()}`,
          name: herbInfo?.name || '',
          quantity: String(h.amountG),
          unit: 'g',
        };
      }),
      {
        id: `ing-sugar-${Date.now()}`,
        name: '빙탕',
        quantity: String(pending.sugarG),
        unit: 'g',
      },
      {
        id: `ing-base-${Date.now()}`,
        name: BASE_TYPE_LABELS[pending.baseType],
        quantity: String(pending.baseAmountMl),
        unit: 'ml',
      },
    ];
    setCustomIngredients(ingredients);
  }, []);
```

Note: Check that `useEffect` is already imported in the file. If not, add it to the React import.

- [ ] **Step 2: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 3: Commit**

```bash
git add src/screens/project/CreateProjectScreen.tsx
git commit -m "feat: 가이드 결과로 프로젝트 생성 화면 프리필"
```

---

## Task 12: 전체 검증

- [ ] **Step 1: TypeScript 전체 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 2: ESLint 검증**

Run: `npm run lint 2>&1 | tail -3`
Expected: 0 errors (warning 허용)

- [ ] **Step 3: Architecture 검증**

Run: `npm run architecture-check`
Expected: 통과

- [ ] **Step 4: 테스트 실행**

Run: `TZ=UTC npx jest __tests__/recipeGuide.test.ts __tests__/tasteAnalysis.test.ts --no-coverage`
Expected: 전체 통과

- [ ] **Step 5: (필요 시) lint fix 후 commit**

린트 에러가 있다면 수정 후:

```bash
git add -A
git commit -m "fix: lint 에러 수정"
```

---

## 선행 조건 (코드 구현 전)

Supabase 대시보드 SQL Editor에서 다음 마이그레이션 실행:

```sql
CREATE TABLE custom_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  base_type TEXT NOT NULL,
  base_amount_ml INTEGER NOT NULL DEFAULT 500,
  fruit_id TEXT NOT NULL,
  fruit_amount_g INTEGER NOT NULL,
  herbs JSONB NOT NULL DEFAULT '[]'::jsonb,
  sugar_g INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  brand_color TEXT,
  mood_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE custom_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes" ON custom_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" ON custom_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON custom_recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON custom_recipes
  FOR DELETE USING (auth.uid() = user_id);
```
