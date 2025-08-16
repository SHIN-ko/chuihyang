import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111811" />
      
      <View style={styles.content}>
        {/* 상단 이미지 섹션 */}
        <View style={styles.imageSection}>
          <View style={[styles.imageContainer, { minHeight: height * 0.4 }]}>
            <ImageBackground
              source={{
                uri: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
              }}
              style={styles.backgroundImage}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['transparent', 'rgba(17, 24, 17, 0.8)', '#111811']}
                style={styles.gradient}
              />
            </ImageBackground>
          </View>
        </View>

        {/* 중앙 텍스트 섹션 */}
        <View style={styles.textSection}>
          <Text style={styles.title}>
            취향에 오신 것을{'\n'}환영합니다
          </Text>
          <Text style={styles.subtitle}>
            나만의 담금주 프로젝트를 체계적으로 관리하고,{'\n'}
            처음부터 완성까지 모든 과정을 기록해보세요.
          </Text>
        </View>

        {/* 하단 버튼 섹션 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            onPress={handleGetStarted}
            style={styles.button}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              시작하기
            </Text>
          </TouchableOpacity>
          
          <View style={styles.bottomSpacing} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111811',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  imageSection: {
    flex: 1,
  },
  imageContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  textSection: {
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  buttonSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default OnboardingScreen;
