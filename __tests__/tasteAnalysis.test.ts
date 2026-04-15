import {
  calculateAverageRatings,
  analyzeTasteType,
  calculateTasteStats,
} from '@/src/utils/tasteAnalysis';
import { Project } from '@/src/types';

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: '1',
  userId: 'u1',
  name: '테스트 프로젝트',
  type: 'damgeumSoju25',
  startDate: '2026-01-01',
  expectedEndDate: '2026-02-01',
  status: 'completed',
  images: [],
  ingredients: [],
  progressLogs: [],
  recipeId: 'yareyare',
  tastingNote: {
    ratings: { taste: 4, aroma: 5, appearance: 3, body: 4, finish: 5, overall: 4 },
    color: '황금색',
    memo: '맛있다',
    tastingDate: '2026-02-01',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-02-01T00:00:00Z',
  ...overrides,
});

describe('calculateAverageRatings', () => {
  it('returns empty array when no projects with tasting notes', () => {
    const result = calculateAverageRatings([makeProject({ tastingNote: null })]);
    expect(result).toEqual([]);
  });

  it('returns average ratings from single project', () => {
    const result = calculateAverageRatings([makeProject()]);
    expect(result).toEqual([
      { label: '맛', value: 4 },
      { label: '향', value: 5 },
      { label: '외관', value: 3 },
      { label: '바디감', value: 4 },
      { label: '여운', value: 5 },
      { label: '전체', value: 4 },
    ]);
  });

  it('averages ratings across multiple projects', () => {
    const p1 = makeProject({
      id: '1',
      tastingNote: {
        ratings: { taste: 4, aroma: 2, appearance: 4, body: 2, finish: 4, overall: 3 },
        color: '', memo: '', tastingDate: '', createdAt: '', updatedAt: '',
      },
    });
    const p2 = makeProject({
      id: '2',
      tastingNote: {
        ratings: { taste: 2, aroma: 4, appearance: 2, body: 4, finish: 2, overall: 3 },
        color: '', memo: '', tastingDate: '', createdAt: '', updatedAt: '',
      },
    });
    const result = calculateAverageRatings([p1, p2]);
    expect(result).toEqual([
      { label: '맛', value: 3 },
      { label: '향', value: 3 },
      { label: '외관', value: 3 },
      { label: '바디감', value: 3 },
      { label: '여운', value: 3 },
      { label: '전체', value: 3 },
    ]);
  });
});

describe('analyzeTasteType', () => {
  it('returns null when no tasting notes', () => {
    const result = analyzeTasteType([makeProject({ tastingNote: null })]);
    expect(result).toBeNull();
  });

  it('returns correct type for aroma + finish top scores', () => {
    const result = analyzeTasteType([makeProject()]);
    expect(result?.title).toBe('여운을 음미하는 감성가');
  });

  it('returns correct type for taste + body top scores', () => {
    const p = makeProject({
      tastingNote: {
        ratings: { taste: 5, aroma: 2, appearance: 2, body: 5, finish: 2, overall: 3 },
        color: '', memo: '', tastingDate: '', createdAt: '', updatedAt: '',
      },
    });
    const result = analyzeTasteType([p]);
    expect(result?.title).toBe('풍미를 추구하는 미식가');
  });
});

describe('calculateTasteStats', () => {
  it('returns zero stats when no tasting notes', () => {
    const result = calculateTasteStats([makeProject({ tastingNote: null })]);
    expect(result.totalTastings).toBe(0);
  });

  it('returns correct stats for single project', () => {
    const result = calculateTasteStats([makeProject()]);
    expect(result.totalTastings).toBe(1);
    expect(result.averageOverall).toBe(4);
    expect(result.highestDimension.label).toBe('향');
    expect(result.lowestDimension.label).toBe('외관');
    expect(result.favoriteRecipe?.name).toBe('야레야레 やれやれ~');
    expect(result.favoriteRecipe?.count).toBe(1);
  });
});
