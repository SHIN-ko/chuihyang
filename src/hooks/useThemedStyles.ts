import { useMemo } from 'react';
import {
  getThemeColors,
  getThemeShadows,
  BRAND_COLORS,
  ANIMATIONS,
  ColorPalette,
  ShadowPalette,
} from '@/constants/Colors';

export interface ThemedStyleParams {
  colors: ColorPalette;
  shadows: ShadowPalette;
  brandColors: typeof BRAND_COLORS;
  animations: typeof ANIMATIONS;
}

const STATIC_COLORS = getThemeColors();
const STATIC_SHADOWS = getThemeShadows();

export const useThemedStyles = <T>(styleCreator: (params: ThemedStyleParams) => T): T => {
  return useMemo(() => {
    return styleCreator({
      colors: STATIC_COLORS,
      shadows: STATIC_SHADOWS,
      brandColors: BRAND_COLORS,
      animations: ANIMATIONS,
    });
  }, [styleCreator]);
};

export const useThemeValues = () => {
  return {
    colors: STATIC_COLORS,
    shadows: STATIC_SHADOWS,
    brandColors: BRAND_COLORS,
    animations: ANIMATIONS,
    theme: 'light' as const,
    isLoading: false,
  };
};
