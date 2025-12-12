# 🎯 배포 준비 완료 안내

**취향 앱의 배포 준비가 완료되었습니다!**

---

## ✅ 완료된 작업

### 1. ✓ 앱 설정 수정
- `app.json` - 번들 ID 변경 (`com.chuihyang.app`)
- iOS 권한 설명 문구 추가
- Android 권한 설정 추가
- Apple Sign In 플러그인 추가

### 2. ✓ EAS Build 설정
- `eas.json` 파일 생성
- Development, Preview, Production 프로필 구성
- Submit 설정 추가

### 3. ✓ Android Release 빌드 준비
- `generate-android-keystore.sh` (Mac/Linux용)
- `generate-android-keystore.bat` (Windows용)
- `android/app/build.gradle` - Release signing 설정 추가
- `android/gradle.properties.example` 생성

### 4. ✓ Apple Sign In 추가
- `src/services/appleAuthService.ts` 생성
- `src/components/common/AppleLoginButton.tsx` 생성
- `LoginScreen.tsx`에 Apple 로그인 버튼 통합
- iOS 필수 요구사항 충족 (소셜 로그인 제공 시 Apple 로그인 필수)

### 5. ✓ 환경 변수 설정 가이드
- `DEPLOYMENT_ENV_SETUP.md` - 상세 환경 변수 설정 가이드
- `.gitignore.deploy` - 보안 파일 목록

### 6. ✓ 법적 문서 템플릿
- `docs/PRIVACY_POLICY_TEMPLATE.md` - 개인정보 처리방침
- `docs/TERMS_OF_SERVICE_TEMPLATE.md` - 서비스 이용약관

### 7. ✓ 배포 가이드 문서
- `DEPLOYMENT_CHECKLIST.md` - 전체 배포 체크리스트
- `DEPLOYMENT_QUICKSTART.md` - 빠른 시작 가이드

---

## 🚀 다음 단계 (실제 배포 시작)

### 단계 1: 필수 패키지 설치
```bash
# expo-apple-authentication 설치
npm install expo-apple-authentication

# EAS CLI 설치 (아직 안 했다면)
npm install -g eas-cli
```

### 단계 2: 개발자 계정 생성
1. **Apple Developer** ($99/년)
   - https://developer.apple.com
   - 결제 및 승인 대기 (1-2일)

2. **Google Play Console** ($25 1회)
   - https://play.google.com/console
   - 결제 후 즉시 사용 가능

3. **Expo 계정** (무료)
   - https://expo.dev
   - 즉시 가입 가능

### 단계 3: EAS 프로젝트 초기화
```bash
# Expo 로그인
eas login

# 프로젝트 초기화
cd chuihyang
eas init

# 프로젝트 ID가 생성되면 app.json 업데이트
# extra.eas.projectId에 실제 ID 입력
```

### 단계 4: Supabase 프로덕션 설정
1. https://supabase.com 접속
2. 새 프로젝트 생성 (프로덕션용)
3. Settings → API에서:
   - Project URL 복사
   - anon public key 복사

### 단계 5: 환경 변수 등록
```bash
# EAS Secret 등록
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxxxx.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJhbG..."
eas secret:create --scope project --name EXPO_PUBLIC_APP_ENV --value "production"
eas secret:create --scope project --name EXPO_PUBLIC_DEBUG_MODE --value "false"

# 등록 확인
eas secret:list
```

### 단계 6: OAuth 설정

#### Google OAuth (Supabase)
1. Google Cloud Console → OAuth 2.0 Client ID 생성
2. Authorized redirect URIs 추가:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
3. Supabase Dashboard → Authentication → Providers → Google 설정

#### Apple Sign In (Supabase)
1. Apple Developer → Certificates, Identifiers & Profiles
2. Services ID 생성
3. Return URLs 추가:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
4. Supabase Dashboard → Authentication → Providers → Apple 설정

### 단계 7: 첫 빌드 실행
```bash
# iOS + Android 동시 빌드
eas build --platform all --profile production

# 또는 개별 빌드
eas build --platform ios --profile production
eas build --platform android --profile production
```

**빌드 시간:** 약 15-30분

### 단계 8: 법적 문서 호스팅
1. `docs/PRIVACY_POLICY_TEMPLATE.md` 열기
2. `[담당자 이름]`, `[이메일 주소]` 등을 실제 정보로 교체
3. `docs/TERMS_OF_SERVICE_TEMPLATE.md` 동일하게 수정
4. GitHub Pages, Vercel, Netlify 등에 호스팅
5. 공개 URL 확보

### 단계 9: 스토어 제출
- **iOS**: App Store Connect에서 앱 생성 및 빌드 제출
- **Android**: Google Play Console에서 앱 생성 및 AAB 업로드

**상세 가이드:** `DEPLOYMENT_CHECKLIST.md` 참고

