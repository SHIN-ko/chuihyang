// 사용자 관련 타입
export interface User {
  id: string;
  email: string;
  nickname: string;
  birthdate?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

// 프로젝트(담금주) 관련 타입
export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'paused';
export type ProjectType = 'whiskey' | 'gin' | 'rum' | 'fruit_wine' | 'vodka' | 'other';

// 미리 정의된 담금주 레시피
export interface PresetRecipe {
  id: string;
  name: string;
  type: ProjectType;
  description: string;
  defaultDuration: number; // 기본 숙성 기간 (일)
  ingredients: string[]; // 미리 정의된 재료 목록
  instructions?: string; // 제조 방법
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  type: ProjectType;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  status: ProjectStatus;
  notes?: string;
  images: string[];
  ingredients: Ingredient[];
  progressLogs: ProgressLog[];
  recipeId?: string; // 사용한 레시피 ID (미리 정의된 레시피 사용 시)
  createdAt: string;
  updatedAt: string;
}

// 재료 타입
export interface Ingredient {
  id: string;
  projectId: string;
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
}

// 진행 로그 타입
export interface ProgressLog {
  id: string;
  projectId: string;
  date: string;
  title: string;
  description?: string;
  images: string[];
  createdAt: string;
}

// 알림 타입
export type NotificationType = 'project_start' | 'project_end' | 'progress_check' | 'custom';

export interface Notification {
  id: string;
  userId: string;
  projectId?: string;
  type: NotificationType;
  title: string;
  message: string;
  scheduledDate: string;
  isRead: boolean;
  createdAt: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 네비게이션 타입
export type RootStackParamList = {
  '(tabs)': undefined;
  'auth/onboarding': undefined;
  'auth/login': undefined;
  'auth/signup': undefined;
  'auth/forgot-password': undefined;
  'project/create': undefined;
  'project/detail': { projectId: string };
  'project/edit': { projectId: string };
  modal: undefined;
};

export type TabParamList = {
  home: undefined;
  calendar: undefined;
  profile: undefined;
};
