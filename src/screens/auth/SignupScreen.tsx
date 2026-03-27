import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import Button from '@/src/components/common/Button';
import DatePicker from '@/src/components/common/DatePicker';
import GoogleLoginButton from '@/src/components/common/GoogleLoginButton';
import AppleLoginButton from '@/src/components/common/AppleLoginButton';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import { signupSchema, SignupFormData } from '@/src/utils/validation';
import * as ImagePicker from 'expo-image-picker';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

const { width } = Dimensions.get('window');

const SignupScreen: React.FC = () => {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const { colors, brandColors } = useThemeValues();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSignup = async () => {
    const formData: SignupFormData = {
      email,
      password,
      confirmPassword,
      nickname: name, // name을 nickname으로 매핑
      birthdate: birthdate || undefined,
    };

    try {
      signupSchema.parse(formData);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const fieldLabels: Record<string, string> = {
          email: '이메일',
          password: '비밀번호',
          confirmPassword: '비밀번호 확인',
          nickname: '닉네임',
          birthdate: '생년월일',
        };
        const issue = error.issues[0];
        const fieldKey = String(issue?.path?.[0] || '');
        const fieldLabel = fieldLabels[fieldKey] || fieldKey;
        const errorMessage = issue?.message || '입력 정보를 확인해주세요.';
        Alert.alert('입력 오류', `${fieldLabel ? `[${fieldLabel}] ` : ''}${errorMessage}`);
      } else {
        Alert.alert('입력 오류', '입력 정보를 확인해주세요.');
      }
      return;
    }

    const success = await signup(email, password, name, birthdate);

    if (success) {
      const { isAuthenticated } = useAuthStore.getState();

      if (isAuthenticated) {
        Alert.alert('회원가입 완료!', '환영합니다! 앱을 시작해보세요.', [
          {
            text: '시작하기',
            onPress: () => {
              setTimeout(() => {
                router.replace('/(tabs)');
              }, 300);
            },
          },
        ]);
      } else {
        Alert.alert(
          '회원가입 완료',
          '이메일을 확인하여 계정을 활성화해주세요.\n확인 후 로그인할 수 있습니다.',
          [
            {
              text: '확인',
              onPress: () => router.replace('/auth/login'),
            },
          ],
        );
      }
    } else {
      Alert.alert('회원가입 실패', '다시 시도해주세요.');
    }
  };

  const handleSelectProfileImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
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

  const handleGoToLogin = () => {
    router.replace('/auth/login');
  };

  const handleGoBack = () => {
    router.back();
  };

  const styles = useThemedStyles(({ colors, shadows, brandColors }) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background.primary,
      },
      keyboardView: {
        flex: 1,
      },
      floatingBackButton: {
        position: 'absolute' as const,
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 20,
        width: 44,
        height: 44,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        borderRadius: 22,
        backgroundColor: colors.background.glass,
        ...shadows.glass.medium,
        zIndex: 1000,
      },
      scrollView: {
        flex: 1,
        paddingHorizontal: 20,
      },
      content: {
        paddingTop: Platform.OS === 'ios' ? 100 : 80,
        paddingBottom: 20,
      },
      titleSection: {
        marginBottom: 32,
        alignItems: 'center' as const,
      },
      title: {
        fontSize: 28,
        fontWeight: '700' as const,
        color: colors.text.primary,
        marginBottom: 8,
        textAlign: 'center' as const,
        letterSpacing: -0.5,
      },
      subtitle: {
        fontSize: 16,
        color: colors.text.secondary,
        textAlign: 'center' as const,
        lineHeight: 22,
      },
      formSection: {
        marginBottom: 24,
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border.primary,
        ...shadows.glass.light,
      },
      inputContainer: {
        marginBottom: 16,
      },
      input: {
        backgroundColor: colors.background.glass,
        color: colors.text.primary,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.border.glass,
        ...shadows.glass.light,
        height: 56,
      },
      imagePickerCard: {
        padding: 16,
        marginBottom: 16,
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border.primary,
        ...shadows.glass.light,
      },
      imagePickerContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
      },
      imageIcon: {
        backgroundColor: colors.background.elevated,
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        marginRight: 16,
        ...shadows.glass.light,
      },
      imagePickerTextContainer: {
        flex: 1,
      },
      imagePickerTitle: {
        color: colors.text.primary,
        fontSize: 16,
        fontWeight: '600' as const,
        marginBottom: 4,
      },
      imagePickerDescription: {
        color: colors.text.secondary,
        fontSize: 14,
        lineHeight: 18,
      },
      profilePreview: {
        width: 48,
        height: 48,
        borderRadius: 12,
        ...shadows.glass.light,
      },
      signupButtonContainer: {
        marginTop: 24,
        marginBottom: 16,
      },
      loginLinkContainer: {
        flexDirection: 'row' as const,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        marginTop: 16,
      },
      loginLinkText: {
        color: colors.text.secondary,
        fontSize: 16,
      },
      loginLink: {
        color: brandColors.accent.primary,
        fontSize: 16,
        fontWeight: '600' as const,
        marginLeft: 4,
      },
      divider: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginVertical: 24,
      },
      dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border.secondary,
      },
      dividerText: {
        color: colors.text.secondary,
        fontSize: 14,
        fontWeight: '500' as const,
        marginHorizontal: 16,
      },
    }),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

      <TouchableOpacity onPress={handleGoBack} style={styles.floatingBackButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.titleSection}>
              <Text style={styles.title}>취향과 함께</Text>
              <Text style={styles.subtitle}>새로운 담금주 여행을 시작해보세요</Text>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="이메일"
                  placeholderTextColor={colors.text.muted}
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
                  placeholderTextColor={colors.text.muted}
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
                  placeholderTextColor={colors.text.muted}
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
                  placeholder="닉네임"
                  placeholderTextColor={colors.text.muted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <DatePicker
                  value={birthdate}
                  onDateChange={setBirthdate}
                  placeholder="생년월일 (선택사항)"
                  maximumDate={new Date().toISOString().split('T')[0]} // 오늘 이후 선택 불가
                  minimumDate="1900-01-01" // 1900년 이후만 선택 가능
                  isBirthdate={true} // 생년월일 모드 활성화
                />
              </View>
            </View>

            <View style={styles.imagePickerCard}>
              <TouchableOpacity
                onPress={handleSelectProfileImage}
                style={styles.imagePickerContainer}
              >
                <View style={styles.imageIcon}>
                  <Ionicons name="camera" size={20} color={brandColors.accent.primary} />
                </View>
                <View style={styles.imagePickerTextContainer}>
                  <Text style={styles.imagePickerTitle}>프로필 이미지</Text>
                  <Text style={styles.imagePickerDescription}>선택사항이에요</Text>
                </View>
                {profileImage && (
                  <Image source={{ uri: profileImage }} style={styles.profilePreview} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.signupButtonContainer}>
              <Button onPress={handleSignup} loading={isLoading} disabled={isLoading}>
                회원가입
              </Button>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>

            <GoogleLoginButton
              onSuccess={() => router.replace('/(tabs)')}
              onError={(error) => console.log('구글 회원가입 오류:', error)}
            />

            <AppleLoginButton
              onSuccess={() => router.replace('/(tabs)')}
              onError={(error) => console.log('애플 회원가입 오류:', error)}
            />

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>이미 계정이 있으신가요?</Text>
              <TouchableOpacity onPress={handleGoToLogin}>
                <Text style={styles.loginLink}>로그인</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;
