import React, { useRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { BRAND_COLORS, SHADOWS, ANIMATIONS } from '@/constants/Colors';

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
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: ANIMATIONS.scale.active,
      duration: ANIMATIONS.duration.fast,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      duration: ANIMATIONS.duration.fast,
      useNativeDriver: true,
    }).start();
  };
  
  const getButtonStyle = () => {
    const baseStyle = [styles.base];
    
    // Size styles
    if (size === 'sm') baseStyle.push(styles.sm);
    else if (size === 'lg') baseStyle.push(styles.lg);
    else baseStyle.push(styles.md);
    
    // Variant styles
    if (variant === 'primary') baseStyle.push(styles.primary);
    else if (variant === 'secondary') baseStyle.push(styles.secondary);
    else if (variant === 'outline') baseStyle.push(styles.outline);
    else if (variant === 'ghost') baseStyle.push(styles.ghost);
    
    // State styles
    if (disabled || loading) baseStyle.push(styles.disabled);
    if (fullWidth) baseStyle.push(styles.fullWidth);
    
    return baseStyle;
  };
  
  const getTextStyle = () => {
    const baseStyle = [styles.textBase];
    
    // Size text styles
    if (size === 'sm') baseStyle.push(styles.textSm);
    else if (size === 'lg') baseStyle.push(styles.textLg);
    else baseStyle.push(styles.textMd);
    
    // Variant text styles
    if (variant === 'primary') baseStyle.push(styles.textPrimary);
    else if (variant === 'secondary') baseStyle.push(styles.textSecondary);
    else if (variant === 'outline') baseStyle.push(styles.textOutline);
    else if (variant === 'ghost') baseStyle.push(styles.textGhost);
    
    return baseStyle;
  };
  
  const getLoaderColor = () => {
    switch (variant) {
      case 'primary':
        return BRAND_COLORS.text.primary;
      case 'secondary':
        return BRAND_COLORS.text.secondary;
      case 'outline':
      case 'ghost':
        return BRAND_COLORS.accent.primary;
      default:
        return BRAND_COLORS.text.primary;
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

const styles = StyleSheet.create({
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
    backgroundColor: BRAND_COLORS.accent.primary,
    borderColor: BRAND_COLORS.border.accent,
    ...SHADOWS.neumorphism.outset,
  },
  secondary: {
    backgroundColor: BRAND_COLORS.background.glass,
    borderColor: BRAND_COLORS.border.glass,
    ...SHADOWS.glass.light,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: BRAND_COLORS.accent.primary,
    borderWidth: 1.5,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.6,
    backgroundColor: BRAND_COLORS.background.surface,
    borderColor: BRAND_COLORS.border.secondary,
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
    color: BRAND_COLORS.text.primary,
    fontWeight: '600',
  },
  textSecondary: {
    color: BRAND_COLORS.text.secondary,
    fontWeight: '500',
  },
  textOutline: {
    color: BRAND_COLORS.accent.primary,
    fontWeight: '500',
  },
  textGhost: {
    color: BRAND_COLORS.accent.primary,
    fontWeight: '500',
  },
});

export default Button;
