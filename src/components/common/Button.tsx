import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';

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
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyle()}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? '#22c55e' : '#ffffff'} 
          style={styles.loader}
        />
      )}
      <Text style={getTextStyle()}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
  },
  primary: {
    backgroundColor: '#22c55e',
  },
  secondary: {
    backgroundColor: '#4b5563',
  },
  outline: {
    borderWidth: 2,
    borderColor: '#22c55e',
    backgroundColor: 'transparent',
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
  },
  textSm: {
    fontSize: 14,
  },
  textMd: {
    fontSize: 16,
  },
  textLg: {
    fontSize: 18,
  },
  textPrimary: {
    color: 'white',
  },
  textSecondary: {
    color: 'white',
  },
  textOutline: {
    color: '#22c55e',
  },
  textGhost: {
    color: 'white',
  },
});

export default Button;
