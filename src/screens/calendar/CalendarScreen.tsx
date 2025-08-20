import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useProjectStore } from '@/src/stores/projectStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';
import { useTheme } from '@/src/contexts/ThemeContext';
import GlassCard from '@/src/components/common/GlassCard';

const { width } = Dimensions.get('window');
import {
  generateCalendarMarkings,
  getEventsForDate,
  getTodayString,
  calendarTheme,
  CalendarEvent,
  getProjectColor,
} from '@/src/utils/calendar';

const CalendarScreen: React.FC = () => {
  const { projects, fetchProjects } = useProjectStore();
  const router = useRouter();
  const { theme } = useTheme();
  const { colors, brandColors } = useThemeValues();
  
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<CalendarEvent[]>([]);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const styles = useThemedStyles(({ colors, shadows, brandColors }) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    backgroundGradient: {
      position: 'absolute',
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
      margin: 20,
      marginBottom: 0,
    },
    headerTitle: {
      color: colors.text.primary,
      fontSize: 24,
      fontWeight: 'bold',
      letterSpacing: -0.5,
    },
    calendarContainer: {
      margin: 20,
      marginBottom: 16,
    },
    legendContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginHorizontal: 20,
      marginBottom: 16,
    },
    legendTitle: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
      letterSpacing: 0.2,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
      ...shadows.glass.light,
    },
    legendText: {
      color: colors.text.secondary,
      fontSize: 14,
    },
    eventsContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      margin: 20,
      marginTop: 0,
    },
    eventsTitle: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
      letterSpacing: 0.2,
    },
    eventItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.background.elevated,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },
    eventDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 12,
    },
    eventText: {
      color: colors.text.primary,
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
    },
    eventDate: {
      color: colors.text.secondary,
      fontSize: 12,
    },
    noEventsContainer: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    noEventsText: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
      textAlign: 'center',
    },
    noEventsSubText: {
      color: colors.text.secondary,
      fontSize: 14,
      marginTop: 6,
      textAlign: 'center',
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20,
    },
    headerSubtitle: {
      color: colors.text.secondary,
      fontSize: 16,
      fontWeight: '400',
    },
    legendGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: '45%',
    },
    eventsList: {
      gap: 8,
    },
    eventIndicator: {
      marginRight: 12,
    },
    eventIcon: {
      marginLeft: 4,
    },
    eventContent: {
      flex: 1,
    },
    eventTitle: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
    },
    eventMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    eventProjectName: {
      color: colors.text.secondary,
      fontSize: 12,
      fontWeight: '500',
    },
    eventDescription: {
      color: colors.text.secondary,
      fontSize: 12,
    },
    bottomSpacing: {
      height: 40,
    },
  }));

  // 동적 캘린더 테마 생성
  const dynamicCalendarTheme = {
    backgroundColor: 'transparent',
    calendarBackground: 'transparent',
    textSectionTitleColor: colors.text.secondary,
    selectedDayBackgroundColor: brandColors.accent.primary,
    selectedDayTextColor: colors.text.primary,
    todayTextColor: brandColors.accent.primary,
    dayTextColor: colors.text.primary,
    textDisabledColor: colors.text.muted,
    dotColor: brandColors.accent.primary,
    selectedDotColor: colors.text.primary,
    arrowColor: colors.text.primary,
    monthTextColor: colors.text.primary,
    indicatorColor: brandColors.accent.primary,
    textDayFontWeight: '400' as any,
    textMonthFontWeight: '600' as any,
    textDayHeaderFontWeight: '500' as any,
  };

  useEffect(() => {
    fetchProjects();
    
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
  }, [fetchProjects]);

  // 선택된 날짜가 변경될 때마다 해당 날짜의 이벤트 업데이트
  useEffect(() => {
    const events = getEventsForDate(selectedDate, projects);
    setEventsForSelectedDate(events);
  }, [selectedDate, projects]);

  const calendarMarkings = generateCalendarMarkings(projects);

  // 선택된 날짜에 선택 표시 추가
  const markedDates = {
    ...calendarMarkings,
    [selectedDate]: {
      ...calendarMarkings[selectedDate],
      selected: true,
      selectedColor: brandColors.accent.primary,
    },
  };

  const handleDateSelect = (date: any) => {
    setSelectedDate(date.dateString);
  };

  const handleEventPress = (event: CalendarEvent) => {
    if (event.type === 'project_start' || event.type === 'project_end') {
      router.push(`/project/${event.project.id}`);
    } else if (event.type === 'progress_log') {
      router.push(`/project/${event.project.id}`);
    }
  };

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'project_start':
        return 'play-circle';
      case 'project_end':
        return 'checkmark-circle';
      case 'progress_log':
        return 'document-text';
      default:
        return 'calendar';
    }
  };

  const renderEvent = (event: CalendarEvent) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventItem}
      onPress={() => handleEventPress(event)}
    >
      <View style={styles.eventIndicator}>
        <View 
          style={[
            styles.eventDot, 
            { backgroundColor: getProjectColor(event.project.type) }
          ]} 
        />
        <Ionicons 
          name={getEventIcon(event.type) as any} 
          size={16} 
          color={brandColors.accent.primary} 
          style={styles.eventIcon}
        />
      </View>
      
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.eventMeta}>
          <Text style={styles.eventProjectName}>{event.project.name}</Text>
          {event.log && (
            <Text style={styles.eventDescription} numberOfLines={1}>
              {event.log.description}
            </Text>
          )}
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background.primary} />
      
      {/* 배경 그라디언트 */}
      <View style={styles.backgroundGradient} />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* 헤더 */}
        <GlassCard style={styles.header} intensity="medium">
          <Text style={styles.headerTitle}>캘린더</Text>
        </GlassCard>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 캘린더 */}
          <GlassCard style={styles.calendarContainer} intensity="medium">
            <Calendar
              current={selectedDate}
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              theme={dynamicCalendarTheme}
              hideExtraDays={true}
              firstDay={0} // 일요일부터 시작
              enableSwipeMonths={true}
              markingType="multi-dot"
            />
          </GlassCard>

          {/* 범례 */}
          <GlassCard style={styles.legendContainer} intensity="light">
            <Text style={styles.legendTitle}>범례</Text>
            <View style={styles.legendGrid}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getProjectColor('whiskey') }]} />
                <Text style={styles.legendText}>위스키</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getProjectColor('gin') }]} />
                <Text style={styles.legendText}>진</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getProjectColor('rum') }]} />
                <Text style={styles.legendText}>럼</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getProjectColor('fruit_wine') }]} />
                <Text style={styles.legendText}>과실주</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: getProjectColor('vodka') }]} />
                <Text style={styles.legendText}>보드카</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: brandColors.accent.amber }]} />
                <Text style={styles.legendText}>진행 로그</Text>
              </View>
            </View>
          </GlassCard>

          {/* 선택된 날짜의 이벤트 */}
          <GlassCard style={styles.eventsContainer} intensity="medium">
            <Text style={styles.eventsTitle}>
              {new Date(selectedDate).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
                weekday: 'short'
              })} 일정
            </Text>
            
            {eventsForSelectedDate.length === 0 ? (
              <View style={styles.noEventsContainer}>
                <Ionicons name="calendar-outline" size={32} color={colors.text.muted} />
                <Text style={styles.noEventsText}>이 날짜에는 일정이 없습니다</Text>
                <Text style={styles.noEventsSubText}>다른 날짜를 선택해보세요</Text>
              </View>
            ) : (
              <View style={styles.eventsList}>
                {eventsForSelectedDate.map(renderEvent)}
              </View>
            )}
          </GlassCard>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

