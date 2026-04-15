# Design Spec: 나만의 담금주 가이드 (Recipe Guide)

> 7단계 설문을 통해 사용자 취향에 맞는 담금주 레시피를 추천하고, 변형하고, 저장/실행할 수 있는 기능

---

## 1. 목적

- 현재 "나만의 레시피" 모드는 **빈 캔버스** — 초보자가 어떤 과일/허브를 어떤 비율로 조합할지 막막
- 7단계 가이드로 **담금주 페어링 지식이 없어도** 자신의 취향에 맞는 레시피를 만들 수 있게 함
- 앱 이름 "취향"과 완벽히 부합 — 자기만의 시그니처 발견 여정

---

## 2. 전체 흐름

```
[홈 탭의 큰 카드]
  ↓
[가이드 시작 화면] — 시음 데이터 반영 토글
  ↓
[7단계 설문] — 분위기 → 사람 → 과일 → 허브 → 베이스 → 단맛 → 시음시기
  ↓
[결과 화면] — 추천 레시피 + 변형 슬라이더 3종
  ↓
선택 ───────────────┬────────────────
[이 레시피로 시작]    [내 레시피에 저장]
  ↓                   ↓
프로젝트 생성        내 레시피 라이브러리
```

---

## 3. 데이터 모델

### 3-1. 재료 풀

#### 과일 (13종)

| ID | 이름 | 어울리는 분위기 (weight) |
|----|------|--------------------------|
| maesil | 매실 | 가족, 전통 |
| bokbunja | 복분자 | 연인 둘 |
| blueberry | 블루베리 | 조용한 밤 |
| grapefruit | 자몽 | 시끌벅적, 피크닉 |
| lemon | 레몬 | 피크닉 |
| yuja | 유자 | 추운 겨울, 가족 |
| moga | 모과 | 추운 겨울, 조용한 밤 |
| apple | 사과 | 가족, 연인 둘 |
| greengrape | 청포도 | 조용한 밤, 연인 둘 |
| raspberry | 산딸기 | 시끌벅적, 피크닉 |
| fig | 무화과 | 특별한 자리 |
| halabong | 한라봉 | 시끌벅적, 피크닉 |
| omija | 오미자 | 조용한 밤, 가족, 특별한 자리 |

#### 허브/향신료 (10종)

| ID | 이름 |
|----|------|
| rosemary | 로즈마리 |
| lavender | 라벤더 |
| mint | 민트 |
| basil | 바질 |
| thyme | 타임 |
| cinnamon | 시나몬 |
| clove | 정향 |
| ginger | 생강 |
| cardamom | 카다멈 |
| chrysanthemum | 국화 |

### 3-2. 페어링 규칙 (과일 → 어울리는 허브 3개, 우선순위 순)

| 과일 | 추천 허브 1순위 | 2순위 | 3순위 |
|------|----------------|-------|-------|
| 매실 | 로즈마리 | 시나몬 | 생강 |
| 복분자 | 로즈마리 | 타임 | 시나몬 |
| 블루베리 | 라벤더 | 로즈마리 | 바질 |
| 자몽 | 민트 | 바질 | 라벤더 |
| 레몬 | 민트 | 바질 | 타임 |
| 유자 | 생강 | 시나몬 | 정향 |
| 모과 | 시나몬 | 정향 | 카다멈 |
| 사과 | 시나몬 | 카다멈 | 타임 |
| 청포도 | 민트 | 바질 | 라벤더 |
| 산딸기 | 민트 | 바질 | 라벤더 |
| 무화과 | 로즈마리 | 시나몬 | 타임 |
| 한라봉 | 민트 | 생강 | 라벤더 |
| 오미자 | 생강 | 국화 | 시나몬 |

### 3-3. 분위기 정의

| ID | 이름 | 선호 과일 | 선호 허브 | 추천 베이스 |
|----|------|-----------|-----------|-------------|
| quiet_night | 조용한 밤 | 블루베리, 청포도, 모과 | 라벤더, 국화 | 담금소주 30도 |
| lively_friends | 시끌벅적 | 산딸기, 한라봉, 자몽 | 민트, 바질 | 담금소주 25도 |
| romantic | 연인과 둘이 | 복분자, 무화과 | 로즈마리, 라벤더 | 담금소주 30도 |
| family | 가족 모임 | 매실, 유자, 오미자, 사과 | 시나몬, 생강, 국화 | 담금소주 25도 |
| picnic | 피크닉 | 레몬, 자몽, 한라봉 | 민트, 바질 | 담금소주 25도 |
| winter_warm | 추운 겨울 | 유자, 모과, 사과 | 시나몬, 생강, 정향 | 보드카 |

