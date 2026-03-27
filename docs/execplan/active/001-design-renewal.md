# ExecPlan: 디자인 리뉴얼 — 밝고 동글동글한 UI/UX

> **이 문서는 AI agent가 자율적으로 작업을 완료하기 위한 실행 계획서입니다.**

---

# Part A: 작업 지시

---

## 1. Purpose (목적)

- **배경**: 현재 앱은 다크/글래스모피즘 중심의 어둡고 무거운 디자인. 밝고 동글동글한 느낌으로 전면 교체 필요.
- **목표**: 
  - 라이트 모드 전용으로 단순화
  - 따뜻하고 밝은 색감 + 동글동글한 UI 컴포넌트
  - 각 담금주 레시피의 브랜드 컬러는 유지
  - UX 개선 (프로젝트 생성 흐름, 빈 상태, 진행률 시각화 등)

---

## 2. Big Picture (전체 맥락)

### Phase A: 기반 교체
- 디자인 컨셉 문서 작성 (`docs/DESIGN_GUIDE.md`)
- DESIGN_TOKENS.json 교체 (라이트 전용)
- ThemeContext 단순화 (다크 모드 제거)
- Colors.ts 단순화
- useThemedStyles 단순화

### Phase B: 프로토타이핑
- 로그인 화면 1개를 새 디자인으로 리뉴얼
- 방향 확인 후 나머지 화면에 적용

### Phase C: UX 개선
- 프로젝트 생성 스텝 위자드
- 빈 상태 개선
- 진행률 시각화 개선
- 빠른 기록 모드

### 영향 받는 파일 (약 24개)
- `src/` 하위 20개 파일에서 useThemedStyles/useThemeValues 사용 중
- `app/` 하위 4개 파일에서 사용 중
- `constants/Colors.ts`, `docs/DESIGN_TOKENS.json`

---

## 3. Scope (범위)

### Phase A 수정 대상

| 파일 경로 | 변경 유형 | 설명 |
|-----------|----------|------|
| `docs/DESIGN_GUIDE.md` | 신규 생성 | UI/UX 컨셉 + 디자인 가이드 문서 |
| `docs/DESIGN_TOKENS.json` | 전면 교체 | 라이트 전용, 밝고 따뜻한 색상 |
| `constants/Colors.ts` | 전면 교체 | 다크 모드 제거, 단순화 |
| `src/contexts/ThemeContext.tsx` | 전면 교체 | 다크/라이트 토글 제거, 라이트 전용 |
| `src/hooks/useThemedStyles.ts` | 수정 | ThemeMode 의존 제거, 단순화 |

### 절대 건드리지 말 것
- `.env` — 환경변수
- `src/services/` — 비즈니스 로직/API
- `src/stores/` — 상태 관리 로직
- `src/types/` — 타입 정의
- 레시피 브랜드 컬러 5종 (`presetRecipes.ts`의 brandColor 값)

---

## 4. Steps (작업 단계)

### Step 1: 디자인 가이드 문서 작성
docs/DESIGN_GUIDE.md — UI/UX 컨셉, 색상 팔레트, 타이포그래피, 컴포넌트 스타일 가이드

### Step 2: DESIGN_TOKENS.json 교체
라이트 전용, 밝고 따뜻한 색상으로 전면 교체

### Step 3: Colors.ts + ThemeContext + useThemedStyles 단순화
다크 모드 코드 제거, 라이트 전용으로 단순화

### Step 4: 로그인 화면 리뉴얼 (Phase B)
LoginScreen.tsx를 새 디자인 토큰 기반으로 리디자인

### Step 5: 나머지 화면 리뉴얼 (Phase B 확장)
방향 확인 후 모든 화면에 새 디자인 적용

### Step 6: UX 개선 (Phase C)
프로젝트 생성 흐름, 빈 상태, 진행률 등 개선

### Step 7: 빌드 및 전체 검증
npx tsc --noEmit, npm run lint, npm run architecture-check

---

# Part B: 실행 기록 (Agent 작성)

| Step | 상태 | 비고 |
|------|------|------|
| Step 1 | - | - |
| Step 2 | - | - |
| Step 3 | - | - |
| Step 4 | - | - |
| Step 5 | - | - |
| Step 6 | - | - |
| Step 7 | - | - |
