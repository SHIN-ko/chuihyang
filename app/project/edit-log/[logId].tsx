import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProjectStore } from '@/src/stores/projectStore';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/src/components/common/Button';
import StarRating from '@/src/components/common/StarRating';
import { ProgressLog } from '@/src/types';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';

const EditProgressLogScreen: React.FC = () => {
  const router = useRouter();
  const { logId, projectId } = useLocalSearchParams<{ logId: string; projectId: string }>();
  const { projects, updateProgressLog, isLoading } = useProjectStore();
  
  // 현재 프로젝트와 로그 찾기
  const project = projects.find(p => p.id === projectId);
  const log = project?.progressLogs.find(l => l.id === logId);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    color: '',
    notes: '',
    images: [] as string[],
    ratings: {
      taste: 0,
      aroma: 0,
      appearance: 0,
      overall: 0,
    },
  });

  useEffect(() => {
    if (log) {
      setFormData({
        title: log.title,
        description: log.description || '',
        date: log.date,
        color: log.color || '',
        notes: log.notes || '',
        images: log.images || [],
        ratings: {
          taste: log.ratings?.taste || 0,
          aroma: log.ratings?.aroma || 0,
          appearance: log.ratings?.appearance || 0,
          overall: log.ratings?.overall || 0,
        },
      });
    }
  }, [log]);

  const handleClose = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!log) return;

    if (!formData.title.trim()) {
      Alert.alert('오류', '제목을 입력해주세요.');
      return;
    }

    if (!formData.date) {
      Alert.alert('오류', '날짜를 입력해주세요.');
      return;
    }

    try {
      const updates: Partial<ProgressLog> = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        date: formData.date,
        color: formData.color.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        images: formData.images,
        ratings: {
          taste: formData.ratings.taste || undefined,
          aroma: formData.ratings.aroma || undefined,
          appearance: formData.ratings.appearance || undefined,
          overall: formData.ratings.overall || undefined,
        },
      };

      const success = await updateProgressLog(log.id, updates);
      
      if (success) {
        Alert.alert('완료', '로그가 수정되었습니다!', [
          {
            text: '확인',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('오류', '로그 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그 수정 실패:', error);
      Alert.alert('오류', '로그 수정에 실패했습니다.');
    }
  };

  const handleSelectImages = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 5,
    } as any;

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets) {
        const newImages = response.assets
          .map(asset => asset.uri)
          .filter(uri => uri) as string[];
        
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages].slice(0, 5)
        }));
      }
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (!log || !project) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#111811" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>로그 수정</Text>
          <View style={styles.placeholderView} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>로그를 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111811" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>로그 수정</Text>
          <View style={styles.placeholderView} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* 제목 */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="로그 제목"
                placeholderTextColor="#9db89d"
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                maxLength={100}
              />
            </View>

            {/* 날짜 */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="날짜 (YYYY-MM-DD)"
                placeholderTextColor="#9db89d"
                value={formData.date}
                onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
            </View>

            {/* 설명 */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="상세 설명"
                placeholderTextColor="#9db89d"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            {/* 평점 섹션 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>평가</Text>
              
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>전체 평가</Text>
                <StarRating
                  rating={formData.ratings.overall}
                  onRatingChange={(rating) => 
                    setFormData(prev => ({
                      ...prev,
                      ratings: { ...prev.ratings, overall: rating }
                    }))
                  }
                  size={24}
                />
              </View>

              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>맛</Text>
                <StarRating
                  rating={formData.ratings.taste}
                  onRatingChange={(rating) => 
                    setFormData(prev => ({
                      ...prev,
                      ratings: { ...prev.ratings, taste: rating }
                    }))
                  }
                  size={24}
                />
              </View>

              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>향</Text>
                <StarRating
                  rating={formData.ratings.aroma}
                  onRatingChange={(rating) => 
                    setFormData(prev => ({
                      ...prev,
                      ratings: { ...prev.ratings, aroma: rating }
                    }))
                  }
                  size={24}
                />
              </View>

              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>외관</Text>
                <StarRating
                  rating={formData.ratings.appearance}
                  onRatingChange={(rating) => 
                    setFormData(prev => ({
                      ...prev,
                      ratings: { ...prev.ratings, appearance: rating }
                    }))
                  }
                  size={24}
                />
              </View>
            </View>

            {/* 색상 */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="색상 (예: 황금색, 호박색)"
                placeholderTextColor="#9db89d"
                value={formData.color}
                onChangeText={(text) => setFormData(prev => ({ ...prev, color: text }))}
                maxLength={50}
              />
            </View>

            {/* 추가 메모 */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="추가 메모"
                placeholderTextColor="#9db89d"
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={300}
              />
            </View>

            {/* 이미지 섹션 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>이미지</Text>
              
              <TouchableOpacity style={styles.imageUploadArea} onPress={handleSelectImages}>
                <Ionicons name="camera-outline" size={32} color="#9db89d" />
                <Text style={styles.imageUploadText}>이미지 추가</Text>
              </TouchableOpacity>

              {formData.images.length > 0 && (
                <View style={styles.imagePreviewContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {formData.images.map((imageUri, index) => (
                      <View key={index} style={styles.imagePreview}>
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        <TouchableOpacity 
                          style={styles.removeImageButton}
                          onPress={() => removeImage(index)}
                        >
                          <Ionicons name="close-circle" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* 하단 저장 버튼 */}
        <View style={styles.bottomContainer}>
          <Button
            onPress={handleSave}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            수정 완료
          </Button>
          
          <View style={styles.bottomSpacing} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111811',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#111811',
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholderView: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1c261c',
    color: 'white',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 8,
    fontSize: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  ratingLabel: {
    color: '#9db89d',
    fontSize: 14,
    fontWeight: '500',
    width: 60,
  },
  imageUploadArea: {
    borderWidth: 2,
    borderColor: '#3c533c',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  imageUploadText: {
    color: '#9db89d',
    fontSize: 14,
  },
  imagePreviewContainer: {
    marginTop: 8,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  bottomSpacing: {
    height: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#9db89d',
    textAlign: 'center',
  },
});

export default EditProgressLogScreen;
