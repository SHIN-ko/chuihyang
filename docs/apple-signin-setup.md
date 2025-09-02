# Apple Sign In 설정 가이드

## 1. Apple Developer 계정 설정

### 1.1 Apple Developer 계정에 로그인
- [Apple Developer](https://developer.apple.com)에 로그인
- 유료 Apple Developer 계정이 필요합니다 ($99/년)

### 1.2 App ID 설정
1. **Certificates, Identifiers & Profiles** → **Identifiers** 이동
2. **+** 버튼 클릭하여 새 App ID 생성
3. **App** 선택 후 **Continue**
4. **Description**: "취향" 입력
5. **Bundle ID**: `com.anonymous.chuihyang` 입력
6. **Capabilities** 섹션에서 **Sign In with Apple** 체크
7. **Continue** → **Register**

### 1.3 Sign In with Apple 설정
1. 생성된 App ID 클릭
2. **Sign In with Apple** 섹션에서 **Configure** 클릭
3. **Primary App ID** 선택
4. **Save** 클릭

## 2. Xcode 프로젝트 설정

### 2.1 Capabilities 추가
1. Xcode에서 프로젝트 열기
2. **Target** → **Signing & Capabilities**
3. **+ Capability** 클릭
4. **Sign In with Apple** 추가

### 2.2 Bundle Identifier 확인
- **Bundle Identifier**가 `com.anonymous.chuihyang`인지 확인
- Apple Developer에 등록한 Bundle ID와 일치해야 함

## 3. Expo 설정

### 3.1 app.json 확인
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.anonymous.chuihyang"
    },
    "plugins": [
      "expo-apple-authentication"
    ]
  }
}
```

### 3.2 EAS Build 설정 (선택사항)
```json
{
  "build": {
    "development": {
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  }
}
```

## 4. 테스트 환경

### 4.1 시뮬레이터 vs 실제 기기
- **시뮬레이터**: Apple 로그인이 제한적으로 작동
- **실제 기기**: 완전한 Apple 로그인 기능 테스트 가능

### 4.2 테스트 계정
- Apple Developer 계정과 연결된 Apple ID 사용
- 테스트용 Apple ID 생성 권장

## 5. 문제 해결

### 5.1 일반적인 오류
- **"The authorization attempt failed for an unknown reason"**
  - Apple Developer 설정 문제
  - Bundle ID 불일치
  - Sign In with Apple capability 누락

### 5.2 디버깅
1. 콘솔 로그 확인
2. Apple Developer 계정 설정 재확인
3. Xcode에서 Capabilities 확인
4. 실제 기기에서 테스트

## 6. 대안 방법

### 6.1 임시 해결책
Apple 로그인 설정이 완료될 때까지:
- Google 로그인 사용
- 데모 계정 사용
- 이메일/비밀번호 로그인 사용

### 6.2 Apple 로그인 비활성화
```tsx
// Apple 로그인 버튼 주석 처리
{/* <AppleLoginButton /> */}
```


