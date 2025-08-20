-- 데이터베이스 마이그레이션: project_type enum 업데이트
-- 실행 순서: 1 → 2 → 3

-- ======================================
-- 방법 1: 기존 enum에 새로운 값들 추가 (안전한 방법)
-- ======================================

-- 1-1. 새로운 enum 값들 추가
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'damgeumSoju25';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'damgeumSoju30';
-- 'vodka'는 이미 있으므로 추가하지 않음

-- 1-2. 기존 데이터 마이그레이션 (필요시)
-- UPDATE public.projects SET type = 'damgeumSoju30' WHERE type = 'whiskey';
-- UPDATE public.projects SET type = 'damgeumSoju25' WHERE type = 'gin';
-- UPDATE public.projects SET type = 'damgeumSoju30' WHERE type = 'rum';
-- UPDATE public.projects SET type = 'damgeumSoju25' WHERE type = 'fruit_wine';
-- UPDATE public.projects SET type = 'vodka' WHERE type = 'other';

-- ======================================
-- 방법 2: 완전히 새로운 enum으로 교체 (깔끔한 방법)
-- ======================================

-- 2-1. 새로운 enum 타입 생성
-- CREATE TYPE project_type_new AS ENUM ('damgeumSoju25', 'damgeumSoju30', 'vodka');

-- 2-2. 테이블 컬럼 타입 변경
-- ALTER TABLE public.projects ALTER COLUMN type DROP DEFAULT;
-- ALTER TABLE public.projects ALTER COLUMN type TYPE project_type_new USING 
--   CASE 
--     WHEN type = 'whiskey' THEN 'damgeumSoju30'::project_type_new
--     WHEN type = 'gin' THEN 'damgeumSoju25'::project_type_new  
--     WHEN type = 'rum' THEN 'damgeumSoju30'::project_type_new
--     WHEN type = 'fruit_wine' THEN 'damgeumSoju25'::project_type_new
--     WHEN type = 'vodka' THEN 'vodka'::project_type_new
--     ELSE 'damgeumSoju30'::project_type_new
--   END;

-- 2-3. 기존 enum 타입 삭제 및 새로운 것으로 이름 변경
-- DROP TYPE project_type;
-- ALTER TYPE project_type_new RENAME TO project_type;

-- ======================================
-- 권장사항
-- ======================================

-- 현재 상황에서는 방법 1을 권장합니다:
-- 1. 더 안전하고 데이터 손실 위험이 없음
-- 2. 기존 프로젝트가 있다면 점진적으로 마이그레이션 가능
-- 3. 필요하면 나중에 정리 가능

-- 실행할 SQL (Supabase SQL Editor에서 실행):
/*
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'damgeumSoju25';
ALTER TYPE project_type ADD VALUE IF NOT EXISTS 'damgeumSoju30';
*/