### 3-4. 용량 기준 (500ml 1병 고정)

| 재료 | 기본량 | 슬라이더 범위 |
|------|--------|--------------|
| 베이스 술 | 500ml | - (질문에서 변경) |
| 과일 | 160g | - |
| 허브/향신료 | 3g | 2g (은은) ~ 10g (진하게) |
| 빙탕 | 25g | 15g (가볍게) ~ 40g (달달) |

### 3-5. 숙성 기간 (베이스별 기본값)

- 담금소주 25도: 30일
- 담금소주 30도: 45일
- 보드카: 60일

`시음 시기` 답변에 따라 조정:
- "한 달 안에" → 최소값으로 고정 (30일)
- "두세 달 후" → 기본값 유지
- "계절이 바뀐 후" → 기본값 + 15일

### 3-6. 시음 프로필 반영 로직 (토글 ON 시)

| 취향 유형 | 조정 |
|-----------|------|
| 여운을 음미하는 감성가 | 허브 기본량 +2g |
| 풍미를 추구하는 미식가 | 과일 기본량 +20g |
| 오감으로 즐기는 탐험가 | 허브 2종 제안 (기본 1종) |
| 깊이를 탐구하는 감별사 | 숙성 기간 +15일 |
| 무게감을 아는 감식가 | 베이스 도수 한 단계 ↑ |
| 자신만의 취향을 만드는 양조가 | 조정 없음 |

### 3-7. 내 레시피 DB 스키마

새 테이블 `custom_recipes`:

```sql
CREATE TABLE custom_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                      -- "매실 × 로즈마리 × 시나몬"
  base_type TEXT NOT NULL,                 -- damgeumSoju25 / damgeumSoju30 / vodka
  base_amount_ml INTEGER DEFAULT 500,
  fruit_id TEXT NOT NULL,
  fruit_amount_g INTEGER NOT NULL,
  herbs JSONB NOT NULL,                    -- [{ id: string, amount_g: number }]
  sugar_g INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  brand_color TEXT,                        -- 과일 컬러에서 파생
  mood_tag TEXT,                           -- 생성 시 선택한 분위기 ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE custom_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자는 자신의 레시피만 조회 가능" ON custom_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 레시피만 생성 가능" ON custom_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 레시피만 수정 가능" ON custom_recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 레시피만 삭제 가능" ON custom_recipes
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 4. 화면 구성

### 4-1. 홈 탭 — 가이드 진입 카드

HomeScreen 상단에 눈에 띄는 카드 추가:

```
┌─────────────────────────────────────┐
│  ✨ 나만의 담금주 가이드               │
│                                     │
│  "7가지 질문으로 당신만의             │
│   시그니처 담금주를 찾아보세요"       │
│                                     │
│  [시작하기 →]                        │
└─────────────────────────────────────┘
```

또한 `custom_recipes`가 1개 이상 있으면 "내 레시피" 섹션이 그 아래에 노출.

### 4-2. 가이드 시작 화면

- 가이드 소개 문구
- **"시음 데이터 반영하기" 토글** (사용자가 시음 노트 2개 이상 있을 때만 노출)
- [시작] 버튼

### 4-3. 7단계 설문 화면

공통 UI:
- 상단: 진행률 바 (1/7 … 7/7)
- 상단: 질문 텍스트
- 중앙: 선택지 카드 그리드
- 하단: [다음] 버튼 (선택 후 활성화)
- 좌측 상단: 뒤로가기

#### Step 1: 분위기
```
"완성된 후, 어떤 순간에 마시고 싶나요?"
[조용한 밤] [시끌벅적] [연인과 둘이]
[가족 모임] [피크닉] [추운 겨울]
```

#### Step 2: 사람
```
"몇 명과 함께 마실 예정인가요?"
[혼자] [둘이서] [소수 모임] [큰 모임]
```

#### Step 3: 과일
```
"어떤 과일에 끌리세요?"

분위기 답변에 따라 상위 6~8개 과일을 표시.
각 카드에 과일 이름 + 한 줄 특징.
예: "매실 — 새콤상큼한 한국의 맛"
```

#### Step 4: 허브/향신료
```
"함께 우려낼 향초는?"

선택한 과일의 페어링 규칙에 따라 상위 3~5개 표시.
"건너뛰기" 옵션 있음 (허브 없이 가능).
```

#### Step 5: 베이스 술
```
"추천 베이스: 담금소주 30도. 그대로 하시겠어요?"

