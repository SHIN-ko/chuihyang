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
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { colors, brandColors } = useThemeValues();
  
  const styles = useThemedStyles(({ colors, shadows, brandColors }) => StyleSheet.create({
    base: {
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    sm: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      minHeight: 40,
    },
    md: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      minHeight: 48,
    },
    lg: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      minHeight: 56,
    },
    primary: {
      backgroundColor: brandColors.accent.primary,
      borderColor: colors.border.accent,
      ...shadows.glass.medium,
    },
    secondary: {
      backgroundColor: colors.background.glass,
      borderColor: colors.border.glass,
      ...shadows.glass.light,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: brandColors.accent.primary,
      borderWidth: 1.5,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    disabled: {
      opacity: 0.6,
      backgroundColor: colors.background.surface,
      borderColor: colors.border.secondary,
    },
    fullWidth: {
      width: '100%',
    },
    loader: {
      marginRight: 8,
    },
    textBase: {
      fontWeight: '500',
      fontFamily: 'System',
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
      fontWeight: '600',
    },
    textSecondary: {
      color: colors.text.secondary,
      fontWeight: '600',
    },
    textOutline: {
      color: brandColors.accent.primary,
      fontWeight: '600',
    },
    textGhost: {
      color: brandColors.accent.primary,
      fontWeight: '600',
    },
  }));
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
  
  const getButtonStyle = () => {
    let sizeStyle = styles.md;
    if (size === 'sm') sizeStyle = styles.sm;
    else if (size === 'lg') sizeStyle = styles.lg;
    
    let variantStyle = styles.primary;
    if (variant === 'secondary') variantStyle = styles.secondary;
    else if (variant === 'outline') variantStyle = styles.outline;
    else if (variant === 'ghost') variantStyle = styles.ghost;
    
    return [
      styles.base,
      sizeStyle,
      variantStyle,
      (disabled || loading) && styles.disabled,
      fullWidth && styles.fullWidth,
    ].filter(Boolean);
  };
  
  const getTextStyle = () => {
    let sizeTextStyle = styles.textMd;
    if (size === 'sm') sizeTextStyle = styles.textSm;
    else if (size === 'lg') sizeTextStyle = styles.textLg;
    
    let variantTextStyle = styles.textPrimary;
    if (variant === 'secondary') variantTextStyle = styles.textSecondary;
    else if (variant === 'outline') variantTextStyle = styles.textOutline;
    else if (variant === 'ghost') variantTextStyle = styles.textGhost;
    
    return [
      styles.textBase,
      sizeTextStyle,
      variantTextStyle,
    ];
  };
  
  const getLoaderColor = () => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return colors.text.secondary;
      case 'outline':
      case 'ghost':
        return brandColors.accent.primary;
      default:
        return '#FFFFFF';
    }
  };
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={getButtonStyle()}
        activeOpacity={0.8}
      >
        {loading && (
          <ActivityIndicator 
            size="small" 
            color={getLoaderColor()} 
            style={styles.loader}
          />
        )}
        <Text style={getTextStyle()}>
          {children}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export { Button };
export default Button;
