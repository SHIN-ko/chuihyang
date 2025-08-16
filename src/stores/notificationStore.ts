import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import NotificationService from '@/src/services/notificationService';

interface NotificationSettings {
  enabled: boolean;
  completionReminders: boolean;
  progressChecks: boolean;
  soundEnabled: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
  };
}

interface NotificationState {
  settings: NotificationSettings;
  isInitialized: boolean;
  isLoading: boolean;

  // Actions
  initializeNotifications: () => Promise<boolean>;
  updateSettings: (updates: Partial<NotificationSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  testNotification: () => Promise<void>;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  completionReminders: true,
  progressChecks: true,
  soundEnabled: true,
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  },
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  settings: defaultSettings,
  isInitialized: false,
  isLoading: false,

  initializeNotifications: async () => {
    set({ isLoading: true });
    
    try {
      // 저장된 설정 불러오기
      const savedSettings = await SecureStore.getItemAsync('notification-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        set({ settings });
      }

      // 알림 서비스 초기화
      const success = await NotificationService.initialize();
      
      if (success) {
        const { settings } = get();
        NotificationService.setEnabled(settings.enabled);
      }

      set({ isInitialized: success, isLoading: false });
      return success;
    } catch (error) {
      console.error('알림 초기화 실패:', error);
      set({ isLoading: false });
      return false;
    }
  },

  updateSettings: async (updates: Partial<NotificationSettings>) => {
    set({ isLoading: true });
    
    try {
      const { settings } = get();
      const newSettings = { ...settings, ...updates };

      // 알림 활성화 상태 업데이트
      NotificationService.setEnabled(newSettings.enabled);

      // 설정 저장
      await SecureStore.setItemAsync('notification-settings', JSON.stringify(newSettings));
      set({ settings: newSettings, isLoading: false });
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error);
      set({ isLoading: false });
    }
  },

  resetSettings: async () => {
    set({ isLoading: true });
    
    try {
      await SecureStore.deleteItemAsync('notification-settings');
      NotificationService.setEnabled(defaultSettings.enabled);
      set({ settings: defaultSettings, isLoading: false });
    } catch (error) {
      console.error('알림 설정 초기화 실패:', error);
      set({ isLoading: false });
    }
  },

  testNotification: async () => {
    try {
      const { settings } = get();
      if (settings.enabled) {
        await NotificationService.sendImmediateNotification(
          '🧪 테스트 알림',
          '알림이 정상적으로 작동하고 있습니다!',
          { test: true }
        );
      }
    } catch (error) {
      console.error('테스트 알림 실패:', error);
    }
  },
}));
