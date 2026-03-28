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
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SupabaseService } from '@/src/services/supabaseService';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();
  const { colors, brandColors } = useThemeValues();
  const {
    settings: notificationSettings,
    isInitialized: notificationInitialized,
    updateSettings: updateNotificationSettings,
    testNotification,
    initializeNotifications,
  } = useNotificationStore();

  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (!notificationInitialized) {
      initializeNotifications();
    }

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
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
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
            const imageResponse = await fetch(asset.uri);
            const arrayBuffer = await imageResponse.arrayBuffer();
            const imageData = new Uint8Array(arrayBuffer);

            const fileName = `profile-images/${user?.id}_${Date.now()}.jpg`;

            const publicUrl = await SupabaseService.uploadImage(
              'profile-images',
              fileName,
              imageData,
            );

            await SupabaseService.updateProfile(user!.id, {
              profileImage: publicUrl,
            });

            await refreshUser();

            console.log('프로필 이미지 업로드 완료:', {
              userId: user?.id,
              imageUrl: publicUrl,
              updatedUser: useAuthStore.getState().user?.profileImage,
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
    description: string,
  ) => {
    if (key === 'quietHours') return null;

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

  const styles = useThemedStyles(({ colors, shadows, brandColors }) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background.primary,
      },
      content: {
        flex: 1,
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.secondary,
      },
      settingInfo: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        flex: 1,
        paddingRight: 16,
      },
      settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 4,
      },
      settingDescription: {
        fontSize: 13,
        color: colors.text.secondary,
        lineHeight: 18,
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
      bottomSpacing: {
        height: 20,
      },
    }),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

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
            <Text style={styles.sectionTitle}>계정 정보</Text>
            <View style={styles.userInfoContainer}>
              <TouchableOpacity
                style={styles.userAvatar}
                onPress={handleChangeProfileImage}
                disabled={uploadingProfileImage}
              >
                {user?.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
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
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>알림 설정</Text>
              {notificationSettings.enabled && (
                <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
                  <Text style={styles.testButtonText}>테스트</Text>
                </TouchableOpacity>
              )}
            </View>

            {renderNotificationSetting('enabled', '푸시 알림', '프로젝트 관련 알림을 받습니다')}

            {notificationSettings.enabled && (
              <>
                {renderNotificationSetting(
                  'completionReminders',
                  '완료 알림',
                  '프로젝트 완료 예정일 알림을 받습니다',
                )}

                {renderNotificationSetting(
                  'progressChecks',
                  '진행 상황 알림',
                  '중간 점검 시기 알림을 받습니다',
                )}

                {renderNotificationSetting(
                  'soundEnabled',
                  '알림 소리',
                  '알림 시 소리를 재생합니다',
                )}

                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => router.push('/profile/quiet-hours')}
                >
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>방해 금지 시간</Text>
                    <Text style={styles.settingDescription}>
                      {notificationSettings.quietHours.enabled
                        ? `${notificationSettings.quietHours.startTime} - ${notificationSettings.quietHours.endTime}`
                        : '설정된 시간 없음'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>알림 관리</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/profile/notification-history')}
            >
              <Ionicons name="time-outline" size={24} color={colors.text.secondary} />
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>알림 히스토리</Text>
                <Text style={styles.menuDescription}>예약된 알림 목록을 확인합니다</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => router.push('/profile/notification-debug')}
            >
              <Ionicons name="bug-outline" size={24} color={brandColors.semantic.warning} />
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>알림 디버그</Text>
                <Text style={styles.menuDescription}>알림 시스템 진단 및 문제 해결</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>앱 정보</Text>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="help-circle-outline" size={24} color={colors.text.secondary} />
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>도움말</Text>
                <Text style={styles.menuDescription}>사용법 및 FAQ</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => router.push('/profile/settings')}
            >
              <Ionicons name="settings-outline" size={24} color={colors.text.secondary} />
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>설정</Text>
                <Text style={styles.menuDescription}>계정 관리, 이용약관, 개인정보처리방침</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
