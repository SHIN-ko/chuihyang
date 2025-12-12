# 배포 환경 변수 설정 가이드

## 1. 로컬 개발 환경 설정

### 단계 1: 환경 변수 파일 생성
```bash
# 개발용
cp .env.example .env

# 프로덕션용 (로컬 테스트)
cp .env.production.example .env.production
```

### 단계 2: 실제 값으로 교체
`.env` 파일을 열고 다음 값들을 입력하세요:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 2. Supabase 설정

### Supabase 프로젝트 생성
1. [Supabase](https://supabase.com) 접속
2. 새 프로젝트 생성 (개발용 / 프로덕션용 분리 권장)
3. Settings → API에서 다음 정보 확인:
   - Project URL → `EXPO_PUBLIC_SUPABASE_URL`
   - anon public key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Google OAuth 설정 (Supabase)
1. Supabase Dashboard → Authentication → Providers
2. Google 활성화
3. Google Cloud Console에서:
   - OAuth 2.0 Client ID 생성
   - Authorized redirect URIs 추가:
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     ```
4. Client ID와 Secret을 Supabase에 입력

### Apple Sign In 설정 (Supabase)
1. Supabase Dashboard → Authentication → Providers
2. Apple 활성화
3. Apple Developer에서:
   - Services ID 생성
   - Sign in with Apple 구성
   - Return URLs 추가:
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     ```
4. Services ID와 Key를 Supabase에 입력

## 3. EAS Build 환경 변수 설정

### 방법 1: EAS Secret 사용 (권장)
```bash
# Supabase URL 설정
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxxxx.supabase.co"

# Supabase Key 설정
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJhbGciOiJIUz..."

# 다른 환경 변수들도 동일하게 추가
eas secret:create --scope project --name EXPO_PUBLIC_APP_ENV --value "production"
eas secret:create --scope project --name EXPO_PUBLIC_DEBUG_MODE --value "false"
```

### 시크릿 확인
```bash
eas secret:list
```

### 방법 2: eas.json에서 환경 변수 참조
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_APP_ENV": "production",
        "EXPO_PUBLIC_DEBUG_MODE": "false"
      }
    }
  }
}
```

## 4. 프로덕션 체크리스트

### 배포 전 확인사항
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 프로덕션 Supabase 프로젝트 생성 완료
- [ ] Google OAuth 프로덕션 클라이언트 ID 발급
- [ ] Apple Sign In Services ID 발급
- [ ] EAS 프로젝트에 모든 시크릿 등록
- [ ] `EXPO_PUBLIC_DEBUG_MODE=false` 설정
- [ ] Supabase RLS (Row Level Security) 정책 설정
- [ ] Supabase Storage 정책 설정

### 보안 권장사항
1. **절대 커밋하지 말 것:**
   - `.env` 파일
   - 키스토어 파일
   - Google Play Service Account JSON
   - iOS 인증서/프로비저닝 프로파일

2. **Supabase 보안:**
   - RLS 정책 반드시 활성화
   - anon key는 공개되어도 되지만 RLS로 보호
   - service_role key는 절대 클라이언트에 노출 금지

3. **API Key 관리:**
   - 개발/프로덕션 환경 분리
   - 정기적으로 키 로테이션
   - 의심되는 경우 즉시 재발급

## 5. 환경별 빌드 명령어

### 개발 빌드
```bash
# 개발 환경 변수 사용
eas build --profile development --platform ios
eas build --profile development --platform android
```

### 프로덕션 빌드
```bash
# 프로덕션 환경 변수 사용 (EAS Secret에서 자동 주입)
eas build --profile production --platform ios
eas build --profile production --platform android
```

### 로컬에서 프로덕션 환경 테스트
```bash
# .env.production 파일 사용
EXPO_PUBLIC_ENV=production npx expo start
```

## 6. 트러블슈팅

### 환경 변수가 undefined로 나오는 경우
1. `EXPO_PUBLIC_` 접두사가 있는지 확인
2. 앱 재시작 (캐시 클리어)
   ```bash
   npx expo start -c
   ```
3. EAS Secret이 제대로 설정되었는지 확인
   ```bash
   eas secret:list
   ```

### Supabase 연결 실패
1. URL과 Key가 정확한지 확인
2. 네트워크 연결 확인
3. Supabase 프로젝트가 활성 상태인지 확인
4. RLS 정책이 너무 제한적이지 않은지 확인

### Google/Apple 로그인 실패
1. OAuth Redirect URI가 올바른지 확인
2. 번들 ID/패키지명이 OAuth 설정과 일치하는지 확인
3. iOS: Apple Developer에서 Sign in with Apple 기능 활성화 확인
4. Android: SHA-1 fingerprint가 Google Console에 등록되어 있는지 확인

## 7. 참고 자료

- [Expo 환경 변수 가이드](https://docs.expo.dev/guides/environment-variables/)
- [EAS Build Secrets](https://docs.expo.dev/build-reference/variables/)
- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Google OAuth 설정](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Apple Sign In 설정](https://supabase.com/docs/guides/auth/social-login/auth-apple)

