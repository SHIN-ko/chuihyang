import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Project } from '@/src/types';

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSchedule {
  id: string;
  projectId: string;
  type: 'completion_reminder' | 'progress_check' | 'completion_due';
  title: string;
  body: string;
  scheduledDate: Date;
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private pushToken: string | null = null;
  private isEnabled: boolean = true;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // 알림 권한 요청 및 초기 설정
  async initialize(): Promise<boolean> {
    try {
      // 물리적 디바이스 확인
      if (!Device.isDevice) {
        console.log('알림은 실제 디바이스에서만 작동합니다.');
        return false;
      }

      // 기존 권한 상태 확인
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // 권한이 없으면 요청
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('알림 권한이 거부되었습니다.');
        return false;
      }

      // Push Token 획득 (로컬 개발 환경에서는 스킵)
      try {
        if (Constants.easConfig?.projectId) {
          this.pushToken = (
            await Notifications.getExpoPushTokenAsync({
              projectId: Constants.easConfig.projectId,
            })
          ).data;
          console.log('Push Token 획득 완료');
        } else {
          console.log('로컬 개발 환경: Push Token 생성을 건너뜁니다.');
        }
      } catch (error) {
        console.log('Push Token 획득 실패 (개발 환경에서는 정상):', error);
      }

      // Android 알림 채널 설정
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('project-reminders', {
          name: '프로젝트 알림',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#22c55e',
        });
      }

      console.log('알림 시스템 초기화 완료');
      return true;
    } catch (error) {
      console.error('알림 초기화 실패:', error);
      return false;
    }
  }

  // 알림 활성화 상태 설정
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.cancelAllProjectNotifications();
    }
  }

  // 알림 활성화 상태 확인
  isNotificationEnabled(): boolean {
    return this.isEnabled;
  }

  // 프로젝트 관련 모든 알림 스케줄링
  async scheduleProjectNotifications(project: Project): Promise<void> {
    if (!this.isEnabled) return;

    // 이미 완료된 프로젝트는 알림 설정하지 않음
    if (project.status === 'completed') {
      console.log(`${project.name} 프로젝트는 이미 완료되어 알림을 설정하지 않습니다.`);
      return;
    }

    try {
      // 기존 알림 취소
      await this.cancelProjectNotifications(project.id);

      const notifications: NotificationSchedule[] = [];
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.expectedEndDate);
      const projectName = project.name;

      console.log(`=== ${projectName} 프로젝트 알림 설정 ===`);
      console.log(`시작일: ${startDate.toLocaleString('ko-KR')}`);
      console.log(`완성일: ${endDate.toLocaleString('ko-KR')}`);
      console.log(`현재시간: ${new Date().toLocaleString('ko-KR')}`);

      // 완료 3일 전 알림
      const threeDaysBefore = new Date(endDate.getTime());
      threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
      threeDaysBefore.setHours(10, 0, 0, 0); // 오전 10시

      const now = new Date();
      
      // 날짜 비교를 위해 오늘 날짜를 정확히 구하기
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const endDateOnly = new Date(endDate.getTime());
      endDateOnly.setHours(0, 0, 0, 0);
      
      console.log(`오늘 날짜: ${today.toLocaleString('ko-KR')}`);
      console.log(`완성일 날짜: ${endDateOnly.toLocaleString('ko-KR')}`);
      const daysUntilCompletion = Math.ceil((endDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`완성까지 남은 날짜: ${daysUntilCompletion}일`);
      
      console.log(`3일 전 알림 시간: ${threeDaysBefore.toLocaleString('ko-KR')}`);
      console.log(`3일 전 알림 조건: ${threeDaysBefore > now} (${daysUntilCompletion} >= 3)`);
      
      if (threeDaysBefore > now && daysUntilCompletion >= 3) {
        notifications.push({
          id: `${project.id}-3days`,
          projectId: project.id,
          type: 'completion_reminder',
          title: '🥃 곧 완성이에요!',
          body: `${projectName}이(가) 3일 후 완성 예정입니다. 준비해주세요!`,
          scheduledDate: threeDaysBefore,
          data: { projectId: project.id, type: 'completion_reminder' },
        });
        console.log('✓ 3일 전 알림 추가됨');
      } else {
        console.log('✗ 3일 전 알림 스킵 (이미 지난 시간)');
      }

      // 완료 1일 전 알림
      const oneDayBefore = new Date(endDate.getTime());
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      oneDayBefore.setHours(18, 0, 0, 0); // 오후 6시

      console.log(`1일 전 알림 시간: ${oneDayBefore.toLocaleString('ko-KR')}`);
      console.log(`1일 전 알림 조건: ${oneDayBefore > now} (${daysUntilCompletion} === 2)`);
      
      if (oneDayBefore > now && daysUntilCompletion === 2) {
        notifications.push({
          id: `${project.id}-1day`,
          projectId: project.id,
          type: 'completion_reminder',
          title: '🎉 내일이면 완성!',
          body: `${projectName}이(가) 내일 완성됩니다. 시음 준비 되셨나요?`,
          scheduledDate: oneDayBefore,
          data: { projectId: project.id, type: 'completion_reminder' },
        });
        console.log('✓ 1일 전 알림 추가됨');
      } else {
        console.log('✗ 1일 전 알림 스킵 (이미 지난 시간)');
      }

      // 완료일 당일 알림
      const completionDay = new Date(endDate.getTime());
      completionDay.setHours(12, 0, 0, 0); // 오후 12시

      console.log(`완료일 당일 알림 시간: ${completionDay.toLocaleString('ko-KR')}`);
      console.log(`완료일 당일 알림 조건: ${completionDay > now} (완성일이 오늘인 경우만)`);
      
      // 완료일 당일 알림은 완성일 당일에만 설정 (오늘이 완성일인 경우)
      if (completionDay > now && daysUntilCompletion === 0) {
        notifications.push({
          id: `${project.id}-completion`,
          projectId: project.id,
          type: 'completion_due',
          title: '🍻 완성되었습니다!',
          body: `${projectName}이(가) 오늘 완성되었습니다! 이제 시음해보세요.`,
          scheduledDate: completionDay,
          data: { projectId: project.id, type: 'completion_due' },
        });
        console.log('✓ 완료일 당일 알림 추가됨');
      } else {
        console.log('✗ 완료일 당일 알림 스킵 (이미 지난 시간)');
      }

      // 중간 점검 알림 (전체 기간의 50% 지점)
      const midPoint = new Date(startDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const halfDays = Math.floor(totalDays / 2);
      midPoint.setDate(startDate.getDate() + halfDays);
      midPoint.setHours(15, 0, 0, 0); // 오후 3시

      if (midPoint > now && midPoint < endDate) {
        notifications.push({
          id: `${project.id}-midcheck`,
          projectId: project.id,
          type: 'progress_check',
          title: '📊 중간 점검 시간!',
          body: `${projectName} 진행 상황을 확인하고 기록해보세요!`,
          scheduledDate: midPoint,
          data: { projectId: project.id, type: 'progress_check' },
        });
      }

      // 모든 알림 스케줄링
      for (const notification of notifications) {
        await this.scheduleNotification(notification);
      }

      console.log(`${project.name} 프로젝트에 ${notifications.length}개 알림 설정`);
      console.log('설정된 알림 목록:');
      notifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title} - ${notif.scheduledDate.toLocaleString('ko-KR')}`);
      });
    } catch (error) {
      console.error('프로젝트 알림 설정 실패:', error);
    }
  }

  // 개별 알림 스케줄링
  private async scheduleNotification(notification: NotificationSchedule): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: notification.id,
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: true,
        },
        trigger: {
          date: notification.scheduledDate,
        } as Notifications.DateTriggerInput,
      });
    } catch (error) {
      console.error('알림 스케줄링 실패:', error);
    }
  }

  // 특정 프로젝트의 모든 알림 취소
  async cancelProjectNotifications(projectId: string): Promise<void> {
    try {
      const identifiers = [
        `${projectId}-3days`,
        `${projectId}-1day`,
        `${projectId}-completion`,
        `${projectId}-midcheck`,
      ];

      for (const id of identifiers) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    } catch (error) {
      console.error('프로젝트 알림 취소 실패:', error);
    }
  }

  // 모든 프로젝트 알림 취소
  async cancelAllProjectNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('모든 알림이 취소되었습니다.');
    } catch (error) {
      console.error('전체 알림 취소 실패:', error);
    }
  }

  // 예약된 알림 목록 조회
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('예약된 알림 조회 실패:', error);
      return [];
    }
  }

  // 즉시 알림 발송 (테스트용)
  async sendImmediateNotification(title: string, body: string, data?: any): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // 즉시 발송
      });
    } catch (error) {
      console.error('즉시 알림 발송 실패:', error);
    }
  }

  // Push Token 반환
  getPushToken(): string | null {
    return this.pushToken;
  }
}

export default NotificationService.getInstance();
