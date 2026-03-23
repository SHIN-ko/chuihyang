import {
  PRESET_RECIPES,
  getRecipeById,
  getRecipesByType,
  getTypeAdjustment,
  getDurationByType,
  calculateFinalDuration,
  getTypeDisplayName,
  getTypeDisplayDuration,
  getTypeDescription,
  getAllProjectTypes,
} from '@/src/data/presetRecipes';

describe('PRESET_RECIPES 데이터 무결성', () => {
  it('5개의 프리셋 레시피가 존재', () => {
    expect(PRESET_RECIPES).toHaveLength(5);
  });

  it('모든 레시피에 필수 필드가 존재', () => {
    PRESET_RECIPES.forEach((recipe) => {
      expect(recipe.id).toBeTruthy();
      expect(recipe.name).toBeTruthy();
      expect(recipe.type).toBeTruthy();
      expect(recipe.description).toBeTruthy();
      expect(recipe.defaultDuration).toBeGreaterThan(0);
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.brandColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('모든 레시피 ID가 유니크', () => {
    const ids = PRESET_RECIPES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getRecipeById', () => {
  it('야레야레 레시피 조회', () => {
    const recipe = getRecipeById('yareyare');
    expect(recipe).toBeDefined();
    expect(recipe!.name).toBe('야레야레 やれやれ~');
    expect(recipe!.type).toBe('damgeumSoju30');
    expect(recipe!.defaultDuration).toBe(30);
  });

  it('블라블라 레시피 조회', () => {
    const recipe = getRecipeById('blabla');
    expect(recipe).toBeDefined();
    expect(recipe!.type).toBe('damgeumSoju25');
    expect(recipe!.defaultDuration).toBe(10);
  });

  it('존재하지 않는 ID → undefined', () => {
    expect(getRecipeById('nonexistent')).toBeUndefined();
  });
});

describe('getRecipesByType', () => {
  it('damgeumSoju25 타입 레시피 필터링', () => {
    const recipes = getRecipesByType('damgeumSoju25');
    expect(recipes.length).toBeGreaterThan(0);
    recipes.forEach((r) => expect(r.type).toBe('damgeumSoju25'));
  });

  it('vodka 타입 레시피 필터링', () => {
    const recipes = getRecipesByType('vodka');
    expect(recipes).toHaveLength(1);
    expect(recipes[0].id).toBe('gyeaeba');
  });
});

describe('getTypeAdjustment', () => {
  it('damgeumSoju25 → +7일', () => {
    expect(getTypeAdjustment('damgeumSoju25')).toBe(7);
  });

  it('damgeumSoju30 → 0일 (기본)', () => {
    expect(getTypeAdjustment('damgeumSoju30')).toBe(0);
  });

  it('vodka → -2일', () => {
    expect(getTypeAdjustment('vodka')).toBe(-2);
  });
});

describe('getDurationByType', () => {
  it('damgeumSoju25: 30 + 7 = 37일', () => {
    expect(getDurationByType('damgeumSoju25')).toBe(37);
  });

  it('damgeumSoju30: 30 + 0 = 30일', () => {
    expect(getDurationByType('damgeumSoju30')).toBe(30);
  });

  it('vodka: 30 - 2 = 28일', () => {
    expect(getDurationByType('vodka')).toBe(28);
  });
});

describe('calculateFinalDuration', () => {
  it('야레야레(30일) + damgeumSoju25(+7) = 37일', () => {
    expect(calculateFinalDuration('yareyare', 'damgeumSoju25')).toBe(37);
  });

  it('야레야레(30일) + damgeumSoju30(+0) = 30일', () => {
    expect(calculateFinalDuration('yareyare', 'damgeumSoju30')).toBe(30);
  });

  it('블라블라(10일) + vodka(-2) = 8일', () => {
    expect(calculateFinalDuration('blabla', 'vodka')).toBe(8);
  });

  it('계애바(14일) + vodka(-2) = 12일', () => {
    expect(calculateFinalDuration('gyeaeba', 'vodka')).toBe(12);
  });

  it('없는 레시피 → getDurationByType fallback', () => {
    expect(calculateFinalDuration('nonexistent', 'damgeumSoju30')).toBe(30);
  });
});

describe('getTypeDisplayName', () => {
  it('damgeumSoju25 → 담금소주 25도', () => {
    expect(getTypeDisplayName('damgeumSoju25')).toBe('담금소주 25도');
  });

  it('vodka → 보드카', () => {
    expect(getTypeDisplayName('vodka')).toBe('보드카');
  });
});

describe('getTypeDisplayDuration', () => {
  it('damgeumSoju25 → +7일', () => {
    expect(getTypeDisplayDuration('damgeumSoju25')).toBe('+7일');
  });

  it('damgeumSoju30 → 기본', () => {
    expect(getTypeDisplayDuration('damgeumSoju30')).toBe('기본');
  });

  it('vodka → -2일', () => {
    expect(getTypeDisplayDuration('vodka')).toBe('-2일');
  });
});

describe('getTypeDescription', () => {
  it('각 타입별 설명이 비어있지 않음', () => {
    const types = getAllProjectTypes();
    types.forEach((type) => {
      expect(getTypeDescription(type)).toBeTruthy();
    });
  });
});

describe('getAllProjectTypes', () => {
  it('3개의 프로젝트 타입 반환', () => {
    const types = getAllProjectTypes();
    expect(types).toHaveLength(3);
    expect(types).toContain('damgeumSoju25');
    expect(types).toContain('damgeumSoju30');
    expect(types).toContain('vodka');
  });
});
