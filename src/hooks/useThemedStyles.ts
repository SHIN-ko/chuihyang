import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors, getThemeShadows, BRAND_COLORS, ANIMATIONS, ColorPalette, ShadowPalette } from '@/constants/Colors';

// 테마별 색상과 그림자를 포함한 객체 타입
export interface ThemedStyleParams {
  colors: ColorPalette;
  shadows: ShadowPalette;
  brandColors: typeof BRAND_COLORS;
  animations: typeof ANIMATIONS;
}

// 테마 기반 스타일을 생성하는 Hook
export const useThemedStyles = <T>(
  styleCreator: (params: ThemedStyleParams) => T
): T => {
  const { theme } = useTheme();
  
  const themedStyles = useMemo(() => {
    const colors = getThemeColors(theme);
    const shadows = getThemeShadows(theme);
    
    return styleCreator({
      colors,
      shadows,
      brandColors: BRAND_COLORS,
      animations: ANIMATIONS,
    });
  }, [theme, styleCreator]);
  
  return themedStyles;
};

// 테마별 색상과 그림자만 필요한 경우의 간소화된 Hook
export const useThemeValues = () => {
  const { theme } = useTheme();
  
  const values = useMemo(() => ({
    colors: getThemeColors(theme),
    shadows: getThemeShadows(theme),
    brandColors: BRAND_COLORS,
    animations: ANIMATIONS,
    theme,
  }), [theme]);
  
  return values;
};
