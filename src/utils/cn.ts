import { type ClassValue, clsx } from 'clsx';

/**
 * Tailwind CSS 클래스명을 조건부로 결합하는 유틸리티 함수
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
