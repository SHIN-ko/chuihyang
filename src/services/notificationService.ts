import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Project } from '@/src/types';
import { generateCustomNotificationMessage } from '@/src/utils/recipeNotifications';

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

// 모든 환경에서 알림 호출 추적을 위한 래퍼
const trackedScheduleNotification = async (request: any) => {
  const isImmediate = request.trigger === null;
  const scheduledDate = request.trigger?.date ? new Date(request.trigger.date) : null;
  const now = new Date();

  console.log(`🔔 [NOTIFICATION CALL] scheduleNotificationAsync 호출:`, {
    trigger: request.trigger,
    title: request.content?.title,
    body: request.content?.body,
    identifier: request.identifier,
    isImmediate: isImmediate,
    scheduledDate: scheduledDate ? scheduledDate.toLocaleString() : 'N/A',
    currentTime: now.toLocaleString(),
    isInPast: scheduledDate ? scheduledDate.getTime() < now.getTime() : false,
    minutesFromNow: scheduledDate
      ? Math.round((scheduledDate.getTime() - now.getTime()) / (1000 * 60))
      : 0,
    platform: Platform.OS,
    isDevice: Device.isDevice,
  });

  // 즉시 알림인 경우 경고
  if (isImmediate) {
    console.warn(
      `⚠️ [즉시 알림 감지] ${request.content?.title} - 이것이 즉시 알림이 오는 원인일 수 있습니다!`,
    );
  }

  // 과거 시간인 경우 경고
  if (scheduledDate && scheduledDate.getTime() < now.getTime()) {
    console.warn(
      `⚠️ [과거 시간 감지] ${request.content?.title} - 과거 시간으로 스케줄링되어 즉시 실행될 수 있습니다!`,
    );
  }

  const result = await Notifications.scheduleNotificationAsync(request);

  console.log(`📋 [NOTIFICATION RESULT]`, {
    title: request.content?.title,
    result: result,
    resultType: typeof result,
  });

  return result;
};

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
    endTime: '08:00',
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
      // 디바이스 정보 로그
      console.log(`📱 디바이스 정보:`, {
        isDevice: Device.isDevice,
        deviceType: Device.deviceType,
        platform: Platform.OS,
      });

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

      // 환경 정보 출력
      console.log('🔔 알림 시스템 초기화 완료:', {
        isDevice: Device.isDevice,
        deviceType: Device.deviceType,
        platform: Platform.OS,
        isDev: __DEV__,
        hasProjectId: !!Constants.easConfig?.projectId,
        hasPushToken: !!this.pushToken,
      });

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

    // 만약 조정된 시간이 원래 시간보다 이전이라면 (자정을 넘나든 경우)
    // 다음 날의 조용한 시간 종료 시점으로 설정
    if (adjustedDate <= originalDate) {
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      adjustedDate.setHours(endHour, endMinute, 0, 0);
    }

    // 조정된 시간이 너무 가까우면 추가로 30분 뒤로 미룸
    const now = new Date();
    const minFutureTime = 30 * 60 * 1000; // 30분
    if (adjustedDate.getTime() <= now.getTime() + minFutureTime) {
      adjustedDate.setMinutes(adjustedDate.getMinutes() + 30);
    }

    console.log(
      `조용한 시간으로 인해 알림 시간 조정: ${originalDate.toLocaleString()} → ${adjustedDate.toLocaleString()}`,
    );
    return adjustedDate;
  }

  // 알림 활성화 상태 확인
  isNotificationEnabled(): boolean {
    return this.isEnabled;
  }

  // 프로젝트 관련 모든 알림 스케줄링
  async scheduleProjectNotifications(project: Project): Promise<void> {
    if (!this.isEnabled) return;

    // 모든 환경에서 알림 스케줄링 활성화
    console.log(`🔔 [${project.name}] 알림 스케줄링 시작 (모든 환경에서 활성화)`);

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

      // 날짜 문자열을 정확하게 파싱 (시간대 문제 방지)
      const startDate = new Date(project.startDate + 'T00:00:00');
      const endDate = new Date(project.expectedEndDate + 'T23:59:59');
      const projectName = project.name;

      // 현재 시간을 정확하게 설정 (밀리초 제거)
      now.setSeconds(0, 0);

      console.log(`🔔 [${projectName}] 알림 스케줄링 시작:`, {
        startDate: project.startDate,
        endDate: project.expectedEndDate,
        parsedStartDate: startDate.toLocaleString(),
        parsedEndDate: endDate.toLocaleString(),
        currentTime: now.toLocaleString(),
      });

      // 날짜 파싱 검증
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('❌ 날짜 파싱 실패!', {
          startDate: project.startDate,
          endDate: project.expectedEndDate,
        });
        return;
      }

      // 프로젝트가 이미 완료되었는지 확인
      if (endDate <= now) {
        console.log('⚠️ 프로젝트 완료일이 이미 지났습니다. 알림을 설정하지 않습니다.', {
          endDate: endDate.toLocaleString(),
          currentTime: now.toLocaleString(),
        });
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

      const daysUntilCompletion = Math.ceil(
        (endDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      console.log(`📅 [${projectName}] 완료까지 남은 일수 계산:`, {
        today: today.toLocaleDateString(),
        endDateOnly: endDateOnly.toLocaleDateString(),
        daysUntilCompletion: daysUntilCompletion,
        timeDiffMs: endDateOnly.getTime() - today.getTime(),
      });

      // 3일 전 알림: 완료까지 3일 이상 남았고, 3일 전 시간이 아직 미래인 경우
      if (threeDaysBefore > now && daysUntilCompletion >= 3) {
        const customMessage = generateCustomNotificationMessage(
          project,
          'threeDaysBeforeCompletion',
        );
        const adjustedDate = this.adjustTimeForQuietHours(threeDaysBefore);

        console.log(`✅ [${projectName}] 3일 전 알림 설정:`, {
          scheduledDate: adjustedDate.toLocaleString(),
          daysUntilCompletion: daysUntilCompletion,
        });

        notifications.push({
          id: `${project.id}-3days`,
          projectId: project.id,
          type: 'completion_reminder',
          title: customMessage.title,
          body: customMessage.body,
          scheduledDate: adjustedDate,
          data: { projectId: project.id, type: 'completion_reminder' },
        });
      } else {
        console.log(`❌ [${projectName}] 3일 전 알림 건너뜀:`, {
          threeDaysBefore: threeDaysBefore.toLocaleString(),
          isAfterNow: threeDaysBefore > now,
          daysUntilCompletion: daysUntilCompletion,
          condition: 'threeDaysBefore > now && daysUntilCompletion >= 3',
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

        console.log(`✅ [${projectName}] 1일 전 알림 설정:`, {
          scheduledDate: adjustedDate.toLocaleString(),
          daysUntilCompletion: daysUntilCompletion,
        });

        notifications.push({
          id: `${project.id}-1day`,
          projectId: project.id,
          type: 'completion_reminder',
          title: customMessage.title,
          body: customMessage.body,
          scheduledDate: adjustedDate,
          data: { projectId: project.id, type: 'completion_reminder' },
        });
      } else {
        console.log(`❌ [${projectName}] 1일 전 알림 건너뜀:`, {
          oneDayBefore: oneDayBefore.toLocaleString(),
          isAfterNow: oneDayBefore > now,
          daysUntilCompletion: daysUntilCompletion,
        });
      }

      // 완료일 당일 알림
      const completionDay = new Date(endDate.getTime());
      completionDay.setHours(12, 0, 0, 0); // 오후 12시

      // 완료일 당일 알림: 완료일 시간이 아직 미래인 경우 (오늘이거나 미래)
      if (completionDay > now && daysUntilCompletion >= 0) {
        const customMessage = generateCustomNotificationMessage(project, 'completionDay');
        const adjustedDate = this.adjustTimeForQuietHours(completionDay);

        console.log(`✅ [${projectName}] 완료일 당일 알림 설정:`, {
          scheduledDate: adjustedDate.toLocaleString(),
          daysUntilCompletion: daysUntilCompletion,
        });

        notifications.push({
          id: `${project.id}-completion`,
          projectId: project.id,
          type: 'completion_due',
          title: customMessage.title,
          body: customMessage.body,
          scheduledDate: adjustedDate,
          data: { projectId: project.id, type: 'completion_due' },
        });
      } else {
        console.log(`❌ [${projectName}] 완료일 당일 알림 건너뜀:`, {
          completionDay: completionDay.toLocaleString(),
          isAfterNow: completionDay > now,
          daysUntilCompletion: daysUntilCompletion,
        });
      }

      // 중간 점검 알림 (전체 기간의 50% 지점)
      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const halfDays = Math.floor(totalDays / 2);

      // 안전한 날짜 계산 (밀리초 단위로 계산)
      const midPoint = new Date(startDate.getTime() + halfDays * 24 * 60 * 60 * 1000);
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

      // 개발 환경에서는 테스트용 즉시 알림 추가 (실제 알림이 작동하는지 확인용)
      if (__DEV__) {
        // 즉시 알림으로 변경 (5초 지연도 개발환경에서는 차단됨)
        console.log(`🧪 [개발환경] 즉시 테스트 알림 발송`);

        // 즉시 알림 발송
        setTimeout(async () => {
          await this.sendImmediateNotification(
            `🧪 [테스트] ${projectName} 알림 작동 확인`,
            `개발환경 테스트: ${projectName} 프로젝트의 알림 시스템이 정상 작동 중입니다!`,
            { projectId: project.id, type: 'dev_test' },
          );
        }, 2000); // 2초 후 즉시 알림
      }

      // 단기간 프로젝트를 위한 추가 알림 (7일 이내 완료, 하지만 기본 알림과 중복되지 않도록)
      if (daysUntilCompletion <= 7 && daysUntilCompletion > 3) {
        // 매일 체크 알림 (단기간 프로젝트용) - 하지만 3일 전, 1일 전 알림과 겹치지 않도록
        for (let i = 4; i <= Math.min(daysUntilCompletion, 7); i++) {
          const dailyCheckDate = new Date(today.getTime());
          dailyCheckDate.setDate(today.getDate() + i);
          dailyCheckDate.setHours(9, 0, 0, 0); // 오전 9시

          // 완료일보다 이전인지 확인
          if (dailyCheckDate < endDate) {
            const customMessage = generateCustomNotificationMessage(project, 'weeklyCheck');
            const adjustedDate = this.adjustTimeForQuietHours(dailyCheckDate);

            console.log(
              `⏰ 단기간 프로젝트 알림 설정: ${i}일 후 (${adjustedDate.toLocaleString()})`,
            );

            notifications.push({
              id: `${project.id}-daily-${i}`,
              projectId: project.id,
              type: 'progress_check',
              title: `📅 ${daysUntilCompletion - i + 1}일 후 완성!`,
              body: `${projectName}이(가) ${daysUntilCompletion - i + 1}일 후 완성됩니다. 상태를 확인해보세요!`,
              scheduledDate: adjustedDate,
              data: { projectId: project.id, type: 'progress_check' },
            });
          }
        }
      }

      // 모든 알림 스케줄링
      console.log(`📋 [${projectName}] 총 ${notifications.length}개의 알림 스케줄링 시작`);

      for (const notification of notifications) {
        await this.scheduleNotification(notification);
      }

      console.log(
        `🎉 [${projectName}] 알림 스케줄링 완료! 총 ${notifications.length}개 알림 설정됨`,
      );

      // 설정된 알림 목록 요약
      notifications.forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.title} - ${notif.scheduledDate.toLocaleString()}`);
      });

      // 실제 스케줄링된 알림 확인
      setTimeout(async () => {
        const scheduledNotifs = await this.getScheduledNotifications();
        const projectNotifs = scheduledNotifs.filter((n) => n.identifier?.includes(project.id));
        console.log(`📋 [${projectName}] 실제 예약된 알림 확인:`, {
          totalScheduled: scheduledNotifs.length,
          projectNotifications: projectNotifs.length,
          projectNotifs: projectNotifs.map((n) => ({
            id: n.identifier,
            title: n.content.title,
            trigger: n.trigger,
          })),
        });
      }, 1000);
    } catch (error) {
      console.error('프로젝트 알림 설정 실패:', error);
    }
  }

  // 개별 알림 스케줄링
  private async scheduleNotification(notification: NotificationSchedule): Promise<void> {
    try {
      const now = new Date();
      const timeDiff = notification.scheduledDate.getTime() - now.getTime();
      const minutesUntil = Math.round(timeDiff / (1000 * 60));

      console.log(`⏰ 알림 스케줄링 시도: ${notification.title}`, {
        scheduledDate: notification.scheduledDate.toLocaleString(),
        currentTime: now.toLocaleString(),
        minutesUntil: minutesUntil,
        timeDiffMs: timeDiff,
      });

      // 과거 시간 체크 (10분 여유를 둠 - 시스템 시간 차이 고려)
      const minFutureTime = 10 * 60 * 1000; // 10분

      if (notification.scheduledDate.getTime() <= now.getTime() + minFutureTime) {
        console.log(
          `❌ 과거 시간 또는 너무 가까운 시간으로 인해 알림 건너뜀: ${notification.title}`,
          {
            scheduledDate: notification.scheduledDate.toLocaleString(),
            currentTime: now.toLocaleString(),
            timeDiffMinutes: Math.round(timeDiff / (1000 * 60)),
            minRequiredMinutes: 10,
          },
        );
        return;
      }

      console.log(
        `✅ 알림 스케줄링 성공: ${notification.title} → ${notification.scheduledDate.toLocaleString()}`,
      );

      const result = await trackedScheduleNotification({
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

      // 스케줄링 결과 상세 로그
      console.log(`📋 스케줄링 결과:`, {
        notificationId: notification.id,
        title: notification.title,
        result: result,
        scheduledFor: notification.scheduledDate.toLocaleString(),
      });

      // 즉시 실제 예약 상태 확인
      setTimeout(async () => {
        try {
          const scheduled = await Notifications.getAllScheduledNotificationsAsync();
          const thisNotification = scheduled.find((n) => n.identifier === notification.id);
          const isScheduled = !!thisNotification;

          console.log(`🔍 ${notification.title} 예약 확인:`, {
            found: isScheduled,
            trigger: thisNotification?.trigger,
            triggerType: thisNotification?.trigger ? (thisNotification.trigger as any).type : 'N/A',
            scheduledTime:
              thisNotification?.trigger && (thisNotification.trigger as any).type === 'date'
                ? new Date((thisNotification.trigger as any).value * 1000).toLocaleString()
                : 'N/A',
          });

          // 개발 환경에서 실제 예약이 안 되었다면 로그만 남김
          if (!isScheduled && (__DEV__ || !Device.isDevice)) {
            console.log(
              `📝 [개발환경] ${notification.title} - Expo 개발환경에서는 예약이 제한될 수 있습니다`,
            );
          }
        } catch (e) {
          console.log(`❌ 예약 확인 실패:`, e);
        }
      }, 100);
    } catch (error) {
      console.error('❌ 알림 스케줄링 실패:', notification.title, error);
    }
  }

  // 특정 프로젝트의 모든 알림 취소
  async cancelProjectNotifications(projectId: string): Promise<void> {
    try {
      // 모든 예약된 알림 조회
      const allScheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

      // 해당 프로젝트의 알림들 찾기
      const projectNotifications = allScheduledNotifications.filter(
        (notification) => notification.identifier && notification.identifier.includes(projectId),
      );

      console.log(`🗑️ [${projectId}] 기존 알림 ${projectNotifications.length}개 취소 중...`);

      // 모든 해당 프로젝트 알림 취소
      for (const notification of projectNotifications) {
        if (notification.identifier) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          console.log(`   ✅ 취소됨: ${notification.identifier}`);
        }
      }

      console.log(`🎯 [${projectId}] 알림 취소 완료: ${projectNotifications.length}개`);
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

    console.log(`🔥 즉시 알림 발송!`, {
      title: title,
      body: body,
      data: data,
    });

    try {
      await trackedScheduleNotification({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // 즉시 발송
      });

      console.log(`✅ 즉시 알림 발송 완료: ${title}`);
    } catch (error) {
      console.error('즉시 알림 발송 실패:', error);
    }
  }

  // Push Token 반환
  getPushToken(): string | null {
    return this.pushToken;
  }

  // 알림 시스템 상태 진단 (디버깅용)
  async diagnoseNotificationSystem(): Promise<{
    permissions: any;
    scheduledCount: number;
    pushToken: string | null;
    settings: any;
    scheduledNotifications: any[];
  }> {
    try {
      const permissions = await Notifications.getPermissionsAsync();
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();

      return {
        permissions: permissions,
        scheduledCount: scheduled.length,
        pushToken: this.pushToken,
        settings: {
          enabled: this.isEnabled,
          quietHours: this.quietHours,
        },
        scheduledNotifications: scheduled.map((n) => ({
          id: n.identifier,
          title: n.content.title,
          trigger: n.trigger,
          triggerDate:
            n.trigger && 'date' in n.trigger
              ? new Date(n.trigger.date as any).toLocaleString()
              : 'N/A',
        })),
      };
    } catch (error) {
      console.error('알림 시스템 진단 실패:', error);
      return {
        permissions: null,
        scheduledCount: 0,
        pushToken: this.pushToken,
        settings: { enabled: this.isEnabled, quietHours: this.quietHours },
        scheduledNotifications: [],
      };
    }
  }

  // 알림 시스템 상태 로깅 (디버깅용)
  async logNotificationSystemStatus(): Promise<void> {
    const diagnosis = await this.diagnoseNotificationSystem();

    console.log('🔔 === 알림 시스템 상태 === ');
    console.log(`   📱 권한 상태: ${diagnosis.permissions?.status || 'Unknown'}`);
    console.log(`   ⚡ 알림 활성화: ${diagnosis.settings.enabled ? 'Yes' : 'No'}`);
    console.log(`   🌙 조용한 시간: ${diagnosis.settings.quietHours.enabled ? 'Yes' : 'No'}`);
    console.log(`   📊 예약된 알림: ${diagnosis.scheduledCount}개`);
    console.log(`   🔑 Push Token: ${diagnosis.pushToken ? 'Available' : 'None'}`);

    if (diagnosis.scheduledNotifications.length > 0) {
      console.log('   📋 예약된 알림 목록:');
      diagnosis.scheduledNotifications.forEach((notif, index) => {
        console.log(`      ${index + 1}. ${notif.title} (${notif.triggerDate})`);
      });
    }

    console.log('🔔 === 상태 확인 완료 === ');
  }
}

// 싱글톤 인스턴스를 export
const notificationService = NotificationService.getInstance();
export default notificationService;
