import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { cn } from '@/src/utils/cn';

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
  const baseClasses = 'rounded-lg flex-row items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-600 active:bg-gray-700',
    outline: 'border-2 border-blue-600 bg-transparent active:bg-blue-50',
    ghost: 'bg-transparent active:bg-gray-100',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 min-h-[36px]',
    md: 'px-4 py-3 min-h-[44px]',
    lg: 'px-6 py-4 min-h-[52px]',
  };
  
  const textVariantClasses = {
    primary: 'text-white font-semibold',
    secondary: 'text-white font-semibold',
    outline: 'text-blue-600 font-semibold',
    ghost: 'text-gray-900 font-medium',
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  const disabledClasses = disabled || loading ? 'opacity-50' : '';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const buttonClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabledClasses,
    widthClasses,
    className
  );
  
  const textClasses = cn(
    textVariantClasses[variant],
    textSizeClasses[size]
  );
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={buttonClasses}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? '#2563eb' : '#ffffff'} 
          className="mr-2"
        />
      )}
      <Text className={textClasses}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
