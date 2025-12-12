import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { supabase } from '@/src/lib/supabase';

export class AppleAuthService {
  /**
   * Apple 로그인 가능 여부 확인
   */
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }
    
    try {
      return await AppleAuthentication.isAvailableAsync();
    } catch (error) {
      console.error('Apple 로그인 가능 여부 확인 오류:', error);
      return false;
    }
  }

  /**
   * Apple Sign In 로그인
   */
  static async signInWithApple() {
    try {
      console.log('Apple 로그인 시작...');

      // Apple 로그인 가능 여부 확인
      const available = await this.isAvailable();
      if (!available) {
        throw new Error('이 기기에서는 Apple 로그인을 사용할 수 없습니다.');
      }

      // Apple 인증 요청
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple 인증 완료:', {
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
      });

      // identityToken이 있는지 확인
      if (!credential.identityToken) {
        throw new Error('Apple 인증 토큰을 받지 못했습니다.');
      }

      // Supabase와 Apple 계정 연동
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: credential.nonce,
      });

      if (error) {
        console.error('Supabase Apple 로그인 오류:', error);
        throw new Error(`Apple 로그인 실패: ${error.message}`);
      }

      // 첫 로그인 시 프로필 정보 업데이트
      if (credential.fullName && data.user) {
        const fullName = [
          credential.fullName.givenName,
          credential.fullName.familyName,
        ]
          .filter(Boolean)
          .join(' ');

        if (fullName) {
          await supabase.auth.updateUser({
            data: { full_name: fullName },
          });
        }
      }

      console.log('Apple 로그인 성공:', data.session?.user.id);
      return { success: true, user: data.user, session: data.session };
    } catch (error: any) {
      // 사용자가 취소한 경우
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('Apple 로그인 취소됨');
        return { success: false, cancelled: true };
      }

      console.error('Apple 로그인 오류:', error);
      throw error;
    }
  }

  /**
   * Apple 계정 삭제/연결 해제 시 호출 (앱 내 계정 삭제 구현 필요)
   */
  static async revokeAppleCredential() {
    try {
      const credential = await AppleAuthentication.getCredentialStateAsync(
        'USER_ID_HERE' // 실제 Apple User ID 필요
      );

      console.log('Apple 인증 상태:', credential);
      return credential;
    } catch (error) {
      console.error('Apple 인증 상태 확인 오류:', error);
      throw error;
    }
  }
}

