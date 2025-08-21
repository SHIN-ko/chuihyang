-- Supabase Storage 정책 설정
-- 이 SQL을 Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. Storage buckets에 대한 기본 정책 (모든 사용자가 읽기 가능)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('project-images', 'project-images', true, 10485760, ARRAY['image/*']),
  ('profile-images', 'profile-images', true, 10485760, ARRAY['image/*']),
  ('progress-images', 'progress-images', true, 10485760, ARRAY['image/*']),
  ('test-images', 'test-images', true, 10485760, ARRAY['image/*'])
ON CONFLICT (id) DO NOTHING;

-- 2. 인증된 사용자만 업로드 가능하도록 정책 설정
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' 
  AND bucket_id IN ('project-images', 'profile-images', 'progress-images', 'test-images')
);

-- 3. 모든 사용자가 이미지 조회 가능
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT USING (
  bucket_id IN ('project-images', 'profile-images', 'progress-images', 'test-images')
);

-- 4. 사용자는 자신의 이미지만 삭제 가능
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  auth.role() = 'authenticated' 
  AND bucket_id IN ('project-images', 'profile-images', 'progress-images', 'test-images')
  AND auth.uid()::text = (storage.foldername(name))[1]
);
