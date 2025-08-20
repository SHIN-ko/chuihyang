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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProjectStore } from '@/src/stores/projectStore';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/src/components/common/Button';

const EditProjectScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { projects, updateProjectData, isLoading } = useProjectStore();
  
  const project = projects.find(p => p.id === id);
  
  const [formData, setFormData] = useState({
    name: '',
    notes: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        notes: project.notes || '',
      });
    }
  }, [project]);

  const handleClose = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!project) return;

    if (!formData.name.trim()) {
      Alert.alert('오류', '프로젝트 이름을 입력해주세요.');
      return;
    }

    try {
      // 변경된 값만 업데이트
      const updates: { name?: string; notes?: string } = {};
      
      if (formData.name.trim() !== project.name) {
        updates.name = formData.name.trim();
      }
      
      if (formData.notes.trim() !== (project.notes || '')) {
        updates.notes = formData.notes.trim();
      }

      if (Object.keys(updates).length === 0) {
        Alert.alert('알림', '변경된 내용이 없습니다.');
        return;
      }

      const success = await updateProjectData(project.id, updates);
      
      if (!success) {
        Alert.alert('오류', '프로젝트 수정에 실패했습니다.');
        return;
      }
      
      Alert.alert('완료', '프로젝트가 수정되었습니다!', [
        {
          text: '확인',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('프로젝트 수정 실패:', error);
      Alert.alert('오류', '프로젝트 수정에 실패했습니다.');
    }
  };

  const getRecipeName = (recipeId: string) => {
    switch (recipeId) {
      case 'yareyare': return '야레야레 (위스키, 60일)';
      case 'blabla': return '블라블라 (진, 30일)';
      case 'oz': return '오즈 (럼, 90일)';
      case 'pachinko': return '파친코 (과실주, 45일)';
      case 'gyeaeba': return '계애바 (보드카, 21일)';
      default: return '알 수 없는 레시피';
    }
  };

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#111811" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>프로젝트 수정</Text>
          <View style={styles.placeholderView} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>프로젝트를 찾을 수 없습니다.</Text>
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
          <Text style={styles.headerTitle}>프로젝트 수정</Text>
          <View style={styles.placeholderView} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* 수정 불가능한 정보 표시 */}
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeInfoTitle}>기본 정보 (수정 불가)</Text>
            <Text style={styles.recipeInfoText}>🧪 레시피: {getRecipeName(project.recipeId)}</Text>
            <Text style={styles.recipeInfoText}>
              📅 시작일: {new Date(project.startDate).toLocaleDateString('ko-KR')}
            </Text>
            <Text style={styles.recipeInfoText}>
              🏁 완료 예정일: {new Date(project.expectedEndDate).toLocaleDateString('ko-KR')}
            </Text>
            <Text style={styles.recipeInfoText}>
              📊 상태: {project.status === 'completed' ? '✅ 완료됨' : '🔄 진행 중'}
            </Text>
          </View>

          {/* 프로젝트 이름 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="프로젝트 이름"
              placeholderTextColor="#9db89d"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              maxLength={50}
            />
          </View>

          {/* 메모/목적 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="프로젝트 노트&#10;&#10;예시:&#10;• 2024년 크리스마스에 가족들과 함께 마시고 싶어요&#10;• 친구 생일선물용으로 특별히 제조&#10;• 회사 동료들과 신년회에서 시음 예정"
              placeholderTextColor="#9db89d"
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.helpText}>
              {formData.notes.length}/500자
            </Text>
          </View>
        </ScrollView>

        {/* 하단 수정 버튼 */}
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
    height: 144,
    paddingTop: 15,
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
    textAlign: 'right',
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

export default EditProjectScreen;
