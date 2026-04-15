# 시음 노트 & 취향 프로필 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 완료된 담금주 프로젝트에 시음 노트를 기록하고, 전체 시음 데이터를 기반으로 "나의 취향 프로필"을 시각화하는 기능 추가

**Architecture:** projects 테이블에 `tasting_note` JSONB 컬럼 추가. 취향 분석은 클라이언트에서 순수 함수로 계산. 새 "취향" 탭과 시음 노트 작성 화면 추가.

**Tech Stack:** React Native, Expo Router, Zustand, Supabase, TypeScript

**Spec:** `docs/superpowers/specs/2026-04-15-tasting-note-taste-profile-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|----------------|
| `src/types/tastingNote.ts` | TastingNote 인터페이스, TasteStats 인터페이스 |
| `src/utils/tasteAnalysis.ts` | 취향 유형 분석 순수 함수 (평균 계산, 캐치프레이즈, 통계) |
| `src/screens/taste/TasteProfileScreen.tsx` | 취향 탭 메인 화면 |
| `src/screens/taste/TastingNoteScreen.tsx` | 시음 노트 작성/수정 화면 |
| `app/(tabs)/taste.tsx` | 취향 탭 라우트 엔트리 |
| `app/project/tasting-note/[projectId].tsx` | 시음 노트 라우트 엔트리 |
| `__tests__/tasteAnalysis.test.ts` | 취향 분석 함수 단위 테스트 |

### Modified Files
| File | Change |
|------|--------|
| `src/types/index.ts` | Project에 `tastingNote` 필드 추가, TastingNote re-export |
| `src/lib/database.types.ts` | projects Row/Insert/Update에 `tasting_note` 추가 |
| `src/services/supabaseService.ts` | `saveTastingNote` 함수 추가, `transformProjectRowToProject`에 tastingNote 매핑 |
| `src/stores/projectStore.ts` | `saveTastingNote` 액션 추가 |
| `app/(tabs)/_layout.tsx` | "취향" 탭 추가 |
| `src/screens/project/ProjectDetailScreen.tsx` | 완료 프로젝트에 시음 노트 버튼/카드 추가 |

---

## Task 1: 타입 정의

**Files:**
- Create: `src/types/tastingNote.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: TastingNote 타입 파일 생성**

```typescript
// src/types/tastingNote.ts

export interface TastingNoteRatings {
  taste: number;       // 맛 (1-5)
  aroma: number;       // 향 (1-5)
  appearance: number;  // 외관 (1-5)
  body: number;        // 바디감 (1-5)
  finish: number;      // 여운 (1-5)
  overall: number;     // 전체 (1-5)
}

export interface TastingNote {
  ratings: TastingNoteRatings;
  color: string;         // 색상 설명
  memo: string;          // 자유 시음 메모
  tastingDate: string;   // 시음 날짜 (ISO string)
  createdAt: string;
  updatedAt: string;
}

export interface TasteType {
  title: string;
  description: string;
}

export interface TasteStats {
  totalTastings: number;
  averageOverall: number;
  highestDimension: { label: string; average: number };
  lowestDimension: { label: string; average: number };
  favoriteRecipe: { name: string; count: number } | null;
}

export const RATING_DIMENSIONS: { key: keyof TastingNoteRatings; label: string }[] = [
  { key: 'taste', label: '맛' },
  { key: 'aroma', label: '향' },
  { key: 'appearance', label: '외관' },
  { key: 'body', label: '바디감' },
  { key: 'finish', label: '여운' },
  { key: 'overall', label: '전체' },
];
```

- [ ] **Step 2: Project 인터페이스에 tastingNote 추가**

`src/types/index.ts`에서 Project 인터페이스에 필드 추가:

```typescript
// src/types/index.ts 상단에 import 추가
// (기존 import 없음, 새로 추가)

// Project 인터페이스 내부, updatedAt 위에 추가:
  tastingNote?: TastingNote | null;
```

파일 하단에 re-export 추가:

```typescript
// 시음 노트 타입
export type {
  TastingNote,
  TastingNoteRatings,
  TasteType,
  TasteStats,
} from './tastingNote';
export { RATING_DIMENSIONS } from './tastingNote';
```

- [ ] **Step 3: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 4: Commit**

```bash
git add src/types/tastingNote.ts src/types/index.ts
git commit -m "feat: TastingNote 타입 정의 및 Project 인터페이스 확장"
```

