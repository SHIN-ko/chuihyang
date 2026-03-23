import {
  emailSchema,
  passwordSchema,
  nicknameSchema,
  projectNameSchema,
  loginSchema,
  signupSchema,
  projectSchema,
} from '@/src/utils/validation';

describe('emailSchema', () => {
  it('유효한 이메일 통과', () => {
    expect(emailSchema.safeParse('test@example.com').success).toBe(true);
  });

  it('잘못된 형식 거부', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false);
    expect(emailSchema.safeParse('').success).toBe(false);
    expect(emailSchema.safeParse('@no-local.com').success).toBe(false);
  });
});

describe('passwordSchema', () => {
  it('6자 이상 통과', () => {
    expect(passwordSchema.safeParse('123456').success).toBe(true);
    expect(passwordSchema.safeParse('password').success).toBe(true);
  });

  it('6자 미만 거부', () => {
    expect(passwordSchema.safeParse('12345').success).toBe(false);
    expect(passwordSchema.safeParse('').success).toBe(false);
  });
});

describe('nicknameSchema', () => {
  it('한글 이름 통과', () => {
    expect(nicknameSchema.safeParse('김철수').success).toBe(true);
  });

  it('영문 이름 통과', () => {
    expect(nicknameSchema.safeParse('John').success).toBe(true);
  });

  it('공백 포함 통과', () => {
    expect(nicknameSchema.safeParse('김 철수').success).toBe(true);
  });

  it('1자 거부 (최소 2자)', () => {
    expect(nicknameSchema.safeParse('김').success).toBe(false);
  });

  it('21자 이상 거부 (최대 20자)', () => {
    expect(nicknameSchema.safeParse('가'.repeat(21)).success).toBe(false);
  });

  it('특수문자 거부', () => {
    expect(nicknameSchema.safeParse('김@철수').success).toBe(false);
    expect(nicknameSchema.safeParse('test!').success).toBe(false);
  });
});

describe('projectNameSchema', () => {
  it('유효한 프로젝트명 통과', () => {
    expect(projectNameSchema.safeParse('나의 첫 담금주').success).toBe(true);
  });

  it('빈 문자열 거부', () => {
    expect(projectNameSchema.safeParse('').success).toBe(false);
  });

  it('51자 이상 거부', () => {
    expect(projectNameSchema.safeParse('가'.repeat(51)).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('유효한 로그인 데이터 통과', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('이메일 누락 시 거부', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: '123456',
    });
    expect(result.success).toBe(false);
  });

  it('비밀번호 누락 시 거부', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('signupSchema', () => {
  const validData = {
    email: 'test@example.com',
    password: '123456',
    confirmPassword: '123456',
    nickname: '테스트유저',
    birthdate: '1990-01-01',
  };

  it('유효한 회원가입 데이터 통과', () => {
    expect(signupSchema.safeParse(validData).success).toBe(true);
  });

  it('비밀번호 불일치 시 거부', () => {
    const result = signupSchema.safeParse({
      ...validData,
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
  });

  it('생년월일 없이도 통과 (선택사항)', () => {
    const result = signupSchema.safeParse({
      ...validData,
      birthdate: undefined,
    });
    expect(result.success).toBe(true);
  });

  it('잘못된 생년월일 형식 거부', () => {
    const result = signupSchema.safeParse({
      ...validData,
      birthdate: '01-01-1990',
    });
    expect(result.success).toBe(false);
  });

  it('빈 생년월일 문자열 통과', () => {
    const result = signupSchema.safeParse({
      ...validData,
      birthdate: '',
    });
    expect(result.success).toBe(true);
  });
});

describe('projectSchema', () => {
  const validProject = {
    name: '야레야레 프로젝트',
    type: 'whiskey' as const,
    startDate: '2025-07-01',
    expectedEndDate: '2025-08-01',
    notes: '메모',
  };

  it('유효한 프로젝트 데이터 통과', () => {
    expect(projectSchema.safeParse(validProject).success).toBe(true);
  });

  it('종료일이 시작일 이전이면 거부', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      startDate: '2025-08-01',
      expectedEndDate: '2025-07-01',
    });
    expect(result.success).toBe(false);
  });

  it('시작일과 종료일이 같으면 거부', () => {
    const result = projectSchema.safeParse({
      ...validProject,
      startDate: '2025-07-15',
      expectedEndDate: '2025-07-15',
    });
    expect(result.success).toBe(false);
  });

  it('notes 없이도 통과 (선택사항)', () => {
    const { notes, ...withoutNotes } = validProject;
    expect(projectSchema.safeParse(withoutNotes).success).toBe(true);
  });
});
