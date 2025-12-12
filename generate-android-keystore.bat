@echo off
REM Android Release Keystore 생성 스크립트 (Windows)
REM 사용법: generate-android-keystore.bat

echo ==================================
echo Android Release Keystore 생성
echo ==================================
echo.

set KEYSTORE_FILE=chuihyang-release.keystore
set KEY_ALIAS=chuihyang-key

if exist ".\android\app\%KEYSTORE_FILE%" (
    echo ⚠️  경고: %KEYSTORE_FILE% 파일이 이미 존재합니다.
    set /p OVERWRITE="덮어쓰시겠습니까? (y/n): "
    if /i not "%OVERWRITE%"=="y" (
        echo 취소되었습니다.
        exit /b 1
    )
)

echo 📝 키스토어 정보를 입력해주세요:
echo.

set /p KEYSTORE_PASSWORD="비밀번호 (최소 6자): "
set /p KEY_PASSWORD="키 별칭 비밀번호 (Enter로 스토어 비밀번호와 동일하게): "

if "%KEY_PASSWORD%"=="" set KEY_PASSWORD=%KEYSTORE_PASSWORD%

set /p DNAME_CN="이름 (First and Last Name): "
set /p DNAME_OU="조직 단위 (Organizational Unit): "
set /p DNAME_O="조직 (Organization): "
set /p DNAME_L="도시 (City or Locality): "
set /p DNAME_ST="주/도 (State or Province): "
set /p DNAME_C="국가 코드 (KR): "

if "%DNAME_C%"=="" set DNAME_C=KR

echo.
echo 🔐 키스토어 생성 중...

keytool -genkeypair -v ^
  -storetype PKCS12 ^
  -keystore .\android\app\%KEYSTORE_FILE% ^
  -alias %KEY_ALIAS% ^
  -keyalg RSA ^
  -keysize 2048 ^
  -validity 10000 ^
  -storepass "%KEYSTORE_PASSWORD%" ^
  -keypass "%KEY_PASSWORD%" ^
  -dname "CN=%DNAME_CN%, OU=%DNAME_OU%, O=%DNAME_O%, L=%DNAME_L%, ST=%DNAME_ST%, C=%DNAME_C%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 키스토어가 성공적으로 생성되었습니다!
    echo    위치: .\android\app\%KEYSTORE_FILE%
    echo.
    echo 📋 다음 정보를 안전한 곳에 저장하세요:
    echo    - Keystore 파일: %KEYSTORE_FILE%
    echo    - Key Alias: %KEY_ALIAS%
    echo    - Store Password: %KEYSTORE_PASSWORD%
    echo    - Key Password: %KEY_PASSWORD%
    echo.
    echo ⚠️  중요: 이 정보를 잃어버리면 앱 업데이트를 할 수 없습니다!
    echo.
    echo 다음 단계:
    echo 1. android\gradle.properties 파일에 다음 내용을 추가하세요:
    echo    CHUIHYANG_UPLOAD_STORE_FILE=%KEYSTORE_FILE%
    echo    CHUIHYANG_UPLOAD_KEY_ALIAS=%KEY_ALIAS%
    echo    CHUIHYANG_UPLOAD_STORE_PASSWORD=%KEYSTORE_PASSWORD%
    echo    CHUIHYANG_UPLOAD_KEY_PASSWORD=%KEY_PASSWORD%
    echo.
    echo 2. 또는 EAS Build를 사용하는 경우 다음 명령어로 저장하세요:
    echo    eas credentials
) else (
    echo.
    echo ❌ 키스토어 생성에 실패했습니다.
    exit /b 1
)

pause

