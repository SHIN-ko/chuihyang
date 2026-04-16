import type { ProjectType } from './index';

export type MoodId =
  | 'quiet_night'
  | 'lively_friends'
  | 'romantic'
  | 'family'
  | 'picnic'
  | 'winter_warm';

export type PeopleCount = 'alone' | 'two' | 'small_group' | 'big_group';

export type SweetnessLevel = 'light' | 'normal' | 'strong';

export type DrinkTiming = 'within_month' | 'two_three_months' | 'after_season';

export type FruitId =
  | 'maesil'
  | 'bokbunja'
  | 'blueberry'
  | 'grapefruit'
  | 'lemon'
  | 'yuja'
  | 'moga'
  | 'apple'
  | 'greengrape'
  | 'raspberry'
  | 'fig'
  | 'halabong'
  | 'omija';

export type HerbId =
  | 'rosemary'
  | 'lavender'
  | 'mint'
  | 'basil'
  | 'thyme'
  | 'cinnamon'
  | 'clove'
  | 'ginger'
  | 'cardamom'
  | 'chrysanthemum';

export interface GuideAnswers {
  mood: MoodId;
  people: PeopleCount;
  fruit: FruitId;
  herbs: HerbId[];
  baseType: ProjectType;
  sweetness: SweetnessLevel;
  drinkTiming: DrinkTiming;
  applyTasteProfile: boolean;
  tasteTypeTitle?: string;
}

export interface GuideResultHerb {
  id: HerbId;
  amountG: number;
}

export interface GuideResult {
  name: string;
  tagline: string;
  baseType: ProjectType;
  baseAmountMl: number;
  fruitId: FruitId;
  fruitAmountG: number;
  herbs: GuideResultHerb[];
  sugarG: number;
  durationDays: number;
  colorDescription: string;
  brandColor: string;
  moodTag: MoodId;
}

export interface CustomRecipe {
  id: string;
  userId: string;
  name: string;
  baseType: ProjectType;
  baseAmountMl: number;
  fruitId: FruitId;
  fruitAmountG: number;
  herbs: GuideResultHerb[];
  sugarG: number;
  durationDays: number;
  brandColor: string;
  moodTag: MoodId | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeAdjustments {
  sweetness: 'light' | 'normal' | 'strong';
  aroma: 'subtle' | 'normal' | 'intense';
  strength: 'soft' | 'normal' | 'strong';
}
