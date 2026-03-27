# ExecPlan: [기능명]

> **이 문서는 AI agent가 자율적으로 작업을 완료하기 위한 실행 계획서입니다.**

---

# Part A: 작업 지시 (엔지니어 작성)

---

## 1. Purpose (목적)

- **배경**: [왜 이 기능이 필요한가?]
- **목표**: [구체적으로 달성할 것]
- **관련 이슈**: [GitHub Issue 번호 또는 없음]

---

## 2. Big Picture (전체 맥락)

### 관련 도메인/모듈

- `screens/[domain]`: [설명]
- `services/[service]`: [설명]
- `stores/[store]`: [설명]

### 데이터 흐름

```
[User Action] → Screen → Store.action()
  → Service.method() → Supabase
  → 결과 반환 → Store 상태 업데이트 → UI 리렌더링
```

### 이 task 전후의 상태 변화

| | Before | After |
|---|--------|-------|
| [항목1] | [현재 상태] | [변경 후 상태] |
| [항목2] | [현재 상태] | [변경 후 상태] |

---

## 3. Scope (범위)

### 수정 대상 파일

| 파일 경로 | 변경 유형 | 설명 |
|-----------|----------|------|
| `src/types/index.ts` | 수정 | [변경 내용] |
| `src/screens/[domain]/[Screen].tsx` | 신규 생성 | [설명] |

### 절대 건드리지 말 것

- `.env` — 환경변수 파일
- `src/lib/supabase.ts` — Supabase 클라이언트 설정
- [기타 보호 대상 파일]

### 설계 결정

- **[결정 사항]**: [이유]
- **[결정 사항]**: [이유]

---

## 4. Steps (작업 단계)

### Step 1: [목표]

**목표**: [구체적 목표]
**상세**:
- [세부 작업 1]
- [세부 작업 2]

### Step 2: [목표]

**목표**: [구체적 목표]
**상세**:
- [세부 작업 1]
- [세부 작업 2]

### Step N: 빌드 및 전체 검증

**상세**:
- `npx tsc --noEmit` — TypeScript 에러 0개 확인
- `npm run lint` — ESLint 통과 확인
- `npm run format:check` — Prettier 포맷 확인
- `npm run architecture-check` — 아키텍처 규칙 통과 확인

---

## 5. Validation (검증 전략)

### 단위 테스트

- [ ] [테스트 시나리오 1]
- [ ] [테스트 시나리오 2]

### 수동 검증

- [ ] [화면 동작 확인 1]
- [ ] [화면 동작 확인 2]

### 회귀 테스트

- [ ] `npx tsc --noEmit` 전체 통과
- [ ] `npm run lint` 전체 통과
- [ ] `npm run architecture-check` 전체 통과

---

## 6. Acceptance Criteria (인수 조건)

- [ ] [사용자 관점에서의 완료 조건 1]
- [ ] [사용자 관점에서의 완료 조건 2]
- [ ] 기존 기능 정상 동작 유지

---

## 7. Constraints & References (제약 사항 & 참고 자료)

### 제약 사항

- `AGENTS.md` 규칙 준수
- [기타 제약 사항]

### 참고 자료

- `src/[참고파일경로]`: [참고 이유]
- [외부 문서 링크]

---

# Part B: 실행 기록 (Agent 작성)

---

## 8. Progress (진행 상황)

| Step | 상태 | 시작 시간 | 완료 시간 | 비고 |
|------|------|----------|----------|------|
| Step 1 | - | - | - | - |
| Step 2 | - | - | - | - |

---

## 9. Surprises & Discoveries (예상 밖 발견)

- [작업 중 발견된 예상 밖 사항]

---

## 10. Decision Log (결정 기록)

| 시점 | 결정 | 대안 | 이유 |
|------|------|------|------|
| [시점] | [결정] | [대안] | [이유] |

---

## 11. Outcomes (결과물)

### 변경 요약

| 파일 경로 | 변경 유형 | 변경 내용 요약 |
|-----------|----------|---------------|
| | | |

### 메트릭

- 추가된 테스트: N개
- TypeScript 에러: 0개
- ESLint: 통과
- Architecture check: 통과

---

## 12. Retrospective (회고)

### 잘된 점

- [항목]

### 개선할 점

- [항목]

### 다음 task를 위한 제안

- [항목]
