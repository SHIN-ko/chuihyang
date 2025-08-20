import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNotificationStore } from '@/src/stores/notificationStore';
import { Ionicons } from '@expo/vector-icons';
import TimePicker from '@/src/components/common/TimePicker';

const QuietHoursScreen: React.FC = () => {
  const router = useRouter();
  const { settings, updateSettings, isLoading } = useNotificationStore();
  
  const [localSettings, setLocalSettings] = useState(settings.quietHours);

  const handleSave = async () => {
    try {
      await updateSettings({
        quietHours: localSettings,
      });
      
      Alert.alert(
        '설정 완료',
        '조용한 시간 설정이 저장되었습니다.',
        [{ text: '확인', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('오류', '설정 저장에 실패했습니다.');
    }
  };

  const handleStartTimeChange = (time: string) => {
    setLocalSettings(prev => ({ ...prev, startTime: time }));
  };

  const handleEndTimeChange = (time: string) => {
    setLocalSettings(prev => ({ ...prev, endTime: time }));
  };

  const handleEnabledChange = (enabled: boolean) => {
    setLocalSettings(prev => ({ ...prev, enabled }));
  };

  const formatTimeRange = () => {
    if (!localSettings.enabled) return '';
    
    const formatTime = (timeString: string) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? '오후' : '오전';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
    };

    return `${formatTime(localSettings.startTime)} - ${formatTime(localSettings.endTime)}`;
  };

  const hasChanges = () => {
    return (
      localSettings.enabled !== settings.quietHours.enabled ||
      localSettings.startTime !== settings.quietHours.startTime ||
      localSettings.endTime !== settings.quietHours.endTime
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
        <Text style={styles.headerTitle}>방해 금지 시간</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 설명 */}
        <View style={styles.descriptionContainer}>
          <View style={styles.descriptionHeader}>
            <Ionicons name="moon" size={24} color="#22c55e" />
            <Text style={styles.descriptionTitle}>방해 금지 시간</Text>
          </View>
          <Text style={styles.descriptionText}>
            설정한 시간 동안에는 알림이 발송되지 않습니다. 
            긴급하지 않은 프로젝트 알림을 차단하여 편안한 시간을 보내세요.
          </Text>
        </View>

        {/* 활성화 토글 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => handleEnabledChange(!localSettings.enabled)}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>방해 금지 시간 사용</Text>
              <Text style={styles.toggleDescription}>
                {localSettings.enabled ? formatTimeRange() : '비활성화됨'}
              </Text>
            </View>
            <View style={[styles.toggle, localSettings.enabled && styles.toggleActive]}>
              <View style={[styles.toggleThumb, localSettings.enabled && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 시간 설정 */}
        {localSettings.enabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>시간 설정</Text>
            
            <View style={styles.timeSection}>
              <TimePicker
                title="시작 시간"
                value={localSettings.startTime}
                onTimeChange={handleStartTimeChange}
              />
            </View>

            <View style={styles.timeSection}>
              <TimePicker
                title="종료 시간"
                value={localSettings.endTime}
                onTimeChange={handleEndTimeChange}
              />
            </View>

            {/* 시간 범위 미리보기 */}
            <View style={styles.previewContainer}>
              <Ionicons name="time-outline" size={16} color="#9db89d" />
              <Text style={styles.previewText}>
                {formatTimeRange()} 동안 알림이 차단됩니다
              </Text>
            </View>
          </View>
        )}

        {/* 예시 설명 */}
        <View style={styles.exampleContainer}>
          <Text style={styles.exampleTitle}>📱 알림 차단 예시</Text>
          <View style={styles.exampleList}>
            <View style={styles.exampleItem}>
              <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
              <Text style={styles.exampleText}>3일 전 완성 알림</Text>
            </View>
            <View style={styles.exampleItem}>
              <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
              <Text style={styles.exampleText}>중간 점검 알림</Text>
            </View>
            <View style={styles.exampleItem}>
              <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
              <Text style={styles.exampleText}>완성일 알림</Text>
            </View>
          </View>
          <Text style={styles.exampleNote}>
            ※ 긴급 알림은 방해 금지 시간에도 발송될 수 있습니다
          </Text>
        </View>
      </ScrollView>

      {/* 저장 버튼 */}
      {hasChanges() && (
        <View style={styles.saveContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <Ionicons name="time-outline" size={20} color="white" />
            ) : (
              <Ionicons name="checkmark" size={20} color="white" />
            )}
            <Text style={styles.saveButtonText}>
              {isLoading ? '저장 중...' : '변경사항 저장'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  descriptionContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1c261c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  descriptionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  descriptionText: {
    color: '#9db89d',
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c261c',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleDescription: {
    color: '#9db89d',
    fontSize: 14,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3c533c',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#22c55e',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  timeSection: {
    marginBottom: 16,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#293829',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  previewText: {
    color: '#22c55e',
    fontSize: 14,
    marginLeft: 8,
  },
  exampleContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1c261c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  exampleTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  exampleList: {
    marginBottom: 12,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exampleText: {
    color: '#9db89d',
    fontSize: 14,
    marginLeft: 8,
  },
  exampleNote: {
    color: '#9db89d',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  saveContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#3c533c',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#666',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuietHoursScreen;
