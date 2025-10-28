import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/src/components/common/GlassCard';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

export interface LegalDocumentEntry {
  label?: string;
  value: string;
}

export interface LegalDocumentSection {
  title: string;
  description?: string;
  entries?: LegalDocumentEntry[];
  bulletItems?: string[];
}

interface LegalDocumentScreenProps {
  title: string;
  intro?: string;
  sections: LegalDocumentSection[];
}

const LegalDocumentScreen: React.FC<LegalDocumentScreenProps> = ({ title, intro, sections }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { colors, brandColors } = useThemeValues();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const styles = useThemedStyles(() => ({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    gradient: {
      position: 'absolute' as const,
      inset: 0,
      opacity: theme === 'dark' ? 0.55 : 0.4,
      backgroundColor: colors.background.secondary,
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 6,
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: colors.background.glass,
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center' as const,
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.text.primary,
    },
    headerSpacer: {
      width: 44,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      paddingTop: 12,
      gap: 16,
    },
    introCard: {
      padding: 18,
      gap: 12,
    },
    introText: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.text.secondary,
    },
    sectionCard: {
      padding: 18,
      gap: 12,
    },
    sectionHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 12,
    },
    sectionIndex: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: `${brandColors.primary.default}14`,
    },
    sectionIndexText: {
      fontSize: 14,
      fontWeight: '700' as const,
      color: brandColors.primary.default,
    },
    sectionTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '700' as const,
      color: colors.text.primary,
    },
    sectionDescription: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 22,
    },
    entryRow: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      gap: 8,
    },
    entryLabel: {
      minWidth: 64,
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.text.secondary,
    },
    entryValue: {
      flex: 1,
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 22,
    },
    bulletRow: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      gap: 10,
    },
    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 8,
      backgroundColor: brandColors.primary.default,
    },
    bulletText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 22,
      color: colors.text.primary,
    },
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View style={styles.gradient} />
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="뒤로가기"
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{title}</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {intro ? (
            <GlassCard intensity="light" style={styles.introCard}>
              <Text style={styles.introText}>{intro}</Text>
            </GlassCard>
          ) : null}

          {sections.map((section, index) => (
            <GlassCard key={section.title} intensity="medium" style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIndex}>
                  <Text style={styles.sectionIndexText}>{index + 1}</Text>
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>

              {section.description ? (
                <Text style={styles.sectionDescription}>{section.description}</Text>
              ) : null}

              {section.entries?.map((entry) => (
                <View key={`${section.title}-${entry.label ?? entry.value}`} style={styles.entryRow}>
                  {entry.label ? (
                    <Text style={styles.entryLabel}>{entry.label}</Text>
                  ) : null}
                  <Text style={styles.entryValue}>{entry.value}</Text>
                </View>
              ))}

              {section.bulletItems?.map((item, bulletIndex) => (
                <View key={`${section.title}-bullet-${bulletIndex}`} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </GlassCard>
          ))}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default LegalDocumentScreen;
