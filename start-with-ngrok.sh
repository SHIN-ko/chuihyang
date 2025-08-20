#!/bin/bash

# 취향(chuihyang) React Native 앱을 ngrok과 함께 실행하는 스크립트

echo "🚀 React Native Metro 서버와 ngrok 터널링을 시작합니다..."

# Metro 서버 시작 (백그라운드)
echo "📱 Metro 서버를 시작합니다 (포트 8081)..."
npm run start &
METRO_PID=$!

# Metro 서버가 준비될 때까지 대기
echo "⏳ Metro 서버가 준비될 때까지 기다립니다..."
sleep 5

# ngrok 터널링 시작
echo "🌐 ngrok 터널링을 시작합니다..."
ngrok http 8081

# 종료 시 Metro 서버도 함께 종료
echo "🛑 서버를 종료합니다..."
kill $METRO_PID 2>/dev/null
