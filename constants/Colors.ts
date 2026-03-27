import designTokens from '../docs/DESIGN_TOKENS.json';

export type ThemeMode = 'light' | 'dark'; // 하위 호환 — 추후 제거 예정

export interface ColorPalette {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    surface: string;
    elevated: string;
    glass: string;     // 하위 호환 (= surface)
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
    glass: string;     // 하위 호환 (= secondary)
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

const COLORS: ColorPalette = {
  background: {
    primary: designTokens.colors.background.primary,
    secondary: designTokens.colors.background.secondary,
    tertiary: designTokens.colors.background.tertiary,
    surface: designTokens.colors.background.surface,
    elevated: designTokens.colors.background.elevated,
    glass: designTokens.colors.background.surface,      // 하위 호환
    overlay: designTokens.colors.background.overlay,
  },
  text: {
    primary: designTokens.colors.text.primary,
    secondary: designTokens.colors.text.secondary,
    tertiary: designTokens.colors.text.tertiary,
    muted: designTokens.colors.text.muted,
    disabled: designTokens.colors.text.disabled,
  },
  border: {
    primary: designTokens.colors.border.primary,
    secondary: designTokens.colors.border.secondary,
    accent: designTokens.colors.border.accent,
    glass: designTokens.colors.border.secondary,         // 하위 호환
  },
  gradient: {
    primary: '',
    glass: '',
    shimmer: '',
  },
};

const SHADOW_SOFT = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
};

const SHADOW_MEDIUM = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 16,
  elevation: 4,
};

const SHADOW_NONE = {
  shadowColor: 'transparent',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
};

const SHADOWS: ShadowPalette = {
  neumorphism: {
    inset: SHADOW_NONE,
    outset: SHADOW_SOFT,
    pressed: SHADOW_NONE,
  },
  glass: {
    light: SHADOW_SOFT,
    medium: SHADOW_MEDIUM,
    heavy: SHADOW_MEDIUM,
  },
  ambient: {
    xs: SHADOW_SOFT,
    sm: SHADOW_SOFT,
    md: SHADOW_SOFT,
    lg: SHADOW_MEDIUM,
    xl: SHADOW_MEDIUM,
  },
};

export interface BrandColorPalette {
  accent: typeof designTokens.colors.accent;
  semantic: typeof designTokens.colors.semantic;
  background: ColorPalette['background'];
  text: ColorPalette['text'];
  border: ColorPalette['border'];
}

export const BRAND_COLORS = {
  accent: designTokens.colors.accent,
  semantic: designTokens.colors.semantic,
  background: COLORS.background,
  text: COLORS.text,
  border: COLORS.border,
} as BrandColorPalette;

export const ANIMATIONS = {
  duration: designTokens.animation.duration,
  scale: {
    hover: 1.02,
    active: 0.97,
    enter: 0.95,
  },
};

export const getThemeColors = (_theme?: ThemeMode | string): ColorPalette => COLORS;
export const getThemeShadows = (_theme?: ThemeMode | string): ShadowPalette => SHADOWS;

export const createThemedStyles = <T>(
  styleCreator: (colors: ColorPalette, shadows: ShadowPalette) => T,
  _theme?: ThemeMode | string,
): T => {
  return styleCreator(COLORS, SHADOWS);
};

export default {
  light: {
    text: COLORS.text.primary,
    background: COLORS.background.primary,
    tint: BRAND_COLORS.accent.primary,
    tabIconDefault: COLORS.text.muted,
    tabIconSelected: BRAND_COLORS.accent.primary,
  },
  dark: {
    text: COLORS.text.primary,
    background: COLORS.background.primary,
    tint: BRAND_COLORS.accent.primary,
    tabIconDefault: COLORS.text.muted,
    tabIconSelected: BRAND_COLORS.accent.primary,
  },
};

export { SHADOWS };
