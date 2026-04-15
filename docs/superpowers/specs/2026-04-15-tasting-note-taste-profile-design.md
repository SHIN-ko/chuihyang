# Design Spec: 시음 노트 & 취향 프로필

> 완성된 담금주에 대한 시음 기록과, 전체 시음 데이터를 기반으로 한 사용자 취향 프로필 기능

---

## 1. 목적

- 완료된 프로젝트에 시음 노트(6차원 평가 + 색상 + 메모)를 기록
- 모든 시음 데이터를 집계하여 "나의 취향 프로필"을 시각화
- 앱 이름 "취향"과 브랜드 아이덴티티를 기능으로 완성

---

## 2. 데이터 모델

### 2-1. TastingNote 인터페이스

```typescript
interface TastingNote {
  ratings: {
    taste: number;       // 맛 (1-5)
    aroma: number;       // 향 (1-5)
    appearance: number;  // 외관 (1-5)
    body: number;        // 바디감 (1-5)
    finish: number;      // 여운 (1-5)
    overall: number;     // 전체 (1-5)
  };
  color: string;         // 색상 설명 ("깊은 호박색")
  memo: string;          // 자유 시음 메모
  tastingDate: string;   // 시음 날짜 (ISO string, e.g. "2026-04-15")
  createdAt: string;     // 생성 시각 (ISO string)
  updatedAt: string;     // 수정 시각 (ISO string)
}
```

### 2-2. Project 인터페이스 확장

```typescript
interface Project {
  // ... 기존 필드
  tastingNote?: TastingNote | null;  // 추가
}
```

### 2-3. DB 마이그레이션

```sql
ALTER TABLE projects ADD COLUMN tasting_note JSONB DEFAULT NULL;
```

- `NULL` = 시음 노트 미작성
- JSONB 값 존재 = 작성 완료
- 기존 projects RLS 정책 그대로 적용 (추가 정책 불필요)
- Supabase 대시보드 SQL Editor에서 직접 실행

### 2-4. database.types.ts 변경

projects Row/Insert/Update 타입에 `tasting_note: Json | null` 추가.

---

## 3. 화면 구성

### 3-1. 취향 탭 화면 (TasteProfileScreen)

**위치**: 하단 탭 바 — 홈 / **취향** / 캘린더 / 프로필
**아이콘**: `wine-outline` (Ionicons)
**라우트**: `app/(tabs)/taste.tsx`

**스크롤 구성** (위에서 아래):

#### (A) 나의 취향 레이더 차트
- 완료 프로젝트들의 tasting_note ratings 평균으로 6차원 레이더 차트 렌더링
- 기존 `RadarChart` 컴포넌트 재사용
- 색상: 앰버 브랜드 컬러 `#D4A574`
- 크기: 200px
- 시음 노트 0개일 때 빈 상태 UI: "첫 담금주를 완성하고 시음 노트를 남겨보세요"

#### (B) 취향 유형 분석
- **캐치프레이즈**: 상위 2개 차원 조합으로 결정 (섹션 4 참조)
- **한 줄 설명**: 유형에 대한 부연 설명
- **세부 통계**:
  - 총 시음 횟수
  - 평균 전체 평점 (N.N / 5.0)
  - 가장 높은 항목 ("향 평균 4.3")
  - 가장 낮은 항목 ("외관 평균 3.1")
  - 가장 많이 담근 레시피 ("파친코 3회")

#### (C) 프로젝트별 시음 카드 리스트
- 필터: `status === 'completed'` && `tastingNote !== null`
- 카드 구성:
  - 좌측: 레시피 브랜드 컬러 바 (4px)
  - 프로젝트명 + 시음 날짜
  - 미니 레이더 차트 (size: 80px)
  - overall 점수 표시
- 카드 탭 → `project/[id]` (프로젝트 상세)로 이동
- 시음 노트 없는 완료 프로젝트 → 별도 섹션 "시음 노트를 남겨보세요" 카드 (탭 시 시음 노트 작성 화면으로 이동)

#### 데이터 부족 시 처리
- 시음 노트 0개: 빈 상태 UI만 표시
- 시음 노트 1개: 레이더 차트 + 캐치프레이즈 표시, 통계 영역에 "더 많은 시음 기록이 쌓이면 정확한 분석이 가능해요" 안내
- 시음 노트 2개 이상: 전체 기능 활성화

### 3-2. 시음 노트 작성/수정 화면 (TastingNoteScreen)

**진입점**: 완료된 프로젝트 상세 화면 → "시음 노트 작성" 버튼
**라우트**: `app/project/tasting-note/[projectId].tsx`

**화면 구성** (스크롤):

1. **프로젝트 정보 헤더**
   - 프로젝트명, 레시피 이름, 브랜드 컬러 액센트
   - 담금 기간 (시작일 ~ 완료일)

2. **평가 섹션**
   - 6개 `StarRating` 입력 (맛/향/외관/바디감/여운/전체)
   - 기존 `StarRating` 컴포넌트 재사용
   - 1개라도 입력 시 실시간 `RadarChart` 미리보기 표시

3. **색상 설명**
   - TextInput, placeholder: "연한 황금색, 맑은 호박색 등"

4. **자유 메모**
   - TextInput (multiline), placeholder: "맛, 느낌, 함께 마신 사람 등 자유롭게 기록하세요"

5. **시음 날짜**
   - DateTimePicker, 기본값: 오늘

6. **저장 버튼**
   - Primary 버튼 ("시음 노트 저장")
   - 저장 후 프로젝트 상세로 복귀

**수정 모드**: 이미 tastingNote가 있으면 기존 데이터 로드, 버튼 텍스트 "시음 노트 수정"