---

## Task 2: DB 타입 및 서비스 레이어

**Files:**
- Modify: `src/lib/database.types.ts`
- Modify: `src/services/supabaseService.ts`

- [ ] **Step 1: database.types.ts에 tasting_note 컬럼 추가**

`src/lib/database.types.ts`의 projects 테이블 Row, Insert, Update 각각에 추가:

Row (line ~61, `updated_at` 위):
```typescript
          tasting_note: Json | null;
```

Insert (line ~80, `updated_at` 위):
```typescript
          tasting_note?: Json | null;
```

Update (line ~96, `updated_at` 위):
```typescript
          tasting_note?: Json | null;
```

- [ ] **Step 2: supabaseService에 saveTastingNote 함수 추가**

`src/services/supabaseService.ts`의 `SupabaseService` 클래스 내부, `deleteProgressLog` 메서드 뒤에 추가:

```typescript
  // 시음 노트 저장
  static async saveTastingNote(projectId: string, tastingNote: TastingNote): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          tasting_note: tastingNote as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (error) throw error;
    } catch (error) {
      console.error('시음 노트 저장 오류:', error);
      throw error;
    }
  }
```

import에 `TastingNote` 추가:

```typescript
import { User, Project, ProgressLog, Ingredient, TastingNote } from '@/src/types';
```

- [ ] **Step 3: transformProjectRowToProject에 tastingNote 매핑 추가**

`src/services/supabaseService.ts`의 `transformProjectRowToProject` 메서드 반환 객체에 추가 (line ~595, `customBrandColor` 아래):

```typescript
      tastingNote: projectRow.tasting_note || null,
```

- [ ] **Step 4: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 5: Commit**

```bash
git add src/lib/database.types.ts src/services/supabaseService.ts
git commit -m "feat: 시음 노트 DB 타입 및 서비스 함수 추가"
```

---

## Task 3: Store 액션

**Files:**
- Modify: `src/stores/projectStore.ts`

- [ ] **Step 1: ProjectState 인터페이스에 액션 추가**

`src/stores/projectStore.ts`의 import에 `TastingNote` 추가:

```typescript
import { Project, ProjectStatus, ProjectType, ProgressLog, TastingNote } from '@/src/types';
```

`ProjectState` 인터페이스의 `deleteProgressLog` 아래에 추가:

```typescript
  // Tasting Note actions
  saveTastingNote: (projectId: string, tastingNote: TastingNote) => Promise<boolean>;
```

- [ ] **Step 2: saveTastingNote 액션 구현**

`rescheduleAllNotifications` 메서드 위에 추가:

```typescript
  saveTastingNote: async (projectId: string, tastingNote: TastingNote) => {
    try {
      set({ isLoading: true });
      await SupabaseService.saveTastingNote(projectId, tastingNote);
      get().updateProject(projectId, { tastingNote });
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('시음 노트 저장 실패:', error);
      set({ isLoading: false });
      return false;
    }
  },
```

- [ ] **Step 3: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 4: Commit**

```bash
git add src/stores/projectStore.ts
git commit -m "feat: projectStore에 saveTastingNote 액션 추가"
```

---

## Task 4: 취향 분석 유틸리티 (TDD)

**Files:**
- Create: `src/utils/tasteAnalysis.ts`
- Create: `__tests__/tasteAnalysis.test.ts`

- [ ] **Step 1: 테스트 파일 생성**

