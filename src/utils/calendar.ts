import { Project, ProgressLog } from '@/src/types';

// 캘린더에서 사용할 마킹 타입 정의
export interface CalendarMarking {
  marked: boolean;
  dotColor?: string;
  activeOpacity?: number;
  dots?: Array<{
    color: string;
    selectedDotColor?: string;
  }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'project_start' | 'project_end' | 'progress_log';
  date: string;
  project: Project;
  log?: ProgressLog;
}

// 프로젝트 데이터로부터 캘린더 마킹 생성
export const generateCalendarMarkings = (projects: Project[]): { [key: string]: CalendarMarking } => {
  const markings: { [key: string]: CalendarMarking } = {};

  projects.forEach(project => {
    const startDate = project.startDate;
    const endDate = project.expectedEndDate;
    const actualEndDate = project.actualEndDate;

    // 시작일 마킹
    if (startDate) {
      if (!markings[startDate]) {
        markings[startDate] = { marked: true, dots: [] };
      }
      markings[startDate].dots!.push({
        color: getProjectColor(project.type),
        selectedDotColor: 'rgba(255, 255, 255, 0.9)',
      });
    }

    // 완료 예정일 또는 실제 완료일 마킹
    const completionDate = actualEndDate || endDate;
    if (completionDate && completionDate !== startDate) {
      if (!markings[completionDate]) {
        markings[completionDate] = { marked: true, dots: [] };
      }
      markings[completionDate].dots!.push({
        color: project.status === 'completed' ? '#22c55e' : '#f59e0b',
        selectedDotColor: 'rgba(255, 255, 255, 0.9)',
      });
    }

    // 진행 로그 마킹
    project.progressLogs?.forEach(log => {
      if (log.date && log.date !== startDate && log.date !== completionDate) {
        if (!markings[log.date]) {
          markings[log.date] = { marked: true, dots: [] };
        }
        markings[log.date].dots!.push({
          color: '#6366f1',
          selectedDotColor: 'rgba(255, 255, 255, 0.9)',
        });
      }
    });
  });

  return markings;
};

// 프로젝트 타입별 색상 반환
export const getProjectColor = (type: string): string => {
  switch (type) {
    case 'whiskey': return '#d97706';
    case 'gin': return '#059669';
    case 'rum': return '#dc2626';
    case 'fruit_wine': return '#c026d3';
    case 'vodka': return '#2563eb';
    default: return '#6b7280';
  }
};

// 특정 날짜의 이벤트 목록 생성
export const getEventsForDate = (date: string, projects: Project[]): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  projects.forEach(project => {
    // 프로젝트 시작일
    if (project.startDate === date) {
      events.push({
        id: `${project.id}-start`,
        title: `${project.name} 시작`,
        type: 'project_start',
        date,
        project,
      });
    }

    // 프로젝트 완료일
    const completionDate = project.actualEndDate || project.expectedEndDate;
    if (completionDate === date) {
      events.push({
        id: `${project.id}-end`,
        title: `${project.name} ${project.status === 'completed' ? '완료' : '완료 예정'}`,
        type: 'project_end',
        date,
        project,
      });
    }

    // 진행 로그
    project.progressLogs?.forEach(log => {
      if (log.date === date) {
        events.push({
          id: `${log.id}`,
          title: `${project.name}: ${log.title}`,
          type: 'progress_log',
          date,
          project,
          log,
        });
      }
    });
  });

  // 시간순 정렬 (진행 로그 → 시작 → 완료)
  return events.sort((a, b) => {
    const order = { 'progress_log': 0, 'project_start': 1, 'project_end': 2 };
    return order[a.type] - order[b.type];
  });
};

