# Git commit script for deployment preparation

$projectPath = "C:\Users\SHIN\OneDrive\바탕 화면\workspace_vs\chuihyang"

# Change to project directory
Set-Location -Path $projectPath

# Initialize git if needed
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..."
    git init
}

# Add all files
Write-Host "Adding files to Git..."
git add .

# Commit with message
Write-Host "Committing changes..."
git commit -m "feat: 배포 준비 완료

- Apple Sign In 추가 (Google 로그인 제공 시 필수)
- EAS Build 설정 (eas.json)
- Android Release 키스토어 생성 스크립트
- 번들 ID 변경 (com.chuihyang.app)
- 개인정보 처리방침 템플릿
- 서비스 이용약관 템플릿
- 배포 가이드 문서 (DEPLOYMENT_*.md)
- iOS 권한 설명 문구
- Android Release 빌드 설정
- 환경 변수 설정 가이드"

Write-Host "Commit completed!"

# Check git status
Write-Host "`nGit Status:"
git status

