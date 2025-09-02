# Apple 로그인 문제 해결 가이드

## 현재 발생하는 오류

### 오류 정보
- **오류 코드**: `ERR_REQUEST_UNKNOWN`
- **오류 메시지**: "The authorization attempt failed for an unknown reason"
- **발생 시점**: Apple 로그인 요청 직후

### 원인 분석
이 오류는 주로 Apple Developer 계정 설정 문제로 발생합니다.

## 해결 방법

### 1. Apple Developer 계정 설정

#### 1.1 Apple Developer 계정 확인
- [Apple Developer](https://developer.apple.com)에 로그인
- 유료 Apple Developer 계정이 필요합니다 ($99/년)

#### 1.2 App ID 설정
1. **Certificates, Identifiers & Profiles** → **Identifiers** 이동
2. **+** 버튼 클릭하여 새 App ID 생성
3. **App** 선택 후 **Continue**
4. **Description**: "취향" 입력
5. **Bundle ID**: `com.anonymous.chuihyang` 입력
6. **Capabilities** 섹션에서 **Sign In with Apple** 체크
7. **Continue** → **Register**

#### 1.3 Sign In with Apple 설정
1. 생성된 App ID 클릭
2. **Sign In with Apple** 섹션에서 **Configure** 클릭
3. **Primary App ID** 선택
4. **Save** 클릭

### 2. Xcode 프로젝트 설정

#### 2.1 Capabilities 추가
1. Xcode에서 프로젝트 열기 (`ios/app.xcworkspace`)
2. **TARGETS** → **app** 선택
3. **Signing & Capabilities** 탭
4. **+ Capability** 클릭
5. **Sign In with Apple** 추가

#### 2.2 Bundle Identifier 확인
- **Bundle Identifier**가 `com.anonymous.chuihyang`인지 확인
- Apple Developer에 등록한 Bundle ID와 일치해야 함

### 3. Expo 환경 문제

#### 3.1 Expo Go 제한
- Apple 로그인은 Expo Go에서 제한적으로 작동
- 개발 빌드에서 더 안정적

#### 3.2 개발 빌드 생성
```bash
# 개발 빌드 생성
npx expo run:ios
```

### 4. 테스트 환경

#### 4.1 시뮬레이터 vs 실제 기기
- **시뮬레이터**: Apple 로그인이 제한적으로 작동
- **실제 기기**: 완전한 Apple 로그인 기능 테스트 가능

#### 4.2 테스트 계정
- Apple Developer 계정과 연결된 Apple ID 사용
- 테스트용 Apple ID 생성 권장

## 임시 해결책

Apple 로그인 설정이 완료될 때까지:

### 1. 데모 계정 사용
- 앱 스토어 심사용 데모 계정 제공
- 계정: `shs28100@naver.com` / `123456`

### 2. 다른 로그인 옵션
- Google 로그인
- 이메일/비밀번호 로그인

### 3. Apple 로그인 비활성화
```tsx
// Apple 로그인 버튼 주석 처리
{/* <AppleLoginButton /> */}
```

## 디버깅 정보

### 콘솔 로그 확인
- Apple 로그인 사용 가능 여부
- 플랫폼 정보
- 오류 코드 및 메시지
- 전체 오류 객체

### 일반적인 오류 코드
- `ERR_REQUEST_UNKNOWN`: Apple Developer 설정 문제
- `ERR_CANCELED`: 사용자가 취소
- `ERR_REQUEST_NOT_HANDLED`: 권한 거부

## 다음 단계

1. Apple Developer 계정에서 Bundle ID 등록
2. Xcode에서 Sign In with Apple capability 추가
3. 실제 iOS 기기에서 테스트
4. Apple 로그인 정상 작동 확인 후 주석 해제