// 오늘 날짜 문자열 반환 (YYYY-MM-DD)
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// 캘린더 테마 설정 (동적 생성 함수)
export const createCalendarTheme = (theme: 'light' | 'dark', colors: any, brandColors: any) => ({
  backgroundColor: 'transparent',
  calendarBackground: 'transparent',
  
  // 헤더 (요일) 텍스트
  textSectionTitleColor: theme === 'dark' ? '#C4C6C4' : '#4A4C4A',
  textDayHeaderFontSize: 13,
  textDayHeaderFontWeight: '600',
  
  // 월/년도 텍스트  
  monthTextColor: theme === 'dark' ? '#FAFAFA' : '#1A1B1A',
  textMonthFontSize: 16,
  textMonthFontWeight: '600',
  
  // 일반 날짜 텍스트
  dayTextColor: theme === 'dark' ? '#FAFAFA' : '#1A1B1A',
  textDayFontSize: 16,
  textDayFontWeight: '400',
  
  // 오늘 날짜
  todayTextColor: brandColors.accent.primary,
  todayBackgroundColor: 'transparent',
  
  // 선택된 날짜
  selectedDayBackgroundColor: brandColors.accent.primary,
  selectedDayTextColor: theme === 'dark' ? '#0A0B0A' : '#FFFFFF',
  
  // 비활성화된 날짜 (이전/다음 달)
  textDisabledColor: theme === 'dark' ? '#6B6D6B' : '#8B8D8B',
  
  // 점 표시 (마킹)
  dotColor: brandColors.accent.primary,
  selectedDotColor: theme === 'dark' ? '#0A0B0A' : '#FFFFFF',
  
  // 화살표
  arrowColor: theme === 'dark' ? '#FAFAFA' : '#1A1B1A',
  disabledArrowColor: theme === 'dark' ? '#6B6D6B' : '#8B8D8B',
  
  // 인디케이터
  indicatorColor: brandColors.accent.primary,
  
  // 추가 스타일 오버라이드 - 더 강력하게!
  'stylesheet.calendar.header': {
    week: {
      marginTop: 7,
      marginHorizontal: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    dayHeader: {
      marginTop: 2,
      marginBottom: 7,
      width: 32,
      textAlign: 'center',
      color: theme === 'dark' ? '#C4C6C4' : '#4A4C4A',
      fontSize: 13,
      fontWeight: '600',
    },
    monthText: {
      color: theme === 'dark' ? '#FAFAFA' : '#1A1B1A',
      fontSize: 16,
      fontWeight: '600',
    },
    arrow: {
      padding: 10,
    },
    arrowImage: {
      tintColor: theme === 'dark' ? '#FAFAFA' : '#1A1B1A',
    },
  },
  'stylesheet.day.basic': {
    base: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      marginTop: 4,
      fontSize: 16,
      fontFamily: 'SF Pro Display',
      fontWeight: '400',
      color: theme === 'dark' ? '#FAFAFA' : '#1A1B1A',
    },
    today: {
      backgroundColor: 'transparent',
    },
    todayText: {
      color: brandColors.accent.primary,
      fontWeight: '600',
    },
    selected: {
      backgroundColor: brandColors.accent.primary,
      borderRadius: 16,
    },
    selectedText: {
      color: theme === 'dark' ? '#0A0B0A' : '#FFFFFF',
      fontWeight: '600',
    },
    disabled: {
      backgroundColor: 'transparent',
    },
    disabledText: {
      color: theme === 'dark' ? '#6B6D6B' : '#8B8D8B',
    },
  },
  'stylesheet.calendar.main': {
    calendar: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    header: {
      backgroundColor: 'transparent',
    },
  },
  // 추가 강제 스타일 오버라이드
  'stylesheet.day.period': {
    base: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: theme === 'dark' ? '#FAFAFA' : '#1A1B1A',
      fontSize: 16,
      fontWeight: '400',
    },
  },
  'stylesheet.day.multiDot': {
    base: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: theme === 'dark' ? '#FAFAFA' : '#1A1B1A',
      fontSize: 16,
      fontWeight: '400',
    },
    selectedText: {
      color: theme === 'dark' ? '#0A0B0A' : '#FFFFFF',
      fontWeight: '600',
    },
    todayText: {
      color: brandColors.accent.primary,
      fontWeight: '600',
    },
  },
});
