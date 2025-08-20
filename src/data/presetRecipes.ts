import { PresetRecipe, ProjectType } from '@/src/types';

export const PRESET_RECIPES: PresetRecipe[] = [
  {
    id: 'yareyare',
    name: '야레야레 やれやれ~',
    type: 'damgeumSoju30',
    description: '활력을 담은 한 잔 야레야레, 맛에서 놀라고 그 놀라움은... 야레야레~',
    defaultDuration: 30, // 30일
    ingredients: [
      '야관문',
      '레몬그라스',
      '빙탕'
    ],
    instructions: '보리를 발효시킨 후 오크통에서 숙성'
  },
  {
    id: 'blabla',
    name: '블라블라 blahblah!',
    type: 'damgeumSoju25',
    description: '블라블라와 함께라면 어떤 대화이건 시간가는 줄 모르고 달큰하게 빠져들거야.',
    defaultDuration: 10, // 10일
    ingredients: [
      '블루베리',
      '라벤더',
      '빙탕'
    ],
    instructions: '허브류를 침출시켜 향을 우려낸 후 숙성'
  },
  {
    id: 'oz',
    name: '오즈(OZ)',
    type: 'damgeumSoju30',
    description: '오즈는 친구들과의 마법 같은 순간을 담은, 다채로운 맛의 여행을 제공합니다',
    defaultDuration: 10, // 10일
    ingredients: [
      '오미자',
      '로즈마리',
      '빙탕'
    ],
    instructions: '사탕수수를 발효시켜 오크칩과 함께 장기 숙성'
  },
  {
    id: 'pachinko',
    name: '파칭코 Pachinco',
    type: 'damgeumSoju25',
    description: '트로피컬한 향과 우연히 찾아온 행운 같은 기쁨 파칭코',
    defaultDuration: 15, // 15일
    ingredients: [
      '파인애플',
      '코코넛',
      '빙탕'
    ],
    instructions: '사과를 으깨어 발효시킨 후 여과하여 숙성'
  },
  {
    id: 'gyeaeba',
    name: '계애바 ApCiVa',
    type: 'vodka',
    description: '익숙하게 다가오지만 색다른 부드러움이 감싸는 조합! 계애바!',
    defaultDuration: 14, // 14일
    ingredients: [
      '사과',
      '계피',
      '바닐라빈',
      '빙탕'
    ],
    instructions: '감자를 증류한 후 활성탄으로 여과하여 정제'
  },
];

export const getRecipeById = (id: string): PresetRecipe | undefined => {
  return PRESET_RECIPES.find(recipe => recipe.id === id);
};

export const getRecipesByType = (type: ProjectType): PresetRecipe[] => {
  return PRESET_RECIPES.filter(recipe => recipe.type === type);
};

// 타입별 숙성 기간 조정값 반환
export const getTypeAdjustment = (type: ProjectType): number => {
  const adjustments: Record<ProjectType, number> = {
    damgeumSoju25: 7, // 25도 - +7일
    damgeumSoju30: 0, // 30도 - +0일 (기본)
    vodka: -2, // 보드카 - -2일
  };
  return adjustments[type];
};

// 타입별 최종 숙성 기간 반환 (레시피 기본값 + 타입 조정값)
export const getDurationByType = (type: ProjectType): number => {
  // 기본값으로 30도 기준 사용 (하위 호환성을 위해 유지)
  const baseDuration = 30; // 30도 기본값
  return baseDuration + getTypeAdjustment(type);
};

// 타입별 한국어 이름 매핑
export const getTypeDisplayName = (type: ProjectType): string => {
  const typeNames: Record<ProjectType, string> = {
    damgeumSoju25: '담금소주 25도',
    damgeumSoju30: '담금소주 30도',
    vodka: '보드카',
  };
  return typeNames[type];
};

// 모든 타입 목록 반환 (UI에서 선택 옵션으로 사용)
export const getAllProjectTypes = (): ProjectType[] => {
  return ['damgeumSoju25', 'damgeumSoju30', 'vodka'];
};

// 레시피와 타입 조합으로 최종 duration 계산
export const calculateFinalDuration = (recipeId: string, selectedType: ProjectType): number => {
  // 레시피의 기본 duration + 타입별 조정값
  const recipe = getRecipeById(recipeId);
  if (!recipe) {
    // 레시피를 찾을 수 없는 경우 기본값 반환
    return getDurationByType(selectedType);
  }
  return recipe.defaultDuration + getTypeAdjustment(selectedType);
};

// 타입별 조정값을 포함한 표시용 기간 정보
export const getTypeDisplayDuration = (type: ProjectType): string => {
  const adjustment = getTypeAdjustment(type);
  if (adjustment > 0) {
    return `+${adjustment}일`;
  } else if (adjustment < 0) {
    return `${adjustment}일`;
  }
  return '기본';
};

// 타입별 설명
export const getTypeDescription = (type: ProjectType): string => {
  const descriptions: Record<ProjectType, string> = {
    damgeumSoju25: '부드럽고 마시기 편한 25도 담금소주',
    damgeumSoju30: '진한 맛과 향이 특징인 30도 담금소주',
    vodka: '깔끔하고 순수한 맛의 보드카',
  };
  return descriptions[type];
};