```typescript
// __tests__/tasteAnalysis.test.ts
import {
  calculateAverageRatings,
  analyzeTasteType,
  calculateTasteStats,
} from '@/src/utils/tasteAnalysis';
import { Project } from '@/src/types';

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: '1',
  userId: 'u1',
  name: '테스트 프로젝트',
  type: 'damgeumSoju25',
  startDate: '2026-01-01',
  expectedEndDate: '2026-02-01',
  status: 'completed',
  images: [],
  ingredients: [],
  progressLogs: [],
  recipeId: 'yareyare',
  tastingNote: {
    ratings: { taste: 4, aroma: 5, appearance: 3, body: 4, finish: 5, overall: 4 },
    color: '황금색',
    memo: '맛있다',
    tastingDate: '2026-02-01',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-02-01T00:00:00Z',
  ...overrides,
});

describe('calculateAverageRatings', () => {
  it('returns empty array when no projects with tasting notes', () => {
    const result = calculateAverageRatings([makeProject({ tastingNote: null })]);
    expect(result).toEqual([]);
  });

  it('returns average ratings from single project', () => {
    const result = calculateAverageRatings([makeProject()]);
    expect(result).toEqual([
      { label: '맛', value: 4 },
      { label: '향', value: 5 },
      { label: '외관', value: 3 },
      { label: '바디감', value: 4 },
      { label: '여운', value: 5 },
      { label: '전체', value: 4 },
    ]);
  });

  it('averages ratings across multiple projects', () => {
    const p1 = makeProject({
      id: '1',
      tastingNote: {
        ratings: { taste: 4, aroma: 2, appearance: 4, body: 2, finish: 4, overall: 3 },
        color: '', memo: '', tastingDate: '', createdAt: '', updatedAt: '',
      },
    });
    const p2 = makeProject({
      id: '2',
      tastingNote: {
        ratings: { taste: 2, aroma: 4, appearance: 2, body: 4, finish: 2, overall: 3 },
        color: '', memo: '', tastingDate: '', createdAt: '', updatedAt: '',
      },
    });
    const result = calculateAverageRatings([p1, p2]);
    expect(result).toEqual([
      { label: '맛', value: 3 },
      { label: '향', value: 3 },
      { label: '외관', value: 3 },
      { label: '바디감', value: 3 },
      { label: '여운', value: 3 },
      { label: '전체', value: 3 },
    ]);
  });
});

describe('analyzeTasteType', () => {
  it('returns null when no tasting notes', () => {
    const result = analyzeTasteType([makeProject({ tastingNote: null })]);
    expect(result).toBeNull();
  });

  it('returns correct type for aroma + finish top scores', () => {
    const result = analyzeTasteType([makeProject()]);
    // aroma=5, finish=5 are top → "여운을 음미하는 감성가"
    expect(result?.title).toBe('여운을 음미하는 감성가');
  });

  it('returns correct type for taste + body top scores', () => {
    const p = makeProject({
      tastingNote: {
        ratings: { taste: 5, aroma: 2, appearance: 2, body: 5, finish: 2, overall: 3 },
        color: '', memo: '', tastingDate: '', createdAt: '', updatedAt: '',
      },
    });
    const result = analyzeTasteType([p]);
    expect(result?.title).toBe('풍미를 추구하는 미식가');
  });
});

describe('calculateTasteStats', () => {
  it('returns zero stats when no tasting notes', () => {
    const result = calculateTasteStats([makeProject({ tastingNote: null })]);
    expect(result.totalTastings).toBe(0);
  });

  it('returns correct stats for single project', () => {
    const result = calculateTasteStats([makeProject()]);
    expect(result.totalTastings).toBe(1);
    expect(result.averageOverall).toBe(4);
    expect(result.highestDimension.label).toBe('향');
    expect(result.lowestDimension.label).toBe('외관');
    expect(result.favoriteRecipe?.name).toBe('야레야레 やれやれ~');
    expect(result.favoriteRecipe?.count).toBe(1);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `TZ=UTC npx jest __tests__/tasteAnalysis.test.ts --no-coverage`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: tasteAnalysis.ts 구현**

```typescript
// src/utils/tasteAnalysis.ts
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

  // overall을 제외한 5개 차원에서 상위 2개 추출
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

  // overall 제외한 차원에서 최고/최저
  const nonOverall = avgRatings.filter((r) => r.label !== '전체');
  const sorted = [...nonOverall].sort((a, b) => b.value - a.value);

  // 선호 레시피 계산
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `TZ=UTC npx jest __tests__/tasteAnalysis.test.ts --no-coverage`
Expected: PASS (모든 테스트 통과)

- [ ] **Step 5: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 6: Commit**

```bash
git add src/utils/tasteAnalysis.ts __tests__/tasteAnalysis.test.ts
git commit -m "feat: 취향 분석 유틸리티 함수 구현 및 테스트"
```

---

## Task 5: 시음 노트 작성 화면

**Files:**
- Create: `src/screens/taste/TastingNoteScreen.tsx`
- Create: `app/project/tasting-note/[projectId].tsx`

- [ ] **Step 1: 라우트 엔트리 생성**

```typescript
// app/project/tasting-note/[projectId].tsx
import TastingNoteScreen from '@/src/screens/taste/TastingNoteScreen';

export default TastingNoteScreen;
```

- [ ] **Step 2: TastingNoteScreen 구현**