---

## 📋 필요한 준비물 체크리스트

### 계정 및 도구
- [ ] Apple Developer 계정 ($99/년)
- [ ] Google Play Console 계정 ($25 1회)
- [ ] Expo 계정 (무료)
- [ ] EAS CLI 설치
- [ ] Supabase 프로덕션 프로젝트

### 앱 자료
- [ ] 앱 아이콘 (1024x1024, 현재: `assets/images/icon.png`)
- [ ] 스크린샷 5-8장 (다양한 화면 크기)
- [ ] 앱 설명 (짧은 + 긴 설명)
- [ ] Feature Graphic (Google Play, 1024x500)
- [ ] 홍보 영상 (선택사항)

### 법적 문서
- [ ] 개인정보 처리방침 (수정 완료 + 호스팅)
- [ ] 서비스 이용약관 (수정 완료 + 호스팅)

### 테스트
- [ ] 테스트 계정 2개 이상 생성
- [ ] 주요 기능 테스트 완료
- [ ] 다양한 기기에서 테스트 완료

---

## 📁 생성된 파일 목록

### 설정 파일
- `eas.json` - EAS Build 설정
- `app.json` - 앱 구성 (업데이트됨)
- `android/app/build.gradle` - Android 빌드 설정 (업데이트됨)
- `android/gradle.properties.example` - Gradle 속성 예시

### 스크립트
- `generate-android-keystore.sh` - Android 키스토어 생성 (Mac/Linux)
- `generate-android-keystore.bat` - Android 키스토어 생성 (Windows)

### 소스 코드
- `src/services/appleAuthService.ts` - Apple 로그인 서비스
- `src/components/common/AppleLoginButton.tsx` - Apple 로그인 버튼
- `src/screens/auth/LoginScreen.tsx` - 로그인 화면 (업데이트됨)

### 문서
- `DEPLOYMENT_CHECKLIST.md` - 전체 배포 체크리스트
- `DEPLOYMENT_QUICKSTART.md` - 빠른 시작 가이드
- `DEPLOYMENT_ENV_SETUP.md` - 환경 변수 설정 가이드
- `docs/PRIVACY_POLICY_TEMPLATE.md` - 개인정보 처리방침
- `docs/TERMS_OF_SERVICE_TEMPLATE.md` - 서비스 이용약관
- `.gitignore.deploy` - 보안 파일 목록

---

## ⚠️ 중요 보안 사항

### Git에 절대 커밋하면 안 되는 파일
```
.env
.env.production
*.keystore
*.jks
google-play-service-account.json
android/gradle.properties (실제 비밀번호 포함 시)
```

### 안전하게 보관해야 할 정보
1. **Android Release Keystore**
   - 파일: `android/app/chuihyang-release.keystore`
   - Store Password, Key Password
   - ⚠️ 분실 시 앱 업데이트 불가능!

2. **Apple 인증서**
   - EAS가 자동 관리하지만 백업 권장

3. **Google Play Service Account JSON**
   - 자동 배포 설정 시 필요

4. **Supabase Keys**
   - Service Role Key (절대 클라이언트 노출 금지)

---

## 🆘 문제 해결

### 빌드 실패 시
```bash
# 로그 확인
eas build:list
eas build:view [BUILD-ID]

# 캐시 클리어 후 재시도
eas build --clear-cache
```

### Apple Sign In 설정 문제
1. Apple Developer에서 Sign in with Apple 기능 활성화 확인
2. Bundle ID 일치 확인
3. Supabase Apple Provider 설정 확인

### Android 키스토어 문제
```bash
# Windows에서 실행
.\generate-android-keystore.bat

# Mac/Linux에서 실행
chmod +x generate-android-keystore.sh
./generate-android-keystore.sh
```

---

## 📞 지원

### 공식 문서
- **Expo 문서**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Apple Developer**: https://developer.apple.com/documentation/
- **Google Play**: https://developer.android.com/distribute

### 커뮤니티
- **Expo Discord**: https://chat.expo.dev
- **Expo Forums**: https://forums.expo.dev

---

## 🎉 배포 성공 후

### 출시 후 할 일
1. ✅ 앱 스토어에서 검색 확인
2. ✅ 첫 다운로드 및 설치 테스트
3. ✅ 사용자 리뷰 모니터링
4. ✅ 크래시 리포트 확인
5. ✅ 소셜 미디어 공유

### 정기 업데이트 계획
- 버그 수정: 즉시 패치
- 기능 개선: 2주마다
- 메이저 업데이트: 월 1회

---

**준비가 완료되었습니다! 🚀**

배포를 시작하려면 `DEPLOYMENT_QUICKSTART.md`를 참고하세요.
상세한 단계별 가이드는 `DEPLOYMENT_CHECKLIST.md`를 확인하세요.

**행운을 빕니다!** 🍀

