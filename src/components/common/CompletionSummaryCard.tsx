import React, { useRef, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Project } from '@/src/types';
import { formatDate } from '@/src/utils/date';
import { getRecipeById } from '@/src/data/presetRecipes';
import { useThemeValues } from '@/src/hooks/useThemedStyles';
import { differenceInDays, parseISO } from 'date-fns';

interface CompletionSummaryCardProps {
  project: Project;
}

const CompletionSummaryCard: React.FC<CompletionSummaryCardProps> = ({ project }) => {
  const cardRef = useRef<View>(null);
  const { colors, brandColors } = useThemeValues();
  const isCustomRecipe = project.recipeId === 'custom';
  const recipe = !isCustomRecipe && project.recipeId ? getRecipeById(project.recipeId) : null;
  const brandColor = isCustomRecipe
    ? project.customBrandColor || brandColors.accent.primary
    : recipe?.brandColor || brandColors.accent.primary;

  const startDate = parseISO(project.startDate);
  const endDate = project.actualEndDate
    ? parseISO(project.actualEndDate)
    : parseISO(project.expectedEndDate);
  const totalDays = Math.max(1, differenceInDays(endDate, startDate));
  const logCount = project.progressLogs?.length || 0;
  const representativeImage =
    project.images?.[0] || project.progressLogs?.find((l) => l.images?.length > 0)?.images[0];

  const handleShare = async () => {
    try {
      if (!cardRef.current) return;
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('알림', '이 기기에서는 공유 기능을 사용할 수 없습니다.');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `${project.name} 숙성 완료!`,
      });
    } catch (error) {
      Alert.alert('오류', '공유에 실패했습니다.');
    }
  };

  const styles = StyleSheet.create({
    wrapper: {
      marginBottom: 16,
    },
    card: {
      backgroundColor: colors.background.elevated,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: `${brandColor}30`,
    },
    cardHeader: {
      backgroundColor: brandColor,
      paddingVertical: 16,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    headerIcon: {
      marginBottom: 4,
    },
    headerTitle: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    headerSubtitle: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 13,
      fontWeight: '500',
      marginTop: 2,
    },
    cardBody: {
      padding: 20,
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    summaryImage: {
      width: 120,
      height: 120,
      borderRadius: 16,
    },
    placeholderImage: {
      width: 120,
      height: 120,
      borderRadius: 16,
      backgroundColor: colors.background.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 16,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 22,
      fontWeight: '700',
      color: brandColor,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.text.secondary,
      marginTop: 2,
    },
    divider: {
      width: 1,
      backgroundColor: colors.border.secondary,
      marginVertical: 4,
    },
    dateRange: {
      textAlign: 'center',
      color: colors.text.tertiary,
      fontSize: 13,
      fontWeight: '400',
    },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: brandColor,
      paddingVertical: 14,
      borderRadius: 14,
      marginTop: 16,
      gap: 8,
    },
    shareButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.wrapper}>
      <View ref={cardRef} collapsable={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trophy" size={28} color="#FFFFFF" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>{project.name}</Text>
            {recipe && <Text style={styles.headerSubtitle}>{recipe.name}</Text>}
          </View>

          <View style={styles.cardBody}>
            {representativeImage && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: representativeImage }}
                  style={styles.summaryImage}
                  resizeMode="cover"
                />
              </View>
            )}
            {!representativeImage && (
              <View style={styles.imageContainer}>
                <View style={styles.placeholderImage}>
                  <Ionicons name="flask" size={40} color={colors.text.muted} />
                </View>
              </View>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalDays}</Text>
                <Text style={styles.statLabel}>숙성일</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{logCount}</Text>
                <Text style={styles.statLabel}>기록 횟수</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{project.ingredients?.length || 0}</Text>
                <Text style={styles.statLabel}>재료 수</Text>
              </View>
            </View>

            <Text style={styles.dateRange}>
              {formatDate(project.startDate, 'yyyy.MM.dd')} →{' '}
              {formatDate(project.actualEndDate || project.expectedEndDate, 'yyyy.MM.dd')}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
        <Ionicons name="share-outline" size={20} color="#FFFFFF" />
        <Text style={styles.shareButtonText}>공유하기</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CompletionSummaryCard;
