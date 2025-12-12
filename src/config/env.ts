import { z } from 'zod';

const rawEnv = {
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
};

type EnvKey = keyof typeof rawEnv;

const EnvSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z
    .string({ required_error: 'EXPO_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.' })
    .url('EXPO_PUBLIC_SUPABASE_URL은 유효한 URL이어야 합니다.'),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z
    .string({ required_error: 'EXPO_PUBLIC_SUPABASE_ANON_KEY이 설정되지 않았습니다.' })
    .min(1, 'EXPO_PUBLIC_SUPABASE_ANON_KEY이 비어 있습니다.'),
});

type EnvIssue = {
  key: EnvKey;
  message: string;
};

const issues: EnvIssue[] = [];

const parsed = EnvSchema.safeParse(rawEnv);

if (!parsed.success) {
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as EnvKey | undefined;
    if (key) {
      issues.push({ key, message: issue.message });
      console.warn(`⚠️ 환경변수 ${key}: ${issue.message}`);
    }
  }
}

const supabaseUrl = parsed.success
  ? parsed.data.EXPO_PUBLIC_SUPABASE_URL
  : rawEnv.EXPO_PUBLIC_SUPABASE_URL ?? '';

const supabaseAnonKey = parsed.success
  ? parsed.data.EXPO_PUBLIC_SUPABASE_ANON_KEY
  : rawEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  issues,
  isSupabaseConfigured: parsed.success,
};

export const requireSupabaseEnv = () => {
  if (!env.isSupabaseConfigured) {
    const issueMessages = env.issues.map((issue) => `${issue.key}: ${issue.message}`);
    const hint = issueMessages.length > 0 ? `\n- ${issueMessages.join('\n- ')}` : '';
    throw new Error(
      `Supabase 환경변수가 올바르게 설정되지 않았습니다.${hint ? `\n${hint}` : ''}`,
    );
  }

  return {
    supabaseUrl: env.supabaseUrl,
    supabaseAnonKey: env.supabaseAnonKey,
  };
};