/*
// 기존 StyleSheet는 useThemedStyles로 이동됨
const oldStyles = StyleSheet.create({
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
    margin: 20,
    padding: 24,
  },
  headerTitle: {
    color: BRAND_COLORS.text.primary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: BRAND_COLORS.text.secondary,
    fontSize: 16,
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  calendarContainer: {
    padding: 20,
    marginBottom: 16,
  },
  legendContainer: {
    padding: 20,
    marginBottom: 16,
  },
  legendTitle: {
    color: BRAND_COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
    ...SHADOWS.glass.light,
  },
  legendText: {
    color: BRAND_COLORS.text.secondary,
    fontSize: 13,
    fontWeight: '500',
  },
  eventsContainer: {
    padding: 20,
    marginBottom: 16,
  },
  eventsTitle: {
    color: BRAND_COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noEventsText: {
    color: BRAND_COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  noEventsSubText: {
    color: BRAND_COLORS.text.secondary,
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  eventsList: {
    gap: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: BRAND_COLORS.background.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border.secondary,
    ...SHADOWS.neumorphism.outset,
  },
  eventIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
    ...SHADOWS.glass.light,
  },
  eventIcon: {
    marginLeft: 4,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    color: BRAND_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  eventMeta: {
    gap: 4,
  },
  eventProjectName: {
    color: BRAND_COLORS.accent.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  eventDescription: {
    color: BRAND_COLORS.text.secondary,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 40,
  },
});
*/

export default CalendarScreen;
