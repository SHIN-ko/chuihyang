# AGENTS.md — 취향 (Chuihyang) AI Agent 가이드

> **이 문서는 AI agent가 취향 앱 코드베이스에서 작업할 때 반드시 따라야 하는 규칙입니다.**

---

## 1. 프로젝트 개요

- **앱 이름**: 취향 (Chuihyang) — 담금주 프로젝트 관리 앱
- **스택**: Expo SDK 55, React Native 0.83.2, React 19.2, TypeScript 5.9, Supabase, Zustand, Zod v4
- **워크플로우**: Expo Managed Workflow (ios/, android/ 폴더 없음)
- **패키지 매니저**: npm (`--legacy-peer-deps` 사용 금지)

---

## 2. 아키텍처

### 디렉토리 구조

```
src/
├── components/       # 재사용 가능한 UI 컴포넌트
│   └── common/       # 공통 컴포넌트 (Button, ImageUpload, RadarChart 등)
├── config/           # 환경변수, 설정 (env.ts)
├── contexts/         # React Context (필요 시)
├── data/             # 정적 데이터 (presetRecipes.ts)
├── hooks/            # 커스텀 React hooks
├── lib/              # 외부 라이브러리 설정 (supabase client, database.types.ts)
├── screens/          # 화면 컴포넌트
│   ├── auth/         # 인증 관련 (Login, Signup, Onboarding)
│   ├── calendar/     # 캘린더
│   ├── profile/      # 프로필, 알림 설정
│   └── project/      # 프로젝트 CRUD, 진행 로그
├── services/         # 외부 API/SDK 통신 (supabaseService, notificationService)
├── stores/           # Zustand 상태 관리
├── types/            # TypeScript 타입 정의
└── utils/            # 유틸리티 함수
```

### 레이어 의존 방향 (중요)

```
screens → stores → services → lib
screens → components
screens → hooks
screens → utils
stores → services (직접 호출 허용)
services → lib (Supabase client)
types ← 모든 레이어에서 import 가능
config ← 모든 레이어에서 import 가능
data ← screens, components에서 import 가능
```

### 의존성 규칙 (ArchUnit 대응)

| 금지 | 이유 |
|------|------|
| `components/` → `stores/` | 컴포넌트는 순수 UI. Store 접근은 screens에서만 |
| `components/` → `services/` | 컴포넌트가 직접 API 호출 금지 |
| `services/` → `stores/` | 서비스는 상태에 의존하지 않음 |
| `utils/` → `stores/` | 유틸리티는 순수 함수 |
| `utils/` → `services/` | 유틸리티는 외부 의존성 없음 |
| `types/` → 다른 레이어 | 타입은 순수 정의만 포함 |

---

## 3. 코드 스타일

### TypeScript

- **strict mode 필수** (`tsconfig.json`에서 활성화됨)
- `as any`, `@ts-ignore`, `@ts-expect-error` **절대 금지**
- 모든 함수 파라미터와 반환값에 타입 명시 (단, JSX 반환은 생략 가능)
- `interface` 선호 (`type`은 union/intersection에만 사용)
- Optional chaining(`?.`)과 nullish coalescing(`??`) 적극 사용

### 네이밍

| 대상 | 컨벤션 | 예시 |
|------|--------|------|
| 파일 (컴포넌트) | PascalCase | `RadarChart.tsx` |
| 파일 (유틸/훅) | camelCase | `useAuth.ts`, `validation.ts` |
| 컴포넌트 | PascalCase | `StarRating` |
| 함수/변수 | camelCase | `fetchProjects` |
| 상수 | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 타입/인터페이스 | PascalCase | `ProjectStatus` |
| Zustand store | `use[Name]Store` | `useProjectStore` |

### 금지 사항