```typescript
// src/screens/taste/TastingNoteScreen.tsx
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
```

- [ ] **Step 3: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 4: Commit**

```bash
git add app/project/tasting-note/ src/screens/taste/TastingNoteScreen.tsx
git commit -m "feat: 시음 노트 작성/수정 화면 구현"
```

---

## Task 6: 취향 프로필 탭 화면

**Files:**
- Create: `src/screens/taste/TasteProfileScreen.tsx`
- Create: `app/(tabs)/taste.tsx`
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: 라우트 엔트리 생성**

```typescript
// app/(tabs)/taste.tsx
import TasteProfileScreen from '@/src/screens/taste/TasteProfileScreen';

export default TasteProfileScreen;
```

- [ ] **Step 2: TasteProfileScreen 구현**

```typescript
// src/screens/taste/TasteProfileScreen.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProjectStore } from '@/src/stores/projectStore';
import { getRecipeById } from '@/src/data/presetRecipes';
import { calculateAverageRatings, analyzeTasteType, calculateTasteStats } from '@/src/utils/tasteAnalysis';
import RadarChart from '@/src/components/common/RadarChart';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

const TasteProfileScreen: React.FC = () => {
  const router = useRouter();
  const { colors, brandColors } = useThemeValues();
  const { projects } = useProjectStore();

  const completedProjects = useMemo(
    () => projects.filter((p) => p.status === 'completed'),
    [projects],
  );
  const projectsWithNotes = useMemo(
    () => completedProjects.filter((p) => p.tastingNote?.ratings),
    [completedProjects],
  );
  const projectsWithoutNotes = useMemo(
    () => completedProjects.filter((p) => !p.tastingNote?.ratings),
    [completedProjects],
  );

  const avgRatings = useMemo(() => calculateAverageRatings(projects), [projects]);
  const tasteType = useMemo(() => analyzeTasteType(projects), [projects]);
  const stats = useMemo(() => calculateTasteStats(projects), [projects]);

  const styles = useThemedStyles(({ colors, brandColors, shadows }) =>
    StyleSheet.create({
      container: { flex: 1, backgroundColor: colors.background.primary },
      header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
      headerTitle: { fontSize: 28, fontWeight: '800', color: colors.text.primary },
      content: { paddingHorizontal: 24, paddingBottom: 40 },
      card: {
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        ...shadows.glass.light,
      },
      cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text.secondary, marginBottom: 16 },
      radarContainer: { alignItems: 'center' },
      typeTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
      typeDescription: { fontSize: 15, color: colors.text.secondary, lineHeight: 22 },
      statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.secondary,
      },
      statsRowLast: { borderBottomWidth: 0 },
      statsLabel: { fontSize: 14, color: colors.text.secondary },
      statsValue: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
      projectCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.glass.light,
      },
      colorBar: { width: 4, height: 48, borderRadius: 2, marginRight: 12 },
      projectInfo: { flex: 1 },
      projectName: { fontSize: 15, fontWeight: '600', color: colors.text.primary, marginBottom: 2 },
      projectDate: { fontSize: 12, color: colors.text.muted },
      overallScore: { fontSize: 20, fontWeight: '700', marginRight: 8 },
      emptyContainer: { alignItems: 'center', paddingVertical: 60 },
      emptyText: { fontSize: 15, color: colors.text.muted, marginTop: 12, textAlign: 'center', lineHeight: 22 },
      nudgeCard: {
        backgroundColor: colors.background.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: brandColors.accent.secondary,
        borderStyle: 'dashed',
      },
      nudgeText: { flex: 1, fontSize: 14, color: colors.text.secondary, marginLeft: 12 },
      infoText: {
        fontSize: 14,
        color: colors.text.muted,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
      },
      sectionHeader: { fontSize: 17, fontWeight: '600', color: colors.text.primary, marginBottom: 12, marginTop: 8 },
    }),
  );

  if (projectsWithNotes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>취향</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="wine-outline" size={48} color={colors.text.muted} />
          <Text style={styles.emptyText}>
            {'첫 담금주를 완성하고\n시음 노트를 남겨보세요'}
          </Text>
        </View>
        {projectsWithoutNotes.length > 0 && (
          <View style={styles.content}>
            <Text style={styles.sectionHeader}>시음 노트를 남겨보세요</Text>
            {projectsWithoutNotes.map((p) => {
              const recipe = p.recipeId ? getRecipeById(p.recipeId) : undefined;
              const bc = p.customBrandColor || recipe?.brandColor || brandColors.accent.primary;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={styles.nudgeCard}
                  onPress={() => router.push(`/project/tasting-note/${p.id}`)}
                >
                  <View style={[styles.colorBar, { backgroundColor: bc }]} />
                  <Text style={styles.nudgeText}>{p.name}</Text>
                  <Ionicons name="create-outline" size={20} color={brandColors.accent.primary} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>취향</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 레이더 차트 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>나의 취향 프로필</Text>
          <View style={styles.radarContainer}>
            <RadarChart data={avgRatings} size={200} color={brandColors.accent.primary} />
          </View>
        </View>

        {/* 취향 유형 */}
        {tasteType && (
          <View style={styles.card}>
            <Text style={styles.typeTitle}>{tasteType.title}</Text>
            <Text style={styles.typeDescription}>{tasteType.description}</Text>
          </View>
        )}

        {/* 세부 통계 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>통계</Text>
          {stats.totalTastings < 2 && (
            <Text style={styles.infoText}>
              더 많은 시음 기록이 쌓이면 정확한 분석이 가능해요
            </Text>
          )}
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>총 시음 횟수</Text>
            <Text style={styles.statsValue}>{stats.totalTastings}회</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>평균 전체 평점</Text>
            <Text style={styles.statsValue}>{stats.averageOverall} / 5.0</Text>
          </View>
          {stats.highestDimension.label && (
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>가장 높은 항목</Text>
              <Text style={styles.statsValue}>
                {stats.highestDimension.label} ({stats.highestDimension.average})
              </Text>
            </View>
          )}
          {stats.lowestDimension.label && (
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>가장 낮은 항목</Text>
              <Text style={styles.statsValue}>
                {stats.lowestDimension.label} ({stats.lowestDimension.average})
              </Text>
            </View>
          )}
          {stats.favoriteRecipe && (
            <View style={[styles.statsRow, styles.statsRowLast]}>
              <Text style={styles.statsLabel}>가장 많이 담근 레시피</Text>
              <Text style={styles.statsValue}>
                {stats.favoriteRecipe.name} ({stats.favoriteRecipe.count}회)
              </Text>
            </View>
          )}
        </View>

        {/* 프로젝트별 시음 카드 */}
        <Text style={styles.sectionHeader}>시음 기록</Text>
        {projectsWithNotes.map((p) => {
          const recipe = p.recipeId ? getRecipeById(p.recipeId) : undefined;
          const bc = p.customBrandColor || recipe?.brandColor || brandColors.accent.primary;
          return (
            <TouchableOpacity
              key={p.id}
              style={styles.projectCard}
              onPress={() => router.push(`/project/${p.id}`)}
            >
              <View style={[styles.colorBar, { backgroundColor: bc }]} />
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{p.name}</Text>
                <Text style={styles.projectDate}>{p.tastingNote?.tastingDate}</Text>
              </View>
              <Text style={[styles.overallScore, { color: bc }]}>
                {p.tastingNote?.ratings.overall}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
            </TouchableOpacity>
          );
        })}

        {/* 시음 노트 미작성 프로젝트 */}
        {projectsWithoutNotes.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>시음 노트를 남겨보세요</Text>
            {projectsWithoutNotes.map((p) => {
              const recipe = p.recipeId ? getRecipeById(p.recipeId) : undefined;
              const bc = p.customBrandColor || recipe?.brandColor || brandColors.accent.primary;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={styles.nudgeCard}
                  onPress={() => router.push(`/project/tasting-note/${p.id}`)}
                >
                  <View style={[styles.colorBar, { backgroundColor: bc }]} />
                  <Text style={styles.nudgeText}>{p.name}</Text>
                  <Ionicons name="create-outline" size={20} color={brandColors.accent.primary} />
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TasteProfileScreen;
```

