import { supabase } from '@/src/lib/supabase';
import { CustomRecipe, GuideResult, FruitId, ProjectType, GuideResultHerb } from '@/src/types';
import { Database, Json } from '@/src/lib/database.types';

type CustomRecipeRow = Database['public']['Tables']['custom_recipes']['Row'];

export class CustomRecipeService {
  static async getMyRecipes(userId: string): Promise<CustomRecipe[]> {
    try {
      const { data, error } = await supabase
        .from('custom_recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(CustomRecipeService.transformRow);
    } catch (error) {
      console.error('내 레시피 조회 오류:', error);
      throw error;
    }
  }

  static async saveRecipe(userId: string, result: GuideResult): Promise<CustomRecipe> {
    try {
      const { data, error } = await supabase
        .from('custom_recipes')
        .insert({
          user_id: userId,
          name: result.name,
          base_type: result.baseType,
          base_amount_ml: result.baseAmountMl,
          fruit_id: result.fruitId,
          fruit_amount_g: result.fruitAmountG,
          herbs: result.herbs as unknown as Json,
          sugar_g: result.sugarG,
          duration_days: result.durationDays,
          brand_color: result.brandColor,
          mood_tag: result.moodTag,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('레시피 저장 실패');

      return CustomRecipeService.transformRow(data);
    } catch (error) {
      console.error('레시피 저장 오류:', error);
      throw error;
    }
  }

  static async deleteRecipe(recipeId: string): Promise<void> {
    try {
      const { error } = await supabase.from('custom_recipes').delete().eq('id', recipeId);
      if (error) throw error;
    } catch (error) {
      console.error('레시피 삭제 오류:', error);
      throw error;
    }
  }

  private static transformRow(row: CustomRecipeRow): CustomRecipe {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      baseType: row.base_type as ProjectType,
      baseAmountMl: row.base_amount_ml,
      fruitId: row.fruit_id as FruitId,
      fruitAmountG: row.fruit_amount_g,
      herbs: (row.herbs as unknown as GuideResultHerb[]) || [],
      sugarG: row.sugar_g,
      durationDays: row.duration_days,
      brandColor: row.brand_color || '#D4A574',
      moodTag: (row.mood_tag as CustomRecipe['moodTag']) || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
