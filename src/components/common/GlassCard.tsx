import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeValues } from '@/src/hooks/useThemedStyles';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'heavy';
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  style, 
  intensity = 'medium' 
}) => {
  const { colors, shadows } = useThemeValues();
  
  const getIntensityStyle = () => {
    switch (intensity) {
      case 'light':
        return {
          backgroundColor: `${colors.background.glass}40`, // 25% opacity
          ...shadows.glass.light,
        };
      case 'heavy':
        return {
          backgroundColor: `${colors.background.glass}CC`, // 80% opacity
          ...shadows.glass.heavy,
        };
      default: // medium
        return {
          backgroundColor: colors.background.glass,
          ...shadows.glass.medium,
        };
    }
  };

  const styles = StyleSheet.create({
    container: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border.glass,
      overflow: 'hidden',
    },
  });

  return (
    <View style={[styles.container, getIntensityStyle(), style]}>
      {children}
    </View>
  );
};

export { GlassCard };
export default GlassCard;
