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

const { width } = Dimensions.get('window');
import {
  generateCalendarMarkings,
  getEventsForDate,
  getTodayString,
  createCalendarTheme,
  CalendarEvent,
  getProjectColor,
  calculateProjectStats,
  ProjectStats,
  calculateDDay,
  calculateProjectProgress,
  getEventStatusInfo,
} from '@/src/utils/calendar';

const CalendarScreen: React.FC = () => {
  const { projects, fetchProjects } = useProjectStore();
  const router = useRouter();
  const { colors, brandColors } = useThemeValues();

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<CalendarEvent[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    totalProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    upcomingDeadlines: 0,
    recentLogs: 0,
    completionRate: 0,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const styles = useThemedStyles(({ colors, shadows, brandColors }) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background.primary,
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
      headerTitle: {
        color: colors.text.primary,
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: -0.5,
        flex: 1,
      },
      headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      },
      actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background.elevated,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.glass.light,
      },
      actionButtonPrimary: {
        backgroundColor: brandColors.accent.primary,
      },
      summaryContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        margin: 20,
        marginTop: 12,
        marginBottom: 16,
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border.primary,
        ...shadows.glass.light,
      },
      summaryContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      },
      summaryText: {
        color: colors.text.primary,
        fontSize: 14,
        fontWeight: '500',
      },
      calendarContainer: {
        margin: 20,
        marginBottom: 16,
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border.primary,
        ...shadows.glass.light,
      },

      eventsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        margin: 20,
        marginTop: 0,
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border.primary,
        ...shadows.glass.light,
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
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: colors.background.elevated,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border.secondary,
        ...shadows.glass.light,
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
      eventHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
      },
      eventBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginLeft: 8,
      },
      eventBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.5,
      },
      dDayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 8,
      },
      dDayBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: colors.background.secondary,
      },
      dDayText: {
        color: colors.text.secondary,
        fontSize: 11,
        fontWeight: '600',
      },
      progressContainer: {
        marginTop: 6,
      },
      progressBar: {
        height: 4,
        backgroundColor: colors.background.secondary,
        borderRadius: 2,
        overflow: 'hidden',
      },
      progressFill: {
        height: '100%',
        borderRadius: 2,
      },
      progressText: {
        color: colors.text.muted,
        fontSize: 11,
        marginTop: 3,
        textAlign: 'right',
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
    }),
  );

  const dynamicCalendarTheme = createCalendarTheme('light', colors, brandColors);

  useEffect(() => {
    fetchProjects();

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

  useEffect(() => {
    const events = getEventsForDate(selectedDate, projects);
    setEventsForSelectedDate(events);
  }, [selectedDate, projects]);

  useEffect(() => {
    const stats = calculateProjectStats(projects);
    setProjectStats(stats);
  }, [projects]);

  const calendarMarkings = generateCalendarMarkings(projects);

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

  const handleGoToToday = () => {
    setSelectedDate(getTodayString());
  };

  const handleAddProject = () => {
    router.push('/project/create');
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

  const renderEvent = (event: CalendarEvent) => {
    const statusInfo = getEventStatusInfo(event);
    const dDayInfo =
      event.type === 'project_end' || event.type === 'project_start'
        ? calculateDDay(event.date)
        : null;
    const progress =
      event.type === 'project_end' || event.type === 'project_start'
        ? calculateProjectProgress(event.project)
        : null;

    return (
      <TouchableOpacity
        key={event.id}
        style={styles.eventItem}
        onPress={() => handleEventPress(event)}
      >
        <View style={styles.eventIndicator}>
          <View style={[styles.eventDot, { backgroundColor: getProjectColor(event.project) }]} />
          <Ionicons
            name={getEventIcon(event.type) as any}
            size={16}
            color={brandColors.accent.primary}
            style={styles.eventIcon}
          />
        </View>

        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={[styles.eventBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={[styles.eventBadgeText, { color: statusInfo.textColor }]}>
                {statusInfo.status}
              </Text>
            </View>
          </View>

          <View style={styles.eventMeta}>
            <Text style={styles.eventProjectName}>{event.project.name}</Text>
            {event.log && (
              <Text style={styles.eventDescription} numberOfLines={1}>
                {event.log.description}
              </Text>
            )}
          </View>

          {(dDayInfo || progress !== null) && (
            <View style={styles.dDayContainer}>
              {dDayInfo && (
                <View style={styles.dDayBadge}>
                  <Text style={styles.dDayText}>{dDayInfo.label}</Text>
                </View>
              )}
              {progress !== null &&
                event.type === 'project_end' &&
                event.project.status !== 'completed' && (
                  <Text style={styles.dDayText}>진행률 {progress}%</Text>
                )}
            </View>
          )}

          {progress !== null &&
            event.type === 'project_end' &&
            event.project.status !== 'completed' && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: brandColors.accent.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            )}
        </View>

        <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

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
          {projectStats.inProgressProjects > 0 && (
            <View style={styles.summaryContainer}>
              <View style={styles.summaryContent}>
                <Ionicons name="flask" size={20} color={brandColors.accent.primary} />
                <Text style={styles.summaryText}>
                  현재 진행 중인 프로젝트 {projectStats.inProgressProjects}개
                </Text>
              </View>
            </View>
          )}

          <View style={styles.calendarContainer}>
            <Calendar
              key="calendar-light"
              current={selectedDate}
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              theme={
                {
                  ...dynamicCalendarTheme,
                  dayTextColor: '#000000',
                  textSectionTitleColor: '#666666',
                  monthTextColor: '#000000',
                  arrowColor: '#000000',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 13,
                  textDayFontWeight: '400',
                  textMonthFontWeight: '600',
                  textDayHeaderFontWeight: '600',
                } as any
              }
              style={{
                backgroundColor: 'transparent',
              }}
              hideExtraDays={true}
              firstDay={0}
              enableSwipeMonths={true}
              markingType="multi-dot"
            />
          </View>

          <View style={styles.eventsContainer}>
            <Text style={styles.eventsTitle}>
              {new Date(selectedDate).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })}{' '}
              일정
            </Text>

            {eventsForSelectedDate.length === 0 ? (
              <View style={styles.noEventsContainer}>
                <Ionicons name="calendar-outline" size={32} color={colors.text.muted} />
                <Text style={styles.noEventsText}>이 날짜에는 일정이 없습니다</Text>
                <Text style={styles.noEventsSubText}>다른 날짜를 선택해보세요</Text>
              </View>
            ) : (
              <View style={styles.eventsList}>{eventsForSelectedDate.map(renderEvent)}</View>
            )}
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default CalendarScreen;
