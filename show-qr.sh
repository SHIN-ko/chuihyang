#!/bin/bash

# ngrok URL의 QR 코드를 표시하는 스크립트

echo "📱 취향(chuihyang) 앱 QR 코드 생성기"
echo "================================================"
echo ""

# ngrok이 실행 중인지 확인
if ! curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
    echo "❌ ngrok이 실행되고 있지 않습니다."
    echo "먼저 다음 명령어로 서버를 시작하세요:"
    echo "   ./start-with-ngrok.sh"
    echo ""
    exit 1
fi

# 현재 ngrok URL 가져오기
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ ngrok URL을 가져올 수 없습니다."
    echo "ngrok이 제대로 실행되고 있는지 확인하세요."
    exit 1
fi

echo "🌐 현재 ngrok URL: $NGROK_URL"
echo ""
echo "📱 모바일 기기에서 Expo Go 앱으로 아래 QR 코드를 스캔하세요:"
echo ""
echo "📷 QR 코드:"
qrencode -t ANSIUTF8 "$NGROK_URL"
echo ""
echo "💡 QR 코드 스캔이 안 되는 경우 위의 URL을 직접 입력하세요!"
echo ""
echo "🔄 새 QR 코드가 필요하면 이 스크립트를 다시 실행하세요: ./show-qr.sh"
