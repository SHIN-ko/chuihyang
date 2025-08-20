import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Project } from '@/src/types';
import { generateCustomNotificationMessage } from '@/src/utils/recipeNotifications';

const IS_DEV = __DEV__;

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
  private quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  } = {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00'
  };

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

  // 조용한 시간 설정
  setQuietHours(quietHours: { enabled: boolean; startTime: string; endTime: string }): void {
    this.quietHours = quietHours;
    console.log('조용한 시간 설정 업데이트:', quietHours);
  }

  // 조용한 시간 체크
  private isInQuietHours(scheduledDate: Date): boolean {
    if (!this.quietHours.enabled) return false;

    const [startHour, startMinute] = this.quietHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.quietHours.endTime.split(':').map(Number);

    const scheduledHour = scheduledDate.getHours();
    const scheduledMinute = scheduledDate.getMinutes();
    const scheduledTime = scheduledHour * 60 + scheduledMinute;
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    // 자정을 넘나드는 경우 처리 (예: 22:00 - 08:00)
    if (startTime > endTime) {
      return scheduledTime >= startTime || scheduledTime <= endTime;
    } else {
      return scheduledTime >= startTime && scheduledTime <= endTime;
    }
  }

  // 조용한 시간을 피해서 알림 시간 조정
  private adjustTimeForQuietHours(originalDate: Date): Date {
    if (!this.isInQuietHours(originalDate)) {
      return originalDate;
    }

    const adjustedDate = new Date(originalDate);
    const [endHour, endMinute] = this.quietHours.endTime.split(':').map(Number);
    
    // 조용한 시간 종료 시간으로 조정
    adjustedDate.setHours(endHour, endMinute, 0, 0);
    
    // 만약 조정된 시간이 원래 시간보다 이전이라면 다음날로 설정
    if (adjustedDate <= originalDate) {
      adjustedDate.setDate(adjustedDate.getDate() + 1);
    }

    console.log(`조용한 시간으로 인해 알림 시간 조정: ${originalDate.toLocaleString()} → ${adjustedDate.toLocaleString()}`);
    return adjustedDate;
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

      const now = new Date();
      const notifications: NotificationSchedule[] = [];
      
      // 날짜 문자열을 로컬 시간대로 파싱 (YYYY-MM-DD 형식을 로컬 시간으로)
      const startDate = new Date(project.startDate + 'T00:00:00');
      const endDate = new Date(project.expectedEndDate + 'T23:59:59');
      const projectName = project.name;

      // 날짜 파싱 검증
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('❌ 날짜 파싱 실패!');
        return;
      }

      // 프로젝트가 이미 완료되었는지 확인
      if (endDate <= now) {
        console.log('⚠️ 프로젝트 완료일이 이미 지났습니다. 알림을 설정하지 않습니다.');
        return;
      }

      // 완료 3일 전 알림
      const threeDaysBefore = new Date(endDate.getTime());
      threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
      threeDaysBefore.setHours(10, 0, 0, 0); // 오전 10시
      
      // 날짜 비교를 위해 오늘 날짜를 정확히 구하기
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const endDateOnly = new Date(endDate.getTime());
      endDateOnly.setHours(0, 0, 0, 0);
      
      const daysUntilCompletion = Math.ceil((endDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // 3일 전 알림: 완료까지 3일 이상 남았고, 3일 전 시간이 아직 미래인 경우
      if (threeDaysBefore > now && daysUntilCompletion >= 3) {
        const customMessage = generateCustomNotificationMessage(project, 'threeDaysBeforeCompletion');
        const adjustedDate = this.adjustTimeForQuietHours(threeDaysBefore);
        
        notifications.push({
          id: `${project.id}-3days`,
          projectId: project.id,
          type: 'completion_reminder',
          title: customMessage.title,
          body: customMessage.body,
          scheduledDate: adjustedDate,
          data: { projectId: project.id, type: 'completion_reminder' },
        });
      }

      // 완료 1일 전 알림
      const oneDayBefore = new Date(endDate.getTime());
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      oneDayBefore.setHours(18, 0, 0, 0); // 오후 6시

      // 1일 전 알림: 완료까지 1일 이상 남았고, 1일 전 시간이 아직 미래인 경우
      if (oneDayBefore > now && daysUntilCompletion >= 1) {
        const customMessage = generateCustomNotificationMessage(project, 'oneDayBeforeCompletion');
        const adjustedDate = this.adjustTimeForQuietHours(oneDayBefore);
        
        notifications.push({
          id: `${project.id}-1day`,
          projectId: project.id,
          type: 'completion_reminder',
          title: customMessage.title,
          body: customMessage.body,
          scheduledDate: adjustedDate,
          data: { projectId: project.id, type: 'completion_reminder' },
        });
      }

      // 완료일 당일 알림
      const completionDay = new Date(endDate.getTime());
      completionDay.setHours(12, 0, 0, 0); // 오후 12시

      // 완료일 당일 알림: 완료일 시간이 아직 미래인 경우 (오늘이거나 미래)
      if (completionDay > now && daysUntilCompletion >= 0) {
        const customMessage = generateCustomNotificationMessage(project, 'completionDay');
        const adjustedDate = this.adjustTimeForQuietHours(completionDay);
        
        notifications.push({
          id: `${project.id}-completion`,
          projectId: project.id,
          type: 'completion_due',
          title: customMessage.title,
          body: customMessage.body,
          scheduledDate: adjustedDate,
          data: { projectId: project.id, type: 'completion_due' },
        });
      }

      // 중간 점검 알림 (전체 기간의 50% 지점)
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const halfDays = Math.floor(totalDays / 2);
      
      // 안전한 날짜 계산 (밀리초 단위로 계산)
      const midPoint = new Date(startDate.getTime() + (halfDays * 24 * 60 * 60 * 1000));
      midPoint.setHours(15, 0, 0, 0); // 오후 3시

      if (midPoint > now && midPoint < endDate) {
        const customMessage = generateCustomNotificationMessage(project, 'midpointCheck');
        const adjustedDate = this.adjustTimeForQuietHours(midPoint);
        
        notifications.push({
          id: `${project.id}-midcheck`,
          projectId: project.id,
          type: 'progress_check',
          title: customMessage.title,
          body: customMessage.body,
          scheduledDate: adjustedDate,
          data: { projectId: project.id, type: 'progress_check' },
        });
      }



      // 단기간 프로젝트를 위한 추가 알림 (7일 이내 완료)
      if (daysUntilCompletion <= 7 && daysUntilCompletion > 0) {
        // 매일 체크 알림 (단기간 프로젝트용)
        for (let i = 1; i <= Math.min(daysUntilCompletion, 3); i++) {
          const dailyCheckDate = new Date(now.getTime());
          dailyCheckDate.setDate(now.getDate() + i);
          dailyCheckDate.setHours(9, 0, 0, 0); // 오전 9시

          if (dailyCheckDate < endDate) {
            const customMessage = generateCustomNotificationMessage(project, 'weeklyCheck');
            const adjustedDate = this.adjustTimeForQuietHours(dailyCheckDate);
            
            notifications.push({
              id: `${project.id}-daily-${i}`,
              projectId: project.id,
              type: 'progress_check',
              title: `📅 ${i}일 후 완성!`,
              body: `${projectName}이(가) ${i}일 후 완성됩니다. 상태를 확인해보세요!`,
              scheduledDate: adjustedDate,
              data: { projectId: project.id, type: 'progress_check' },
            });

          }
        }
      }

      // 모든 알림 스케줄링
      for (const notification of notifications) {
        await this.scheduleNotification(notification);
      }
    } catch (error) {
      console.error('프로젝트 알림 설정 실패:', error);
    }
  }

  // 개별 알림 스케줄링
  private async scheduleNotification(notification: NotificationSchedule): Promise<void> {
    try {
      const now = new Date();
      
      // 과거 시간 체크 (5분 여유를 둠)
      if (notification.scheduledDate.getTime() <= now.getTime() + (5 * 60 * 1000)) {
        return;
      }

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
      console.error('❌ 알림 스케줄링 실패:', error);
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

// 싱글톤 인스턴스를 export
const notificationService = NotificationService.getInstance();
export default notificationService;
