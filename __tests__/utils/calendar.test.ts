import {
  generateCalendarMarkings,
  getProjectColor,
  getEventsForDate,
  calculateDDay,
  calculateProjectProgress,
  getEventStatusInfo,
  calculateProjectStats,
  type CalendarEvent,
} from '@/src/utils/calendar';
import { Project } from '@/src/types';

const MOCK_NOW = new Date('2025-07-15T12:00:00Z');

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(MOCK_NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

const createProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'test-1',
  userId: 'user-1',
  name: '테스트 담금주',
  type: 'damgeumSoju30',
  startDate: '2025-07-01',
  expectedEndDate: '2025-07-31',
  status: 'in_progress',
  images: [],
  ingredients: [],
  progressLogs: [],
  createdAt: '2025-07-01T00:00:00Z',
  updatedAt: '2025-07-15T00:00:00Z',
  ...overrides,
});

describe('calculateDDay', () => {
  it('미래 날짜 → D-N', () => {
    const result = calculateDDay('2025-07-20');
    expect(result.dDay).toBe(5);
    expect(result.label).toBe('D-5');
  });

  it('오늘 → D-Day', () => {
    const result = calculateDDay('2025-07-15');
    expect(result.dDay).toBe(0);
    expect(result.label).toBe('D-Day');
  });

  it('과거 날짜 → D+N', () => {
    const result = calculateDDay('2025-07-10');
    expect(result.dDay).toBe(-5);
    expect(result.label).toBe('D+5');
  });
});

describe('calculateProjectProgress', () => {
  it('완료된 프로젝트 → 100%', () => {
    const project = createProject({ status: 'completed' });
    expect(calculateProjectProgress(project)).toBe(100);
  });

  it('시작 전 프로젝트 → 0%', () => {
    const project = createProject({
      startDate: '2025-08-01',
      expectedEndDate: '2025-09-01',
    });
    expect(calculateProjectProgress(project)).toBe(0);
  });

  it('종료일 지난 프로젝트 → 100%', () => {
    const project = createProject({
      startDate: '2025-06-01',
      expectedEndDate: '2025-07-01',
    });
    expect(calculateProjectProgress(project)).toBe(100);
  });

  it('진행 중 → 0~100 사이', () => {
    const project = createProject({
      startDate: '2025-07-01',
      expectedEndDate: '2025-07-29',
    });
    const progress = calculateProjectProgress(project);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThanOrEqual(100);
  });
});

describe('getProjectColor', () => {
  it('레시피 ID가 있으면 브랜드 컬러 반환', () => {
    const project = createProject({ recipeId: 'yareyare' });
    expect(getProjectColor(project)).toBe('#025830');
  });

  it('레시피 없으면 타입별 기본 컬러', () => {
    const project = createProject({ type: 'damgeumSoju25' });
    expect(getProjectColor(project)).toBe('#20407c');
  });

  it('vodka 타입 기본 컬러', () => {
    const project = createProject({ type: 'vodka' });
    expect(getProjectColor(project)).toBe('#921e22');
  });
});

describe('generateCalendarMarkings', () => {
  it('빈 배열 → 빈 마킹', () => {
    expect(generateCalendarMarkings([])).toEqual({});
  });

  it('프로젝트 시작일에 마킹 생성', () => {
    const projects = [createProject({ startDate: '2025-07-01' })];
    const markings = generateCalendarMarkings(projects);
    expect(markings['2025-07-01']).toBeDefined();
    expect(markings['2025-07-01'].marked).toBe(true);
    expect(markings['2025-07-01'].dots!.length).toBeGreaterThan(0);
  });

  it('진행 로그 날짜에도 마킹', () => {
    const projects = [
      createProject({
        progressLogs: [
          {
            id: 'log-1',
            projectId: 'test-1',
            date: '2025-07-10',
            title: '중간점검',
            images: [],
            createdAt: '2025-07-10T00:00:00Z',
            updatedAt: '2025-07-10T00:00:00Z',
          },
        ],
      }),
    ];
    const markings = generateCalendarMarkings(projects);
    expect(markings['2025-07-10']).toBeDefined();
  });
});

