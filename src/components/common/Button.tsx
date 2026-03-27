import React, { useRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { colors, brandColors } = useThemeValues();

  const styles = useThemedStyles(({ colors, shadows, brandColors }) =>
    StyleSheet.create({
      base: {
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      sm: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        minHeight: 40,
      },
      md: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        minHeight: 48,
      },
      lg: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        minHeight: 52,
      },
      primary: {
        backgroundColor: brandColors.accent.primary,
        ...shadows.glass.light,
      },
      secondary: {
        backgroundColor: colors.background.surface,
        borderWidth: 1,
        borderColor: colors.border.primary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: brandColors.accent.primary,
        borderWidth: 1.5,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      disabled: {
        opacity: 0.5,
      },
      fullWidth: {
        width: '100%',
      },
      loader: {
        marginRight: 8,
      },
      textBase: {
        fontWeight: '600',
        letterSpacing: 0.2,
      },
      textSm: {
        fontSize: 13,
      },
      textMd: {
        fontSize: 15,
      },
      textLg: {
        fontSize: 17,
      },
      textPrimary: {
        color: '#FFFFFF',
      },
      textSecondary: {
        color: colors.text.primary,
      },
      textOutline: {
        color: brandColors.accent.primary,
      },
      textGhost: {
        color: brandColors.accent.primary,
      },
    }),
  );

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const sizeStyles = { sm: styles.sm, md: styles.md, lg: styles.lg };
  const variantStyles = {
    primary: styles.primary,
    secondary: styles.secondary,
    outline: styles.outline,
    ghost: styles.ghost,
  };
  const textVariantStyles = {
    primary: styles.textPrimary,
    secondary: styles.textSecondary,
    outline: styles.textOutline,
    ghost: styles.textGhost,
  };
  const textSizeStyles = { sm: styles.textSm, md: styles.textMd, lg: styles.textLg };

  const loaderColors: Record<string, string> = {
    primary: '#FFFFFF',
    secondary: colors.text.secondary,
    outline: brandColors.accent.primary,
    ghost: brandColors.accent.primary,
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.base,
          sizeStyles[size],
          variantStyles[variant],
          (disabled || loading) && styles.disabled,
          fullWidth && styles.fullWidth,
        ]}
        activeOpacity={0.8}
      >
        {loading && (
          <ActivityIndicator size="small" color={loaderColors[variant]} style={styles.loader} />
        )}
        <Text style={[styles.textBase, textSizeStyles[size], textVariantStyles[variant]]}>
          {children}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export { Button };
export default Button;
