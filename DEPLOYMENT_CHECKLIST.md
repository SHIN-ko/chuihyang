# 🚀 취향 앱 배포 종합 체크리스트

이 문서는 **취향 (Chuihyang)** 앱을 App Store와 Google Play Store에 배포하기 위한 단계별 체크리스트입니다.

---

## 📋 목차
1. [사전 준비 (필수)](#1-사전-준비-필수)
2. [개발자 계정 준비](#2-개발자-계정-준비)
3. [법적 문서 준비](#3-법적-문서-준비)
4. [앱 설정 및 빌드](#4-앱-설정-및-빌드)
5. [스토어 리스팅 준비](#5-스토어-리스팅-준비)
6. [테스트 및 QA](#6-테스트-및-qa)
7. [심사 제출](#7-심사-제출)
8. [출시 후 모니터링](#8-출시-후-모니터링)

---

## 1. 사전 준비 (필수)

### 1.1 계정 및 도구 설치
- [ ] Apple Developer Account 가입 ($99/년)
  - URL: https://developer.apple.com
- [ ] Google Play Console 계정 가입 ($25 1회)
  - URL: https://play.google.com/console
- [ ] Expo 계정 생성
  - URL: https://expo.dev
- [ ] EAS CLI 설치
  ```bash
  npm install -g eas-cli
  eas login
  ```

### 1.2 Expo 프로젝트 설정
- [ ] EAS 프로젝트 연동
  ```bash
  cd chuihyang
  eas init
  ```
- [ ] `app.json`의 `extra.eas.projectId` 업데이트
- [ ] `app.json`의 `owner` 필드에 Expo 유저명 입력

### 1.3 번들 식별자 결정
- [ ] iOS: `com.chuihyang.app` (또는 실제 도메인)
- [ ] Android: `com.chuihyang.app`
- [ ] `app.json`, `android/app/build.gradle` 업데이트 확인

---

## 2. 개발자 계정 준비

### 2.1 Apple Developer
- [ ] Apple Developer Program 가입 완료
- [ ] App Store Connect 접속 확인
- [ ] 새 앱 등록 (Bundle ID: `com.chuihyang.app`)
- [ ] App Information 입력
  - 앱 이름: 취향
  - 주 언어: 한국어
  - 번들 ID 선택
  - SKU: chuihyang-app-001
- [ ] 연령 등급 설정: **만 19세 이상** (주류 콘텐츠)
- [ ] Sign in with Apple 기능 활성화 (필수)
  - Certificates, Identifiers & Profiles → Identifiers
  - App ID 선택 → Sign in with Apple 체크

### 2.2 Google Play Console
- [ ] Google Play Console 접속
- [ ] 새 앱 만들기
  - 앱 이름: 취향
  - 기본 언어: 한국어
  - 앱 유형: 앱
  - 무료/유료: 무료
- [ ] 콘텐츠 등급 설정
  - IARC 설문 작성
  - 주류 콘텐츠 관련 체크
  - **만 19세 이상** 등급 획득
- [ ] 앱 카테고리: 라이프스타일
- [ ] 타겟 연령: 성인 (만 19세 이상)

---

## 3. 법적 문서 준비

### 3.1 문서 작성
- [ ] 개인정보 처리방침 작성
  - 템플릿: `docs/PRIVACY_POLICY_TEMPLATE.md`
  - 실제 정보로 수정 ([담당자 이름], [이메일 주소] 등)
- [ ] 서비스 이용약관 작성
  - 템플릿: `docs/TERMS_OF_SERVICE_TEMPLATE.md`
  - 실제 연락처 정보 입력

### 3.2 문서 호스팅
- [ ] 웹사이트에 문서 게시 (권장)
  - GitHub Pages
  - Vercel
  - Netlify
  - 자체 웹사이트
- [ ] 공개 URL 확보
  - 개인정보 처리방침: https://...
  - 서비스 이용약관: https://...
- [ ] App Store Connect / Google Play Console에 URL 등록

### 3.3 앱 내 링크 추가 (선택)
- [ ] 프로필 화면에 "개인정보 처리방침" 링크 추가
- [ ] 프로필 화면에 "서비스 이용약관" 링크 추가
- [ ] 회원가입 화면에 약관 동의 체크박스 추가

---

## 4. 앱 설정 및 빌드

### 4.1 환경 변수 설정
- [ ] Supabase 프로젝트 생성 (프로덕션용)
- [ ] EAS Secret 등록
  ```bash
  eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
  eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..."
  eas secret:create --scope project --name EXPO_PUBLIC_APP_ENV --value "production"
  eas secret:create --scope project --name EXPO_PUBLIC_DEBUG_MODE --value "false"
  ```
- [ ] 환경 변수 확인
  ```bash
  eas secret:list
  ```

### 4.2 Supabase OAuth 설정
- [ ] Google OAuth 설정
  - Google Cloud Console에서 OAuth 2.0 Client ID 생성
  - Authorized redirect URIs 추가:
    ```
    https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
    ```
  - Supabase Dashboard → Authentication → Providers → Google 설정
- [ ] Apple Sign In 설정
  - Apple Developer → Services ID 생성
  - Return URLs 추가:
    ```
    https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
    ```
  - Supabase Dashboard → Authentication → Providers → Apple 설정

### 4.3 Android 키스토어 생성
- [ ] Release Keystore 생성
  ```bash
  # Windows
  .\generate-android-keystore.bat
  
  # Mac/Linux
  chmod +x generate-android-keystore.sh
  ./generate-android-keystore.sh
  ```
- [ ] 키스토어 정보 안전한 곳에 백업
  - 파일: `android/app/chuihyang-release.keystore`
  - Store Password
  - Key Alias
  - Key Password
- [ ] EAS에 키스토어 등록 (권장)
  ```bash
  eas credentials
  ```

### 4.4 iOS 인증서 설정
- [ ] EAS가 자동으로 관리하도록 설정 (권장)
  ```bash
  eas credentials
  # 또는 빌드 시 자동 생성
  ```
- [ ] 또는 수동으로 Apple Developer에서 인증서 생성

### 4.5 앱 아이콘 및 스플래시 확인
- [ ] 앱 아이콘 (1024x1024, 투명도 없음)
  - 위치: `assets/images/icon.png`
- [ ] Adaptive Icon (Android)
  - 위치: `assets/images/adaptive-icon.png`
- [ ] 스플래시 스크린
  - 위치: `assets/images/splash-icon.png`
- [ ] Favicon (웹용)
  - 위치: `assets/images/favicon.png`

### 4.6 빌드 실행
- [ ] iOS 프로덕션 빌드
  ```bash
  eas build --platform ios --profile production
  ```
- [ ] Android 프로덕션 빌드
  ```bash
  eas build --platform android --profile production
  ```
- [ ] 빌드 완료 대기 (EAS 대시보드에서 확인)
- [ ] 빌드 파일 다운로드
  - iOS: `.ipa` 파일
  - Android: `.aab` 파일

---

## 5. 스토어 리스팅 준비

### 5.1 앱 설명 작성

**짧은 설명 (80자):**
```
나만의 담금주를 체계적으로 관리하세요. 레시피 선택부터 완성까지!
```

**긴 설명 (4000자):**
```
🍶 취향 - 나만의 담금주 관리 앱

담금주 제조를 시작하셨나요?
복잡한 과정과 숙성 기간 관리가 어려우신가요?

'취향'은 담금주 제조 과정을 체계적으로 기록하고 관리할 수 있는 
스마트한 프로젝트 관리 앱입니다.

✨ 주요 기능
• 5가지 프리셋 레시피 (야레야레, 블라블라, 오즈, 파친코, 계애바)
• 3가지 담금주 타입 (25도, 30도, 보드카)
• 타입별 자동 숙성 기간 계산
• 캘린더 기반 일정 관리
• 스마트 알림 시스템
• 진행 상황 사진 기록
• 조용한 시간 설정

📅 체계적인 관리
프로젝트 시작부터 완성까지의 모든 과정을 한눈에!
진행률과 남은 기간을 실시간으로 확인하세요.

🔔 놓치지 않는 알림
완성 시기를 알려주는 스마트 알림으로
최적의 타이밍을 놓치지 마세요.

📸 추억 기록
담금주 제조 과정을 사진과 메모로 기록하고
언제 누구와 마실지 계획하세요.

⚠️ 주의사항
• 만 19세 이상만 이용 가능합니다.
• 교육 및 정보 제공 목적의 앱입니다.
• 과도한 음주는 건강에 해롭습니다.
• 음주 운전은 절대 금지입니다.

지금 바로 시작해보세요! 🎉
```

### 5.2 스크린샷 촬영
- [ ] iPhone 6.7" (필수)
  - 최소 3장, 권장 5-8장
  - 해상도: 1290 x 2796
- [ ] iPhone 6.5" (필수)
  - 해상도: 1284 x 2778
- [ ] iPhone 5.5"
  - 해상도: 1242 x 2208
- [ ] iPad Pro 12.9" (iPad 지원 시)
  - 해상도: 2048 x 2732
- [ ] Android 휴대폰 (필수)
  - 최소 2장
  - 권장 해상도: 1080 x 1920 이상
- [ ] Android 7인치 태블릿 (권장)
- [ ] Android 10인치 태블릿 (권장)

**스크린샷 구성 예시:**
1. 온보딩 화면
2. 프로젝트 목록 화면
3. 레시피 선택 화면
4. 프로젝트 상세 화면
5. 캘린더 화면
6. 알림 설정 화면

### 5.3 홍보 자료 (선택)
- [ ] Feature Graphic (Google Play, 1024 x 500)
- [ ] 홍보 영상 (15-30초, YouTube 업로드)
- [ ] App Preview 영상 (iOS, 15-30초)

### 5.4 키워드 최적화 (ASO)
**추천 키워드:**
- 담금주, 담금소주, 홈메이드, 레시피
- 프로젝트 관리, 일정 관리, 캘린더
- 술, 주류, 칵테일, 증류주
- DIY, 취미, 기록

---

## 6. 테스트 및 QA

### 6.1 내부 테스트
- [ ] TestFlight (iOS) 내부 테스트
  - App Store Connect → TestFlight → 빌드 업로드
  - 내부 테스터 초대 (최대 100명)
- [ ] Google Play Internal Testing
  - Google Play Console → 테스트 → 내부 테스트
  - 테스터 초대 (최대 100명)

### 6.2 기능 테스트
- [ ] 회원가입/로그인 (이메일, Google, Apple)
- [ ] 비밀번호 찾기 및 재설정
- [ ] 프로젝트 생성 (모든 레시피/타입 조합)
- [ ] 프로젝트 수정/삭제
- [ ] 진행 로그 추가/수정/삭제
- [ ] 사진 업로드 (카메라/갤러리)
- [ ] 캘린더 표시 및 일정 확인
- [ ] 알림 발송 및 수신
- [ ] 조용한 시간 설정 및 동작
- [ ] 프로필 정보 수정
- [ ] 로그아웃
- [ ] 회원 탈퇴

### 6.3 다양한 환경 테스트
- [ ] iOS 13, 14, 15, 16, 17
- [ ] Android 10, 11, 12, 13, 14
- [ ] 다양한 화면 크기 (소형/중형/대형)
- [ ] 다크 모드 / 라이트 모드
- [ ] 네트워크 끊김 시나리오
- [ ] 메모리 부족 상황
- [ ] 백그라운드/포그라운드 전환

### 6.4 보안 테스트
- [ ] 비밀번호 암호화 확인
- [ ] HTTPS 통신 확인
- [ ] Supabase RLS 정책 동작 확인
- [ ] 민감한 정보 로그 출력 제거

### 6.5 성능 테스트
- [ ] 앱 실행 시간 (3초 이내)
- [ ] 화면 전환 속도
- [ ] 이미지 로딩 속도
- [ ] 메모리 사용량
- [ ] 배터리 소모

---

## 7. 심사 제출

### 7.1 App Store (iOS)
- [ ] App Store Connect 로그인
- [ ] 앱 정보 입력
  - 앱 이름: 취향
  - 부제목: 담금주 프로젝트 관리
  - 카테고리: 라이프스타일
  - 연령 등급: 만 19세 이상
- [ ] 스크린샷 업로드 (모든 기기 크기)
- [ ] 앱 설명 입력 (한국어)
- [ ] 키워드 입력 (최대 100자)
- [ ] 지원 URL 입력
- [ ] 개인정보 처리방침 URL 입력
- [ ] 빌드 선택 (TestFlight에서 업로드한 빌드)
- [ ] 앱 심사 정보 입력
  - 테스트 계정 (이메일/비밀번호)
  - 특별 지시사항 (있는 경우)
- [ ] 심사 제출 클릭

**예상 심사 기간:** 1-3일

### 7.2 Google Play (Android)
- [ ] Google Play Console 로그인
- [ ] 앱 콘텐츠 입력
  - 개인정보 처리방침 URL
  - 앱 액세스 권한 (테스트 계정)
  - 광고 포함 여부
  - 타겟층 및 콘텐츠
- [ ] 스토어 등록정보 입력
  - 앱 이름: 취향
  - 짧은 설명
  - 전체 설명
  - 앱 아이콘
  - Feature Graphic
  - 스크린샷
- [ ] 프로덕션 트랙에 릴리스 만들기
  - 빌드 선택 (.aab 파일)
  - 출시 노트 작성
- [ ] 국가/지역 선택 (대한민국)
- [ ] 심사 제출

**예상 심사 기간:** 3-7일

---

## 8. 출시 후 모니터링

### 8.1 즉시 확인사항
- [ ] 앱 스토어에서 앱 검색 확인
- [ ] 다운로드 및 설치 테스트
- [ ] 초기 사용자 피드백 모니터링
- [ ] 크래시 리포트 확인 (Sentry 등)

### 8.2 지속적 모니터링
- [ ] 일일 다운로드 수 확인
- [ ] 사용자 리뷰 및 평점 확인
- [ ] 버그 리포트 수집
- [ ] 서버/데이터베이스 성능 모니터링
- [ ] 알림 발송 성공률 확인

### 8.3 대응 계획
- [ ] 긴급 버그 수정 프로세스 수립
- [ ] 고객 지원 채널 운영
  - 이메일: support@chuihyang.com
  - 앱 내 문의하기
- [ ] 정기 업데이트 계획 수립
- [ ] 사용자 피드백 반영 로드맵 작성

---

## 9. 추가 권장사항

### 9.1 마케팅
- [ ] 소셜 미디어 계정 개설 (Instagram, Facebook 등)
- [ ] 프로모션 코드 생성 (iOS)
- [ ] 초기 사용자 확보 캠페인
- [ ] 앱 소개 웹사이트 제작

### 9.2 분석 도구 설정
- [ ] Google Analytics / Firebase Analytics
- [ ] Mixpanel / Amplitude
- [ ] App Store / Google Play Console 내장 분석

### 9.3 오류 추적
- [ ] Sentry 또는 Bugsnag 연동
- [ ] 크래시 리포트 자동화

---

## 10. 긴급 연락처

**Apple Developer Support:**
- https://developer.apple.com/contact/

**Google Play Support:**
- https://support.google.com/googleplay/android-developer

**Expo Support:**
- https://expo.dev/support

---

## ✅ 최종 점검

배포 전 마지막으로 확인하세요:

- [ ] 모든 테스트 통과
- [ ] 법적 문서 링크 확인
- [ ] 테스트 계정 2개 이상 준비
- [ ] 스크린샷 및 설명 최종 검토
- [ ] 버전 번호 확인 (1.0.0)
- [ ] 환경 변수 프로덕션 설정 확인
- [ ] 디버그 모드 비활성화 확인
- [ ] 크래시 발생 시 대응 계획 수립

**행운을 빕니다! 🚀**