### 3-3. 프로젝트 상세 화면 변경 (ProjectDetailScreen)

- `project.status === 'completed'` 일 때 버튼 추가:
  - tastingNote 없음 → "시음 노트 작성" 버튼 (accent 스타일)
  - tastingNote 있음 → 시음 노트 요약 카드 (레이더 차트 + 메모) + "수정" 버튼

---

## 4. 취향 유형 분석 로직

### 4-1. 파일 위치

`src/utils/tasteAnalysis.ts` — 순수 함수, 외부 의존성 없음

### 4-2. 캐치프레이즈 결정 규칙

6개 차원의 평균 점수를 계산한 후, 상위 2개 항목 조합으로 유형을 결정:

| 상위 2개 항목 | 유형명 | 설명 |
|---------------|--------|------|
| 향(aroma) + 여운(finish) | "여운을 음미하는 감성가" | 향과 뒷맛의 깊이를 중시하는 섬세한 취향 |
| 맛(taste) + 바디감(body) | "풍미를 추구하는 미식가" | 강렬하고 묵직한 맛을 선호하는 대담한 취향 |
| 외관(appearance) + 향(aroma) | "오감으로 즐기는 탐험가" | 보는 즐거움과 향의 조화를 추구하는 취향 |
| 맛(taste) + 여운(finish) | "깊이를 탐구하는 감별사" | 첫 맛부터 끝 맛까지 전체 여정을 중시하는 취향 |
| 바디감(body) + 여운(finish) | "무게감을 아는 감식가" | 묵직한 질감과 긴 여운을 사랑하는 취향 |
| 그 외 조합 | "자신만의 취향을 만드는 양조가" | 균형 잡힌 시선으로 담금주를 즐기는 취향 |

매칭 순서: 위 테이블 순서대로 우선 매칭 (첫 번째 매치 반환).

### 4-3. 세부 통계 계산

```typescript
interface TasteStats {
  totalTastings: number;
  averageOverall: number;
  highestDimension: { label: string; average: number };
  lowestDimension: { label: string; average: number };
  favoriteRecipe: { name: string; count: number } | null;
}
```

### 4-4. 함수 시그니처

```typescript
// 전체 취향 프로필 레이더 차트 데이터
function calculateAverageRatings(projects: Project[]): { label: string; value: number }[];

// 취향 유형 분석
function analyzeTasteType(projects: Project[]): { title: string; description: string } | null;

// 세부 통계
function calculateTasteStats(projects: Project[]): TasteStats;
```

모든 함수는 `tastingNote`가 있는 완료 프로젝트만 필터링하여 계산.

---

## 5. 파일 변경 목록

### 새로 생성

| 파일 | 역할 |
|------|------|
| `app/(tabs)/taste.tsx` | 취향 탭 라우트 엔트리 |
| `src/screens/taste/TasteProfileScreen.tsx` | 취향 탭 메인 화면 |
| `app/project/tasting-note/[projectId].tsx` | 시음 노트 라우트 엔트리 |
| `src/screens/taste/TastingNoteScreen.tsx` | 시음 노트 작성/수정 화면 |
| `src/utils/tasteAnalysis.ts` | 취향 유형 분석 순수 함수 |

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `app/(tabs)/_layout.tsx` | "취향" 탭 추가 (홈과 캘린더 사이, wine-outline 아이콘) |
| `src/types/index.ts` | `TastingNote` 인터페이스 추가, `Project`에 `tastingNote?: TastingNote \| null` 추가 |
| `src/lib/database.types.ts` | projects Row/Insert/Update에 `tasting_note` 컬럼 추가 |
| `src/services/supabaseService.ts` | `saveTastingNote(projectId, note)` 함수 추가 |
| `src/stores/projectStore.ts` | `saveTastingNote` 액션 추가 |
| `src/screens/project/ProjectDetailScreen.tsx` | 완료 프로젝트에 시음 노트 작성/보기 버튼 및 요약 카드 추가 |

### 건드리지 않음

- `.env`, `src/lib/supabase.ts`
- `src/components/common/RadarChart.tsx` (그대로 재사용)
- `src/components/common/StarRating.tsx` (그대로 재사용)
- 인증/알림 관련 파일 전부
- `app/_layout.tsx`

---

## 6. 디자인 원칙

기존 `DESIGN_GUIDE.md` 준수:
- 배경: `#FFFBF5` (크림색)
- 카드: `#FFFFFF`, borderRadius 20px, shadow soft
- 액센트: `#D4A574` (앰버)
- 프로젝트 카드에 레시피 브랜드 컬러 반영
- 아이콘: Ionicons `-outline` 변형
- 빈 상태 UI: 따뜻한 톤의 안내 문구 + CTA

---

## 7. 검증 전략

### 자동 검증
- `npx tsc --noEmit` — TypeScript 에러 0개
- `npm run lint` — ESLint 에러 0개
- `npm run architecture-check` — 아키텍처 규칙 통과

### 수동 검증
- [ ] 완료된 프로젝트에서 시음 노트 작성 → 저장 → 재진입 시 데이터 유지
- [ ] 시음 노트 수정 정상 동작
- [ ] 취향 탭에서 레이더 차트, 캐치프레이즈, 통계 정상 표시
- [ ] 시음 노트 0/1/2개 이상일 때 각각 올바른 UI 표시
- [ ] 프로젝트 상세에서 시음 노트 요약 카드 정상 표시
- [ ] 기존 기능(홈, 캘린더, 프로필, 프로젝트 CRUD) 정상 동작 유지

---

## 8. 선행 조건

코드 구현 전에 Supabase 대시보드에서 마이그레이션 실행 필요:

```sql
ALTER TABLE projects ADD COLUMN tasting_note JSONB DEFAULT NULL;
```
