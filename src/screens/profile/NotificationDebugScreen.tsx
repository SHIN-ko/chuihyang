import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProjectStore } from '@/src/stores/projectStore';
import { useNotificationStore } from '@/src/stores/notificationStore';
import { Ionicons } from '@expo/vector-icons';
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

  const runDiagnostics = async () => {
    setIsLoading(true);
    const info: any = {};

    try {
      // 진단 유틸리티 실행
      const diagnostics = await NotificationDiagnostics.runFullDiagnostics(projects);
      setDiagnosticResults(diagnostics);

      // 1. 알림 권한 확인
      const { status } = await Notifications.getPermissionsAsync();
      info.permissionStatus = status;

      // 2. 예약된 알림 목록
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      info.scheduledNotifications = scheduledNotifications;

      // 3. 알림 설정 상태
      info.notificationSettings = settings;
      info.notificationInitialized = isInitialized;

      // 4. 프로젝트 목록
      info.projects = projects.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        startDate: p.startDate,
        expectedEndDate: p.expectedEndDate,
        recipeId: p.recipeId
      }));

      // 5. NotificationService 상태
      info.serviceEnabled = NotificationService.isNotificationEnabled();

      setDebugInfo(info);
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
        Alert.alert('성공', `모든 프로젝트의 알림을 다시 스케줄링했습니다.`);
        runDiagnostics(); // 다시 진단 실행
      } else {
        Alert.alert('오류', '일부 프로젝트의 알림 설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('알림 스케줄링 실패:', error);
      Alert.alert('오류', `알림 스케줄링에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`);
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
              <Text key={index} style={styles.actionText}>• {action}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderDiagnosticResult = (result: DiagnosticResult, index: number) => {
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'success': return '✅';
        case 'warning': return '⚠️';
        case 'error': return '❌';
        default: return 'ℹ️';
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'success': return '#22c55e';
        case 'warning': return '#f59e0b';
        case 'error': return '#ef4444';
        default: return '#9db89d';
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
        {result.details && (
          <Text style={styles.diagnosticDetails}>{result.details}</Text>
        )}
        {result.action && (
          <Text style={styles.diagnosticAction}>💡 {result.action}</Text>
        )}
      </View>
    );
  };

  const renderDebugSection = (title: string, data: any) => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>
            {typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111811" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림 디버그</Text>
        <TouchableOpacity onPress={runDiagnostics} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#9db89d" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 빠른 액션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>빠른 진단</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={runDiagnostics}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? '진단 중...' : '진단 실행'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={testNotificationScheduling}
            >
              <Text style={styles.buttonText}>모든 알림 재설정</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]}
              onPress={clearAllNotifications}
            >
              <Text style={styles.buttonText}>모든 알림 삭제</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 진단 요약 */}
        {diagnosticResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 종합 진단 결과</Text>
            {renderDiagnosticSummary()}
          </View>
        )}

        {/* 상세 진단 결과 */}
        {diagnosticResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 상세 진단</Text>
            {diagnosticResults.map((result, index) => renderDiagnosticResult(result, index))}
          </View>
        )}

        {/* 진단 결과 */}
        {debugInfo.permissionStatus && (
          <>
            {renderDebugSection('1. 알림 권한 상태', debugInfo.permissionStatus)}
            
            {renderDebugSection('2. 예약된 알림 개수', debugInfo.scheduledNotifications?.length || 0)}
            
            {debugInfo.scheduledNotifications?.length > 0 && (
              <View style={styles.section}>
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
              </View>
            )}
            
            {renderDebugSection('3. 알림 설정', {
              enabled: debugInfo.notificationSettings?.enabled,
              completionReminders: debugInfo.notificationSettings?.completionReminders,
              progressChecks: debugInfo.notificationSettings?.progressChecks,
              soundEnabled: debugInfo.notificationSettings?.soundEnabled,
              quietHours: debugInfo.notificationSettings?.quietHours
            })}
            
            {renderDebugSection('4. 서비스 상태', {
              initialized: debugInfo.notificationInitialized,
              serviceEnabled: debugInfo.serviceEnabled
            })}
            
            {renderDebugSection('5. 프로젝트 개수', debugInfo.projects?.length || 0)}
            
            {debugInfo.projects?.length > 0 && (
              <View style={styles.section}>
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
              </View>
            )}
          </>
        )}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3c533c',
  },
  backButton: {
    width: 40,
    height: 40,
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
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonContainer: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#22c55e',
  },
  secondaryButton: {
    backgroundColor: '#3b82f6',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dataContainer: {
    backgroundColor: '#1c261c',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  dataText: {
    color: '#9db89d',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  notificationItem: {
    backgroundColor: '#1c261c',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  notificationTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationBody: {
    color: '#9db89d',
    fontSize: 12,
    marginBottom: 4,
  },
  notificationTime: {
    color: '#666',
    fontSize: 11,
  },
  projectItem: {
    backgroundColor: '#1c261c',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  projectName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  projectInfo: {
    color: '#9db89d',
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
    backgroundColor: '#1c261c',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3c533c',
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
    color: 'white',
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
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  actionText: {
    color: '#9db89d',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  diagnosticItem: {
    backgroundColor: '#1c261c',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3c533c',
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
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  diagnosticMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  diagnosticDetails: {
    color: '#9db89d',
    fontSize: 12,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  diagnosticAction: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default NotificationDebugScreen;
