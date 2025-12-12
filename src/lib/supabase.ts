import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '@/src/lib/database.types';
import { env } from '@/src/config/env';

const supabaseUrl = env.supabaseUrl;
const supabaseAnonKey = env.supabaseAnonKey;

// 환경변수가 없어도 클라이언트는 생성하되, 실제 요청은 실패할 수 있음
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Supabase 연결 상태 확인 함수
export const isSupabaseConfigured = () => {
  return env.isSupabaseConfigured;
};
