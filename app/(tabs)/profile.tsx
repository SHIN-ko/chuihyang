import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '@/src/stores/authStore';
import { useRouter } from 'expo-router';
import Button from '@/src/components/common/Button';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          프로필
        </Text>
        
        {user && (
          <View style={styles.userCard}>
            <Text style={styles.userName}>
              {user.nickname}
            </Text>
            <Text style={styles.userEmail}>
              {user.email}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleLogout}
            variant="outline"
            fullWidth
          >
            로그아웃
          </Button>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  userCard: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  userEmail: {
    color: 'white',
    opacity: 0.7,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
});

