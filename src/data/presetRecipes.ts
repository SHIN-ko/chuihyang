import { PresetRecipe } from '@/src/types';

export const PRESET_RECIPES: PresetRecipe[] = [
  {
    id: 'yareyare',
    name: '야레야레',
    type: 'whiskey',
    description: '부드럽고 깔끔한 맛의 전통 위스키',
    defaultDuration: 60, // 60일
    ingredients: [
      '보리 500g',
      '맥아 200g', 
      '효모 10g',
      '정제수 2L'
    ],
    instructions: '보리를 발효시킨 후 오크통에서 숙성'
  },
  {
    id: 'blabla',
    name: '블라블라',
    type: 'gin',
    description: '상큼한 허브향이 특징인 프리미엄 진',
    defaultDuration: 30, // 30일
    ingredients: [
      '주니퍼 베리 50g',
      '코리앤더 씨 30g',
      '레몬껍질 20g',
      '보드카 베이스 1L'
    ],
    instructions: '허브류를 침출시켜 향을 우려낸 후 숙성'
  },
  {
    id: 'oz',
    name: '오즈',
    type: 'rum',
    description: '달콤하고 진한 풍미의 다크 럼',
    defaultDuration: 90, // 90일
    ingredients: [
      '사탕수수 즙 1L',
      '블랙 당밀 200ml',
      '럼 효모 5g',
      '오크칩 100g'
    ],
    instructions: '사탕수수를 발효시켜 오크칩과 함께 장기 숙성'
  },
  {
    id: 'pachinko',
    name: '파친코',
    type: 'fruit_wine',
    description: '청사과의 산뜻함이 살아있는 과실주',
    defaultDuration: 45, // 45일
    ingredients: [
      '청사과 2kg',
      '설탕 400g',
      '와인 효모 5g',
      '구연산 3g'
    ],
    instructions: '사과를 으깨어 발효시킨 후 여과하여 숙성'
  },
  {
    id: 'gyeaeba',
    name: '계애바',
    type: 'vodka',
    description: '깔끔하고 순수한 맛의 프리미엄 보드카',
    defaultDuration: 21, // 21일
    ingredients: [
      '감자 1kg',
      '보드카 효모 8g',
      '정제수 1.5L',
      '활성탄 50g'
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
