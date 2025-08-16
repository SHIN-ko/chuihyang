import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  color = '#22c55e',
  readonly = false,
}) => {
  const handleStarPress = (starIndex: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4].map((starIndex) => (
        <TouchableOpacity
          key={starIndex}
          onPress={() => handleStarPress(starIndex)}
          disabled={readonly}
          style={styles.star}
        >
          <Ionicons
            name={starIndex < rating ? 'star' : 'star-outline'}
            size={size}
            color={starIndex < rating ? color : '#9db89d'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 4,
  },
});

export default StarRating;
