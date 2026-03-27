import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProjectStore } from '@/src/stores/projectStore';
import { useNotificationStore } from '@/src/stores/notificationStore';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_COLORS, SHADOWS, ANIMATIONS } from '@/constants/Colors';
import GlassCard from '@/src/components/common/GlassCard';
import * as Notifications from 'expo-notifications';
import NotificationService from '@/src/services/notificationService';
import { NotificationDiagnostics, DiagnosticResult } from '@/src/utils/notificationDiagnostics';

const NotificationDebugScreen: React.FC = () => {
  const router = useRouter();
  const { projects } = useProjectStore();
  const { settings, isInitialized } = useNotificationStore();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const runDiagnostics = async () => {
    setIsLoading(true);

    try {
      // 새로운 진단 기능 사용
      const diagnosis = await NotificationService.diagnoseNotificationSystem();
      await NotificationService.logNotificationSystemStatus();

      // 기존 진단 유틸리티도 실행
      let diagnostics: DiagnosticResult[] = [];
      try {
        diagnostics = await NotificationDiagnostics.runFullDiagnostics(projects);
      } catch (diagError) {
        console.warn('기존 진단 유틸리티 실패:', diagError);
      }

      setDiagnosticResults(diagnostics);

      // 통합된 디버그 정보 구성
      const info = {
        // 새로운 진단 결과
        systemDiagnosis: diagnosis,

        // 기존 정보들
        permissionStatus: diagnosis.permissions?.status || 'unknown',
        scheduledNotifications: diagnosis.scheduledNotifications,
        notificationSettings: settings,
        notificationInitialized: isInitialized,
        serviceEnabled: NotificationService.isNotificationEnabled(),

        // 프로젝트 정보
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          status: p.status,
          startDate: p.startDate,
          expectedEndDate: p.expectedEndDate,
          recipeId: p.recipeId,
          type: p.type,
        })),

        // 추가 메타데이터
        timestamp: new Date().toISOString(),
        projectCount: projects.length,
        inProgressProjects: projects.filter((p) => p.status === 'in_progress').length,
      };

      setDebugInfo(info);

      console.log('🔍 전체 진단 결과:', info);
    } catch (error) {
      console.error('진단 실패:', error);
      Alert.alert('오류', '진단 실행 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const testNotificationScheduling = async () => {
    const { rescheduleAllNotifications } = useProjectStore.getState();

    if (projects.length === 0) {
      Alert.alert('알림', '테스트할 프로젝트가 없습니다.');
      return;
    }

    try {
      const success = await rescheduleAllNotifications();
      if (success) {
        Alert.alert(
          '성공',
          __DEV__
            ? '개발환경에서는 실제 알림 예약이 제한됩니다. 2초 후 즉시 테스트 알림을 받으셔야 합니다.'
            : '모든 프로젝트의 알림을 다시 스케줄링했습니다.',
        );
        runDiagnostics(); // 다시 진단 실행
      } else {
        Alert.alert('오류', '일부 프로젝트의 알림 설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('알림 스케줄링 실패:', error);
      Alert.alert(
        '오류',
        `알림 스케줄링에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const testImmediateNotification = async () => {
    try {
      await NotificationService.sendImmediateNotification(
        '🧪 개발환경 테스트',
        '즉시 알림 테스트가 성공했습니다! 🎉',
        { test: true, timestamp: Date.now() },
      );
      Alert.alert('테스트 알림 발송', '즉시 알림을 발송했습니다.');
    } catch (error) {
      console.error('테스트 알림 실패:', error);
      Alert.alert('오류', '테스트 알림 발송에 실패했습니다.');
    }
  };

  const clearAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert('완료', '모든 예약된 알림을 취소했습니다.');
      runDiagnostics();
    } catch (error) {
      Alert.alert('오류', '알림 취소에 실패했습니다.');
    }
  };

  useEffect(() => {
    runDiagnostics();

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const renderDiagnosticSummary = () => {
    const summary = NotificationDiagnostics.getSummary(diagnosticResults);
    const actions = NotificationDiagnostics.getRecommendedActions(diagnosticResults);

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{summary.success}</Text>
            <Text style={[styles.statLabel, { color: '#22c55e' }]}>정상</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{summary.warning}</Text>
            <Text style={[styles.statLabel, { color: '#f59e0b' }]}>주의</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{summary.error}</Text>
            <Text style={[styles.statLabel, { color: '#ef4444' }]}>오류</Text>
          </View>
        </View>

        {actions.length > 0 && (
          <View style={styles.recommendedActions}>
            <Text style={styles.actionsTitle}>💡 권장 조치</Text>
            {actions.map((action, index) => (
              <Text key={index} style={styles.actionText}>
                • {action}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderDiagnosticResult = (result: DiagnosticResult, index: number) => {
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'success':
          return '✅';
        case 'warning':
          return '⚠️';
        case 'error':
          return '❌';
        default:
          return 'ℹ️';
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'success':
          return '#22c55e';
        case 'warning':
          return '#f59e0b';
        case 'error':
          return '#ef4444';
        default:
          return '#9db89d';
      }
    };

    return (
      <View key={index} style={styles.diagnosticItem}>
        <View style={styles.diagnosticHeader}>
          <Text style={styles.diagnosticIcon}>{getStatusIcon(result.status)}</Text>
          <Text style={styles.diagnosticCategory}>{result.category}</Text>
        </View>
        <Text style={[styles.diagnosticMessage, { color: getStatusColor(result.status) }]}>
          {result.message}
        </Text>
        {result.details && <Text style={styles.diagnosticDetails}>{result.details}</Text>}
        {result.action && <Text style={styles.diagnosticAction}>💡 {result.action}</Text>}
      </View>
    );
  };

  const renderDebugSection = (title: string, data: any) => {
    return (
      <GlassCard style={styles.section} intensity="light">
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>
            {typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data)}
          </Text>
        </View>
      </GlassCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_COLORS.background.primary} />

      {/* 배경 그라디언트 */}
      <View style={styles.backgroundGradient} />

      {/* 헤더 */}
      <GlassCard style={styles.header} intensity="medium">
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BRAND_COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림 디버그</Text>
        <TouchableOpacity onPress={runDiagnostics} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={BRAND_COLORS.accent.primary} />
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
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 빠른 액션 */}
          <GlassCard style={styles.section} intensity="medium">
            <Text style={styles.sectionTitle}>빠른 진단</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={runDiagnostics}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>{isLoading ? '진단 중...' : '진단 실행'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={testNotificationScheduling}
              >
                <Text style={styles.buttonText}>모든 알림 재설정</Text>
              </TouchableOpacity>

              {__DEV__ && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.testButton]}
                  onPress={testImmediateNotification}
                >
                  <Text style={styles.buttonText}>🧪 즉시 테스트 알림</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={clearAllNotifications}
              >
                <Text style={styles.buttonText}>모든 알림 삭제</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* 진단 요약 */}
          {diagnosticResults.length > 0 && (
            <GlassCard style={styles.section} intensity="light">
              <Text style={styles.sectionTitle}>🔍 종합 진단 결과</Text>
              {renderDiagnosticSummary()}
            </GlassCard>
          )}

          {/* 상세 진단 결과 */}
          {diagnosticResults.length > 0 && (
            <GlassCard style={styles.section} intensity="light">
              <Text style={styles.sectionTitle}>📋 상세 진단</Text>
              {diagnosticResults.map((result, index) => renderDiagnosticResult(result, index))}
            </GlassCard>
          )}

          {/* 진단 결과 */}
          {debugInfo.permissionStatus && (
            <>
              {renderDebugSection('1. 알림 권한 상태', debugInfo.permissionStatus)}

              {renderDebugSection(
                '2. 예약된 알림 개수',
                debugInfo.scheduledNotifications?.length || 0,
              )}

              {debugInfo.scheduledNotifications?.length > 0 && (
                <GlassCard style={styles.section} intensity="light">
                  <Text style={styles.sectionTitle}>예약된 알림 상세</Text>
                  {debugInfo.scheduledNotifications.map((notif: any, index: number) => (
                    <View key={index} style={styles.notificationItem}>
                      <Text style={styles.notificationTitle}>
                        {notif.content.title || '제목 없음'}
                      </Text>
                      <Text style={styles.notificationBody}>
                        {notif.content.body || '내용 없음'}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {notif.trigger?.date ? formatDate(notif.trigger.date) : '시간 정보 없음'}
                      </Text>
                    </View>
                  ))}
                </GlassCard>
              )}

              {renderDebugSection('3. 알림 설정', {
                enabled: debugInfo.notificationSettings?.enabled,
                completionReminders: debugInfo.notificationSettings?.completionReminders,
                progressChecks: debugInfo.notificationSettings?.progressChecks,
                soundEnabled: debugInfo.notificationSettings?.soundEnabled,
                quietHours: debugInfo.notificationSettings?.quietHours,
              })}

              {renderDebugSection('4. 서비스 상태', {
                initialized: debugInfo.notificationInitialized,
                serviceEnabled: debugInfo.serviceEnabled,
              })}

              {renderDebugSection('5. 프로젝트 개수', debugInfo.projects?.length || 0)}

              {debugInfo.projects?.length > 0 && (
                <GlassCard style={styles.section} intensity="light">
                  <Text style={styles.sectionTitle}>프로젝트 목록</Text>
                  {debugInfo.projects.map((project: any, index: number) => (
                    <View key={index} style={styles.projectItem}>
                      <Text style={styles.projectName}>{project.name}</Text>
                      <Text style={styles.projectInfo}>
                        상태: {project.status} | 레시피: {project.recipeId || '없음'}
                      </Text>
                      <Text style={styles.projectDates}>
                        {project.startDate} → {project.expectedEndDate}
                      </Text>
                    </View>
                  ))}
                </GlassCard>
              )}
            </>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.background.primary,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: BRAND_COLORS.background.secondary,
    opacity: 0.3,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    margin: 20,
    marginBottom: 0,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: BRAND_COLORS.background.surface,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border.secondary,
    ...SHADOWS.neumorphism.outset,
  },
  headerTitle: {
    color: BRAND_COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  refreshButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: BRAND_COLORS.background.surface,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border.accent,
    ...SHADOWS.neumorphism.outset,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: BRAND_COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  buttonContainer: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    ...SHADOWS.neumorphism.outset,
  },
  primaryButton: {
    backgroundColor: BRAND_COLORS.accent.primary,
    borderColor: BRAND_COLORS.accent.secondary,
  },
  secondaryButton: {
    backgroundColor: BRAND_COLORS.background.surface,
    borderColor: BRAND_COLORS.border.accent,
  },
  dangerButton: {
    backgroundColor: BRAND_COLORS.background.surface,
    borderColor: `${BRAND_COLORS.semantic.error}40`,
  },
  testButton: {
    backgroundColor: BRAND_COLORS.background.surface,
    borderColor: `${BRAND_COLORS.accent.primary}60`,
  },
  buttonText: {
    color: BRAND_COLORS.text.primary,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dataContainer: {
    backgroundColor: BRAND_COLORS.background.elevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border.secondary,
    ...SHADOWS.neumorphism.inset,
  },
  dataText: {
    color: BRAND_COLORS.text.secondary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  notificationItem: {
    backgroundColor: BRAND_COLORS.background.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border.secondary,
  },
  notificationTitle: {
    color: BRAND_COLORS.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationBody: {
    color: BRAND_COLORS.text.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  notificationTime: {
    color: '#666',
    fontSize: 11,
  },
  projectItem: {
    backgroundColor: BRAND_COLORS.background.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border.secondary,
  },
  projectName: {
    color: BRAND_COLORS.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  projectInfo: {
    color: BRAND_COLORS.text.secondary,
    fontSize: 12,
    marginBottom: 2,
  },
  projectDates: {
    color: '#666',
    fontSize: 11,
  },
  bottomSpacing: {
    height: 32,
  },
  summaryContainer: {
    backgroundColor: BRAND_COLORS.background.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border.secondary,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: BRAND_COLORS.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendedActions: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#3c533c',
  },
  actionsTitle: {
    color: BRAND_COLORS.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  actionText: {
    color: BRAND_COLORS.text.secondary,
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  diagnosticItem: {
    backgroundColor: BRAND_COLORS.background.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border.secondary,
  },
  diagnosticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  diagnosticIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  diagnosticCategory: {
    color: BRAND_COLORS.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  diagnosticMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  diagnosticDetails: {
    color: BRAND_COLORS.text.secondary,
    fontSize: 12,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  diagnosticAction: {
    color: BRAND_COLORS.accent.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default NotificationDebugScreen;
