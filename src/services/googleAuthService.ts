import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/src/lib/supabase';
import Constants from 'expo-constants';

export class GoogleAuthService {
  /**
   * 리다이렉트 URI 생성
   */
  private static getRedirectUri(): string {
    if (__DEV__ && Constants.appOwnership === 'expo') {
      const { manifest } = Constants;
      const slug = manifest?.slug || 'chuihyang';
      const owner = manifest?.owner || Constants.manifest2?.extra?.expoClient?.owner || 'anonymous';
      return `https://auth.expo.io/@${owner}/${slug}`;
    }
    return makeRedirectUri({
      scheme: 'chuihyang',
      path: 'auth',
    });
  }

  /**
   * URL에서 OAuth 토큰 추출
   */
  private static extractTokensFromUrl(url: string): {
    access_token: string | null;
    refresh_token: string | null;
  } {
    let access_token: string | null = null;
    let refresh_token: string | null = null;

    try {
      const urlObj = new URL(url);
      access_token = urlObj.searchParams.get('access_token');
      refresh_token = urlObj.searchParams.get('refresh_token');

      if (!access_token && urlObj.hash) {
        const hashParams = new URLSearchParams(urlObj.hash.substring(1));
        access_token = hashParams.get('access_token');
        refresh_token = hashParams.get('refresh_token');
      }
    } catch {
      // URL 파싱 실패 시 정규식으로 추출
      const accessMatch = url.match(/access_token=([^&]+)/);
      const refreshMatch = url.match(/refresh_token=([^&]+)/);
      if (accessMatch) access_token = decodeURIComponent(accessMatch[1]);
      if (refreshMatch) refresh_token = decodeURIComponent(refreshMatch[1]);
    }

    return { access_token, refresh_token };
  }

  /**
   * 구글 OAuth 로그인 (in-app browser 사용)
   */
  static async signInWithGoogle() {
    try {
      console.log('구글 로그인 시작...');

      const redirectUri = this.getRedirectUri();
      console.log('리다이렉트 URI:', redirectUri);

      // Supabase OAuth URL 생성
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

      if (!data.url) {
        throw new Error('구글 로그인 URL을 생성할 수 없습니다. 네트워크 연결을 확인해주세요.');
      }

      console.log('OAuth URL 생성됨, in-app 브라우저 열기...');

      // in-app Safari View Controller로 OAuth 진행
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

      if (result.type === 'success' && result.url) {
        console.log('OAuth 리다이렉트 수신:', result.url);

        const { access_token, refresh_token } = this.extractTokensFromUrl(result.url);

        if (access_token && refresh_token) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) {
            console.error('세션 설정 오류:', sessionError);
            throw new Error(`로그인 세션 설정 실패: ${sessionError.message}`);
          }

          console.log('구글 로그인 성공:', !!sessionData.session);
          return { success: true, session: sessionData.session };
        }

        throw new Error('OAuth 토큰을 찾을 수 없습니다.');
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log('사용자가 구글 로그인을 취소했습니다.');
        return { success: false, cancelled: true };
      }

      throw new Error('구글 로그인이 예상치 못한 방식으로 종료되었습니다.');
    } catch (error) {
      console.error('Google OAuth 오류:', error);
      throw error;
    }
  }

  /**
   * Deep link fallback용 OAuth 콜백 처리
   */
  static async handleOAuthCallback(url: string) {
    try {
      console.log('OAuth 콜백 처리:', url);

      const { access_token, refresh_token } = this.extractTokensFromUrl(url);

      console.log('추출된 토큰:', {
        access_token: access_token ? '존재함' : '없음',
        refresh_token: refresh_token ? '존재함' : '없음',
      });

      if (access_token && refresh_token) {
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
      }

      throw new Error('OAuth 토큰을 찾을 수 없습니다.');
    } catch (error) {
      console.error('OAuth 콜백 처리 오류:', error);
      throw error;
    }
  }
}
