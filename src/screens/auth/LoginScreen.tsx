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
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import Button from '@/src/components/common/Button';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호를 확인해주세요.');
    }
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111811" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={styles.title}>
                취향
              </Text>
              <Text style={styles.subtitle}>
                나만의 담금주 프로젝트를 관리하세요
              </Text>
            </View>

            {/* 로그인 폼 */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  이메일
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="이메일을 입력하세요"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  비밀번호
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호를 입력하세요"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* 비밀번호 찾기 */}
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>
                비밀번호를 잊으셨나요?
              </Text>
            </TouchableOpacity>

            {/* 로그인 버튼 */}
            <Button
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              style={styles.loginButton}
            >
              로그인
            </Button>

            {/* 회원가입 링크 */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>
                계정이 없으신가요?
              </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signupLink}>
                  회원가입
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
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
  forgotPassword: {
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#22c55e',
    textAlign: 'right',
    fontSize: 16,
  },
  loginButton: {
    marginBottom: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: 'white',
    fontSize: 16,
    marginRight: 4,
  },
  signupLink: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;