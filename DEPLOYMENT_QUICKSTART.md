# 🚀 배포 빠른 시작 가이드

**취향 앱을 최대한 빠르게 배포하는 방법**

---

## 📌 필수 사전 작업 (1일차)

### 1. 계정 생성
```bash
# 필요한 계정들
1. Apple Developer ($99/년) → https://developer.apple.com
2. Google Play Console ($25 1회) → https://play.google.com/console
3. Expo 계정 → https://expo.dev
```

### 2. EAS CLI 설치 및 로그인
```bash
npm install -g eas-cli
eas login
cd chuihyang
eas init
```

### 3. app.json 수정
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "여기에-실제-프로젝트-ID-입력"
      }
    },
    "owner": "여기에-expo-유저명-입력"
  }
}
```

---

## 🔐 환경 변수 설정 (1일차)

### Supabase 프로덕션 프로젝트 생성
1. https://supabase.com 접속
2. 새 프로젝트 생성
3. Settings → API에서 URL과 Key 확인

### EAS Secret 등록
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxxxx.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJhbG..."
eas secret:create --scope project --name EXPO_PUBLIC_APP_ENV --value "production"
eas secret:create --scope project --name EXPO_PUBLIC_DEBUG_MODE --value "false"
```

---

## 🔨 빌드 실행 (2일차)

### 첫 빌드
```bash
# iOS 빌드
eas build --platform ios --profile production

# Android 빌드
eas build --platform android --profile production

# 또는 동시에
eas build --platform all --profile production
```

**대기 시간:** 15-30분

---

## 📝 법적 문서 준비 (2일차)

### 1. 템플릿 수정
- `docs/PRIVACY_POLICY_TEMPLATE.md` 열기
- `[담당자 이름]`, `[이메일 주소]` 등을 실제 정보로 교체
- `docs/TERMS_OF_SERVICE_TEMPLATE.md` 동일하게 수정

### 2. 문서 호스팅 (간단한 방법)
```bash
# GitHub Pages 사용 예시
1. GitHub 저장소 생성
2. docs 폴더 업로드
3. Settings → Pages에서 활성화
4. URL 확인: https://yourusername.github.io/chuihyang/PRIVACY_POLICY_TEMPLATE.html
```

---

## 🍎 App Store 제출 (3일차)

### 1. App Store Connect 설정
1. https://appstoreconnect.apple.com 접속
2. **내 앱** → **+** → **새로운 앱**
3. 정보 입력:
   - 플랫폼: iOS
   - 이름: 취향
   - 주 언어: 한국어
   - 번들 ID: com.chuihyang.app
   - SKU: chuihyang-app-001

### 2. 스크린샷 촬영
```bash
# 시뮬레이터 실행
npx expo run:ios --device "iPhone 15 Pro Max"

# 스크린샷 캡처 (Cmd + S)
# 필요한 화면: 온보딩, 목록, 상세, 캘린더, 프로필
```

### 3. 앱 정보 입력
- 카테고리: **라이프스타일**
- 연령 등급: **만 19세 이상**
- 개인정보 처리방침 URL 입력
- 스크린샷 업로드 (최소 3장)
- 설명 입력 (DEPLOYMENT_CHECKLIST.md 참고)

### 4. 빌드 연결 및 제출
- TestFlight → 빌드 선택
- 심사용 정보 입력 (테스트 계정)
- **심사 제출** 클릭

---

## 🤖 Google Play 제출 (3일차)

### 1. Google Play Console 설정
1. https://play.google.com/console 접속
2. **앱 만들기**
3. 정보 입력:
   - 앱 이름: 취향
   - 기본 언어: 한국어 (대한민국)
   - 앱: 앱
   - 무료: 무료

### 2. 앱 콘텐츠 설정
- **개인정보 처리방침**: URL 입력
- **앱 액세스 권한**: 제한 없음 (또는 테스트 계정 제공)
- **광고**: 아니요
- **콘텐츠 등급**: IARC 설문 작성 → **만 19세 이상**
- **타겟층**: 성인

