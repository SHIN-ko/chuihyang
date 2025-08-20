import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/src/components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import { SupabaseService } from '@/src/services/supabaseService';
import { emailSchema } from '@/src/utils/validation';

const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('오류', '이메일을 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    try {
      emailSchema.parse(email.trim());
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || '올바른 이메일 주소를 입력해주세요.';
      Alert.alert('입력 오류', errorMessage);
      return;
    }

    setIsLoading(true);
    
    try {
      await SupabaseService.resetPassword(email.trim());
      
      Alert.alert(
        '이메일 전송 완료',
        '비밀번호 재설정 링크가 이메일로 전송되었습니다.\n\n이메일을 확인하시고 링크를 클릭하여 새 비밀번호를 설정해주세요.',
        [
          {
            text: '확인',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('비밀번호 재설정 오류:', error);
      
      // Supabase 에러 메시지 처리
      let errorMessage = '비밀번호 재설정 요청 중 오류가 발생했습니다.';
      
      if (error.message) {
        if (error.message.includes('User not found')) {
          errorMessage = '등록되지 않은 이메일 주소입니다.';
        } else if (error.message.includes('Email rate limit')) {
          errorMessage = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = '올바른 이메일 주소를 입력해주세요.';
        }
      }
      
      Alert.alert('오류', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };



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
          <Text style={styles.headerTitle}>비밀번호 찾기</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* 설명 텍스트 */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.title}>
              비밀번호를 잊으셨나요?
            </Text>
            <Text style={styles.description}>
              가입하신 이메일 주소를 입력해주세요.{'\n'}
              비밀번호 재설정 링크를 보내드립니다.
            </Text>
          </View>

          {/* 이메일 입력 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="이메일 주소"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* 재설정 버튼 */}
          <Button
            onPress={handleResetPassword}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            재설정 링크 보내기
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
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#374151',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
});

export default ForgotPasswordScreen;
