import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { SupabaseService } from '@/src/services/supabaseService';
import { supabase } from '@/src/lib/supabase';
import { useThemedStyles, useThemeValues } from '@/src/hooks/useThemedStyles';
import GlassCard from './GlassCard';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  title?: string;
  subtitle?: string;
  bucket?: string;
  uploadPath?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  title = '이미지 추가',
  subtitle = '사진을 추가하세요',
  bucket = 'project-images',
  uploadPath = 'uploads',
}) => {
  const { colors, brandColors } = useThemeValues();
  const [uploading, setUploading] = useState(false);

  const handleSelectImages = async () => {
    console.log('이미지 선택 버튼 클릭됨');
    
    if (uploading) {
      console.log('업로드 중이므로 무시');
      return;
    }

    try {
      // 권한 요청
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('권한 요청 결과:', permissionResult);
      
      if (permissionResult.granted === false) {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
        return;
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxImages - images.length,
      });

      console.log('이미지 피커 결과:', result);

      if (result.canceled) {
        console.log('사용자가 취소함');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        console.log('선택된 이미지 개수:', result.assets.length);
        setUploading(true);
        
        try {
          const uploadedUrls: string[] = [];
          
          for (const asset of result.assets) {
            if (asset.uri) {
              console.log('업로드 시작:', asset.uri);
              
              try {
                // 더 안전한 파일 읽기 방법
                console.log('파일 정보:', {
                  uri: asset.uri,
                  type: asset.mimeType,
                  name: asset.fileName,
                  size: asset.fileSize
                });
                
                // 파일을 ArrayBuffer로 읽기
                const response = await fetch(asset.uri);
                console.log('Fetch 응답 상태:', response.status, response.headers.get('content-type'));
                
                if (!response.ok) {
                  throw new Error(`파일 읽기 실패: ${response.status}`);
                }
                
                const arrayBuffer = await response.arrayBuffer();
                console.log('ArrayBuffer 크기:', arrayBuffer.byteLength);
                
                if (arrayBuffer.byteLength === 0) {
                  throw new Error('파일이 비어있습니다');
                }
                
                // ArrayBuffer를 Uint8Array로 변환
                const uint8Array = new Uint8Array(arrayBuffer);
                
                // 고유한 파일명 생성
                const fileName = `${uploadPath}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
                console.log('업로드 파일명:', fileName);
                
                // Supabase Storage에 업로드
                const { data, error } = await supabase.storage
                  .from(bucket)
                  .upload(fileName, uint8Array, {
                    contentType: asset.mimeType || 'image/jpeg',
                  });
                
                if (error) throw error;
                if (!data) throw new Error('업로드 실패');
                
                console.log('업로드 완료 데이터:', data);
                
                // Public URL 생성
                const { data: { publicUrl } } = supabase.storage
                  .from(bucket)
                  .getPublicUrl(data.path);
                
                console.log('생성된 Public URL:', publicUrl);
                uploadedUrls.push(publicUrl);
                
              } catch (uploadError) {
                console.error('개별 파일 업로드 실패:', uploadError);
                throw uploadError;
              }
            }
          }
          
          // 새로 업로드된 이미지들을 기존 이미지들과 합침
          const newImages = [...images, ...uploadedUrls].slice(0, maxImages);
          console.log('새 이미지 배열:', newImages);
          onImagesChange(newImages);
          
          Alert.alert('성공', `${uploadedUrls.length}장의 이미지가 업로드되었습니다.`);
          
        } catch (error) {
          console.error('이미지 업로드 실패:', error);
          Alert.alert('오류', `이미지 업로드에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          setUploading(false);
        }
      } else {
        console.log('선택된 이미지가 없음');
      }
    } catch (error) {
      console.error('이미지 선택 과정에서 오류:', error);
      Alert.alert('오류', `이미지 선택 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const styles = useThemedStyles(({ colors, shadows, brandColors }) => StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    uploadArea: {
      borderWidth: 2,
      borderColor: colors.border.accent,
      borderStyle: 'dashed',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background.glass,
      minHeight: 100,
    },
    uploadAreaDisabled: {
      opacity: 0.6,
    },
    uploadIcon: {
      marginBottom: 8,
    },
    uploadContent: {
      alignItems: 'center',
    },
    uploadTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4,
    },
    uploadSubtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    uploadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    uploadingText: {
      fontSize: 14,
      color: brandColors.accent.primary,
      marginLeft: 8,
    },
    previewContainer: {
      marginTop: 16,
    },
    previewScroll: {
      paddingHorizontal: 4,
    },
    imagePreview: {
      position: 'relative',
      marginRight: 12,
      borderRadius: 8,
      overflow: 'hidden',
    },
    previewImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
    },
    removeButton: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: colors.background.surface,
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.glass.light,
    },
    imageCount: {
      fontSize: 12,
      color: colors.text.muted,
      textAlign: 'center',
      marginTop: 8,
    },
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.uploadArea,
          (uploading || images.length >= maxImages) && styles.uploadAreaDisabled
        ]} 
        onPress={() => {
          console.log('터치 이벤트 발생');
          handleSelectImages();
        }}
        disabled={uploading || images.length >= maxImages}
        activeOpacity={0.7}
      >
        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color={brandColors.accent.primary} />
            <Text style={styles.uploadingText}>업로드 중...</Text>
          </View>
        ) : (
          <>
            <View style={styles.uploadIcon}>
              <Ionicons 
                name="camera" 
                size={24} 
                color={images.length >= maxImages ? colors.text.muted : brandColors.accent.primary} 
              />
            </View>
            <View style={styles.uploadContent}>
              <Text style={styles.uploadTitle}>
                {images.length >= maxImages ? '최대 개수 도달' : title}
              </Text>
              <Text style={styles.uploadSubtitle}>
                {images.length >= maxImages 
                  ? `최대 ${maxImages}장까지 추가 가능합니다` 
                  : `${subtitle} (최대 ${maxImages}장)`
                }
              </Text>

            </View>
          </>
        )}
      </TouchableOpacity>

      {images.length > 0 && (
        <View style={styles.previewContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.previewScroll}
          >
            {images.map((imageUri, index) => (
              <View key={index} style={styles.imagePreview}>
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.previewImage}
                  onError={(error) => {
                    console.error(`이미지 로드 실패 [${index}]:`, imageUri, error.nativeEvent.error);
                  }}
                  onLoad={() => {
                    console.log(`이미지 로드 성공 [${index}]:`, imageUri);
                  }}
                />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close" size={16} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <Text style={styles.imageCount}>
            {images.length} / {maxImages}장
          </Text>
        </View>
      )}
    </View>
  );
};

export default ImageUpload;
