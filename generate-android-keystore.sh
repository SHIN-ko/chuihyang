#!/bin/bash

# Android Release Keystore 생성 스크립트
# 사용법: ./generate-android-keystore.sh

echo "=================================="
echo "Android Release Keystore 생성"
echo "=================================="
echo ""

# 키스토어 파일 이름
KEYSTORE_FILE="chuihyang-release.keystore"
KEY_ALIAS="chuihyang-key"

# 키스토어가 이미 존재하는지 확인
if [ -f "./android/app/$KEYSTORE_FILE" ]; then
    echo "⚠️  경고: $KEYSTORE_FILE 파일이 이미 존재합니다."
    read -p "덮어쓰시겠습니까? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "취소되었습니다."
        exit 1
    fi
fi

echo "📝 키스토어 정보를 입력해주세요:"
echo ""
read -p "비밀번호 (최소 6자): " -s KEYSTORE_PASSWORD
echo ""
read -p "비밀번호 확인: " -s KEYSTORE_PASSWORD_CONFIRM
echo ""

if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CONFIRM" ]; then
    echo "❌ 비밀번호가 일치하지 않습니다."
    exit 1
fi

read -p "키 별칭 비밀번호 (최소 6자, Enter로 스토어 비밀번호와 동일하게): " -s KEY_PASSWORD
echo ""

if [ -z "$KEY_PASSWORD" ]; then
    KEY_PASSWORD=$KEYSTORE_PASSWORD
fi

read -p "이름 (First and Last Name): " DNAME_CN
read -p "조직 단위 (Organizational Unit): " DNAME_OU
read -p "조직 (Organization): " DNAME_O
read -p "도시 (City or Locality): " DNAME_L
read -p "주/도 (State or Province): " DNAME_ST
read -p "국가 코드 (KR): " DNAME_C

# 기본값 설정
DNAME_C=${DNAME_C:-KR}

echo ""
echo "🔐 키스토어 생성 중..."

# keytool로 키스토어 생성
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore ./android/app/$KEYSTORE_FILE \
  -alias $KEY_ALIAS \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "$KEYSTORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  -dname "CN=$DNAME_CN, OU=$DNAME_OU, O=$DNAME_O, L=$DNAME_L, ST=$DNAME_ST, C=$DNAME_C"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 키스토어가 성공적으로 생성되었습니다!"
    echo "   위치: ./android/app/$KEYSTORE_FILE"
    echo ""
    echo "📋 다음 정보를 안전한 곳에 저장하세요:"
    echo "   - Keystore 파일: $KEYSTORE_FILE"
    echo "   - Key Alias: $KEY_ALIAS"
    echo "   - Store Password: $KEYSTORE_PASSWORD"
    echo "   - Key Password: $KEY_PASSWORD"
    echo ""
    echo "⚠️  중요: 이 정보를 잃어버리면 앱 업데이트를 할 수 없습니다!"
    echo ""
    echo "다음 단계:"
    echo "1. android/gradle.properties 파일에 다음 내용을 추가하세요:"
    echo "   CHUIHYANG_UPLOAD_STORE_FILE=$KEYSTORE_FILE"
    echo "   CHUIHYANG_UPLOAD_KEY_ALIAS=$KEY_ALIAS"
    echo "   CHUIHYANG_UPLOAD_STORE_PASSWORD=$KEYSTORE_PASSWORD"
    echo "   CHUIHYANG_UPLOAD_KEY_PASSWORD=$KEY_PASSWORD"
    echo ""
    echo "2. 또는 EAS Build를 사용하는 경우 다음 명령어로 저장하세요:"
    echo "   eas credentials"
else
    echo ""
    echo "❌ 키스토어 생성에 실패했습니다."
    exit 1
fi

