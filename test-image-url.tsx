import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

const TestImageURLScreen: React.FC = () => {
  const [testUrl, setTestUrl] = useState<string>('');
  const [showImage, setShowImage] = useState<boolean>(false);

  const handleTestUrl = () => {
    if (!testUrl.trim()) {
      Alert.alert('오류', 'URL을 입력해주세요');
      return;
    }
    console.log('테스트할 URL:', testUrl);
    setShowImage(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>이미지 URL 테스트</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Supabase Storage URL을 입력하세요"
          placeholderTextColor="#666"
          value={testUrl}
          onChangeText={setTestUrl}
          multiline
        />
        
        <TouchableOpacity style={styles.button} onPress={handleTestUrl}>
          <Text style={styles.buttonText}>이미지 테스트</Text>
        </TouchableOpacity>
        
        {showImage && testUrl && (
          <View style={styles.imageContainer}>
            <Text style={styles.imageTitle}>테스트 결과:</Text>
            <Image
              source={{ uri: testUrl }}
              style={styles.testImage}
              onError={(error) => {
                console.error('이미지 로드 실패:', error.nativeEvent.error);
                Alert.alert('실패', '이미지를 로드할 수 없습니다');
              }}
              onLoad={() => {
                console.log('이미지 로드 성공:', testUrl);
                Alert.alert('성공', '이미지가 성공적으로 로드되었습니다');
              }}
            />
          </View>
        )}
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#222',
    color: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#7C9885',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
  },
  testImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: '#333',
  },
});

export default TestImageURLScreen;
