# 🌐 ngrok을 사용한 네트워크 공유 설정 가이드

## 1. 기본 사용법

### 방법 1: 스크립트 사용 (권장)
```bash
./start-with-ngrok.sh
```

### 방법 2: 수동 실행
```bash
# 터미널 1: Metro 서버 시작
npm run start

# 터미널 2: ngrok 터널링 시작
npm run ngrok
# 또는
ngrok http 8081
```

### 방법 3: 한 번에 실행
```bash
npm run start:ngrok
```

## 2. ngrok 터널 URL 확인

ngrok이 실행되면 다음과 같은 화면이 표시됩니다:
```
Session Status                online
Account                       [your-account] (Plan: Free)
Version                       3.26.0
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:8081

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**중요**: `https://abc123.ngrok.io` 부분이 외부에서 접근할 수 있는 URL입니다.

## 3. 모바일 기기에서 연결

### Android 기기:
1. Expo Go 앱 실행
2. "Enter URL manually" 선택
3. ngrok URL 입력: `https://abc123.ngrok.io`

### iOS 기기:
1. Expo Go 앱 실행
2. QR 코드 스캔 또는 URL 직접 입력
3. ngrok URL 사용

## 4. 주의사항

- **무료 ngrok 계정**: 동시 터널 수 제한 있음
- **세션 제한**: 8시간 후 자동 종료
- **URL 변경**: ngrok 재시작 시 URL이 변경됨
- **인터넷 연결**: 모든 기기가 인터넷에 연결되어 있어야 함

## 5. 트러블슈팅

### Metro 서버가 시작되지 않는 경우:
```bash
# 포트 확인
lsof -i :8081
# 프로세스 종료 후 재시작
kill -9 [PID]
npm run start
```

### ngrok 인증이 필요한 경우:
**⚠️ 중요: ngrok 사용을 위해서는 무료 계정 가입이 필요합니다**

1. 계정 가입: https://dashboard.ngrok.com/signup
2. 인증 토큰 확인: https://dashboard.ngrok.com/get-started/your-authtoken
3. 토큰 설정:
```bash
# ngrok 계정 가입 후 인증 토큰 설정
ngrok authtoken [your-auth-token]
```

### 🚨 ngrok 인증 전 대안: Expo 터널링
ngrok 인증을 기다리는 동안 Expo 내장 터널링 사용:
```bash
npm run start:tunnel
```

### 방화벽 문제:
- 맥 시스템 환경설정 > 보안 및 개인정보보호 > 방화벽에서 허용

## 6. 대안: Expo 터널링

Expo 내장 터널링 기능도 사용 가능:
```bash
npm run start:tunnel
```

이 방법은 ngrok 설치 없이도 사용할 수 있지만, 때때로 속도가 느릴 수 있습니다.
