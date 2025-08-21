import { create } from 'zustand';
import { Project, ProjectStatus, ProjectType, ProgressLog } from '@/src/types';
import NotificationService from '@/src/services/notificationService';
import { SupabaseService } from '@/src/services/supabaseService';
import { useAuthStore } from './authStore';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setSelectedProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Async actions
  fetchProjects: () => Promise<void>;
  createProject: (projectData: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateProjectData: (id: string, updates: Partial<Project>) => Promise<boolean>;
  updateProjectStatus: (id: string, status: ProjectStatus) => Promise<boolean>;
  deleteProjectData: (id: string) => Promise<boolean>;
  
  // Progress Log actions
  addProgressLog: (logData: Omit<ProgressLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateProgressLog: (logId: string, updates: Partial<ProgressLog>) => Promise<boolean>;
  deleteProgressLog: (projectId: string, logId: string) => Promise<boolean>;
  
  // Notification actions
  rescheduleAllNotifications: () => Promise<boolean>;
  
  // Computed values
  getProjectsByStatus: (status: ProjectStatus) => Project[];
  getInProgressProjects: () => Project[];
  getCompletedProjects: () => Project[];
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  isLoading: false,

  setProjects: (projects: Project[]) => {
    set({ projects });
  },

  addProject: (project: Project) => {
    set((state) => ({
      projects: [...state.projects, project],
    }));
  },

  updateProject: (id: string, updates: Partial<Project>) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id ? { ...project, ...updates, updatedAt: new Date().toISOString() } : project
      ),
    }));
  },

  deleteProject: (id: string) => {
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
      selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
    }));
  },

  // 모든 프로젝트의 알림 재설정
  rescheduleAllNotifications: async () => {
    try {
      set({ isLoading: true });
      const { projects } = get();
      
      // 진행 중인 프로젝트들만 필터링
      const inProgressProjects = projects.filter(p => p.status === 'in_progress');
      
      console.log(`${inProgressProjects.length}개의 진행 중인 프로젝트 알림 재설정 시작`);
      
      for (const project of inProgressProjects) {
        try {
          console.log(`=== ${project.name} 프로젝트 알림 재설정 ===`);
          await NotificationService.scheduleProjectNotifications(project);
        } catch (error) {
          console.error(`${project.name} 프로젝트 알림 설정 실패:`, error);
        }
      }
      
      console.log('모든 프로젝트 알림 재설정 완료');
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('알림 재설정 실패:', error);
      set({ isLoading: false });
      return false;
    }
  },

  setSelectedProject: (project: Project | null) => {
    set({ selectedProject: project });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const authState = useAuthStore.getState();
      if (!authState.user) {
        console.log('사용자 정보 없음 - 프로젝트 조회 중단');
        set({ projects: [], isLoading: false });
        return;
      }

      console.log('프로젝트 목록 조회 시작:', authState.user.id);
      const projects = await SupabaseService.getProjects(authState.user.id);
      
      console.log('프로젝트 목록 조회 완료:', {
        projectCount: projects.length,
        projects: projects.map(p => ({ 
          id: p.id, 
          name: p.name, 
          logsCount: p.progressLogs?.length || 0 
        }))
      });
      
      set({ projects, isLoading: false });
    } catch (error) {
      console.error('프로젝트 조회 실패:', error);
      set({ projects: [], isLoading: false });
    }
  },

  createProject: async (projectData) => {
    set({ isLoading: true });
    try {
      const authState = useAuthStore.getState();
      if (!authState.user) {
        set({ isLoading: false });
        return false;
      }

      const newProject = await SupabaseService.createProject(projectData, authState.user.id);
      
      get().addProject(newProject);
      
      // 프로젝트 생성 후 알림 스케줄링
      await NotificationService.scheduleProjectNotifications(newProject);
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      set({ isLoading: false });
      return false;
    }
  },

  updateProjectData: async (id: string, updates: Partial<Project>) => {
    try {
      set({ isLoading: true });
      
      await SupabaseService.updateProject(id, updates);
      get().updateProject(id, updates);
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('프로젝트 업데이트 실패:', error);
      set({ isLoading: false });
      return false;
    }
  },

  updateProjectStatus: async (id: string, status: ProjectStatus) => {
    try {
      const updates = { 
        status,
        actualEndDate: status === 'completed' ? new Date().toISOString() : undefined,
      };
      
      await SupabaseService.updateProject(id, updates);
      get().updateProject(id, updates);
      
      // 프로젝트 완료 시 해당 알림 취소
      if (status === 'completed') {
        await NotificationService.cancelProjectNotifications(id);
      }
      
      return true;
    } catch (error) {
      console.error('프로젝트 상태 업데이트 실패:', error);
      return false;
    }
  },

  deleteProjectData: async (id: string) => {
    try {
      set({ isLoading: true });
      
      // 백엔드에서 프로젝트 삭제
      await SupabaseService.deleteProject(id);
      
      // 관련 알림 취소
      await NotificationService.cancelProjectNotifications(id);
      
      // 로컬 상태에서 프로젝트 제거
      get().deleteProject(id);
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error);
      set({ isLoading: false });
      return false;
    }
  },

  getProjectsByStatus: (status: ProjectStatus) => {
    return get().projects.filter((project) => project.status === status);
  },

  getInProgressProjects: () => {
    return get().getProjectsByStatus('in_progress');
  },

  getCompletedProjects: () => {
    return get().getProjectsByStatus('completed');
  },

  // Progress Log 관련 액션들
  addProgressLog: async (logData: Omit<ProgressLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      set({ isLoading: true });
      
      const { projects } = get();
      const projectIndex = projects.findIndex(p => p.id === logData.projectId);
      
      if (projectIndex === -1) {
        console.error('프로젝트를 찾을 수 없습니다:', logData.projectId);
        return false;
      }

      console.log('진행 로그 추가 시작:', {
        projectId: logData.projectId,
        projectName: projects[projectIndex].name,
        currentLogsCount: projects[projectIndex].progressLogs.length
      });

      const newLog = await SupabaseService.addProgressLog(logData);
      console.log('Supabase에서 생성된 로그:', newLog);

      const updatedProjects = [...projects];
      updatedProjects[projectIndex] = {
        ...updatedProjects[projectIndex],
        progressLogs: [...updatedProjects[projectIndex].progressLogs, newLog],
        updatedAt: new Date().toISOString(),
      };
      
      console.log('로컬 상태 업데이트 완료:', {
        projectId: logData.projectId,
        newLogsCount: updatedProjects[projectIndex].progressLogs.length,
        updatedProject: updatedProjects[projectIndex].name
      });
      
      set({ projects: updatedProjects });
      
      // 추가: 서버에서 최신 데이터를 다시 가져와서 동기화
      console.log('서버에서 최신 프로젝트 데이터 동기화 시작...');
      try {
        await get().fetchProjects();
        console.log('프로젝트 데이터 동기화 완료');
      } catch (syncError) {
        console.error('프로젝트 동기화 실패:', syncError);
        // 동기화 실패해도 로컬 업데이트는 유지
      }
      
      return true;
    } catch (error) {
      console.error('진행 로그 추가 실패:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProgressLog: async (logId: string, updates: Partial<ProgressLog>) => {
    try {
      set({ isLoading: true });
      
      // 백엔드 업데이트
      await SupabaseService.updateProgressLog(logId, updates);
      
      const { projects } = get();
      let updated = false;

      const updatedProjects = projects.map(project => {
        const logIndex = project.progressLogs.findIndex(log => log.id === logId);
        if (logIndex !== -1) {
          const updatedLogs = [...project.progressLogs];
          updatedLogs[logIndex] = {
            ...updatedLogs[logIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          updated = true;
          return {
            ...project,
            progressLogs: updatedLogs,
            updatedAt: new Date().toISOString(),
          };
        }
        return project;
      });

      if (updated) {
        set({ projects: updatedProjects });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('진행 로그 업데이트 실패:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProgressLog: async (projectId: string, logId: string) => {
    try {
      set({ isLoading: true });
      
      // 백엔드에서 삭제
      await SupabaseService.deleteProgressLog(logId);
      
      const { projects } = get();
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        console.error('프로젝트를 찾을 수 없습니다:', projectId);
        return false;
      }

      const updatedProjects = [...projects];
      updatedProjects[projectIndex] = {
        ...updatedProjects[projectIndex],
        progressLogs: updatedProjects[projectIndex].progressLogs.filter(log => log.id !== logId),
        updatedAt: new Date().toISOString(),
      };
      
      set({ projects: updatedProjects });
      return true;
    } catch (error) {
      console.error('진행 로그 삭제 실패:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
