import { z } from 'zod';

// 이메일 검증
export const emailSchema = z.string().email('올바른 이메일 주소를 입력해주세요');

// 비밀번호 검증 (완화된 버전)
export const passwordSchema = z
  .string()
  .min(6, '비밀번호는 최소 6자 이상이어야 합니다');

// 이름 검증 (공백 허용)
export const nicknameSchema = z
  .string()
  .min(2, '이름은 최소 2자 이상이어야 합니다')
  .max(20, '이름은 최대 20자까지 입력 가능합니다')
  .regex(/^[가-힣a-zA-Z0-9\s]+$/, '이름은 한글, 영문, 숫자만 사용 가능합니다');

// 프로젝트명 검증
export const projectNameSchema = z
  .string()
  .min(1, '프로젝트명을 입력해주세요')
  .max(50, '프로젝트명은 최대 50자까지 입력 가능합니다');

// 로그인 폼 스키마
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

// 생년월일 검증 (선택사항, 하지만 입력 시 형식 체크)
const birthdateSchema = z
  .string()
  .optional()
  .refine((val) => {
    if (!val || val.trim() === '') return true; // 빈 값은 허용
    return /^\d{4}-\d{2}-\d{2}$/.test(val);
  }, '생년월일은 YYYY-MM-DD 형식으로 입력해주세요 (예: 1990-01-01)');

// 회원가입 폼 스키마
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  nickname: nicknameSchema,
  birthdate: birthdateSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

// 프로젝트 생성 폼 스키마
export const projectSchema = z.object({
  name: projectNameSchema,
  type: z.enum(['whiskey', 'gin', 'rum', 'fruit_wine', 'vodka', 'other']),
  startDate: z.string().min(1, '시작일을 선택해주세요'),
  expectedEndDate: z.string().min(1, '완료 예정일을 선택해주세요'),
  notes: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.expectedEndDate);
  return end > start;
}, {
  message: '완료 예정일은 시작일보다 늦어야 합니다',
  path: ['expectedEndDate'],
});

// 타입 추출
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
