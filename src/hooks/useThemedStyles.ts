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
  const { theme, isLoading } = useTheme();
  
  const themedStyles = useMemo(() => {
    // 로딩 중이거나 테마가 없을 때 기본 라이트 테마 사용
    const safeTheme = isLoading ? 'light' : theme;
    const colors = getThemeColors(safeTheme);
    const shadows = getThemeShadows(safeTheme);
    
    return styleCreator({
      colors,
      shadows,
      brandColors: BRAND_COLORS,
      animations: ANIMATIONS,
    });
  }, [theme, isLoading, styleCreator]);
  
  return themedStyles;
};

// 테마별 색상과 그림자만 필요한 경우의 간소화된 Hook
export const useThemeValues = () => {
  const { theme, isLoading } = useTheme();
  
  const values = useMemo(() => {
    // 로딩 중이거나 테마가 없을 때 기본 라이트 테마 사용
    const safeTheme = isLoading ? 'light' : theme;
    
    return {
      colors: getThemeColors(safeTheme),
      shadows: getThemeShadows(safeTheme),
      brandColors: BRAND_COLORS,
      animations: ANIMATIONS,
      theme: safeTheme,
      isLoading,
    };
  }, [theme, isLoading]);
  
  return values;
};
