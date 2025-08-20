import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Button from '@/src/components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import { SupabaseService } from '@/src/services/supabaseService';
import { passwordSchema } from '@/src/utils/validation';
import { supabase } from '@/src/lib/supabase';

const ResetPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { access_token, refresh_token } = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
  }>();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  // 세션 확인 및 복구
  useEffect(() => {
    const checkAndRecoverSession = async () => {
      try {
        console.log('세션 복구 시작...');
        console.log('URL 파라미터:', { access_token, refresh_token });
        
        // 현재 세션 확인
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session && !sessionError) {
          console.log('기존 세션 발견');
          setHasValidSession(true);
          setIsSessionLoading(false);
          return;
        }

        // URL에서 토큰 추출 시도 (Deep Link로 온 경우)
        if (access_token && refresh_token) {
          console.log('URL 토큰으로 세션 설정 시도...');
          const { data, error } = await supabase.auth.setSession({
            access_token: access_token as string,
            refresh_token: refresh_token as string,
          });

          if (data.session && !error) {
            console.log('세션 복구 성공');
            setHasValidSession(true);
          } else {
            console.error('세션 설정 실패:', error);
            setHasValidSession(false);
          }
        } else {
          // React Native에서는 Hash fragment 체크 건너뛰기
          console.log('URL 파라미터에서 토큰을 찾을 수 없음');
          setHasValidSession(false);
        }
      } catch (error) {
        console.error('세션 복구 중 오류:', error);
        setHasValidSession(false);
      } finally {
        setIsSessionLoading(false);
      }
    };

    checkAndRecoverSession();
  }, [access_token, refresh_token]);

  const handleResetPassword = async () => {
    // 세션 유효성 확인
    if (!hasValidSession) {
      Alert.alert('오류', '유효한 세션이 없습니다. 비밀번호 재설정을 다시 요청해주세요.');
      return;
    }

    // 입력 검증
    if (!newPassword.trim()) {
      Alert.alert('오류', '새 비밀번호를 입력해주세요.');
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('오류', '비밀번호 확인을 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 형식 검증
    try {
      passwordSchema.parse(newPassword);
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || '올바른 비밀번호를 입력해주세요.';
      Alert.alert('입력 오류', errorMessage);
      return;
    }

    setIsLoading(true);
    
    try {
      await SupabaseService.updatePassword(newPassword);
      
      Alert.alert(
        '비밀번호 변경 완료',
        '새 비밀번호가 성공적으로 설정되었습니다.\n로그인 화면으로 이동합니다.',
        [
          {
            text: '확인',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('비밀번호 변경 오류:', error);
      
      let errorMessage = '비밀번호 변경 중 오류가 발생했습니다.';
      
      if (error.message) {
        if (error.message.includes('Invalid session')) {
          errorMessage = '세션이 만료되었습니다. 비밀번호 재설정을 다시 요청해주세요.';
        } else if (error.message.includes('New password should be different')) {
          errorMessage = '기존 비밀번호와 다른 새 비밀번호를 입력해주세요.';
        }
      }
      
      Alert.alert('오류', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryReset = () => {
    Alert.alert(
      '비밀번호 재설정 다시 요청',
      '로그인 화면으로 이동하여 비밀번호 찾기를 다시 시도하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => router.replace('/auth/login'),
        },
      ]
    );
  };

  const handleGoBack = () => {
    router.replace('/auth/login');
  };

  // 세션 로딩 중
  if (isSessionLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#111811" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>
            세션을 확인하는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // 세션이 유효하지 않은 경우
  if (!hasValidSession) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#111811" />
        
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>비밀번호 재설정</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={64} color="#ef4444" />
            <Text style={styles.errorTitle}>
              세션 만료
            </Text>
            <Text style={styles.errorDescription}>
              비밀번호 재설정 링크가 만료되었거나{'\n'}
              유효하지 않습니다.{'\n\n'}
              비밀번호 찾기를 다시 시도해주세요.
            </Text>
            <Button
              onPress={handleRetryReset}
              fullWidth
            >
              다시 시도하기
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 정상적인 비밀번호 재설정 화면
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111811" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>새 비밀번호 설정</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* 설명 텍스트 */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.title}>
              새 비밀번호 설정
            </Text>
            <Text style={styles.description}>
              안전한 새 비밀번호를 설정해주세요.{'\n'}
              최소 6자 이상의 비밀번호를 입력해주세요.
            </Text>
          </View>

          {/* 새 비밀번호 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>새 비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호를 입력하세요"
              placeholderTextColor="#9CA3AF"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* 비밀번호 확인 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호 확인</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 다시 입력하세요"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* 비밀번호 안내 */}
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              💡 비밀번호는 최소 6자 이상이어야 합니다
            </Text>
          </View>

          {/* 변경 버튼 */}
          <Button
            onPress={handleResetPassword}
            loading={isLoading}
            disabled={isLoading || !hasValidSession}
            fullWidth
          >
            비밀번호 변경
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111811',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#111811',
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 48,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  descriptionContainer: {
    marginBottom: 32,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#374151',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  hintContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1c261c',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  hintText: {
    color: '#9db89d',
    fontSize: 14,
    lineHeight: 20,
  },
  // 로딩 스타일
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  // 에러 스타일
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorDescription: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 32,
  },
});

export default ResetPasswordScreen;
