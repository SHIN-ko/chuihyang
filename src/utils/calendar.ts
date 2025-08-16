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
        selectedDotColor: '#ffffff',
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
        selectedDotColor: '#ffffff',
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
          selectedDotColor: '#ffffff',
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

// 캘린더 테마 설정
export const calendarTheme = {
  backgroundColor: '#111811',
  calendarBackground: '#111811',
  textSectionTitleColor: '#9db89d',
  selectedDayBackgroundColor: '#22c55e',
  selectedDayTextColor: '#111811',
  todayTextColor: '#22c55e',
  dayTextColor: '#ffffff',
  textDisabledColor: '#6b7280',
  dotColor: '#22c55e',
  selectedDotColor: '#111811',
  arrowColor: '#22c55e',
  monthTextColor: '#ffffff',
  textDayFontSize: 16,
  textMonthFontSize: 18,
  textDayHeaderFontSize: 14,
  'stylesheet.calendar.header': {
    week: {
      marginTop: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  },
};
