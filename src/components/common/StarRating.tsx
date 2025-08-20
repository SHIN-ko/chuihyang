import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_COLORS, ANIMATIONS } from '@/constants/Colors';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  color?: string;
  readonly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 24,
  color = BRAND_COLORS.accent.amber, // 호박색으로 변경 (담금주 테마)
  readonly = false,
}) => {
  const scaleAnims = useRef([...Array(5)].map(() => new Animated.Value(1))).current;
  
  const handleStarPress = (starIndex: number) => {
    if (!readonly && onRatingChange) {
      // 마이크로 인터랙션 애니메이션
      Animated.sequence([
        Animated.spring(scaleAnims[starIndex], {
          toValue: 1.3,
          duration: ANIMATIONS.duration.fast,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims[starIndex], {
          toValue: 1,
          duration: ANIMATIONS.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();
      
      onRatingChange(starIndex + 1);
    }
  };

  const handleStarPressIn = (starIndex: number) => {
    if (!readonly) {
      Animated.spring(scaleAnims[starIndex], {
        toValue: 1.1,
        duration: ANIMATIONS.duration.fast,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleStarPressOut = (starIndex: number) => {
    if (!readonly) {
      Animated.spring(scaleAnims[starIndex], {
        toValue: 1,
        duration: ANIMATIONS.duration.fast,
        useNativeDriver: true,
      }).start();
    }
  };

  const getStarColor = (starIndex: number) => {
    if (starIndex < rating) {
      return color;
    }
    return BRAND_COLORS.text.muted;
  };

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4].map((starIndex) => (
        <Animated.View 
          key={starIndex}
          style={{ transform: [{ scale: scaleAnims[starIndex] }] }}
        >
          <TouchableOpacity
            onPress={() => handleStarPress(starIndex)}
            onPressIn={() => handleStarPressIn(starIndex)}
            onPressOut={() => handleStarPressOut(starIndex)}
            disabled={readonly}
            style={styles.star}
            activeOpacity={0.7}
          >
            <Ionicons
              name={starIndex < rating ? 'star' : 'star-outline'}
              size={size}
              color={getStarColor(starIndex)}
              style={starIndex < rating ? styles.filledStar : styles.emptyStar}
            />
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // 별 사이 간격 증가
  },
  star: {
    padding: 2, // 터치 영역 확대
  },
  filledStar: {
    shadowColor: BRAND_COLORS.accent.amber,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStar: {
    opacity: 0.6,
  },
});

export default StarRating;
