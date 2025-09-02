import { supabase } from '@/src/lib/supabase';

export class DemoAccountService {
  /**
   * 데모 계정 생성 (앱 스토어 심사용)
   */
  static async createDemoAccount() {
    try {
      console.log('데모 계정 생성 시작...');
      
      const demoEmail = 'shs28100@naver.com';
      const demoPassword = '123456';
      const demoName = '데모 사용자';
      
      // 기존 계정이 있는지 확인
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });
      
      if (existingUser.user) {
        console.log('데모 계정이 이미 존재합니다.');
        return { success: true, user: existingUser.user };
      }
      
      // 새 데모 계정 생성
      const { data, error } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: {
            name: demoName,
            full_name: demoName,
            is_demo_account: true,
          }
        }
      });
      
      if (error) {
        console.error('데모 계정 생성 실패:', error);
        throw error;
      }
      
      if (data.user) {
        console.log('데모 계정 생성 성공:', data.user);
        return { success: true, user: data.user };
      } else {
        throw new Error('데모 계정 생성 후 사용자 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('데모 계정 생성 오류:', error);
      throw error;
    }
  }
  
  /**
   * 데모 계정으로 로그인
   */
  static async signInWithDemoAccount() {
    try {
      console.log('데모 계정으로 로그인 시작...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'shs28100@naver.com',
        password: '123456',
      });
      
      if (error) {
        console.error('데모 계정 로그인 실패:', error);
        throw error;
      }
      
      if (data.user) {
        console.log('데모 계정 로그인 성공:', data.user);
        return { success: true, user: data.user, session: data.session };
      } else {
        throw new Error('데모 계정 로그인 후 사용자 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('데모 계정 로그인 오류:', error);
      throw error;
    }
  }
}
