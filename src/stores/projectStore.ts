import { create } from 'zustand';
import { Project, ProjectStatus, ProjectType } from '@/src/types';

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
      // TODO: API 호출 구현
      // const response = await projectService.getProjects();
      
      // 임시 mock 데이터
      const mockProjects: Project[] = [
        {
          id: '1',
          userId: '1',
          name: '첫 번째 위스키 프로젝트',
          type: 'whiskey',
          startDate: '2024-01-01',
          expectedEndDate: '2024-03-01',
          status: 'in_progress',
          notes: '오크 배럴에서 숙성 중',
          images: [],
          ingredients: [
            {
              id: '1',
              projectId: '1',
              name: '보리',
              quantity: '500',
              unit: 'g',
            },
          ],
          progressLogs: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      
      set({ projects: mockProjects, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  createProject: async (projectData) => {
    set({ isLoading: true });
    try {
      // TODO: API 호출 구현
      
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        userId: '1', // 현재 사용자 ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      get().addProject(newProject);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false });
      return false;
    }
  },

  updateProjectStatus: async (id: string, status: ProjectStatus) => {
    try {
      // TODO: API 호출 구현
      
      get().updateProject(id, { 
        status,
        actualEndDate: status === 'completed' ? new Date().toISOString() : undefined,
      });
      return true;
    } catch (error) {
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
}));
