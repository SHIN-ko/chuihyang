import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useProjectStore } from '@/src/stores/projectStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    fetchProjects();
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
      selectedColor: '#22c55e',
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
          color="#9db89d" 
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
      
      <Ionicons name="chevron-forward" size={16} color="#9db89d" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111811" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>캘린더</Text>
        <Text style={styles.headerSubtitle}>프로젝트 일정을 확인하세요</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 캘린더 */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            theme={calendarTheme}
            hideExtraDays={true}
            firstDay={0} // 일요일부터 시작
            enableSwipeMonths={true}
            markingType="multi-dot"
          />
        </View>

        {/* 범례 */}
        <View style={styles.legendContainer}>
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
              <View style={[styles.legendDot, { backgroundColor: '#6366f1' }]} />
              <Text style={styles.legendText}>진행 로그</Text>
            </View>
          </View>
        </View>

        {/* 선택된 날짜의 이벤트 */}
        <View style={styles.eventsContainer}>
          <Text style={styles.eventsTitle}>
            {new Date(selectedDate).toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'short'
            })} 일정
          </Text>
          
          {eventsForSelectedDate.length === 0 ? (
            <View style={styles.noEventsContainer}>
              <Ionicons name="calendar-outline" size={32} color="#9db89d" />
              <Text style={styles.noEventsText}>이 날짜에는 일정이 없습니다</Text>
              <Text style={styles.noEventsSubText}>다른 날짜를 선택해보세요</Text>
            </View>
          ) : (
            <View style={styles.eventsList}>
              {eventsForSelectedDate.map(renderEvent)}
            </View>
          )}
        </View>

        {/* 하단 여백 */}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#9db89d',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: '#111811',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  legendContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#1c261c',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  legendTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: '#9db89d',
    fontSize: 12,
  },
  eventsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  eventsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#1c261c',
    borderRadius: 12,
  },
  noEventsText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
  },
  noEventsSubText: {
    color: '#9db89d',
    fontSize: 14,
    marginTop: 4,
  },
  eventsList: {
    backgroundColor: '#1c261c',
    borderRadius: 12,
    overflow: 'hidden',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3c533c',
  },
  eventIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  eventIcon: {
    marginRight: 4,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventMeta: {
    gap: 2,
  },
  eventProjectName: {
    color: '#9db89d',
    fontSize: 14,
  },
  eventDescription: {
    color: '#9db89d',
    fontSize: 12,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default CalendarScreen;
