import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProjectStore } from '@/src/stores/projectStore';
import Button from '@/src/components/common/Button';
import StarRating from '@/src/components/common/StarRating';
import { Ionicons } from '@expo/vector-icons';
import { ProgressLog } from '@/src/types';
import ImageUpload from '@/src/components/common/ImageUpload';

const AddProgressLogScreen: React.FC = () => {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { addProgressLog, isLoading } = useProjectStore();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  // 평가 점수들
  const [tasteRating, setTasteRating] = useState(0);
  const [aromaRating, setAromaRating] = useState(0);
  const [appearanceRating, setAppearanceRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);

  const handleClose = () => {
    router.back();
  };

  const handleAddProgressLog = async () => {
    // 기본 검증
    if (!title.trim()) {
      Alert.alert('오류', '제목을 입력해주세요.');
      return;
    }
    
    if (!projectId) {
      Alert.alert('오류', '프로젝트 정보를 찾을 수 없습니다.');
      return;
    }

    const logData: Omit<ProgressLog, 'id' | 'createdAt' | 'updatedAt'> = {
      projectId,
      date,
      title: title.trim(),
      description: description.trim() || undefined,
      images,
      color: color.trim() || undefined,
      notes: notes.trim() || undefined,
      ratings: {
        taste: tasteRating || undefined,
        aroma: aromaRating || undefined,
        appearance: appearanceRating || undefined,
        overall: overallRating || undefined,
      },
    };

    console.log('진행 로그 추가 요청:', logData);

    const success = await addProgressLog(logData);
    
    console.log('진행 로그 추가 결과:', success);
    
    if (success) {
      Alert.alert(
        '로그 추가 완료',
        '진행 로그가 추가되었습니다!',
        [
          {
            text: '확인',
            onPress: () => {
              console.log('진행 로그 추가 후 화면 뒤로가기');
              router.back();
            },
          },
        ]
      );
    } else {
      Alert.alert('오류', '진행 로그 추가에 실패했습니다.');
    }
  };

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
  };

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
          <Text style={styles.headerTitle}>진행 로그 추가</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* 날짜 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>날짜</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9db89d"
                value={date}
                onChangeText={setDate}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
            </View>

            {/* 제목 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>제목 *</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 첫 시음, 색깔 확인, 향 체크 등"
                placeholderTextColor="#9db89d"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* 상세 내용 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>상세 내용</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="오늘의 상태나 변화에 대해 자세히 기록해보세요&#10;&#10;예:&#10;• 드디어 첫 맛을 봤는데 생각보다 부드럽고 좋다!&#10;• 색이 조금 더 진해진 것 같아요&#10;• 향이 훨씬 풍부해졌네요"
                placeholderTextColor="#9db89d"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* 평가 섹션 */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionTitle}>평가</Text>
              
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>맛</Text>
                <StarRating
                  rating={tasteRating}
                  onRatingChange={setTasteRating}
                />
              </View>
              
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>향</Text>
                <StarRating
                  rating={aromaRating}
                  onRatingChange={setAromaRating}
                />
              </View>
              
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>외관</Text>
                <StarRating
                  rating={appearanceRating}
                  onRatingChange={setAppearanceRating}
                />
              </View>
              
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>전체</Text>
                <StarRating
                  rating={overallRating}
                  onRatingChange={setOverallRating}
                />
              </View>
            </View>

            {/* 색깔 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>색깔</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 연한 황금색, 짙은 호박색, 투명한 무색 등"
                placeholderTextColor="#9db89d"
                value={color}
                onChangeText={setColor}
              />
            </View>

            {/* 추가 메모 */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>추가 메모</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="특별한 관찰사항이나 다음에 시도해볼 것들을 메모하세요"
                placeholderTextColor="#9db89d"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* 이미지 업로드 */}
            <View style={styles.imageSection}>
              <Text style={styles.label}>사진</Text>
              <ImageUpload
                images={images}
                onImagesChange={handleImagesChange}
                maxImages={5}
                title="사진 추가"
                subtitle="현재 상태를 사진으로 기록하세요"
                bucket="progress-images"
                uploadPath="logs"
              />
            </View>
          </View>
        </ScrollView>

        {/* 하단 저장 버튼 */}
        <View style={styles.bottomContainer}>
          <Button
            onPress={handleAddProgressLog}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            로그 저장
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
  placeholder: {
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
    marginBottom: 20,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
    height: 120,
    paddingTop: 15,
  },
  ratingSection: {
    marginBottom: 20,
    backgroundColor: '#1c261c',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3c533c',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ratingLabel: {
    color: 'white',
    fontSize: 14,
    width: 60,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageUploadArea: {
    borderWidth: 2,
    borderColor: '#3c533c',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  imageUploadContent: {
    alignItems: 'center',
    gap: 8,
  },
  imageUploadTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageUploadSubtitle: {
    color: '#9db89d',
    fontSize: 14,
    textAlign: 'center',
  },
  imagePreviewContainer: {
    marginTop: 16,
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
});

export default AddProgressLogScreen;
