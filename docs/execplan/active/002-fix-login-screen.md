# ExecPlan: 로그인 화면 수정 (데모 로그인 제거 + 구글 로그인 리다이렉트 수정)

> **이 문서는 AI agent가 자율적으로 작업을 완료하기 위한 실행 계획서입니다.**

---

# Part A: 작업 지시

---

## 1. Purpose (목적)

- **배경**: 로그인 화면에 데모 로그인 버튼이 프로덕션에서도 노출되고 있고, 구글 로그인 후 리다이렉트 과정에서 localhost로 전달되어 로그인이 실패함
- **목표**: (1) 데모 로그인 버튼 비노출 (2) 구글 OAuth 리다이렉트 URI를 올바른 커스텀 스킴(`chuihyang://auth`)으로 고정
- **관련 이슈**: 없음

---

## 2. Big Picture (전체 맥락)

### 관련 모듈

- `screens/auth/LoginScreen.tsx`: 데모 로그인 버튼 렌더링
- `services/googleAuthService.ts`: 구글 OAuth 리다이렉트 URI 생성
- `components/common/DemoLoginButton.tsx`: 데모 로그인 컴포넌트 (파일 유지, import만 제거)

### 이 task 전후의 상태 변화

| | Before | After |
|---|--------|-------|
| 데모 로그인 | 로그인 화면에 노출 | 비노출 |
| 구글 OAuth redirect | `makeRedirectUri`가 환경에 따라 localhost 반환 가능 | 커스텀 스킴 `chuihyang://auth` 명시적 사용 |

---

## 3. Scope (범위)

### 수정 대상 파일

| 파일 경로 | 변경 유형 | 설명 |
|-----------|----------|------|
| `src/screens/auth/LoginScreen.tsx` | 수정 | DemoLoginButton import 및 렌더링 제거 |
| `src/services/googleAuthService.ts` | 수정 | `getRedirectUri()` — makeRedirectUri 대신 명시적 스킴 URI 사용 |

### 절대 건드리지 말 것

- `.env`
- `src/lib/supabase.ts`
- `app/_layout.tsx` (deep link 핸들러는 그대로 유지)
- `src/components/common/DemoLoginButton.tsx` (파일 자체는 유지)

---

## 4. Steps (작업 단계)

### Step 1: 데모 로그인 버튼 제거

- LoginScreen.tsx에서 DemoLoginButton import 제거
- DemoLoginButton 렌더링 JSX + 위의 socialGap 제거

### Step 2: 구글 OAuth 리다이렉트 URI 수정

- `getRedirectUri()`에서 non-Expo-Go 환경의 redirect URI를 `chuihyang://auth`로 명시
- `makeRedirectUri` 의존 제거

### Step 3: 빌드 및 전체 검증

- `npx tsc --noEmit` — TypeScript 에러 0개 확인
- `npm run lint` — ESLint 통과 확인
- `npm run architecture-check` — 아키텍처 규칙 통과 확인

---

## 5. Validation (검증 전략)

### 수동 검증

- [ ] 로그인 화면에서 데모 로그인 버튼이 보이지 않는지 확인
- [ ] 구글 로그인 시 OAuth 후 정상적으로 앱으로 리다이렉트되는지 확인

### 회귀 테스트

- [ ] `npx tsc --noEmit` 전체 통과
- [ ] `npm run lint` 전체 통과
- [ ] `npm run architecture-check` 전체 통과

---

## 6. Acceptance Criteria (인수 조건)

- [ ] 로그인 화면에 데모 로그인 버튼 비노출
- [ ] 구글 로그인 후 `chuihyang://auth`로 리다이렉트되어 정상 로그인 처리
- [ ] 기존 Apple 로그인, 이메일 로그인 기능 정상 동작 유지

---

## 7. Constraints & References (제약 사항 & 참고 자료)

### 제약 사항

- `AGENTS.md` 규칙 준수
- Supabase 대시보드에서 Redirect URLs에 `chuihyang://auth`가 등록되어 있어야 함 (코드 외 설정)

### 참고 자료

- `app.json`: scheme `chuihyang` 설정 확인
- `eas.json`: 빌드 프로파일 확인

---

# Part B: 실행 기록 (Agent 작성)

---

## 8. Progress (진행 상황)

| Step | 상태 | 비고 |
|------|------|------|
| Step 1 | - | - |
| Step 2 | - | - |
| Step 3 | - | - |
