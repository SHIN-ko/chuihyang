import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import Button from './Button';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';

const { width } = Dimensions.get('window');

interface DatePickerProps {
  value: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
  minimumDate?: string;
  maximumDate?: string;
  disabled?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onDateChange,
  placeholder = '날짜 선택',
  minimumDate,
  maximumDate,
  disabled = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value);
  const { colors, brandColors } = useThemeValues();

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const handleDateSelect = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handleConfirm = () => {
    onDateChange(selectedDate);
    setShowModal(false);
  };

  const handleCancel = () => {
    setSelectedDate(value);
    setShowModal(false);
  };

  const getMarkedDates = () => {
    if (!selectedDate) return {};
    
    return {
      [selectedDate]: {
        selected: true,
        selectedColor: brandColors.accent.primary,
        selectedTextColor: '#FFFFFF',
      },
    };
  };

  const styles = useThemedStyles(({ colors, shadows, brandColors }) => StyleSheet.create({
    pickerButton: {
      backgroundColor: colors.background.glass,
      paddingHorizontal: 20,
      paddingVertical: 18,
      borderRadius: 12,
      fontSize: 16,
      minHeight: 56,
      borderWidth: 1,
      borderColor: colors.border.glass,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...shadows.glass.light,
    },
    pickerButtonDisabled: {
      opacity: 0.5,
    },
    pickerText: {
      color: colors.text.primary,
      fontSize: 16,
      flex: 1,
    },
    placeholderText: {
      color: colors.text.muted,
      fontSize: 16,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      width: width - 40,
      maxWidth: 400,
      borderRadius: 20,
      overflow: 'hidden',
    },
    modalHeader: {
      padding: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.secondary,
    },
    modalTitle: {
      color: colors.text.primary,
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 0.2,
    },
    calendarContainer: {
      padding: 20,
      paddingTop: 16,
    },
    calendar: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    modalFooter: {
      flexDirection: 'row',
      padding: 20,
      paddingTop: 16,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      color: colors.text.secondary,
      fontSize: 16,
      fontWeight: '600',
    },
    confirmButton: {
      flex: 1,
    },
  }));

  const calendarTheme = {
    backgroundColor: colors.background.primary,
    calendarBackground: colors.background.elevated,
    textSectionTitleColor: colors.text.secondary,
    selectedDayBackgroundColor: brandColors.accent.primary,
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: brandColors.accent.primary,
    dayTextColor: colors.text.primary,
    textDisabledColor: colors.text.muted,
    arrowColor: brandColors.accent.primary,
    monthTextColor: colors.text.primary,
    indicatorColor: brandColors.accent.primary,
    textDayFontWeight: '500' as const,
    textMonthFontWeight: '700' as const,
    textDayHeaderFontWeight: '600' as const,
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.pickerButton, disabled && styles.pickerButtonDisabled]}
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
      >
        <Text style={value ? styles.pickerText : styles.placeholderText}>
          {value ? formatDisplayDate(value) : placeholder}
        </Text>
        <Ionicons 
          name="calendar-outline" 
          size={20} 
          color={colors.text.secondary} 
        />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent} intensity="medium">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>날짜 선택</Text>
            </View>
            
            <View style={styles.calendarContainer}>
              <Calendar
                style={styles.calendar}
                current={selectedDate || new Date().toISOString().split('T')[0]}
                onDayPress={handleDateSelect}
                markedDates={getMarkedDates()}
                minDate={minimumDate}
                maxDate={maximumDate}
                theme={calendarTheme}
                enableSwipeMonths={true}
                firstDay={1} // Monday as first day
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              
              <View style={styles.confirmButton}>
                <Button onPress={handleConfirm} disabled={!selectedDate}>
                  확인
                </Button>
              </View>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </>
  );
};

export default DatePicker;