분위기에 따라 추천 베이스를 highlight하되, 3개 모두 선택 가능:
[담금소주 25도] [담금소주 30도 ✓추천] [보드카]
```

#### Step 6: 단맛
```
"단맛 정도는?"
[가볍게] [보통] [달달하게]
```

#### Step 7: 시음 시기
```
"언제 마시고 싶나요?"
[한 달 안에] [두세 달 후] [계절이 바뀐 후]
```

### 4-4. 결과 화면

```
┌─────────────────────────────────────┐
│  ← 취향          당신을 위한 레시피    │
│                                     │
│  🍑 매실 × 🌿 로즈마리 × 🌿 시나몬    │
│                                     │
│  "조용한 겨울밤의 시그니처"           │
│  (분위기 기반 자동 생성)              │
│                                     │
│  ┌─ 500ml 1병 기준 ────────────┐    │
│  │ 🍶 담금소주 30도 500ml       │    │
│  │ 🍑 매실 160g                 │    │
│  │ 🌿 로즈마리 3g               │    │
│  │ 🌿 시나몬 2g                 │    │
│  │ 🍯 빙탕 25g                  │    │
│  │ ⏱  숙성 45일                 │    │
│  │ 🎨 예상 색감: 은은한 호박색  │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌─ 변형하기 ─────────────────┐    │
│  │ 단맛  ━━●━━  가볍게 ↔ 달달 │    │
│  │ 향   ━━●━━  은은 ↔ 진하게 │    │
│  │ 도수  ━━●━━  부드럽 ↔ 강함│    │
│  └────────────────────────────┘    │
│                                     │
│  [이 레시피로 프로젝트 시작] ←메인   │
│  [내 레시피에 저장]                  │
└─────────────────────────────────────┘
```

**변형 슬라이더 동작**:
- 단맛: 빙탕 15g ↔ 40g
- 향: 허브 각각 2g ↔ 10g
- 도수: 베이스 (25도 ↔ 30도 ↔ 보드카). 변경 시 숙성 기간도 자동 재계산

### 4-5. 내 레시피 라이브러리 화면

라우트: `app/profile/my-recipes.tsx` 또는 홈 탭에 섹션으로

리스트 구조:
```
┌────────────────────────────┐
│ 매실 × 로즈마리 × 시나몬     │
│ 담금소주 30도 · 45일         │
│ 2026-04-15 저장            │
│ [프로젝트 시작] [삭제]       │
└────────────────────────────┘
```

카드 탭 → 레시피 상세 (결과 화면과 유사) → 거기서 프로젝트 생성 가능.

### 4-6. "이 레시피로 프로젝트 시작" 흐름

기존 `CreateProjectScreen`으로 이동하되, 다음 값들을 미리 채워서 전달:
- `recipeMode: 'custom'`
- `customRecipeName`
- `customIngredients` (과일 + 허브 + 빙탕)
- `customDuration`
- `customBrandColor` (과일에 매핑된 색)
- `type` (base_type 기반)

사용자는 **시작일, 프로젝트 이름, 목적 메모**만 입력하면 됨.

---

## 5. 파일 변경 목록

### 새로 생성

| 파일 | 역할 |
|------|------|
| `src/data/recipeGuideData.ts` | 과일/허브 풀, 페어링 규칙, 분위기 정의 |
| `src/utils/recipeGuide.ts` | 답변 기반 레시피 추천 순수 함수 |
| `src/types/customRecipe.ts` | CustomRecipe, GuideAnswers 타입 |
| `src/screens/guide/GuideStartScreen.tsx` | 가이드 시작 화면 (토글 포함) |
| `src/screens/guide/GuideQuestionScreen.tsx` | 7단계 공통 설문 화면 |
| `src/screens/guide/GuideResultScreen.tsx` | 추천 결과 + 변형 슬라이더 |
| `src/screens/guide/MyRecipesScreen.tsx` | 내 레시피 라이브러리 |
| `src/stores/customRecipeStore.ts` | Zustand: 내 레시피 CRUD |
| `app/guide/index.tsx` | 가이드 시작 라우트 |
| `app/guide/question.tsx` | 설문 라우트 |
| `app/guide/result.tsx` | 결과 라우트 |
| `app/profile/my-recipes.tsx` | 내 레시피 라우트 |
| `__tests__/recipeGuide.test.ts` | 추천 로직 단위 테스트 |

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `app/(tabs)/index.tsx` (HomeScreen) | 가이드 진입 카드 + 내 레시피 섹션 추가 |
| `src/types/index.ts` | CustomRecipe 타입 re-export |
| `src/lib/database.types.ts` | `custom_recipes` 테이블 타입 추가 |
| `src/services/supabaseService.ts` | `getMyRecipes`, `saveMyRecipe`, `deleteMyRecipe` 추가 |
| `src/screens/project/CreateProjectScreen.tsx` | URL 파라미터로 레시피 프리필 받도록 확장 |

### 건드리지 않음

- `.env`, `src/lib/supabase.ts`
- 시음 노트 관련 파일 (TastingNoteScreen, TasteProfileScreen)
- 기존 프리셋 레시피 (`presetRecipes.ts`)
- 인증/알림 관련 파일

### DB 마이그레이션

Supabase 대시보드 SQL Editor에서 실행 (섹션 3-7 참조).

---

## 6. 추천 로직 (순수 함수 시그니처)

```typescript
// src/utils/recipeGuide.ts