describe('getEventsForDate', () => {
  const projects = [
    createProject({
      startDate: '2025-07-01',
      expectedEndDate: '2025-07-31',
      progressLogs: [
        {
          id: 'log-1',
          projectId: 'test-1',
          date: '2025-07-15',
          title: '중간점검',
          images: [],
          createdAt: '2025-07-15T00:00:00Z',
          updatedAt: '2025-07-15T00:00:00Z',
        },
      ],
    }),
  ];

  it('시작일에 시작 이벤트', () => {
    const events = getEventsForDate('2025-07-01', projects);
    expect(events.some((e) => e.type === 'project_start')).toBe(true);
  });

  it('종료일에 완료 이벤트', () => {
    const events = getEventsForDate('2025-07-31', projects);
    expect(events.some((e) => e.type === 'project_end')).toBe(true);
  });

  it('로그 날짜에 로그 이벤트', () => {
    const events = getEventsForDate('2025-07-15', projects);
    expect(events.some((e) => e.type === 'progress_log')).toBe(true);
  });

  it('이벤트 없는 날짜 → 빈 배열', () => {
    const events = getEventsForDate('2025-07-20', projects);
    expect(events).toHaveLength(0);
  });

  it('이벤트 정렬: progress_log → project_start → project_end', () => {
    const events = getEventsForDate('2025-07-15', projects);
    if (events.length > 1) {
      const types = events.map((e) => e.type);
      const order = { progress_log: 0, project_start: 1, project_end: 2 };
      for (let i = 1; i < types.length; i++) {
        expect(order[types[i]]).toBeGreaterThanOrEqual(order[types[i - 1]]);
      }
    }
  });
});

describe('getEventStatusInfo', () => {
  it('오늘 시작 이벤트 → 시작', () => {
    const event: CalendarEvent = {
      id: '1',
      title: 'test',
      type: 'project_start',
      date: '2025-07-15',
      project: createProject(),
    };
    expect(getEventStatusInfo(event).status).toBe('시작');
  });

  it('미래 시작 이벤트 → 예정', () => {
    const event: CalendarEvent = {
      id: '1',
      title: 'test',
      type: 'project_start',
      date: '2025-08-01',
      project: createProject(),
    };
    expect(getEventStatusInfo(event).status).toBe('예정');
  });

  it('완료된 프로젝트 종료 이벤트 → 완료', () => {
    const event: CalendarEvent = {
      id: '1',
      title: 'test',
      type: 'project_end',
      date: '2025-07-31',
      project: createProject({ status: 'completed' }),
    };
    expect(getEventStatusInfo(event).status).toBe('완료');
  });

  it('진행 로그 → 로그', () => {
    const event: CalendarEvent = {
      id: '1',
      title: 'test',
      type: 'progress_log',
      date: '2025-07-10',
      project: createProject(),
    };
    expect(getEventStatusInfo(event).status).toBe('로그');
  });
});

describe('calculateProjectStats', () => {
  it('빈 배열 → 모든 값 0', () => {
    const stats = calculateProjectStats([]);
    expect(stats.totalProjects).toBe(0);
    expect(stats.completionRate).toBe(0);
  });

  it('통계 정확하게 계산', () => {
    const projects = [
      createProject({ id: '1', status: 'in_progress' }),
      createProject({ id: '2', status: 'completed' }),
      createProject({ id: '3', status: 'completed' }),
    ];
    const stats = calculateProjectStats(projects);
    expect(stats.totalProjects).toBe(3);
    expect(stats.inProgressProjects).toBe(1);
    expect(stats.completedProjects).toBe(2);
    expect(stats.completionRate).toBe(67); // 2/3 = 66.67 → 67
  });

  it('일주일 내 마감 프로젝트 카운트', () => {
    const projects = [
      createProject({
        id: '1',
        status: 'in_progress',
        expectedEndDate: '2025-07-18', // 3일 후 (일주일 이내)
      }),
      createProject({
        id: '2',
        status: 'in_progress',
        expectedEndDate: '2025-08-01', // 일주일 초과
      }),
    ];
    const stats = calculateProjectStats(projects);
    expect(stats.upcomingDeadlines).toBe(1);
  });
});
