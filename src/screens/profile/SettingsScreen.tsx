import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { logout, deleteAccount } = useAuthStore();
  const { colors, brandColors } = useThemeValues();

  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true);
          await logout();
          setIsLoading(false);
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '계정을 삭제하면 담금주 프로젝트와 알림을 포함한 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '계정 삭제',
          style: 'destructive',
          onPress: async () => {
            setIsDeletingAccount(true);
            try {
              await deleteAccount();
              Alert.alert('계정 삭제 완료', '계정과 모든 데이터가 삭제되었습니다.', [
                {
                  text: '확인',
                  onPress: () => router.replace('/auth/onboarding'),
                },
              ]);
            } catch (error) {
              console.error('계정 삭제 중 오류 발생:', error);
              Alert.alert(
                '오류',
                error instanceof Error
                  ? error.message
                  : '계정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.',
              );
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  const styles = useThemedStyles(({ colors, shadows, brandColors }) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background.primary,
      },
      content: {
        flex: 1,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
      },
      backButton: {
        marginRight: 12,
        padding: 4,
      },
      headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -0.5,
      },
      scrollView: {
        flex: 1,
        paddingHorizontal: 20,
      },
      section: {
        padding: 20,
        marginBottom: 16,
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border.primary,
        ...shadows.glass.light,
      },
      sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 20,
        letterSpacing: -0.3,
      },
      menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.secondary,
      },
      menuItemLast: {
        borderBottomWidth: 0,
      },
      menuInfo: {
        flex: 1,
        marginLeft: 16,
      },
      menuTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text.primary,
        marginBottom: 2,
      },
      menuDescription: {
        fontSize: 13,
        color: colors.text.secondary,
      },
      logoutButton: {
        backgroundColor: `${brandColors.semantic.error}20`,
        borderColor: `${brandColors.semantic.error}40`,
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        ...shadows.neumorphism.outset,
      },
      logoutText: {
        color: brandColors.semantic.error,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
      },
      dangerSection: {
        padding: 20,
        marginBottom: 16,
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: `${brandColors.semantic.error}30`,
        ...shadows.glass.light,
      },
      dangerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: brandColors.semantic.error,
        marginBottom: 12,
        letterSpacing: -0.3,
      },
      dangerDescription: {
        fontSize: 13,
        color: colors.text.secondary,
        lineHeight: 20,
        marginBottom: 16,
      },
      deleteButton: {
        backgroundColor: `${brandColors.semantic.error}10`,
        borderColor: `${brandColors.semantic.error}40`,
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      },
      deleteText: {
        color: brandColors.semantic.error,
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
      },
      bottomSpacing: {
        height: 40,
      },
    }),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>일반</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/profile/terms-of-service')}
            >
              <Ionicons name="document-text-outline" size={24} color={colors.text.secondary} />
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>이용약관</Text>
                <Text style={styles.menuDescription}>서비스 이용약관</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => router.push('/profile/privacy-policy')}
            >
              <Ionicons name="shield-outline" size={24} color={colors.text.secondary} />
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>개인정보처리방침</Text>
                <Text style={styles.menuDescription}>개인정보 보호정책</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>계정</Text>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={handleLogout}
              disabled={isLoading}
            >
              <Ionicons name="log-out-outline" size={24} color={brandColors.semantic.error} />
              <View style={styles.menuInfo}>
                <Text style={[styles.menuTitle, { color: brandColors.semantic.error }]}>
                  로그아웃
                </Text>
                <Text style={styles.menuDescription}>계정에서 로그아웃합니다</Text>
              </View>
              {isLoading && <Ionicons name="time-outline" size={20} color={colors.text.muted} />}
            </TouchableOpacity>
          </View>

          <View style={styles.dangerSection}>
            <Text style={styles.dangerTitle}>위험 구역</Text>
            <Text style={styles.dangerDescription}>
              계정을 삭제하면 담금주 프로젝트, 알림, 프로필 정보가 모두 제거되며 다시 복구할 수
              없습니다.
            </Text>
            <TouchableOpacity
              style={[styles.deleteButton, (isDeletingAccount || isLoading) && { opacity: 0.7 }]}
              onPress={handleDeleteAccount}
              disabled={isDeletingAccount || isLoading}
            >
              <Ionicons name="trash-outline" size={20} color={brandColors.semantic.error} />
              <Text style={styles.deleteText}>
                {isDeletingAccount ? '계정 삭제 중...' : '계정 삭제'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
