import { FruitId, HerbId, MoodId, ProjectType } from '@/src/types';

export interface FruitInfo {
  id: FruitId;
  name: string;
  description: string;
  brandColor: string;
  colorDescription: string;
  moods: MoodId[];
}

export interface HerbInfo {
  id: HerbId;
  name: string;
  description: string;
}

export interface MoodInfo {
  id: MoodId;
  label: string;
  emoji: string;
  preferredFruits: FruitId[];
  preferredHerbs: HerbId[];
  recommendedBase: ProjectType;
}

export const FRUITS: FruitInfo[] = [
  {
    id: 'maesil',
    name: '매실',
    description: '새콤상큼한 한국의 맛',
    brandColor: '#7BA428',
    colorDescription: '연한 연두색',
    moods: ['family'],
  },
  {
    id: 'bokbunja',
    name: '복분자',
    description: '깊은 단맛의 루비빛',
    brandColor: '#B22046',
    colorDescription: '진한 루비색',
    moods: ['romantic'],
  },
  {
    id: 'blueberry',
    name: '블루베리',
    description: '은은한 보랏빛 부드러움',
    brandColor: '#4A4AAB',
    colorDescription: '깊은 보랏빛',
    moods: ['quiet_night'],
  },
  {
    id: 'grapefruit',
    name: '자몽',
    description: '쌉싸름 상큼',
    brandColor: '#E8654F',
    colorDescription: '분홍빛 감도는 주황색',
    moods: ['lively_friends', 'picnic'],
  },
  {
    id: 'lemon',
    name: '레몬',
    description: '깔끔한 산미',
    brandColor: '#E8C647',
    colorDescription: '밝은 레몬색',
    moods: ['picnic'],
  },
  {
    id: 'yuja',
    name: '유자',
    description: '향긋한 한국의 시트러스',
    brandColor: '#E8A347',
    colorDescription: '은은한 황금색',
    moods: ['winter_warm', 'family'],
  },
  {
    id: 'moga',
    name: '모과',
    description: '깊은 향의 황금빛',
    brandColor: '#C98B3A',
    colorDescription: '진한 황금색',
    moods: ['winter_warm', 'quiet_night'],
  },
  {
    id: 'apple',
    name: '사과',
    description: '부드럽고 달콤',
    brandColor: '#D44F3A',
    colorDescription: '은은한 호박색',
    moods: ['family', 'romantic'],
  },
  {
    id: 'greengrape',
    name: '청포도',
    description: '깔끔한 단맛',
    brandColor: '#8FB339',
    colorDescription: '연한 연둣빛',
    moods: ['quiet_night', 'romantic'],
  },
  {
    id: 'raspberry',
    name: '산딸기',
    description: '발랄한 붉은빛',
    brandColor: '#D93A5E',
    colorDescription: '선명한 붉은색',
    moods: ['lively_friends', 'picnic'],
  },
  {
    id: 'fig',
    name: '무화과',
    description: '묵직한 단맛',
    brandColor: '#6B3D4B',
    colorDescription: '깊은 자주색',
    moods: ['romantic'],
  },
  {
    id: 'halabong',
    name: '한라봉',
    description: '풍부한 향과 단맛',
    brandColor: '#F0993C',
    colorDescription: '진한 주황색',
    moods: ['lively_friends', 'picnic'],
  },
  {
    id: 'omija',
    name: '오미자',
    description: '다섯 가지 맛이 어우러진 한국 베리',
    brandColor: '#A63A50',
    colorDescription: '맑은 선홍색',
    moods: ['quiet_night', 'family'],
  },
];

export const HERBS: HerbInfo[] = [
  { id: 'rosemary', name: '로즈마리', description: '깊고 우디한 향' },
  { id: 'lavender', name: '라벤더', description: '부드럽고 플로럴' },
  { id: 'mint', name: '민트', description: '청량하고 시원함' },
  { id: 'basil', name: '바질', description: '산뜻한 허브' },
  { id: 'thyme', name: '타임', description: '은은한 약초향' },
  { id: 'cinnamon', name: '시나몬', description: '따뜻한 매콤함' },
  { id: 'clove', name: '정향', description: '강하고 깊은 향' },
  { id: 'ginger', name: '생강', description: '알싸한 따뜻함' },
  { id: 'cardamom', name: '카다멈', description: '이국적이고 은은' },
  { id: 'chrysanthemum', name: '국화', description: '부드러운 플로럴, 한국적' },
];

