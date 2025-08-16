import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';

export default function CalendarScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          캘린더
        </Text>
        <Text style={styles.subtitle}>
          프로젝트 일정을 확인할 수 있습니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111811',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    color: 'white',
    textAlign: 'center',
    opacity: 0.7,
  },
});
