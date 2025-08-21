-- Supabase Storage RLS 정책 수정
-- 이 SQL을 Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. 기존 정책 모두 삭제 (있다면)
DROP POLICY IF EXISTS "Give users authenticated access to folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- 2. 간단하고 안전한 정책 생성

-- 인증된 사용자는 모든 이미지 버킷에 업로드 가능
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id IN ('project-images', 'profile-images', 'progress-images', 'test-images')
);

-- 모든 사용자가 이미지 조회 가능 (public 이미지)
CREATE POLICY "Anyone can view images" ON storage.objects
FOR SELECT USING (
  bucket_id IN ('project-images', 'profile-images', 'progress-images', 'test-images')
);

-- 인증된 사용자는 이미지 업데이트 가능
CREATE POLICY "Authenticated users can update images" ON storage.objects
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  bucket_id IN ('project-images', 'profile-images', 'progress-images', 'test-images')
);

-- 인증된 사용자는 이미지 삭제 가능
CREATE POLICY "Authenticated users can delete images" ON storage.objects
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  bucket_id IN ('project-images', 'profile-images', 'progress-images', 'test-images')
);
