import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import GlassCard from '@/src/components/common/GlassCard';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';
import { useTheme } from '@/src/contexts/ThemeContext';

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  date: Date;
  data?: any;
}

const NotificationHistoryScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { colors, brandColors } = useThemeValues();
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const loadNotificationHistory = async () => {
    setIsLoading(true);
    try {
      // 예약된 알림 목록 가져오기
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`[알림 히스토리] 총 ${scheduledNotifications.length}개의 예약된 알림 발견`);

      const historyData: NotificationHistory[] = scheduledNotifications.map((notif, index) => {
        let triggerDate: Date = new Date();

        if (notif.trigger) {
          if ('date' in notif.trigger && notif.trigger.date) {
            // Date 기반 트리거
            triggerDate =
              typeof notif.trigger.date === 'number'
                ? new Date(notif.trigger.date)
                : new Date(notif.trigger.date);
          } else if ('seconds' in notif.trigger && typeof notif.trigger.seconds === 'number') {
            // TimeInterval 기반 트리거 - 현재 시간부터 X초 후
            triggerDate = new Date(Date.now() + notif.trigger.seconds * 1000);
          }
        }

        return {
          id: notif.identifier,
          title: notif.content.title || '알림',
          body: notif.content.body || '',
          date: triggerDate,
          data: notif.content.data,
        };
      });

      // 날짜순으로 정렬 (최신순)
      historyData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log(`[알림 히스토리] 최종 ${historyData.length}개 알림 로드 완료`);
      setNotifications(historyData);
    } catch (error) {
      console.error('알림 히스토리 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotificationHistory();

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
  }, []);

  const formatDate = (date: Date) => {
    const now = new Date();
    const targetDate = new Date(date);

    // 날짜가 올바르게 파싱되었는지 확인
    if (isNaN(targetDate.getTime())) {
      console.error(`[날짜 오류] 잘못된 날짜:`, date);
      return '날짜 오류';
    }

    // 날짜만 비교하기 위해 시간을 0으로 설정
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDateOnly = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
    );

    const diffTime = targetDateOnly.getTime() - nowDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '내일';
    } else if (diffDays === -1) {
      return '어제';
    } else if (diffDays > 1 && diffDays <= 7) {
      return `${diffDays}일 후`;
    } else if (diffDays < -1 && diffDays >= -7) {
      return `${Math.abs(diffDays)}일 전`;
    } else {
      return targetDate.toLocaleDateString('ko-KR', {
        year: targetDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNotificationIcon = (data: any) => {
    if (data?.type === 'completion_reminder') return '🎉';
    if (data?.type === 'progress_check') return '📊';
    if (data?.type === 'completion_due') return '🍻';
    return '🔔';
  };

  const renderNotificationItem = (item: NotificationHistory, index: number) => {
    return (
      <GlassCard key={item.id} style={styles.notificationCard} intensity="light">
        <View style={styles.notificationIcon}>
          <Text style={styles.iconText}>{getNotificationIcon(item.data)}</Text>
        </View>

        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationBody}>{item.body}</Text>
          <View style={styles.notificationMeta}>
            <Text style={styles.notificationDate}>
              {formatDate(item.date)} {formatTime(item.date)}
            </Text>
          </View>
        </View>
      </GlassCard>
    );
  };

  const styles = useThemedStyles(() => ({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    backgroundGradient: {
      position: 'absolute' as const,
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
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 20,
      paddingVertical: 16,
      margin: 20,
      marginBottom: 0,
    },
    backButton: {
      width: 44,
      height: 44,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: 22,
      backgroundColor: colors.background.surface,
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },
    headerTitle: {
      color: colors.text.primary,
      fontSize: 20,
      fontWeight: '700' as const,
      flex: 1,
      textAlign: 'center' as const,
      letterSpacing: -0.3,
    },
    refreshButton: {
      width: 44,
      height: 44,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: 22,
      backgroundColor: colors.background.surface,
      borderWidth: 1,
      borderColor: colors.border.accent,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20,
    },
    descriptionContainer: {
      marginBottom: 20,
      padding: 20,
    },
    descriptionHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: 8,
    },
    descriptionTitle: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: 'bold' as const,
      marginLeft: 8,
    },
    descriptionText: {
      color: colors.text.secondary,
      fontSize: 14,
      lineHeight: 20,
    },
    notificationsContainer: {
      paddingHorizontal: 16,
    },
    sectionTitle: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: 'bold' as const,
      marginBottom: 16,
    },
    notificationsList: {
      backgroundColor: colors.background.surface,
      borderRadius: 12,
      overflow: 'hidden' as const,
    },
    notificationCard: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      padding: 20,
      marginBottom: 12,
    },
    lastItem: {
      borderBottomWidth: 0,
    },
    notificationIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.background.elevated,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginRight: 16,
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },
    iconText: {
      fontSize: 18,
    },
    notificationContent: {
      flex: 1,
    },
    notificationTitle: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: '600' as const,
      marginBottom: 4,
    },
    notificationBody: {
      color: colors.text.secondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 8,
    },
    notificationMeta: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    notificationDate: {
      color: colors.text.muted,
      fontSize: 12,
    },
    emptyContainer: {
      alignItems: 'center' as const,
      paddingVertical: 60,
      backgroundColor: colors.background.surface,
      borderRadius: 12,
    },
    emptyTitle: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: 'bold' as const,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      color: colors.text.secondary,
      fontSize: 14,
      textAlign: 'center' as const,
      paddingHorizontal: 32,
    },
    bottomSpacing: {
      height: 32,
    },
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.primary}
      />

      {/* 배경 그라디언트 */}
      <View style={styles.backgroundGradient} />

      {/* 헤더 */}
      <GlassCard style={styles.header} intensity="medium">
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림 히스토리</Text>
        <TouchableOpacity onPress={loadNotificationHistory} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={brandColors.accent.primary} />
        </TouchableOpacity>
      </GlassCard>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadNotificationHistory}
              tintColor={brandColors.accent.primary}
              colors={[brandColors.accent.primary]}
            />
          }
        >
          {/* 설명 */}
          <GlassCard style={styles.descriptionContainer} intensity="light">
            <View style={styles.descriptionHeader}>
              <Ionicons name="time" size={20} color={brandColors.accent.primary} />
              <Text style={styles.descriptionTitle}>예약된 알림</Text>
            </View>
            <Text style={styles.descriptionText}>
              현재 예약되어 있는 프로젝트 알림들을 확인할 수 있습니다.
            </Text>
          </GlassCard>

          {/* 알림 목록 */}
          <View style={styles.notificationsContainer}>
            {notifications.length === 0 ? (
              <GlassCard style={styles.emptyContainer} intensity="light">
                <Ionicons name="notifications-off-outline" size={48} color={colors.text.muted} />
                <Text style={styles.emptyTitle}>예약된 알림이 없습니다</Text>
                <Text style={styles.emptySubtitle}>
                  프로젝트를 생성하면 자동으로 알림이 설정됩니다
                </Text>
              </GlassCard>
            ) : (
              <>
                <Text style={styles.sectionTitle}>총 {notifications.length}개의 알림</Text>
                <View style={styles.notificationsList}>
                  {notifications.map(renderNotificationItem)}
                </View>
              </>
            )}
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default NotificationHistoryScreen;
