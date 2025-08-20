import designTokens from '../docs/DESIGN_TOKENS.json';
import { ThemeMode } from '../src/contexts/ThemeContext';

// 타입 정의
export interface ColorPalette {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    surface: string;
    elevated: string;
    glass: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
    disabled: string;
  };
  border: {
    primary: string;
    secondary: string;
    accent: string;
    glass: string;
  };
  gradient: {
    primary: string;
    glass: string;
    shimmer: string;
  };
}

export interface ShadowPalette {
  neumorphism: {
    inset: object;
    outset: object;
    pressed: object;
  };
  glass: {
    light: object;
    medium: object;
    heavy: object;
  };
  ambient: {
    xs: object;
    sm: object;
    md: object;
    lg: object;
    xl: object;
  };
}

// 테마별 색상 팔레트
const THEME_COLORS: Record<ThemeMode, ColorPalette> = {
  dark: designTokens.colors.dark as ColorPalette,
  light: designTokens.colors.light as ColorPalette,
};

// 테마별 그림자 팔레트
const THEME_SHADOWS: Record<ThemeMode, ShadowPalette> = {
  dark: {
    neumorphism: {
      inset: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: -2,
      },
      outset: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
      },
      pressed: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: -3,
      },
    },
    glass: {
      light: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 32,
        elevation: 8,
      },
      heavy: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.3,
        shadowRadius: 64,
        elevation: 16,
      },
    },
    ambient: {
      xs: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 1,
      },
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
      },
      xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.08,
        shadowRadius: 32,
        elevation: 16,
      },
    },
  },
  light: {
    neumorphism: {
      inset: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: -1,
      },
      outset: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
      pressed: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: -1,
      },
    },
    glass: {
      light: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 16,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 32,
        elevation: 4,
      },
      heavy: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.08,
        shadowRadius: 64,
        elevation: 8,
      },
    },
    ambient: {
      xs: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
      },
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
      },
      xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.12,
        shadowRadius: 32,
        elevation: 16,
      },
    },
  },
};

// 공통 브랜드 색상 (테마 독립적)
export const BRAND_COLORS: any = {
  accent: designTokens.colors.accent,
  semantic: designTokens.colors.semantic,
};

// 애니메이션 설정
export const ANIMATIONS = {
  duration: designTokens.animation.duration,
  scale: {
    hover: 1.02,
    active: 0.98,
    enter: 0.95,
  },
};

// 테마별 색상과 그림자를 가져오는 함수
export const getThemeColors = (theme: ThemeMode): ColorPalette => THEME_COLORS[theme];
export const getThemeShadows = (theme: ThemeMode): ShadowPalette => THEME_SHADOWS[theme];

// Hook으로 사용할 수 있는 유틸리티 함수들
export const createThemedStyles = <T>(
  styleCreator: (colors: ColorPalette, shadows: ShadowPalette) => T,
  theme: ThemeMode
): T => {
  const colors = getThemeColors(theme);
  const shadows = getThemeShadows(theme);
  return styleCreator(colors, shadows);
};

// 레거시 지원을 위한 기본 export (다크모드 기본)
export default {
  light: {
    text: THEME_COLORS.light.text.primary,
    background: THEME_COLORS.light.background.primary,
    tint: BRAND_COLORS.accent.primary,
    tabIconDefault: THEME_COLORS.light.text.muted,
    tabIconSelected: BRAND_COLORS.accent.primary,
  },
  dark: {
    text: THEME_COLORS.dark.text.primary,
    background: THEME_COLORS.dark.background.primary,
    tint: BRAND_COLORS.accent.primary,
    tabIconDefault: THEME_COLORS.dark.text.muted,
    tabIconSelected: BRAND_COLORS.accent.primary,
  },
};

// 레거시 호환성을 위한 BRAND_COLORS 확장 (다크모드 기본)
export const SHADOWS = THEME_SHADOWS.dark;
BRAND_COLORS.background = THEME_COLORS.dark.background;
BRAND_COLORS.text = THEME_COLORS.dark.text;
BRAND_COLORS.border = THEME_COLORS.dark.border;