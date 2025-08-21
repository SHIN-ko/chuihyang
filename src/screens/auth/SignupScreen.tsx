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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import Button from '@/src/components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import { signupSchema, SignupFormData } from '@/src/utils/validation';
import * as ImagePicker from 'expo-image-picker';

const SignupScreen: React.FC = () => {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleSignup = async () => {
    // 입력 데이터 검증
    const formData: SignupFormData = {
      email,
      password,
      confirmPassword,
      nickname: name, // name을 nickname으로 매핑
      birthdate: birthdate || undefined,
    };

    try {
      // Zod 스키마로 검증
      signupSchema.parse(formData);
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || '입력 정보를 확인해주세요.';
      const fieldName = error.errors?.[0]?.path?.[0] || '';
      Alert.alert('입력 오류', `${fieldName ? `[${fieldName}] ` : ''}${errorMessage}`);
      return;
    }

    // 회원가입 시도
    const success = await signup(email, password, name, birthdate);
    
    if (success) {
      // 인증 상태 확인 후 적절한 화면으로 이동
      const { isAuthenticated } = useAuthStore.getState();
      
      if (isAuthenticated) {
        Alert.alert(
          '회원가입 완료!', 
          '환영합니다! 앱을 시작해보세요.',
          [
            {
              text: '시작하기',
              onPress: () => router.replace('/(tabs)')
            }
          ]
        );
      } else {
        Alert.alert(
          '회원가입 완료', 
          '이메일을 확인하여 계정을 활성화해주세요.\n확인 후 로그인할 수 있습니다.',
          [
            {
              text: '확인',
              onPress: () => router.replace('/auth/login')
            }
          ]
        );
      }
    } else {
      Alert.alert('회원가입 실패', '다시 시도해주세요.');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSelectProfileImage = async () => {
    try {
      // 권한 요청
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
        return;
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets[0]) {
        setProfileImage(result.assets[0].uri || null);
      }
    } catch (error) {
      console.error('프로필 이미지 선택 오류:', error);
      Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
    }
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
          <Text style={styles.headerTitle}>회원가입</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* 입력 필드들 */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="이메일"
                  placeholderTextColor="#9db89d"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호"
                  placeholderTextColor="#9db89d"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 확인"
                  placeholderTextColor="#9db89d"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="이름"
                  placeholderTextColor="#9db89d"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="생년월일 (선택사항, 예: 1990-01-01)"
                  placeholderTextColor="#9db89d"
                  value={birthdate}
                  onChangeText={setBirthdate}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
              </View>

              {/* 프로필 이미지 선택 */}
              <TouchableOpacity 
                style={styles.imagePickerContainer}
                onPress={handleSelectProfileImage}
              >
                <View style={styles.imageIcon}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profilePreview} />
                  ) : (
                    <Ionicons name="image" size={24} color="white" />
                  )}
                </View>
                <Text style={styles.imagePickerText}>
                  {profileImage ? '프로필 이미지 변경' : '프로필 이미지 추가'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.bottomContainer}>
          <Button
            onPress={handleSignup}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            회원가입
          </Button>
          
          <View style={styles.bottomSpacing} />
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  form: {
    gap: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#293829',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    fontSize: 16,
    height: 56,
  },
  imagePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111811',
    paddingVertical: 14,
    gap: 16,
  },
  imageIcon: {
    backgroundColor: '#293829',
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  profilePreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default SignupScreen;
