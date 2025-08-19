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
  updateProjectStatus: (id: string, status: ProjectStatus) => Promise<boolean>;
  
  // Progress Log actions
  addProgressLog: (logData: Omit<ProgressLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateProgressLog: (logId: string, updates: Partial<ProgressLog>) => Promise<boolean>;
  deleteProgressLog: (projectId: string, logId: string) => Promise<boolean>;
  
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
        set({ projects: [], isLoading: false });
        return;
      }

      const projects = await SupabaseService.getProjects(authState.user.id);
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

      const newLog = await SupabaseService.addProgressLog(logData);

      const updatedProjects = [...projects];
      updatedProjects[projectIndex] = {
        ...updatedProjects[projectIndex],
        progressLogs: [...updatedProjects[projectIndex].progressLogs, newLog],
        updatedAt: new Date().toISOString(),
      };
      
      set({ projects: updatedProjects });
      
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