| 금지 | 대안 |
|------|------|
| `console.log()` (디버깅 잔류) | 커밋 전 제거. 필요 시 `__DEV__ && console.log()` |
| `any` 타입 | 구체적 타입 정의 |
| 인라인 스타일 남발 | `StyleSheet.create()` 사용 |
| 하드코딩된 색상값 | `data/presetRecipes.ts` 또는 상수 파일 참조 |
| `export default` | `export const` / `export function` (named export 선호) |
| `var` 키워드 | `const` / `let` |

### Import 순서

```typescript
// 1. React / React Native
import React from 'react';
import { View, Text } from 'react-native';

// 2. 외부 라이브러리
import { create } from 'zustand';
import { z } from 'zod';

// 3. 내부 모듈 (@/ alias)
import { Project } from '@/src/types';
import { useProjectStore } from '@/src/stores/projectStore';
import { SupabaseService } from '@/src/services/supabaseService';

// 4. 상대 경로
import { StarRating } from './StarRating';
```

---

## 4. 상태 관리 (Zustand)

- Store는 `src/stores/` 에 위치
- Store 파일명: `[domain]Store.ts` (예: `projectStore.ts`, `authStore.ts`)
- 비동기 액션은 Store 내부에서 `try/catch` + `isLoading` 관리
- Store 간 참조: `useAuthStore.getState()` 패턴 사용 (구독 없이 1회 읽기)

---

## 5. Supabase 서비스

- 모든 DB 접근은 `src/services/supabaseService.ts`를 통해서만
- 직접 `supabase.from()` 호출은 서비스 파일 내부에서만
- Row → App Type 변환은 `transform*` 함수로 (예: `transformProjectRowToProject`)
- 에러 처리: Supabase 에러를 catch 후 의미있는 메시지로 re-throw

---

## 6. 새 기능 추가 체크리스트

1. **타입 정의** — `src/types/index.ts`에 인터페이스 추가
2. **DB 타입** — `src/lib/database.types.ts` 업데이트 (Supabase 컬럼 추가 시)
3. **서비스 함수** — `src/services/supabaseService.ts`에 CRUD 함수 추가
4. **Store 액션** — 해당 Store에 비동기 액션 추가
5. **화면 구현** — `src/screens/[domain]/` 에 화면 컴포넌트 생성
6. **공통 컴포넌트** — 재사용 가능하면 `src/components/common/`에 분리
7. **라우팅** — `app/` 디렉토리에 Expo Router 파일 추가
8. **검증** — `npx tsc --noEmit` 에러 0개 확인
9. **린트** — `npm run lint` 통과 확인

---

## 7. 테스트

- 테스트 프레임워크: Jest + jest-expo
- 테스트 파일: `__tests__/` 디렉토리 또는 `*.test.ts(x)` 
- 타임존: `TZ=UTC` 환경에서 실행
- React 19 + react-test-renderer 호환성 이슈 존재 (기존 문제)

---

## 8. 빌드 & 배포

- **빌드**: `eas build --platform [ios|android]`
- **버전 관리**: `appVersionSource: "remote"`, `autoIncrement: true`
- **OTA 업데이트**: JS 코드만 변경 시 `eas update` 사용 가능
- **커밋 금지 파일**: `.env`, `*.jks`, `credentials.json`, `google-play-service-account.json`, `*.p8`

---

## 9. ExecPlan 워크플로우

모든 기능 개발은 ExecPlan 문서를 먼저 작성한 후 진행합니다.

### 흐름

```
1. docs/execplan/active/ 에 ExecPlan 작성
2. ExecPlan의 Steps를 순서대로 구현
3. 각 Step 완료 시 Progress 기록
4. 모든 Step 완료 + 검증 통과
5. ExecPlan을 docs/execplan/archive/ 로 이동
6. 커밋 & PR 생성
```

### 규칙

- ExecPlan 없이 기능 구현 **금지**
- Step은 atomic하게 분리 (하나의 Step = 하나의 관심사)
- 수정 대상 파일과 절대 건드리지 말 것을 명시
- Validation 체크리스트 필수
- 완료 후 Retrospective 작성
