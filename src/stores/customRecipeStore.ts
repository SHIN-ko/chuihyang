import { create } from 'zustand';
import { CustomRecipe, GuideResult } from '@/src/types';
import { CustomRecipeService } from '@/src/services/customRecipeService';
import { useAuthStore } from './authStore';

interface CustomRecipeState {
  recipes: CustomRecipe[];
  isLoading: boolean;
  pendingRecipe: GuideResult | null;

  fetchRecipes: () => Promise<void>;
  saveRecipe: (result: GuideResult) => Promise<boolean>;
  deleteRecipe: (recipeId: string) => Promise<boolean>;
  setPendingRecipe: (result: GuideResult | null) => void;
  consumePendingRecipe: () => GuideResult | null;
}

export const useCustomRecipeStore = create<CustomRecipeState>((set, get) => ({
  recipes: [],
  isLoading: false,
  pendingRecipe: null,

  fetchRecipes: async () => {
    try {
      set({ isLoading: true });
      const authState = useAuthStore.getState();
      if (!authState.user) {
        set({ recipes: [], isLoading: false });
        return;
      }
      const recipes = await CustomRecipeService.getMyRecipes(authState.user.id);
      set({ recipes, isLoading: false });
    } catch (error) {
      console.error('내 레시피 조회 실패:', error);
      set({ recipes: [], isLoading: false });
    }
  },

  saveRecipe: async (result: GuideResult) => {
    try {
      set({ isLoading: true });
      const authState = useAuthStore.getState();
      if (!authState.user) {
        set({ isLoading: false });
        return false;
      }
      const saved = await CustomRecipeService.saveRecipe(authState.user.id, result);
      set((state) => ({
        recipes: [saved, ...state.recipes],
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('레시피 저장 실패:', error);
      set({ isLoading: false });
      return false;
    }
  },

  deleteRecipe: async (recipeId: string) => {
    try {
      set({ isLoading: true });
      await CustomRecipeService.deleteRecipe(recipeId);
      set((state) => ({
        recipes: state.recipes.filter((r) => r.id !== recipeId),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('레시피 삭제 실패:', error);
      set({ isLoading: false });
      return false;
    }
  },

  setPendingRecipe: (result) => set({ pendingRecipe: result }),

  consumePendingRecipe: () => {
    const pending = get().pendingRecipe;
    set({ pendingRecipe: null });
    return pending;
  },
}));
