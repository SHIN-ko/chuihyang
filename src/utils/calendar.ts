import { Project, ProgressLog } from '@/src/types';
import { getRecipeById } from '@/src/data/presetRecipes';

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
        color: getProjectColor(project),
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
        color: project.status === 'completed' ? '#22c55e' : getProjectColor(project),
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
          color: getProjectColor(project),
          selectedDotColor: 'rgba(255, 255, 255, 0.9)',
        });
      }
    });
  });

  return markings;
};

// 프로젝트별 브랜드 컬러 반환 (레시피 기반)
export const getProjectColor = (project: Project): string => {
  if (project.recipeId) {
    const recipe = getRecipeById(project.recipeId);
    if (recipe?.brandColor) {
      return recipe.brandColor;
    }
  }
  
  // 기본 타입별 색상 (fallback)
  switch (project.type) {
    case 'damgeumSoju25': return '#20407c'; // 블라블라 색상 기본값
    case 'damgeumSoju30': return '#025830'; // 야레야레 색상 기본값
    case 'vodka': return '#921e22'; // 계애바 색상 기본값
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

// D-Day 계산 함수
export const calculateDDay = (targetDate: string): { dDay: number; label: string } => {
  const today = new Date();
  const target = new Date(targetDate);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return { dDay: 0, label: 'D-Day' };
  if (diffDays > 0) return { dDay: diffDays, label: `D-${diffDays}` };
  return { dDay: diffDays, label: `D+${Math.abs(diffDays)}` };
};

// 프로젝트 진행률 계산 함수
export const calculateProjectProgress = (project: Project): number => {
  if (project.status === 'completed') return 100;
  
  const today = new Date();
  const start = new Date(project.startDate);
  const end = new Date(project.expectedEndDate || project.actualEndDate || project.startDate);
  
  if (today < start) return 0;
  if (today > end) return 100;
  
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const passedDays = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.min(Math.max(Math.round((passedDays / totalDays) * 100), 0), 100);
};

// 이벤트 상태 배지 정보
export const getEventStatusInfo = (event: CalendarEvent): { status: string; color: string; textColor: string } => {
  const today = getTodayString();
  
  switch (event.type) {
    case 'project_start':
      if (event.date === today) {
        return { status: '시작', color: '#22c55e', textColor: '#ffffff' };
      } else if (event.date > today) {
        return { status: '예정', color: '#3b82f6', textColor: '#ffffff' };
      }
      return { status: '시작됨', color: '#6b7280', textColor: '#ffffff' };
      
    case 'project_end':
      if (event.project.status === 'completed') {
        return { status: '완료', color: '#22c55e', textColor: '#ffffff' };
      } else if (event.date === today) {
        return { status: '마감', color: '#ef4444', textColor: '#ffffff' };
      } else if (event.date > today) {
        const { dDay } = calculateDDay(event.date);
        if (dDay <= 3) {
          return { status: '임박', color: '#f59e0b', textColor: '#ffffff' };
        }
        return { status: '예정', color: '#3b82f6', textColor: '#ffffff' };
      }
      return { status: '지연', color: '#ef4444', textColor: '#ffffff' };
      
    case 'progress_log':
      return { status: '로그', color: '#8b5cf6', textColor: '#ffffff' };
      
    default:
      return { status: '기타', color: '#6b7280', textColor: '#ffffff' };
  }
};

// 프로젝트 통계 계산
export interface ProjectStats {
  totalProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  upcomingDeadlines: number;
  recentLogs: number;
  completionRate: number;
}

export const calculateProjectStats = (projects: Project[]): ProjectStats => {
  const today = getTodayString();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekString = nextWeek.toISOString().split('T')[0];

  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  
  // 일주일 내 완료 예정인 프로젝트
  const upcomingDeadlines = projects.filter(p => {
    const deadline = p.actualEndDate || p.expectedEndDate;
    return deadline && deadline >= today && deadline <= nextWeekString && p.status !== 'completed';
  }).length;

  // 최근 일주일 내 진행 로그
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoString = oneWeekAgo.toISOString().split('T')[0];
  
  const recentLogs = projects.reduce((count, project) => {
    return count + (project.progressLogs?.filter(log => 
      log.date && log.date >= oneWeekAgoString && log.date <= today
    ).length || 0);
  }, 0);

  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  return {
    totalProjects,
    inProgressProjects,
    completedProjects,
    upcomingDeadlines,
    recentLogs,
    completionRate,
  };
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
