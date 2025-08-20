#!/bin/bash

# 취향(chuihyang) React Native 앱을 Expo 터널링으로 실행하는 스크립트
# ngrok 인증이 필요하지 않은 대안

echo "🚀 React Native Expo 터널링을 시작합니다..."
echo "💡 이 방법은 ngrok 계정 없이도 사용할 수 있습니다"
echo ""

# Expo 터널링으로 시작
echo "📱 Expo 터널링 모드로 Metro 서버를 시작합니다..."
npm run start:tunnel

echo "🛑 서버를 종료합니다..."
