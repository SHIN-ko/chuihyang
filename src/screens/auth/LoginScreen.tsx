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
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import Button from '@/src/components/common/Button';
import GoogleLoginButton from '@/src/components/common/GoogleLoginButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useThemedStyles } from '@/src/hooks/useThemedStyles';
import { useThemeValues } from '@/src/hooks/useThemedStyles';

const { width } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const { colors, brandColors } = useThemeValues();
  
  const styles = useThemedStyles(({ colors, shadows, brandColors }) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    backgroundGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: colors.background.secondary,
      opacity: 0.5,
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
      paddingVertical: 40,
      minHeight: '100%',
    },
    header: {
      alignItems: 'center',
      marginBottom: 48,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    logo: {
      color: colors.text.primary,
      fontSize: 48,
      fontWeight: '800',
      letterSpacing: -1,
      marginBottom: 4,
    },
    brandTagline: {
      color: brandColors.accent.primary,
      fontSize: 14,
      fontWeight: '500',
      letterSpacing: 3,
      textTransform: 'uppercase',
    },
    subtitle: {
      color: colors.text.secondary,
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
      fontWeight: '400',
    },
    form: {
      marginBottom: 32,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
      letterSpacing: 0.3,
    },
    inputContainer: {
      backgroundColor: colors.background.glass,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border.secondary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      ...shadows.glass.light,
    },
    inputContainerFocused: {
      borderColor: brandColors.accent.primary,
      ...shadows.glass.medium,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      color: colors.text.primary,
      paddingVertical: 16,
      fontSize: 16,
      fontWeight: '400',
    },
    eyeButton: {
      padding: 4,
      marginLeft: 8,
    },
    forgotPassword: {
      marginBottom: 32,
      alignSelf: 'flex-end',
    },
    forgotPasswordText: {
      color: brandColors.accent.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    signupContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
    },
    signupText: {
      color: colors.text.secondary,
      fontSize: 14,
      fontWeight: '400',
    },
    signupLink: {
      color: brandColors.accent.primary,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border.secondary,
    },
    dividerText: {
      color: colors.text.muted,
      fontSize: 14,
      fontWeight: '400',
      marginHorizontal: 16,
    },
  }));
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const exitAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 초기 애니메이션
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      setIsTransitioning(true);
      
      // 부드러운 퇴장 애니메이션
      Animated.parallel([
        Animated.timing(exitAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        router.replace('/(tabs)');
      });
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
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* 배경 그라디언트 */}
      <View style={styles.backgroundGradient} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: isTransitioning ? exitAnim : fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* 헤더 - 로고 영역 */}
            <Animated.View 
              style={[
                styles.header,
                {
                  opacity: logoAnim,
                  transform: [{
                    scale: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    })
                  }]
                }
              ]}
            >
              <View style={styles.logoContainer}>
                <Text style={styles.logo}>취향</Text>
                <Text style={styles.brandTagline}>CHUIHYANG</Text>
              </View>

            </Animated.View>

            {/* 로그인 폼 */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>이메일</Text>
                <View style={[
                  styles.inputContainer,
                  emailFocused && styles.inputContainerFocused
                ]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={emailFocused ? brandColors.accent.primary : colors.text.secondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="이메일을 입력하세요"
                    placeholderTextColor={colors.text.muted}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>비밀번호</Text>
                <View style={[
                  styles.inputContainer,
                  passwordFocused && styles.inputContainerFocused
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={passwordFocused ? brandColors.accent.primary : colors.text.secondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="비밀번호를 입력하세요"
                    placeholderTextColor={colors.text.muted}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
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
                variant="primary"
              >
                로그인
              </Button>

              {/* 구분선 */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>또는</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* 구글 로그인 버튼 */}
              <GoogleLoginButton />

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
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


export default LoginScreen;