export const MOODS: MoodInfo[] = [
  {
    id: 'quiet_night',
    label: '조용한 밤',
    emoji: '🌙',
    preferredFruits: ['blueberry', 'greengrape', 'moga', 'omija'],
    preferredHerbs: ['lavender', 'chrysanthemum'],
    recommendedBase: 'damgeumSoju30',
  },
  {
    id: 'lively_friends',
    label: '시끌벅적',
    emoji: '🎉',
    preferredFruits: ['raspberry', 'halabong', 'grapefruit'],
    preferredHerbs: ['mint', 'basil'],
    recommendedBase: 'damgeumSoju25',
  },
  {
    id: 'romantic',
    label: '연인과 둘이',
    emoji: '💕',
    preferredFruits: ['bokbunja', 'fig', 'apple', 'greengrape'],
    preferredHerbs: ['rosemary', 'lavender'],
    recommendedBase: 'damgeumSoju30',
  },
  {
    id: 'family',
    label: '가족 모임',
    emoji: '🏡',
    preferredFruits: ['maesil', 'yuja', 'omija', 'apple'],
    preferredHerbs: ['cinnamon', 'ginger', 'chrysanthemum'],
    recommendedBase: 'damgeumSoju25',
  },
  {
    id: 'picnic',
    label: '피크닉',
    emoji: '🧺',
    preferredFruits: ['lemon', 'grapefruit', 'halabong', 'raspberry'],
    preferredHerbs: ['mint', 'basil'],
    recommendedBase: 'damgeumSoju25',
  },
  {
    id: 'winter_warm',
    label: '추운 겨울',
    emoji: '❄️',
    preferredFruits: ['yuja', 'moga', 'apple'],
    preferredHerbs: ['cinnamon', 'ginger', 'clove'],
    recommendedBase: 'vodka',
  },
];

/**
 * 과일별 어울리는 허브 (우선순위 순)
 */
export const FRUIT_HERB_PAIRINGS: Record<FruitId, HerbId[]> = {
  maesil: ['rosemary', 'cinnamon', 'ginger'],
  bokbunja: ['rosemary', 'thyme', 'cinnamon'],
  blueberry: ['lavender', 'rosemary', 'basil'],
  grapefruit: ['mint', 'basil', 'lavender'],
  lemon: ['mint', 'basil', 'thyme'],
  yuja: ['ginger', 'cinnamon', 'clove'],
  moga: ['cinnamon', 'clove', 'cardamom'],
  apple: ['cinnamon', 'cardamom', 'thyme'],
  greengrape: ['mint', 'basil', 'lavender'],
  raspberry: ['mint', 'basil', 'lavender'],
  fig: ['rosemary', 'cinnamon', 'thyme'],
  halabong: ['mint', 'ginger', 'lavender'],
  omija: ['ginger', 'chrysanthemum', 'cinnamon'],
};

/**
 * 베이스 타입별 기본 숙성 기간 (일)
 */
export const BASE_DURATION_DAYS: Record<ProjectType, number> = {
  damgeumSoju25: 30,
  damgeumSoju30: 45,
  vodka: 60,
};

export const BASE_TYPE_LABELS: Record<ProjectType, string> = {
  damgeumSoju25: '담금소주 25도',
  damgeumSoju30: '담금소주 30도',
  vodka: '보드카',
};

export const PEOPLE_LABELS: Record<string, string> = {
  alone: '혼자',
  two: '둘이서',
  small_group: '소수 모임',
  big_group: '큰 모임',
};

export const SWEETNESS_LABELS: Record<string, string> = {
  light: '가볍게',
  normal: '보통',
  strong: '달달하게',
};

export const DRINK_TIMING_LABELS: Record<string, string> = {
  within_month: '한 달 안에',
  two_three_months: '두세 달 후',
  after_season: '계절이 바뀐 후',
};

export function getFruitById(id: FruitId): FruitInfo | undefined {
  return FRUITS.find((f) => f.id === id);
}

export function getHerbById(id: HerbId): HerbInfo | undefined {
  return HERBS.find((h) => h.id === id);
}

export function getMoodById(id: MoodId): MoodInfo | undefined {
  return MOODS.find((m) => m.id === id);
}