interface GuideAnswers {
  mood: MoodId;
  people: 'alone' | 'two' | 'small_group' | 'big_group';
  fruit: FruitId;
  herbs: HerbId[];           // 0~2개
  baseType: ProjectType;
  sweetness: 'light' | 'normal' | 'strong';
  drinkTiming: 'within_month' | 'two_three_months' | 'after_season';
  applyTasteProfile: boolean;
  tasteTypeTitle?: string;   // 프로필 반영 시 전달
}

interface GuideResult {
  name: string;              // "매실 × 로즈마리 × 시나몬"
  tagline: string;           // "조용한 겨울밤의 시그니처"
  baseType: ProjectType;
  baseAmountMl: number;      // 항상 500
  fruitId: FruitId;
  fruitAmountG: number;
  herbs: { id: HerbId; amountG: number }[];
  sugarG: number;
  durationDays: number;
  colorDescription: string;  // "은은한 호박색"
  brandColor: string;        // 과일에서 파생
}

// 답변에서 레시피 생성
function generateRecipe(answers: GuideAnswers): GuideResult;

// 분위기에 따라 필터링된 과일 목록
function getFruitsForMood(mood: MoodId, limit: number): Fruit[];

// 과일에 어울리는 허브 목록
function getHerbsForFruit(fruit: FruitId, limit: number): Herb[];

// 변형 슬라이더 값으로 레시피 재계산
function adjustRecipe(
  base: GuideResult,
  adjustments: {
    sweetness: number;    // 0~1, 0.5=기본
    aroma: number;        // 0~1, 0.5=기본
    strength: number;     // 0~1, 0=25도 / 0.5=30도 / 1=보드카
  }
): GuideResult;
```

---

## 7. 검증 전략

### 자동 검증
- `npx tsc --noEmit` — 타입 에러 0
- `npm run lint` — 에러 0
- `npm run architecture-check` — 통과
- `recipeGuide.test.ts` — 추천 로직 단위 테스트 통과

### 단위 테스트 시나리오
- 각 분위기별로 필터링된 과일 목록 검증
- 각 과일별로 추천 허브 순서 검증
- `generateRecipe`가 답변 조합에 대해 올바른 용량/기간 계산
- `adjustRecipe`의 슬라이더 경계값 (0, 0.5, 1) 처리
- 시음 프로필 반영 시 quantities 가산 확인

### 수동 검증
- [ ] 홈 탭에서 카드 탭 → 가이드 시작
- [ ] 7단계 진행 후 결과 화면 도달
- [ ] 변형 슬라이더 움직이면 용량 즉시 반영
- [ ] "이 레시피로 시작" → CreateProjectScreen에 값 프리필 확인
- [ ] "내 레시피 저장" → 내 레시피 라이브러리에서 확인
- [ ] 시음 데이터 반영 토글이 시음 노트 2개 이상일 때만 활성화
- [ ] 내 레시피에서 "프로젝트 시작" 가능
- [ ] 내 레시피 삭제 가능

---

## 8. 선행 조건

Supabase 대시보드 SQL Editor에서 마이그레이션 실행 (섹션 3-7 참조).

---

## 9. 향후 확장 가능성 (본 스펙 범위 외)

- 여러 번 담근 내 레시피에 "마스터" 배지
- 내 레시피를 친구에게 공유 (링크/코드)
- 가이드 재진입 시 지난 답변 일부 기억
- 계절 감지해서 제철 과일 우선 노출
