# 환경 변수 관리 가이드

이 프로젝트는 Expo 공개 환경변수(`EXPO_PUBLIC_` prefix)를 활용해 런타임 설정을 주입합니다. `src/config/env.ts`에서 Zod 스키마로 필수 값을 검증하며, 값이 빠져 있거나 형식이 잘못된 경우 앱 실행 시 경고를 출력합니다.

## 1. 로컬 개발용 `.env` 생성

1. 예시 파일을 복사합니다.

   ```bash
   cp env.example .env
   ```

2. 아래 값을 실제 Supabase 프로젝트 정보로 교체합니다.
   - `EXPO_PUBLIC_SUPABASE_URL`: `https://<project-ref>.supabase.co` 형식의 REST URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase 콘솔 → **Project Settings → API → Project API keys** 에서 확인 가능한 anon key

Expo는 `.env`의 값을 빌드 시점에 사용하므로, 변경 후에는 `expo start --clear`로 캐시를 비우는 것이 안전합니다.

## 2. CI/EAS 빌드 환경 변수 주입

- EAS Build/Submit을 사용할 경우 [`eas secret`](https://docs.expo.dev/eas/secrets/) 명령으로 동일한 키를 등록하세요.
- `EXPO_PUBLIC_` prefix가 붙은 값은 번들에 포함되므로 민감한 서버 키는 사용하지 말고, 비공개 키가 필요한 경우 Secure Store나 서버 프록시를 활용하세요.

## 3. 런타임 검증 동작

- `src/config/env.ts`에서 Supabase URL/Key 형식을 검사합니다.
- 값이 비어 있거나 형식이 맞지 않을 경우 콘솔에 경고가 찍히며, `SupabaseService.deleteAccount`처럼 민감한 경로에서는 `requireSupabaseEnv()`가 명시적으로 오류를 발생시켜 잘못된 배포를 빠르게 감지할 수 있습니다.
- `supabase` 클라이언트는 기본값으로 placeholder를 사용해 앱이 완전히 크래시 나는 것을 방지하지만, API 호출은 실패합니다. 실제 서비스를 위해서는 필수 변수를 반드시 채워야 합니다.

## 4. 추가 공개 환경변수 사용 시 주의점

- 앱 코드에서 바로 접근해야 하는 값만 `EXPO_PUBLIC_` prefix로 선언합니다.
- iOS/Android 빌드 시 값이 그대로 포함되므로, 사용자에게 노출돼도 문제없는 값인지 다시 확인하세요.
- 민감한 값이 필요한 경우 서버에서 값을 내려주는 API를 구현하거나, Expo Secure Store 등을 사용해 런타임에 주입하세요.
