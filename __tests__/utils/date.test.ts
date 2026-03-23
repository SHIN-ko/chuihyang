import {
  formatDate,
  calculateProgress,
  calculateDetailedProgress,
  getDaysRemaining,
  getDateRange,
  toLocalDateString,
} from '@/src/utils/date';

const MOCK_NOW = new Date('2025-07-15T00:00:00');

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(MOCK_NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('formatDate', () => {
  it('ISO 문자열을 한국어 형식으로 포맷', () => {
    expect(formatDate('2025-07-15')).toBe('2025년 07월 15일');
  });

  it('Date 객체를 한국어 형식으로 포맷', () => {
    const date = new Date('2025-01-01T00:00:00Z');
    expect(formatDate(date)).toBe('2025년 01월 01일');
  });

  it('커스텀 패턴 지원', () => {
    expect(formatDate('2025-07-15', 'MM/dd')).toBe('07/15');
  });

  it('잘못된 날짜 문자열 → 빈 문자열', () => {
    expect(formatDate('not-a-date')).toBe('');
  });

  it('빈 문자열 → 빈 문자열', () => {
    expect(formatDate('')).toBe('');
  });
});

describe('calculateProgress', () => {
  it('기간 중간이면 약 50%', () => {
    // 7/1 ~ 7/29 (28일), 현재 7/15 → 14일 경과 → 50%
    const result = calculateProgress('2025-07-01', '2025-07-29');
    expect(result).toBe(50);
  });

  it('시작 전이면 0%', () => {
    const result = calculateProgress('2025-08-01', '2025-09-01');
    expect(result).toBe(0);
  });

  it('종료 후이면 100%', () => {
    const result = calculateProgress('2025-06-01', '2025-07-01');
    expect(result).toBe(100);
  });

  it('시작일과 종료일이 같으면 100%', () => {
    const result = calculateProgress('2025-07-15', '2025-07-15');
    expect(result).toBe(100);
  });

  it('잘못된 날짜 → 0', () => {
    expect(calculateProgress('invalid', '2025-07-15')).toBe(0);
  });
});

describe('calculateDetailedProgress', () => {
  it('올바른 상세 정보 반환', () => {
    // 7/1 ~ 7/29 (28일), 현재 7/15 → 14일 경과, 14일 남음
    const result = calculateDetailedProgress('2025-07-01', '2025-07-29');
    expect(result.totalDays).toBe(28);
    expect(result.daysElapsed).toBe(14);
    expect(result.remainingDays).toBe(14);
    expect(result.percentage).toBe(50);
  });

  it('종료 후 percentage는 100 이하', () => {
    const result = calculateDetailedProgress('2025-06-01', '2025-06-15');
    expect(result.percentage).toBeLessThanOrEqual(100);
  });

  it('시작 전 daysElapsed는 0', () => {
    const result = calculateDetailedProgress('2025-08-01', '2025-09-01');
    expect(result.daysElapsed).toBe(0);
  });

  it('잘못된 날짜 → 기본값 객체', () => {
    const result = calculateDetailedProgress('invalid', '2025-07-15');
    expect(result).toEqual({
      percentage: 0,
      totalDays: 0,
      daysElapsed: 0,
      remainingDays: 0,
    });
  });
});

describe('getDaysRemaining', () => {
  it('미래 날짜까지 남은 일수', () => {
    // 7/15 → 7/25 = 10일
    expect(getDaysRemaining('2025-07-25')).toBe(10);
  });

  it('과거 날짜 → 0', () => {
    expect(getDaysRemaining('2025-07-01')).toBe(0);
  });

  it('오늘 → 0', () => {
    expect(getDaysRemaining('2025-07-15')).toBe(0);
  });

  it('잘못된 날짜 → 0', () => {
    expect(getDaysRemaining('invalid')).toBe(0);
  });
});

describe('getDateRange', () => {
  it('시작일~종료일 범위의 날짜 배열 생성', () => {
    const range = getDateRange('2025-07-10', '2025-07-13');
    expect(range).toEqual(['2025-07-10', '2025-07-11', '2025-07-12', '2025-07-13']);
  });

  it('같은 날짜 → 하나의 요소', () => {
    const range = getDateRange('2025-07-15', '2025-07-15');
    expect(range).toEqual(['2025-07-15']);
  });

  it('잘못된 날짜 → 빈 배열', () => {
    expect(getDateRange('invalid', '2025-07-15')).toEqual([]);
  });
});

describe('toLocalDateString', () => {
  it('ISO 문자열 → YYYY-MM-DD 형식', () => {
    expect(toLocalDateString('2025-07-15T12:00:00Z')).toBe('2025-07-15');
  });

  it('잘못된 문자열 → 빈 문자열', () => {
    expect(toLocalDateString('invalid')).toBe('');
  });
});