### 3. 스토어 등록정보
- **앱 이름**: 취향
- **짧은 설명**: 나만의 담금주를 체계적으로 관리하세요
- **전체 설명**: DEPLOYMENT_CHECKLIST.md 참고
- **앱 아이콘**: 512 x 512 PNG
- **Feature Graphic**: 1024 x 500 JPG/PNG
- **스크린샷**: 최소 2장 업로드

### 4. 프로덕션 출시
- **출시** → **프로덕션**
- **새 출시 만들기**
- EAS에서 빌드한 `.aab` 파일 업로드
- 출시 노트 작성:
  ```
  첫 출시 버전입니다.
  담금주 프로젝트를 체계적으로 관리할 수 있습니다.
  ```
- **검토 시작** 클릭

---

## ⚡ 시간 절약 팁

### 빌드 대기 중 할 일
- [ ] 스크린샷 촬영
- [ ] 앱 설명 작성
- [ ] 법적 문서 호스팅
- [ ] 테스트 계정 2개 생성

### 자동화 가능한 부분
```bash
# 빌드 + 제출 자동화
eas build --platform ios --profile production --auto-submit
eas build --platform android --profile production --auto-submit
```

### 병렬 작업
- iOS 빌드와 Android 빌드 동시 진행 ✅
- 빌드 대기 중 스토어 설정 진행 ✅
- 심사 대기 중 마케팅 자료 준비 ✅

---

## 🚨 자주하는 실수

### 1. 번들 ID 불일치
```bash
# 확인 필수
- app.json의 bundleIdentifier
- android/app/build.gradle의 applicationId
- App Store Connect의 Bundle ID
```

### 2. 테스트 계정 미제공
```
심사 거부 원인 1위!
반드시 2개 이상의 작동하는 테스트 계정 제공
```

### 3. 개인정보 처리방침 URL 누락
```
필수 항목! 없으면 심사 자동 거부
```

### 4. 만 19세 미만 접근 가능
```
주류 관련 앱은 반드시 연령 제한 설정
```

---

## 📅 예상 일정

| 단계 | 소요 시간 | 비고 |
|------|----------|------|
| 계정 생성 | 1-2시간 | 승인 대기 시간 별도 |
| 환경 설정 | 2-3시간 | Supabase 설정 포함 |
| 빌드 | 30분 | EAS 빌드 시간 |
| 스토어 준비 | 3-4시간 | 스크린샷, 설명 작성 |
| 심사 제출 | 30분 | |
| **심사 대기** | **1-7일** | Apple: 1-3일, Google: 3-7일 |
| **총 작업 시간** | **1-2일** | 실제 작업 시간 |

---

## ✅ 최소 요구사항 체크리스트

배포를 위한 최소한의 준비물:

- [ ] Apple Developer + Google Play Console 계정
- [ ] EAS 프로젝트 설정 완료
- [ ] 프로덕션 빌드 2개 (.ipa, .aab)
- [ ] 개인정보 처리방침 URL
- [ ] 앱 아이콘 (1024x1024)
- [ ] 스크린샷 최소 3장 (iOS), 2장 (Android)
- [ ] 앱 설명 (짧은 + 긴 설명)
- [ ] 테스트 계정 2개

---

## 🆘 문제 발생 시

### EAS 빌드 실패
```bash
# 로그 확인
eas build:list
eas build:view [BUILD-ID]

# 캐시 클리어 후 재시도
eas build --platform ios --profile production --clear-cache
```

### Apple 심사 거부
- App Store Connect에서 거부 사유 확인
- Resolution Center에서 대응
- 수정 후 재제출

### Google Play 거부
- Google Play Console에서 이메일 확인
- 지적 사항 수정 후 업데이트 업로드

---

## 📞 긴급 연락처

- **EAS 지원**: https://expo.dev/support
- **Apple 지원**: https://developer.apple.com/contact/
- **Google Play 지원**: https://support.google.com/googleplay/android-developer

---

**준비되셨나요? 지금 바로 시작하세요! 🚀**

```bash
# 첫 명령어
eas build --platform all --profile production
```

