import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StyleSheet,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { useNotificationStore } from '@/src/stores/notificationStore';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import GlassCard from '@/src/components/common/GlassCard';
import { SupabaseService } from '@/src/services/supabaseService';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, logout, refreshUser, deleteAccount } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { colors, brandColors } = useThemeValues();
  const { 
    settings: notificationSettings, 
    isInitialized: notificationInitialized,
    updateSettings: updateNotificationSettings,
    testNotification,
    initializeNotifications 
  } = useNotificationStore();

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // 컴포넌트 마운트 시 알림 시스템 초기화
    if (!notificationInitialized) {
      initializeNotifications();
    }
    
    // 초기 애니메이션
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
  }, [notificationInitialized, initializeNotifications]);

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
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
            // 로그아웃 후 로그인 화면으로 이동
            router.replace('/auth/login');
          },
        },
      ]
    );
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
                  : '계정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.'
              );
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleTestNotification = async () => {
    try {
      await testNotification();
      Alert.alert('테스트 완료', '테스트 알림을 발송했습니다!');
    } catch (error) {
      Alert.alert('오류', '테스트 알림 발송에 실패했습니다.');
    }
  };

  const handleChangeProfileImage = async () => {
    if (uploadingProfileImage) return;

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
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets[0]) {
        setUploadingProfileImage(true);
        
        try {
          const asset = result.assets[0];
          if (asset.uri) {
            // 파일을 ArrayBuffer로 변환 (Blob 대신 사용)
            const imageResponse = await fetch(asset.uri);
            const arrayBuffer = await imageResponse.arrayBuffer();
            const imageData = new Uint8Array(arrayBuffer);
            
            // 고유한 파일명 생성
            const fileName = `profile-images/${user?.id}_${Date.now()}.jpg`;
            
            // Supabase Storage에 업로드
            const publicUrl = await SupabaseService.uploadImage('profile-images', fileName, imageData);
            
            // 프로필 이미지 URL 업데이트
            await SupabaseService.updateProfile(user!.id, { 
              profileImage: publicUrl 
            });
            
            // 사용자 정보 새로고침 (DB에서 최신 정보 가져오기)
            await refreshUser();
            
            console.log('프로필 이미지 업로드 완료:', {
              userId: user?.id,
              imageUrl: publicUrl,
              updatedUser: useAuthStore.getState().user?.profileImage
            });
            
            Alert.alert('성공', '프로필 이미지가 변경되었습니다.');
            
          }
        } catch (error) {
          console.error('프로필 이미지 업로드 실패:', error);
          Alert.alert('오류', '프로필 이미지 업로드에 실패했습니다.');
        } finally {
          setUploadingProfileImage(false);
        }
      }
    } catch (error) {
      console.error('프로필 이미지 선택 오류:', error);
      Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
    }
  };

  const renderNotificationSetting = (
    key: keyof typeof notificationSettings,
    title: string,
    description: string
  ) => {
    if (key === 'quietHours') return null; // 조용한 시간은 별도 처리

    return (
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        <Switch
          value={notificationSettings[key] as boolean}
          onValueChange={(value) => updateNotificationSettings({ [key]: value })}
          trackColor={{ false: colors.background.surface, true: brandColors.accent.primary }}
          thumbColor={colors.text.primary}
        />
      </View>
    );
  };

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
      opacity: 0.3,
    },
    content: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20,
    },
    header: {
      padding: 24,
      marginBottom: 16,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    section: {
      padding: 20,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 20,
      letterSpacing: -0.3,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    userInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      ...shadows.neumorphism.outset,
      backgroundColor: colors.background.elevated,
      borderRadius: 16,
      padding: 16,
    },
    userAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.background.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      borderWidth: 1,
      borderColor: colors.border.accent,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 2,
    },
    userBirthdate: {
      fontSize: 13,
      color: colors.text.muted,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16, // 조금 더 여유있게
      borderBottomWidth: 1,
      borderBottomColor: colors.border.secondary,
    },
    settingInfo: {
      flexDirection: 'column', // 세로 배치로 변경
      alignItems: 'flex-start', // 왼쪽 정렬
      flex: 1,
      paddingRight: 16, // Switch와의 간격 확보
    },
    settingInfoWithIcon: {
      flexDirection: 'row', // 아이콘이 있는 경우 가로 배치
      alignItems: 'center',
      flex: 1,
      paddingRight: 16,
    },
    settingTextContainer: {
      flexDirection: 'column', // 제목과 설명은 세로 배치
      flex: 1,
    },
    settingIcon: {
      marginRight: 12,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4, // 제목과 설명 사이 간격 늘림
    },
    settingDescription: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 18, // 설명 텍스트 가독성 향상
    },
    switch: {
      marginLeft: 12,
    },
    testButton: {
      backgroundColor: colors.background.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border.accent,
      ...shadows.neumorphism.outset,
    },
    testButtonText: {
      color: colors.text.primary,
      fontSize: 13,
      fontWeight: '600',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.secondary,
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
    logoutItem: {
      borderBottomWidth: 0,
    },
    deleteAccountContainer: {
      marginBottom: 20,
    },
    deleteAccountDescription: {
      fontSize: 12,
      color: colors.text.secondary,
      lineHeight: 18,
      marginBottom: 12,
    },
    deleteAccountButton: {
      marginBottom: 16,
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
    bottomSpacing: {
      height: 20,
    },
    avatarImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    uploadingOverlay: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      backgroundColor: brandColors.accent.primary,
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background.elevated,
    },
    changeImageButton: {
      marginTop: 8,
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: colors.background.glass,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border.accent,
    },
    changeImageText: {
      fontSize: 12,
      color: brandColors.accent.primary,
      fontWeight: '500',
    },
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background.primary} />
      
      {/* 배경 그라디언트 */}
      <View style={styles.backgroundGradient} />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 사용자 정보 */}
          <GlassCard style={styles.section} intensity="light">
            <Text style={styles.sectionTitle}>계정 정보</Text>
            <View style={styles.userInfoContainer}>
              <TouchableOpacity 
                style={styles.userAvatar}
                onPress={handleChangeProfileImage}
                disabled={uploadingProfileImage}
              >
                {user?.profileImage ? (
                  <Image 
                    source={{ uri: user.profileImage }} 
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons name="person" size={32} color={brandColors.accent.primary} />
                )}
                {uploadingProfileImage && (
                  <View style={styles.uploadingOverlay}>
                    <Ionicons name="camera" size={16} color={colors.text.primary} />
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.nickname || '사용자'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
                {user?.birthdate && (
                  <Text style={styles.userBirthdate}>생년월일: {user.birthdate}</Text>
                )}
                <TouchableOpacity 
                  style={styles.changeImageButton}
                  onPress={handleChangeProfileImage}
                  disabled={uploadingProfileImage}
                >
                  <Text style={styles.changeImageText}>
                    {uploadingProfileImage ? '업로드 중...' : '프로필 사진 변경'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </GlassCard>

          {/* 테마 설정 */}
          <GlassCard style={styles.section} intensity="medium">
            <Text style={styles.sectionTitle}>테마 설정</Text>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={toggleTheme}
            >
              <View style={styles.settingInfoWithIcon}>
                <Ionicons 
                  name={theme === 'dark' ? 'moon' : 'sunny'} 
                  size={20} 
                  color={brandColors.accent.primary} 
                  style={styles.settingIcon}
                />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>
                    {theme === 'dark' ? '다크 모드' : '라이트 모드'}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {theme === 'dark' ? '어두운 테마를 사용합니다' : '밝은 테마를 사용합니다'}
                  </Text>
                </View>
              </View>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{
                  false: colors.background.elevated,
                  true: brandColors.accent.primary,
                }}
                thumbColor={colors.text.primary}
                style={styles.switch}
              />
            </TouchableOpacity>
          </GlassCard>

          {/* 알림 설정 */}
          <GlassCard style={styles.section} intensity="medium">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>알림 설정</Text>
            {notificationSettings.enabled && (
              <TouchableOpacity
                style={styles.testButton}
                onPress={handleTestNotification}
              >
                <Text style={styles.testButtonText}>테스트</Text>
              </TouchableOpacity>
            )}
          </View>

          {renderNotificationSetting(
            'enabled',
            '푸시 알림',
            '프로젝트 관련 알림을 받습니다'
          )}

          {notificationSettings.enabled && (
            <>
              {renderNotificationSetting(
                'completionReminders',
                '완료 알림',
                '프로젝트 완료 예정일 알림을 받습니다'
              )}

              {renderNotificationSetting(
                'progressChecks',
                '진행 상황 알림',
                '중간 점검 시기 알림을 받습니다'
              )}

              {renderNotificationSetting(
                'soundEnabled',
                '알림 소리',
                '알림 시 소리를 재생합니다'
              )}

              {/* 조용한 시간 설정 */}
              <TouchableOpacity 
                style={styles.settingRow}
                onPress={() => router.push('/profile/quiet-hours' as any)}
              >
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>방해 금지 시간</Text>
                  <Text style={styles.settingDescription}>
                    {notificationSettings.quietHours.enabled
                      ? `${notificationSettings.quietHours.startTime} - ${notificationSettings.quietHours.endTime}`
                      : '설정된 시간 없음'
                    }
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </>
          )}
          </GlassCard>

          {/* 앱 정보 */}
          <GlassCard style={styles.section} intensity="medium">
          <Text style={styles.sectionTitle}>알림 관리</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/notification-history' as any)}
          >
            <Ionicons name="time-outline" size={24} color={colors.text.secondary} />
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>알림 히스토리</Text>
              <Text style={styles.menuDescription}>예약된 알림 목록을 확인합니다</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/notification-debug' as any)}
          >
            <Ionicons name="bug-outline" size={24} color={brandColors.semantic.warning} />
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>알림 디버그</Text>
              <Text style={styles.menuDescription}>알림 시스템 진단 및 문제 해결</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          </GlassCard>

          {/* 앱 정보 */}
          <GlassCard style={styles.section} intensity="light">
          <Text style={styles.sectionTitle}>앱 정보</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color={colors.text.secondary} />
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>도움말</Text>
              <Text style={styles.menuDescription}>사용법 및 FAQ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text-outline" size={24} color={colors.text.secondary} />
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>이용약관</Text>
              <Text style={styles.menuDescription}>서비스 이용약관</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-outline" size={24} color={colors.text.secondary} />
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>개인정보처리방침</Text>
              <Text style={styles.menuDescription}>개인정보 보호정책</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          </GlassCard>

          {/* 계정 관리 */}
          <GlassCard style={styles.section} intensity="heavy">
            <Text style={styles.sectionTitle}>계정 관리</Text>
            
            <View style={styles.deleteAccountContainer}>
              <Text style={styles.deleteAccountDescription}>
                계정을 삭제하면 담금주 프로젝트, 알림, 프로필 정보가 모두 제거되며 다시 복구할 수 없습니다.
              </Text>
              <TouchableOpacity
                style={[
                  styles.logoutButton,
                  styles.deleteAccountButton,
                  (isDeletingAccount || isLoading) && { opacity: 0.7 },
                ]}
                onPress={handleDeleteAccount}
                disabled={isDeletingAccount || isLoading}
              >
                <Ionicons name="trash-outline" size={22} color={brandColors.semantic.error} />
                <Text style={styles.logoutText}>
                  {isDeletingAccount ? '계정 삭제 중...' : '계정 삭제'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
              disabled={isLoading}
            >
              <Ionicons name="log-out-outline" size={24} color={brandColors.semantic.error} />
              <View style={styles.menuInfo}>
                <Text style={[styles.menuTitle, styles.logoutText]}>로그아웃</Text>
                <Text style={styles.menuDescription}>계정에서 로그아웃합니다</Text>
              </View>
              {isLoading && <Ionicons name="time-outline" size={20} color={colors.text.muted} />}
            </TouchableOpacity>
          </GlassCard>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};



export default ProfileScreen;
