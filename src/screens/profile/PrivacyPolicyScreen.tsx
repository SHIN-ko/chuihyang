import React from 'react';
import LegalDocumentScreen, {
  LegalDocumentSection,
} from '@/src/screens/profile/components/LegalDocumentScreen';

const PRIVACY_SECTIONS: LegalDocumentSection[] = [
  {
    title: '수집하는 개인정보 항목',
    entries: [
      { label: '필수 항목', value: '이메일 주소, 비밀번호, 닉네임' },
      { label: '선택 항목', value: '생년월일, 성별' },
      {
        label: '자동 수집',
        value: '앱 사용 기록, 기기 정보(OS, 기기 모델명, 광고 ID 등)',
      },
    ],
  },
  {
    title: '개인정보 수집 및 이용 목적',
    bulletItems: [
      '회원가입 및 계정 관리',
      '담금주 키트 추천 및 프로젝트 관리 기능 제공',
      '알림 및 마케팅 정보 발송 (선택 동의 시)',
      '앱 서비스 개선 및 사용자 경험 분석',
    ],
  },
  {
    title: '보유 및 이용 기간',
    bulletItems: [
      '회원 탈퇴 시까지 보관 후 즉시 파기',
      '관련 법령에 따른 보존 필요 시, 해당 기간까지 보관',
    ],
  },
  {
    title: '개인정보 제3자 제공',
    description:
      '원칙적으로 외부에 개인정보를 제공하지 않으며, 사전 동의가 필요한 경우 이용 목적과 범위를 명확히 안내합니다.',
    bulletItems: [
      '제공하지 않음 (단, 사전 동의 시에만 외부 마케팅·배송 업체 등에 제공)',
    ],
  },
  {
    title: '개인정보 처리 위탁',
    description: '안정적인 서비스 운영을 위해 다음 업체에 처리를 위탁하고 있습니다.',
    bulletItems: [
      'AWS – 클라우드 서버 및 데이터 저장소 운영',
      'Firebase – 사용자 인증 및 데이터베이스 관리',
    ],
  },
  {
    title: '사용자 및 법정대리인의 권리',
    bulletItems: [
      '개인정보 열람, 수정, 삭제, 처리정지 요청 가능',
      '만 14세 미만 이용자는 법정대리인이 권리 행사 가능',
    ],
  },
  {
    title: '아동의 개인정보 처리',
    bulletItems: [
      '본 앱은 만 13세 미만 아동을 대상으로 하지 않으며 해당 연령대의 개인정보를 수집하지 않습니다.',
      '타겟층에 해당할 경우, 아동 개인정보 수집 시 보호자 동의를 필수로 받습니다.',
    ],
  },
  {
    title: '개인정보 보호책임자',
    entries: [
      { label: '이름', value: '신현수' },
      { label: '이메일', value: 'shs2810@gmail.com' },
      { label: '문의 전화', value: '010-8004-2810' },
    ],
  },
  {
    title: '정책 변경 및 고지',
    bulletItems: ['앱 공지사항 및 이메일을 통해 사전 고지합니다.'],
  },
];

const PrivacyPolicyScreen: React.FC = () => (
  <LegalDocumentScreen
    title="개인정보처리방침"
    intro="담금주 취향은 이용자 여러분의 개인정보를 안전하게 보호하고 투명하게 처리하기 위해 아래와 같은 정책을 준수합니다."
    sections={PRIVACY_SECTIONS}
  />
);

export default PrivacyPolicyScreen;