- [ ] **Step 3: 탭 레이아웃에 "취향" 탭 추가**

`app/(tabs)/_layout.tsx`에서 `index` 탭과 `calendar` 탭 사이에 추가:

```typescript
      <Tabs.Screen
        name="taste"
        options={{
          title: '취향',
          tabBarIcon: ({ color }) => <TabBarIcon name="wine-outline" color={color} />,
        }}
      />
```

위치: `index` Screen 닫는 태그 (`/>`) 바로 뒤, `calendar` Screen 바로 앞.

- [ ] **Step 4: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 5: Lint 검증**

Run: `npm run lint 2>&1 | grep -c "error"` 
Expected: 0

- [ ] **Step 6: Architecture 검증**

Run: `npm run architecture-check`
Expected: 통과

- [ ] **Step 7: Commit**

```bash
git add app/\(tabs\)/taste.tsx src/screens/taste/TasteProfileScreen.tsx app/\(tabs\)/_layout.tsx
git commit -m "feat: 취향 프로필 탭 화면 구현"
```

---

## Task 7: 프로젝트 상세 화면에 시음 노트 진입점 추가

**Files:**
- Modify: `src/screens/project/ProjectDetailScreen.tsx`

- [ ] **Step 1: 완료된 프로젝트에 시음 노트 섹션 추가**

