import { format, parseISO, differenceInDays, addDays, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
export const formatDate = (date: string | Date, pattern: string = 'yyyy년 MM월 dd일'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, pattern, { locale: ko });
  } catch {
    return '';
  }
};

/**
 * 프로젝트 진행 상황 계산 (퍼센트)
 */
export const calculateProgress = (startDate: string, endDate: string): number => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const now = new Date();
    
    if (!isValid(start) || !isValid(end)) return 0;
    
    const totalDays = differenceInDays(end, start);
    const elapsedDays = differenceInDays(now, start);
    
    if (totalDays <= 0) return 100;
    if (elapsedDays <= 0) return 0;
    if (elapsedDays >= totalDays) return 100;
    
    return Math.round((elapsedDays / totalDays) * 100);
  } catch {
    return 0;
  }
};

/**
 * 프로젝트 상세 진행 상황 계산 (객체 반환)
 */
export const calculateDetailedProgress = (startDate: string, endDate: string) => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const now = new Date();
    
    if (!isValid(start) || !isValid(end)) {
      return {
        percentage: 0,
        totalDays: 0,
        daysElapsed: 0,
        remainingDays: 0,
      };
    }
    
    const totalDays = differenceInDays(end, start);
    const elapsedDays = Math.max(0, differenceInDays(now, start));
    const remainingDays = Math.max(0, differenceInDays(end, now));
    
    let percentage = 0;
    if (totalDays > 0) {
      percentage = Math.round((elapsedDays / totalDays) * 100);
    }
    
    return {
      percentage: Math.min(100, Math.max(0, percentage)),
      totalDays: Math.max(0, totalDays),
      daysElapsed: Math.max(0, elapsedDays),
      remainingDays: Math.max(0, remainingDays),
    };
  } catch {
    return {
      percentage: 0,
      totalDays: 0,
      daysElapsed: 0,
      remainingDays: 0,
    };
  }
};

/**
 * 남은 일수 계산
 */
export const getDaysRemaining = (endDate: string): number => {
  try {
    const end = parseISO(endDate);
    const now = new Date();
    
    if (!isValid(end)) return 0;
    
    const remaining = differenceInDays(end, now);
    return Math.max(0, remaining);
  } catch {
    return 0;
  }
};

/**
 * 날짜 범위 생성
 */
export const getDateRange = (startDate: string, endDate: string): string[] => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    if (!isValid(start) || !isValid(end)) return [];
    
    const dates: string[] = [];
    let currentDate = start;
    
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate = addDays(currentDate, 1);
    }
    
    return dates;
  } catch {
    return [];
  }
};

/**
 * ISO 문자열을 로컬 날짜 문자열로 변환
 */
export const toLocalDateString = (isoString: string): string => {
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};
