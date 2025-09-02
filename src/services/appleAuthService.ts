import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '@/src/lib/supabase';
import { Platform } from 'react-native';

export class AppleAuthService {
  /**
   * Sign in with Apple 로그인
   */
  static async signInWithApple() {
    try {
      console.log('Apple 로그인 시작...');
      console.log('플랫폼:', Platform.OS);
      console.log('플랫폼 버전:', Platform.Version);
      
      // iOS에서만 Apple 로그인 지원
      if (Platform.OS !== 'ios') {
        throw new Error('Apple 로그인은 iOS에서만 지원됩니다.');
      }

      // Apple 로그인 사용 가능 여부 확인
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      console.log('Apple 로그인 사용 가능:', isAvailable);
      
      if (!isAvailable) {
        throw new Error('Apple 로그인을 사용할 수 없습니다. iOS 13 이상에서만 지원됩니다.');
      }

      // Apple 로그인 요청 (최소한의 설정)
      console.log('Apple 로그인 요청 시작...');
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple 로그인 성공:', credential);
      console.log('Identity Token 존재:', !!credential.identityToken);
      console.log('User ID:', credential.user);

      if (!credential.identityToken) {
        throw new Error('Apple에서 인증 토큰을 받지 못했습니다.');
      }

      // Supabase에 Apple 로그인 정보 전송
      console.log('Supabase Apple 로그인 시작...');
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) {
        console.error('Supabase Apple 로그인 오류:', error);
        throw new Error(`Apple 로그인 실패: ${error.message}`);
      }

      if (data.user) {
        console.log('Apple 로그인 완료, 사용자:', data.user);
        return { success: true, user: data.user, session: data.session };
      } else {
        throw new Error('Apple 로그인 후 사용자 정보를 가져올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('Apple 로그인 오류:', error);
      console.error('오류 타입:', typeof error);
      console.error('오류 메시지:', error?.message);
      console.error('오류 코드:', error?.code);
      console.error('전체 오류 객체:', error);
      
      // AppleAuthenticationError 타입 체크를 안전하게 수행
      if (error && typeof error === 'object' && 'code' in error) {
        const appleError = error as any;
        
        // 사용자가 취소한 경우
        if (appleError.code === 'ERR_CANCELED' || appleError.code === 'ERR_REQUEST_CANCELED') {
          throw new Error('Apple 로그인이 취소되었습니다.');
        }
        
        // 권한 거부
        if (appleError.code === 'ERR_REQUEST_NOT_HANDLED') {
          throw new Error('Apple 로그인 권한이 거부되었습니다.');
        }
        
        // 기타 Apple 관련 오류
        if (appleError.code && appleError.code.startsWith('ERR_')) {
          throw new Error(`Apple 로그인 오류: ${appleError.message || '알 수 없는 오류가 발생했습니다.'}`);
        }
      }
      
      // 일반적인 오류 메시지
      const errorMessage = error?.message || 'Apple 로그인 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Apple 로그인 사용 가능 여부 확인
   */
  static async isAvailable() {
    try {
      const available = await AppleAuthentication.isAvailableAsync();
      console.log('Apple 로그인 사용 가능 여부:', available);
      return available;
    } catch (error) {
      console.error('Apple 로그인 사용 가능 여부 확인 실패:', error);
      return false;
    }
  }
}
