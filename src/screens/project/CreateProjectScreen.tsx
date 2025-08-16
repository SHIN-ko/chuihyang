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
import { useRouter } from 'expo-router';
import { useProjectStore } from '@/src/stores/projectStore';
import Button from '@/src/components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import { ProjectType, PresetRecipe } from '@/src/types';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { PRESET_RECIPES, getRecipeById } from '@/src/data/presetRecipes';

const CreateProjectScreen: React.FC = () => {
  const router = useRouter();
  const { createProject, isLoading } = useProjectStore();
  
  const [name, setName] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<PresetRecipe | null>(null);
  const [startDate, setStartDate] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showRecipePicker, setShowRecipePicker] = useState(false);

  const handleClose = () => {
    router.back();
  };

  const handleCreateProject = async () => {
    // 기본 검증
    if (!name.trim()) {
      Alert.alert('오류', '프로젝트 이름을 입력해주세요.');
      return;
    }
    
    if (!selectedRecipe) {
      Alert.alert('오류', '담금주 레시피를 선택해주세요.');
      return;
    }
    
    if (!startDate) {
      Alert.alert('오류', '시작일을 입력해주세요.');
      return;
    }

    // 자동으로 완료 예정일 계산 (선택한 레시피의 기본 기간 사용)
    let calculatedEndDate = expectedEndDate;
    if (!expectedEndDate && selectedRecipe) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + selectedRecipe.defaultDuration);
      calculatedEndDate = start.toISOString().split('T')[0];
      setExpectedEndDate(calculatedEndDate);
    }

    // 날짜 검증 (입력한 경우에만)
    if (expectedEndDate) {
      const start = new Date(startDate);
      const end = new Date(expectedEndDate);
      
      if (end <= start) {
        Alert.alert('오류', '완료 예정일은 시작일보다 늦어야 합니다.');
        return;
      }
    }

    // 선택한 레시피의 재료를 사용
    const ingredientList = selectedRecipe.ingredients.map((ingredientName, index) => ({
      id: `ingredient-${Date.now()}-${index}`,
      projectId: '', // 프로젝트 생성 후 설정됨
      name: ingredientName,
      quantity: '',
      unit: '',
    }));

    const projectData = {
      name: name.trim(),
      type: selectedRecipe.type,
      startDate,
      expectedEndDate: calculatedEndDate,
      status: 'planning' as const,
      notes: notes.trim() || undefined,
      images,
      ingredients: ingredientList,
      progressLogs: [],
      recipeId: selectedRecipe.id, // 선택한 레시피 ID 저장
    };

    const success = await createProject(projectData);
    
    if (success) {
      Alert.alert(
        '프로젝트 생성 완료',
        `${selectedRecipe.name} 프로젝트가 생성되었습니다!`,
        [
          {
            text: '확인',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } else {
      Alert.alert('오류', '프로젝트 생성에 실패했습니다.');
    }
  };

  const handleSelectImages = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 5, // 최대 5개
    } as any;

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets) {
        const newImages = response.assets
          .map(asset => asset.uri)
          .filter(uri => uri) as string[];
        
        setImages(prev => [...prev, ...newImages].slice(0, 5)); // 최대 5개까지
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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
          <Text style={styles.headerTitle}>새 프로젝트</Text>
          <View style={styles.placeholderView} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* 프로젝트 이름 */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="프로젝트 이름"
                placeholderTextColor="#9db89d"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* 담금주 레시피 선택 */}
            <TouchableOpacity 
              style={[styles.input, styles.pickerButton]}
              onPress={() => setShowRecipePicker(!showRecipePicker)}
            >
              <Text style={[styles.inputText, !selectedRecipe && styles.placeholderStyle]}>
                {selectedRecipe ? selectedRecipe.name : '담금주 레시피 선택'}
              </Text>
              <Ionicons 
                name={showRecipePicker ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#9db89d" 
              />
            </TouchableOpacity>

            {/* 레시피 선택 드롭다운 */}
            {showRecipePicker && (
              <View style={styles.dropdown}>
                {PRESET_RECIPES.map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={[
                      styles.dropdownItem,
                      selectedRecipe?.id === recipe.id && styles.dropdownItemSelected
                    ]}
                    onPress={() => {
                      setSelectedRecipe(recipe);
                      setShowRecipePicker(false);
                      // 완료 예정일을 자동으로 설정
                      if (startDate) {
                        const start = new Date(startDate);
                        start.setDate(start.getDate() + recipe.defaultDuration);
                        setExpectedEndDate(start.toISOString().split('T')[0]);
                      }
                    }}
                  >
                    <View>
                      <Text style={[
                        styles.dropdownText,
                        selectedRecipe?.id === recipe.id && styles.dropdownTextSelected
                      ]}>
                        {recipe.name}
                      </Text>
                      <Text style={[
                        styles.dropdownSubText,
                        selectedRecipe?.id === recipe.id && styles.dropdownTextSelected
                      ]}>
                        {recipe.description} • {recipe.defaultDuration}일
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 선택된 레시피 정보 표시 */}
            {selectedRecipe && (
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeInfoTitle}>선택된 레시피</Text>
                <Text style={styles.recipeInfoText}>📝 {selectedRecipe.description}</Text>
                <Text style={styles.recipeInfoText}>⏱️ 예상 제조 기간: {selectedRecipe.defaultDuration}일</Text>
                <Text style={styles.recipeInfoText}>🥃 종류: {
                  selectedRecipe.type === 'whiskey' ? '위스키' :
                  selectedRecipe.type === 'gin' ? '진' :
                  selectedRecipe.type === 'rum' ? '럼' :
                  selectedRecipe.type === 'fruit_wine' ? '과실주' :
                  selectedRecipe.type === 'vodka' ? '보드카' : '기타'
                }</Text>
                <Text style={styles.recipeInfoText}>🧪 재료: {selectedRecipe.ingredients.join(', ')}</Text>
              </View>
            )}

            {/* 시작일 */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="시작일 (YYYY-MM-DD)"
                placeholderTextColor="#9db89d"
                value={startDate}
                onChangeText={setStartDate}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
            </View>

            {/* 완료 예정일 */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="완료 예정일 (YYYY-MM-DD) - 레시피 선택 시 자동 설정"
                placeholderTextColor="#9db89d"
                value={expectedEndDate}
                onChangeText={setExpectedEndDate}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                editable={!!selectedRecipe} // 레시피 선택 후에만 수정 가능
              />
              {selectedRecipe && (
                <Text style={styles.helpText}>
                  💡 {selectedRecipe.name} 레시피의 권장 숙성 기간은 {selectedRecipe.defaultDuration}일입니다
                </Text>
              )}
            </View>

            {/* 노트 */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="프로젝트 노트&#10;&#10;예시:&#10;• 2024년 크리스마스에 가족들과 함께 마시고 싶어요&#10;• 친구 생일선물용으로 특별히 제조&#10;• 회사 동료들과 신년회에서 시음 예정"
                placeholderTextColor="#9db89d"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* 이미지 업로드 */}
            <View style={styles.imageSection}>
              <TouchableOpacity style={styles.imageUploadArea} onPress={handleSelectImages}>
                <View style={styles.imageUploadContent}>
                  <Text style={styles.imageUploadTitle}>이미지 추가</Text>
                  <Text style={styles.imageUploadSubtitle}>프로젝트 관련 이미지를 추가하세요</Text>
                </View>
                <TouchableOpacity style={styles.imageUploadButton} onPress={handleSelectImages}>
                  <Text style={styles.imageUploadButtonText}>이미지 추가</Text>
                </TouchableOpacity>
              </TouchableOpacity>

              {/* 선택된 이미지들 */}
              {images.length > 0 && (
                <View style={styles.imagePreviewContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {images.map((imageUri, index) => (
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

        {/* 하단 생성 버튼 */}
        <View style={styles.bottomContainer}>
          <Button
            onPress={handleCreateProject}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            프로젝트 생성
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
  inputText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  placeholderStyle: {
    color: '#9db89d',
  },
  placeholderView: {
    width: 48,
  },
  textArea: {
    height: 144,
    paddingTop: 15,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdown: {
    backgroundColor: '#1c261c',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3c533c',
    marginBottom: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3c533c',
  },
  dropdownItemSelected: {
    backgroundColor: '#293829',
  },
  dropdownText: {
    color: 'white',
    fontSize: 16,
  },
  dropdownTextSelected: {
    color: '#22c55e',
    fontWeight: '600',
  },
  dropdownSubText: {
    color: '#9db89d',
    fontSize: 12,
    marginTop: 2,
  },
  recipeInfo: {
    backgroundColor: '#293829',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  recipeInfoTitle: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeInfoText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  helpText: {
    color: '#9db89d',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
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
    paddingVertical: 56,
    alignItems: 'center',
    gap: 24,
  },
  imageUploadContent: {
    alignItems: 'center',
    gap: 8,
  },
  imageUploadTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageUploadSubtitle: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  imageUploadButton: {
    backgroundColor: '#293829',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  imageUploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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

export default CreateProjectScreen;
