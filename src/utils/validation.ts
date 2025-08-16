import { z } from 'zod';

// 이메일 검증
export const emailSchema = z.string().email('올바른 이메일 주소를 입력해주세요');

// 비밀번호 검증
export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다');

// 닉네임 검증
export const nicknameSchema = z
  .string()
  .min(2, '닉네임은 최소 2자 이상이어야 합니다')
  .max(20, '닉네임은 최대 20자까지 입력 가능합니다')
  .regex(/^[가-힣a-zA-Z0-9_]+$/, '닉네임은 한글, 영문, 숫자, 언더스코어만 사용 가능합니다');

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

// 회원가입 폼 스키마
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  nickname: nicknameSchema,
  birthdate: z.string().optional(),
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
