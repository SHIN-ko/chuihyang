import {
  generateRecipe,
  adjustRecipe,
  getFruitsForMood,
  getHerbsForFruit,
} from '@/src/utils/recipeGuide';
import { GuideAnswers } from '@/src/types';

const baseAnswers: GuideAnswers = {
  mood: 'quiet_night',
  people: 'alone',
  fruit: 'maesil',
  herbs: ['rosemary'],
  baseType: 'damgeumSoju30',
  sweetness: 'normal',
  drinkTiming: 'two_three_months',
  applyTasteProfile: false,
};

describe('getFruitsForMood', () => {
  it('returns fruits matching the mood', () => {
    const result = getFruitsForMood('quiet_night', 6);
    const ids = result.map((f) => f.id);
    expect(ids).toContain('blueberry');
    expect(ids).toContain('greengrape');
  });

  it('limits the number of results', () => {
    const result = getFruitsForMood('quiet_night', 3);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('fills with other fruits when preferred list is short', () => {
    const result = getFruitsForMood('winter_warm', 8);
    expect(result.length).toBeGreaterThanOrEqual(6);
  });
});

describe('getHerbsForFruit', () => {
  it('returns pairing herbs in priority order for maesil', () => {
    const result = getHerbsForFruit('maesil', 3);
    const ids = result.map((h) => h.id);
    expect(ids[0]).toBe('rosemary');
    expect(ids[1]).toBe('cinnamon');
    expect(ids[2]).toBe('ginger');
  });

  it('limits the number of results', () => {
    const result = getHerbsForFruit('maesil', 2);
    expect(result.length).toBe(2);
  });
});

describe('generateRecipe', () => {
  it('generates base recipe with default quantities', () => {
    const result = generateRecipe(baseAnswers);
    expect(result.baseAmountMl).toBe(500);
    expect(result.fruitAmountG).toBe(160);
    expect(result.sugarG).toBe(25);
    expect(result.herbs).toHaveLength(1);
    expect(result.herbs[0].id).toBe('rosemary');
    expect(result.herbs[0].amountG).toBe(3);
  });

  it('adjusts sugar for light sweetness', () => {
    const result = generateRecipe({ ...baseAnswers, sweetness: 'light' });
    expect(result.sugarG).toBe(15);
  });

  it('adjusts sugar for strong sweetness', () => {
    const result = generateRecipe({ ...baseAnswers, sweetness: 'strong' });
    expect(result.sugarG).toBe(40);
  });

  it('sets duration based on base type', () => {
    const result = generateRecipe({ ...baseAnswers, baseType: 'damgeumSoju25' });
    expect(result.durationDays).toBe(30);
  });

  it('reduces duration for within_month timing', () => {
    const result = generateRecipe({
      ...baseAnswers,
      baseType: 'damgeumSoju30',
      drinkTiming: 'within_month',
    });
    expect(result.durationDays).toBe(30);
  });

  it('extends duration for after_season timing', () => {
    const result = generateRecipe({
      ...baseAnswers,
      baseType: 'damgeumSoju30',
      drinkTiming: 'after_season',
    });
    expect(result.durationDays).toBe(60);
  });

  it('applies taste profile boost for aroma lover', () => {
    const result = generateRecipe({
      ...baseAnswers,
      applyTasteProfile: true,
      tasteTypeTitle: '여운을 음미하는 감성가',
    });
    expect(result.herbs[0].amountG).toBe(5);
  });

  it('applies taste profile boost for flavor seeker', () => {
    const result = generateRecipe({
      ...baseAnswers,
      applyTasteProfile: true,
      tasteTypeTitle: '풍미를 추구하는 미식가',
    });
    expect(result.fruitAmountG).toBe(180);
  });

  it('generates a recipe name', () => {
    const result = generateRecipe(baseAnswers);
    expect(result.name).toContain('매실');
    expect(result.name).toContain('로즈마리');
  });

  it('sets brand color from fruit', () => {
    const result = generateRecipe(baseAnswers);
    expect(result.brandColor).toBe('#7BA428');
  });

  it('preserves mood tag', () => {
    const result = generateRecipe(baseAnswers);
    expect(result.moodTag).toBe('quiet_night');
  });
});

describe('adjustRecipe', () => {
  it('adjusts sugar amount with sweetness slider', () => {
    const base = generateRecipe(baseAnswers);
    const light = adjustRecipe(base, { sweetness: 'light', aroma: 'normal', strength: 'normal' });
    expect(light.sugarG).toBe(15);

    const strong = adjustRecipe(base, { sweetness: 'strong', aroma: 'normal', strength: 'normal' });
    expect(strong.sugarG).toBe(40);
  });

  it('adjusts herb amount with aroma slider', () => {
    const base = generateRecipe(baseAnswers);
    const subtle = adjustRecipe(base, { sweetness: 'normal', aroma: 'subtle', strength: 'normal' });
    expect(subtle.herbs[0].amountG).toBe(2);

    const intense = adjustRecipe(base, { sweetness: 'normal', aroma: 'intense', strength: 'normal' });
    expect(intense.herbs[0].amountG).toBe(10);
  });

  it('adjusts base type and duration with strength slider', () => {
    const base = generateRecipe(baseAnswers);
    const soft = adjustRecipe(base, { sweetness: 'normal', aroma: 'normal', strength: 'soft' });
    expect(soft.baseType).toBe('damgeumSoju25');
    expect(soft.durationDays).toBe(30);

    const strong = adjustRecipe(base, { sweetness: 'normal', aroma: 'normal', strength: 'strong' });
    expect(strong.baseType).toBe('vodka');
    expect(strong.durationDays).toBe(60);
  });
});
