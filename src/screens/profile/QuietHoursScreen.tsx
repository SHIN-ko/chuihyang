import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNotificationStore } from '@/src/stores/notificationStore';
import { Ionicons } from '@expo/vector-icons';
import TimePicker from '@/src/components/common/TimePicker';
import { BRAND_COLORS, SHADOWS, ANIMATIONS } from '@/constants/Colors';
import GlassCard from '@/src/components/common/GlassCard';

const QuietHoursScreen: React.FC = () => {
  const router = useRouter();
  const { settings, updateSettings, isLoading } = useNotificationStore();
  
  const [localSettings, setLocalSettings] = useState(settings.quietHours);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  React.useEffect(() => {
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
      <StatusBar barStyle="light-content" backgroundColor={BRAND_COLORS.background.primary} />
      
      {/* 배경 그라디언트 */}
      <View style={styles.backgroundGradient} />
      
      {/* 헤더 */}
      <GlassCard style={styles.header} intensity="medium">
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BRAND_COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>방해 금지 시간</Text>
        <View style={styles.placeholder} />
      </GlassCard>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 설명 */}
          <GlassCard style={styles.descriptionContainer} intensity="light">
            <View style={styles.descriptionHeader}>
              <Ionicons name="moon" size={24} color={BRAND_COLORS.accent.primary} />
              <Text style={styles.descriptionTitle}>방해 금지 시간</Text>
          </View>
          <Text style={styles.descriptionText}>
            설정한 시간 동안에는 알림이 발송되지 않습니다. 
            긴급하지 않은 프로젝트 알림을 차단하여 편안한 시간을 보내세요.
            </Text>
          </GlassCard>

          {/* 활성화 토글 */}
          <GlassCard style={styles.section} intensity="medium">
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
          </GlassCard>

          {/* 시간 설정 */}
          {localSettings.enabled && (
            <GlassCard style={styles.section} intensity="medium">
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
                <Ionicons name="time-outline" size={16} color={BRAND_COLORS.text.secondary} />
                <Text style={styles.previewText}>
                  {formatTimeRange()} 동안 알림이 차단됩니다
                </Text>
              </View>
            </GlassCard>
          )}

          {/* 예시 설명 */}
          <GlassCard style={styles.exampleContainer} intensity="light">
          <Text style={styles.exampleTitle}>📱 알림 차단 예시</Text>
          <View style={styles.exampleList}>
            <View style={styles.exampleItem}>
              <Ionicons name="checkmark-circle" size={16} color={BRAND_COLORS.accent.primary} />
              <Text style={styles.exampleText}>3일 전 완성 알림</Text>
            </View>
            <View style={styles.exampleItem}>
              <Ionicons name="checkmark-circle" size={16} color={BRAND_COLORS.accent.primary} />
              <Text style={styles.exampleText}>중간 점검 알림</Text>
            </View>
            <View style={styles.exampleItem}>
              <Ionicons name="checkmark-circle" size={16} color={BRAND_COLORS.accent.primary} />
              <Text style={styles.exampleText}>완성일 알림</Text>
            </View>
          </View>
            <Text style={styles.exampleNote}>
              ※ 긴급 알림은 방해 금지 시간에도 발송될 수 있습니다
            </Text>
          </GlassCard>
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
                <Ionicons name="time-outline" size={20} color={BRAND_COLORS.text.primary} />
              ) : (
                <Ionicons name="checkmark" size={20} color={BRAND_COLORS.text.primary} />
              )}
              <Text style={styles.saveButtonText}>
                {isLoading ? '저장 중...' : '변경사항 저장'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  descriptionContainer: {
    padding: 20,
    marginBottom: 16,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  descriptionTitle: {
    color: BRAND_COLORS.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  descriptionText: {
    color: BRAND_COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: BRAND_COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border.secondary,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    color: BRAND_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleDescription: {
    color: BRAND_COLORS.text.secondary,
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
    backgroundColor: BRAND_COLORS.accent.primary,
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
    backgroundColor: BRAND_COLORS.background.elevated,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  previewText: {
    color: BRAND_COLORS.accent.primary,
    fontSize: 14,
    marginLeft: 8,
  },
  exampleContainer: {
    padding: 20,
    marginBottom: 16,
  },
  exampleTitle: {
    color: BRAND_COLORS.text.primary,
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
    color: BRAND_COLORS.text.secondary,
    fontSize: 14,
    marginLeft: 8,
  },
  exampleNote: {
    color: BRAND_COLORS.text.secondary,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  saveContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.border.secondary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_COLORS.accent.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: BRAND_COLORS.accent.secondary,
    ...SHADOWS.glass.medium,
  },
  saveButtonDisabled: {
    backgroundColor: BRAND_COLORS.background.elevated,
    opacity: 0.6,
  },
  saveButtonText: {
    color: BRAND_COLORS.text.primary,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default QuietHoursScreen;
