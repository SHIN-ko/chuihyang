import { makeRedirectUri } from 'expo-auth-session';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '@/src/lib/supabase';
import { Linking } from 'react-native';
import Constants from 'expo-constants';

export class GoogleAuthService {
  /**
   * 구글 OAuth 로그인 시작 (Supabase 내장 OAuth 사용)
   */
  static async signInWithGoogle() {
    try {
      console.log('구글 로그인 시작...');
      
      // Expo Go용 리다이렉트 URI 생성
      let redirectUri: string;
      
      if (__DEV__ && Constants.appOwnership === 'expo') {
        // Expo Go에서 실행 중인 경우
        const { manifest } = Constants;
        const slug = manifest?.slug || 'chuihyang';
        const owner = manifest?.owner || Constants.manifest2?.extra?.expoClient?.owner || 'anonymous';
        redirectUri = `https://auth.expo.io/@${owner}/${slug}`;
        console.log('Expo Go 리다이렉트 URI:', redirectUri);
      } else {
        // 스탠드얼론 앱이나 개발 빌드인 경우
        redirectUri = makeRedirectUri({
          scheme: 'myapp',
          path: 'auth',
        });
        console.log('스탠드얼론 리다이렉트 URI:', redirectUri);
      }
      
      // Supabase OAuth를 사용한 구글 로그인
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        console.error('Supabase OAuth 오류:', error);
        throw new Error(`구글 로그인 설정 오류: ${error.message}`);
      }

      console.log('OAuth URL 생성됨');

      // 브라우저에서 OAuth URL 열기
      if (data.url) {
        const supported = await Linking.canOpenURL(data.url);
        if (supported) {
          await Linking.openURL(data.url);
          return { success: true, data };
        } else {
          throw new Error('브라우저를 열 수 없습니다. 기기 설정을 확인해주세요.');
        }
      } else {
        throw new Error('구글 로그인 URL을 생성할 수 없습니다. 네트워크 연결을 확인해주세요.');
      }
    } catch (error) {
      console.error('Google OAuth 오류:', error);
      throw error;
    }
  }

  /**
   * OAuth 콜백 처리
   */
  static async handleOAuthCallback(url: string) {
    try {
      console.log('OAuth 콜백 처리:', url);
      
      let access_token: string | null = null;
      let refresh_token: string | null = null;
      
      try {
        const urlObj = new URL(url);
        
        // Query parameters에서 토큰 추출 시도
        access_token = urlObj.searchParams.get('access_token');
        refresh_token = urlObj.searchParams.get('refresh_token');
        
        // Hash fragment에서 토큰 추출 시도 (OAuth 표준)
        if (!access_token && urlObj.hash) {
          console.log('Hash fragment에서 토큰 추출 시도:', urlObj.hash);
          const hashParams = new URLSearchParams(urlObj.hash.substring(1));
          access_token = hashParams.get('access_token');
          refresh_token = hashParams.get('refresh_token');
        }
      } catch (urlError) {
        // URL 파싱 실패 시 수동으로 토큰 추출
        console.log('URL 파싱 실패, 수동 추출 시도');
        const accessMatch = url.match(/access_token=([^&]+)/);
        const refreshMatch = url.match(/refresh_token=([^&]+)/);
        
        if (accessMatch) access_token = decodeURIComponent(accessMatch[1]);
        if (refreshMatch) refresh_token = decodeURIComponent(refreshMatch[1]);
      }
      
      console.log('추출된 토큰:', { 
        access_token: access_token ? '존재함' : '없음', 
        refresh_token: refresh_token ? '존재함' : '없음' 
      });
      
      if (access_token && refresh_token) {
        // 토큰으로 세션 설정
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        
        if (error) {
          console.error('세션 설정 오류:', error);
          throw error;
        }

        console.log('OAuth 콜백 성공:', !!data.session);
        return { success: true, session: data.session };
      } else {
        throw new Error('OAuth 토큰을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('OAuth 콜백 처리 오류:', error);
      throw error;
    }
  }
}
