import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Project } from '@/src/types';

export interface DiagnosticResult {
  category: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  action?: string;
}

export class NotificationDiagnostics {
  static async runFullDiagnostics(projects: Project[]): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    // 1. 디바이스 체크
    results.push(...await this.checkDevice());

    // 2. 권한 체크
    results.push(...await this.checkPermissions());

    // 3. 예약된 알림 체크
    results.push(...await this.checkScheduledNotifications());

    // 4. 프로젝트 상태 체크
    results.push(...this.checkProjectsForNotifications(projects));

    return results;
  }

  private static async checkDevice(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    if (!Device.isDevice) {
      results.push({
        category: '디바이스',
        status: 'error',
        message: '시뮬레이터에서는 알림이 작동하지 않습니다',
        details: '실제 디바이스에서 테스트해야 합니다',
        action: '실제 디바이스에서 앱을 실행하세요'
      });
    } else {
      results.push({
        category: '디바이스',
        status: 'success',
        message: '실제 디바이스에서 실행 중입니다',
      });
    }

    return results;
  }

  private static async checkPermissions(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    try {
      const { status } = await Notifications.getPermissionsAsync();
      
      switch (status) {
        case 'granted':
          results.push({
            category: '권한',
            status: 'success',
            message: '알림 권한이 허용되어 있습니다',
          });
          break;
        case 'denied':
          results.push({
            category: '권한',
            status: 'error',
            message: '알림 권한이 거부되었습니다',
            action: '설정에서 알림 권한을 허용하세요'
          });
          break;
        default:
          results.push({
            category: '권한',
            status: 'warning',
            message: `알림 권한 상태: ${status}`,
            action: '알림 권한을 확인하세요'
          });
      }
    } catch (error) {
      results.push({
        category: '권한',
        status: 'error',
        message: '권한 확인 중 오류 발생',
        details: String(error)
      });
    }

    return results;
  }

  private static async checkScheduledNotifications(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      if (scheduledNotifications.length === 0) {
        results.push({
          category: '예약된 알림',
          status: 'warning',
          message: '예약된 알림이 없습니다',
          details: '진행 중인 프로젝트가 있다면 알림이 스케줄링되어야 합니다',
          action: '프로젝트를 생성하거나 알림을 재설정하세요'
        });
      } else {
        results.push({
          category: '예약된 알림',
          status: 'success',
          message: `${scheduledNotifications.length}개의 알림이 예약되어 있습니다`,
        });

        // 알림 시간 체크
        const now = new Date();
        const futureNotifications = scheduledNotifications.filter(notif => {
          const triggerDate = notif.trigger && 'date' in notif.trigger ? notif.trigger.date : null;
          return triggerDate && new Date(triggerDate) > now;
        });

        if (futureNotifications.length === 0) {
          results.push({
            category: '예약된 알림',
            status: 'warning',
            message: '모든 예약된 알림이 과거 시간입니다',
            action: '알림을 재설정하세요'
          });
        }
      }
    } catch (error) {
      results.push({
        category: '예약된 알림',
        status: 'error',
        message: '알림 목록 조회 중 오류 발생',
        details: String(error)
      });
    }

    return results;
  }

  private static checkProjectsForNotifications(projects: Project[]): DiagnosticResult[] {
    const results: DiagnosticResult[] = [];

    const inProgressProjects = projects.filter(p => p.status === 'in_progress');

    if (projects.length === 0) {
      results.push({
        category: '프로젝트',
        status: 'warning',
        message: '프로젝트가 없습니다',
        details: '알림을 받으려면 프로젝트를 생성해야 합니다',
        action: '새 프로젝트를 생성하세요'
      });
    } else if (inProgressProjects.length === 0) {
      results.push({
        category: '프로젝트',
        status: 'warning',
        message: '진행 중인 프로젝트가 없습니다',
        details: '완료된 프로젝트는 알림이 스케줄링되지 않습니다',
        action: '새 프로젝트를 시작하거나 기존 프로젝트를 진행 중으로 변경하세요'
      });
    } else {
      results.push({
        category: '프로젝트',
        status: 'success',
        message: `${inProgressProjects.length}개의 진행 중인 프로젝트가 있습니다`,
      });

      // 프로젝트별 알림 가능성 체크
      inProgressProjects.forEach(project => {
        const now = new Date();
        const endDate = new Date(project.expectedEndDate);
        
        if (endDate <= now) {
          results.push({
            category: '프로젝트',
            status: 'warning',
            message: `"${project.name}" 프로젝트의 완료 예정일이 과거입니다`,
            details: `완료 예정일: ${endDate.toLocaleDateString('ko-KR')}`,
            action: '프로젝트를 완료 처리하거나 완료 예정일을 수정하세요'
          });
        }
      });
    }

    return results;
  }

  static getRecommendedActions(results: DiagnosticResult[]): string[] {
    const actions: string[] = [];
    
    results.forEach(result => {
      if (result.action && result.status !== 'success') {
        actions.push(result.action);
      }
    });

    // 중복 제거
    return [...new Set(actions)];
  }

  static getSummary(results: DiagnosticResult[]): {
    total: number;
    success: number;
    warning: number;
    error: number;
  } {
    return {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      warning: results.filter(r => r.status === 'warning').length,
      error: results.filter(r => r.status === 'error').length,
    };
  }
}

export default NotificationDiagnostics;
