import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface TimePickerProps {
  value: string; // "HH:mm" 형식
  onTimeChange: (time: string) => void;
  title?: string;
  disabled?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onTimeChange,
  title = "시간 선택",
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(() => {
    const [hours, minutes] = value.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  });

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? '오후' : '오전';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        const hours = selectedDate.getHours().toString().padStart(2, '0');
        const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
        onTimeChange(`${hours}:${minutes}`);
      }
    }
  };

  const handleConfirm = () => {
    const hours = tempDate.getHours().toString().padStart(2, '0');
    const minutes = tempDate.getMinutes().toString().padStart(2, '0');
    onTimeChange(`${hours}:${minutes}`);
    setShowPicker(false);
  };

  const handleCancel = () => {
    // 원래 값으로 복원
    const [hours, minutes] = value.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    setTempDate(date);
    setShowPicker(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.timeButton, disabled && styles.disabledButton]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
      >
        <View style={styles.timeInfo}>
          <Text style={[styles.timeLabel, disabled && styles.disabledText]}>
            {title}
          </Text>
          <Text style={[styles.timeValue, disabled && styles.disabledText]}>
            {formatTime(value)}
          </Text>
        </View>
        <Ionicons 
          name="time-outline" 
          size={20} 
          color={disabled ? "#666" : "#9db89d"} 
        />
      </TouchableOpacity>

      {showPicker && (
        <>
          {Platform.OS === 'ios' ? (
            <Modal
              transparent
              animationType="slide"
              visible={showPicker}
              onRequestClose={handleCancel}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={handleCancel}>
                      <Text style={styles.cancelButton}>취소</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <TouchableOpacity onPress={handleConfirm}>
                      <Text style={styles.confirmButton}>확인</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <DateTimePicker
                    value={tempDate}
                    mode="time"
                    display="spinner"
                    onChange={handleTimeChange}
                    style={styles.picker}
                    textColor="#ffffff"
                  />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={tempDate}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c261c',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  disabledButton: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    color: '#9db89d',
    fontSize: 14,
    marginBottom: 4,
  },
  timeValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1c261c',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3c533c',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    color: '#9db89d',
    fontSize: 16,
  },
  confirmButton: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    backgroundColor: '#1c261c',
  },
});

export default TimePicker;
