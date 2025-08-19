import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { useNotificationStore } from '@/src/stores/notificationStore';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { 
    settings: notificationSettings, 
    isInitialized: notificationInitialized,
    updateSettings: updateNotificationSettings,
    testNotification,
    initializeNotifications 
  } = useNotificationStore();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 알림 시스템 초기화
    if (!notificationInitialized) {
      initializeNotifications();
    }
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

  const handleTestNotification = async () => {
    try {
      await testNotification();
      Alert.alert('테스트 완료', '테스트 알림을 발송했습니다!');
    } catch (error) {
      Alert.alert('오류', '테스트 알림 발송에 실패했습니다.');
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
          trackColor={{ false: '#3c533c', true: '#22c55e' }}
          thumbColor="#ffffff"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>프로필</Text>
          <Text style={styles.headerSubtitle}>계정 및 앱 설정을 관리하세요</Text>
        </View>

        {/* 사용자 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 정보</Text>
          <View style={styles.userInfoContainer}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={32} color="#22c55e" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.nickname || '사용자'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
              {user?.birthdate && (
                <Text style={styles.userBirthdate}>생년월일: {user.birthdate}</Text>
              )}
            </View>
          </View>
        </View>

        {/* 알림 설정 */}
        <View style={styles.section}>
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
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>방해 금지 시간</Text>
                  <Text style={styles.settingDescription}>
                    {notificationSettings.quietHours.enabled
                      ? `${notificationSettings.quietHours.startTime} - ${notificationSettings.quietHours.endTime}`
                      : '설정된 시간 없음'
                    }
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.quietHours.enabled}
                  onValueChange={(value) =>
                    updateNotificationSettings({
                      quietHours: { ...notificationSettings.quietHours, enabled: value }
                    })
                  }
                  trackColor={{ false: '#3c533c', true: '#22c55e' }}
                  thumbColor="#ffffff"
                />
              </View>
            </>
          )}
        </View>

        {/* 앱 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color="#9db89d" />
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>도움말</Text>
              <Text style={styles.menuDescription}>사용법 및 FAQ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9db89d" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text-outline" size={24} color="#9db89d" />
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>이용약관</Text>
              <Text style={styles.menuDescription}>서비스 이용약관</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9db89d" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-outline" size={24} color="#9db89d" />
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>개인정보처리방침</Text>
              <Text style={styles.menuDescription}>개인정보 보호정책</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9db89d" />
          </TouchableOpacity>
        </View>

        {/* 계정 관리 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 관리</Text>
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <View style={styles.menuInfo}>
              <Text style={[styles.menuTitle, styles.logoutText]}>로그아웃</Text>
              <Text style={styles.menuDescription}>계정에서 로그아웃합니다</Text>
            </View>
            {isLoading && <Ionicons name="time-outline" size={20} color="#9db89d" />}
          </TouchableOpacity>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111811',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#9db89d',
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  testButton: {
    backgroundColor: '#293829',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  testButtonText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '600',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c261c',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#293829',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#9db89d',
    fontSize: 14,
    marginBottom: 2,
  },
  userBirthdate: {
    color: '#9db89d',
    fontSize: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c261c',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    color: '#9db89d',
    fontSize: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c261c',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  menuInfo: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuDescription: {
    color: '#9db89d',
    fontSize: 14,
  },
  logoutItem: {
    borderColor: '#ef444420',
  },
  logoutText: {
    color: '#ef4444',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;