`src/screens/project/ProjectDetailScreen.tsx`에서 `CompletionSummaryCard` 바로 아래 (line ~1083 부근)에 시음 노트 섹션을 추가합니다.

기존:
```tsx
          {project.status === 'completed' && <CompletionSummaryCard project={project} />}
```

변경 후:
```tsx
          {project.status === 'completed' && <CompletionSummaryCard project={project} />}

          {project.status === 'completed' && (
            <View style={{ ...styles.section, alignItems: 'stretch' }}>
              {project.tastingNote?.ratings ? (
                <>
                  <View style={styles.logsSectionHeader}>
                    <Text style={[styles.sectionTitle, { flex: 1, marginRight: 8, textAlign: 'left' }]}>
                      시음 노트
                    </Text>
                    <TouchableOpacity
                      style={styles.addLogButton}
                      onPress={() => router.push(`/project/tasting-note/${project.id}`)}
                    >
                      <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.addLogButtonText}>수정</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ alignItems: 'center', marginBottom: 12 }}>
                    <RadarChart
                      data={[
                        { label: '맛', value: project.tastingNote.ratings.taste || 0 },
                        { label: '향', value: project.tastingNote.ratings.aroma || 0 },
                        { label: '외관', value: project.tastingNote.ratings.appearance || 0 },
                        { label: '바디감', value: project.tastingNote.ratings.body || 0 },
                        { label: '여운', value: project.tastingNote.ratings.finish || 0 },
                        { label: '전체', value: project.tastingNote.ratings.overall || 0 },
                      ]}
                      size={180}
                      color={brandColor}
                    />
                  </View>
                  {project.tastingNote.memo ? (
                    <Text style={styles.notesText}>{project.tastingNote.memo}</Text>
                  ) : null}
                </>
              ) : (
                <TouchableOpacity
                  style={{
                    backgroundColor: brandColor,
                    borderRadius: 24,
                    paddingVertical: 14,
                    alignItems: 'center',
                  }}
                  onPress={() => router.push(`/project/tasting-note/${project.id}`)}
                >
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>
                    시음 노트 작성
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
```

- [ ] **Step 2: TastingNote 타입 import 확인**

`ProjectDetailScreen.tsx`의 import에서 이미 `Project`을 import하고 있고, `tastingNote`는 `Project`의 필드이므로 추가 import 불필요.

- [ ] **Step 3: TypeScript 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 4: Commit**

```bash
git add src/screens/project/ProjectDetailScreen.tsx
git commit -m "feat: 프로젝트 상세에 시음 노트 작성/보기 섹션 추가"
```

---

## Task 8: 전체 검증

- [ ] **Step 1: TypeScript 전체 검증**

Run: `npx tsc --noEmit`
Expected: 에러 0개

- [ ] **Step 2: ESLint 검증**

Run: `npm run lint 2>&1 | tail -1`
Expected: 에러 0개 (warning만 허용)

- [ ] **Step 3: Architecture 검증**

Run: `npm run architecture-check`
Expected: 통과 (새로운 위반 없음)

- [ ] **Step 4: 테스트 실행**

Run: `TZ=UTC npx jest --no-coverage --forceExit`
Expected: 전체 테스트 통과

- [ ] **Step 5: Commit (필요 시 lint fix)**

린트 에러가 있다면 수정 후:

```bash
git add -A
git commit -m "fix: lint 및 검증 수정"
```

---

## 선행 조건 (코드 구현 전)

Supabase 대시보드 SQL Editor에서 실행:

```sql
ALTER TABLE projects ADD COLUMN tasting_note JSONB DEFAULT NULL;
```
