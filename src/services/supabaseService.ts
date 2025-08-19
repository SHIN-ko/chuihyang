import { supabase } from '@/src/lib/supabase';
import { User, Project, ProgressLog, Ingredient } from '@/src/types';
import { Database } from '@/src/lib/database.types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProgressLogRow = Database['public']['Tables']['progress_logs']['Row'];
type ProgressLogInsert = Database['public']['Tables']['progress_logs']['Insert'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export class SupabaseService {
  // 인증 관련
  static async signUp(email: string, password: string, nickname: string, birthdate?: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname,
            birthdate: birthdate || null,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('사용자 생성 실패');

      // 프로필은 Database Trigger가 자동으로 생성함
      // 트리거가 실행될 시간을 위해 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 500));

      return { user: authData.user, session: authData.session };
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw error;
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // profiles 테이블이 없거나 RLS 오류인 경우 auth user 정보만으로 임시 사용자 반환
        if (error.code === 'PGRST116' || error.code === '42501') {
          return {
            id: user.id,
            email: user.email || '',
            nickname: user.user_metadata?.nickname || user.email?.split('@')[0] || 'User',
            birthdate: user.user_metadata?.birthdate,
            profileImage: user.user_metadata?.profile_image_url,
            createdAt: user.created_at || new Date().toISOString(),
            updatedAt: user.updated_at || new Date().toISOString(),
          } as User;
        }
        throw error;
      }

      if (!profile) return null;

      return this.transformProfileToUser(profile);
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      return null;
    }
  }

  // 프로젝트 관련
  static async getProjects(userId: string): Promise<Project[]> {
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select(`
          *,
          progress_logs(*),
          ingredients(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!projectsData) return [];

      return projectsData.map(this.transformProjectRowToProject);
    } catch (error) {
      console.error('프로젝트 조회 오류:', error);
      throw error;
    }
  }

  static async createProject(projectData: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Project> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('인증되지 않은 사용자');

      // 프로젝트 생성
      const projectInsert: ProjectInsert = {
        user_id: userId,
        name: projectData.name,
        type: projectData.type,
        recipe_id: projectData.recipeId || null,
        start_date: projectData.startDate,
        expected_end_date: projectData.expectedEndDate,
        status: projectData.status,
        notes: projectData.notes || null,
        images: projectData.images || null,
      };

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert(projectInsert)
        .select()
        .single();

      if (projectError) throw projectError;
      if (!project) throw new Error('프로젝트 생성 실패');

      // 재료 생성
      if (projectData.ingredients && projectData.ingredients.length > 0) {
        const ingredientsToInsert = projectData.ingredients.map(ingredient => ({
          project_id: project.id,
          name: ingredient.name,
          quantity: ingredient.quantity || null,
          unit: ingredient.unit || null,
          notes: ingredient.notes || null,
        }));

        const { error: ingredientsError } = await supabase
          .from('ingredients')
          .insert(ingredientsToInsert);

        if (ingredientsError) throw ingredientsError;
      }

      // 생성된 프로젝트 전체 데이터 조회
      const { data: fullProject, error: fetchError } = await supabase
        .from('projects')
        .select(`
          *,
          progress_logs(*),
          ingredients(*)
        `)
        .eq('id', project.id)
        .single();

      if (fetchError) throw fetchError;
      if (!fullProject) throw new Error('프로젝트 조회 실패');

      return this.transformProjectRowToProject(fullProject);
    } catch (error) {
      console.error('프로젝트 생성 오류:', error);
      throw error;
    }
  }

  static async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    try {
      const updateData: Partial<ProjectRow> = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.actualEndDate !== undefined) updateData.actual_end_date = updates.actualEndDate;
      if (updates.images !== undefined) updateData.images = updates.images;

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);

      if (error) throw error;
    } catch (error) {
      console.error('프로젝트 업데이트 오류:', error);
      throw error;
    }
  }

  static async deleteProject(projectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    } catch (error) {
      console.error('프로젝트 삭제 오류:', error);
      throw error;
    }
  }

  // 진행 로그 관련
  static async addProgressLog(logData: Omit<ProgressLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProgressLog> {
    try {
      const logInsert: ProgressLogInsert = {
        project_id: logData.projectId,
        date: logData.date,
        title: logData.title,
        description: logData.description || null,
        images: logData.images || null,
        ratings: logData.ratings || null,
        color: logData.color || null,
        notes: logData.notes || null,
      };

      const { data: log, error } = await supabase
        .from('progress_logs')
        .insert(logInsert)
        .select()
        .single();

      if (error) throw error;
      if (!log) throw new Error('진행 로그 생성 실패');

      return this.transformProgressLogRowToProgressLog(log);
    } catch (error) {
      console.error('진행 로그 추가 오류:', error);
      throw error;
    }
  }

  static async updateProgressLog(logId: string, updates: Partial<ProgressLog>): Promise<void> {
    try {
      const updateData: Partial<ProgressLogRow> = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.images !== undefined) updateData.images = updates.images;
      if (updates.ratings !== undefined) updateData.ratings = updates.ratings;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { error } = await supabase
        .from('progress_logs')
        .update(updateData)
        .eq('id', logId);

      if (error) throw error;
    } catch (error) {
      console.error('진행 로그 업데이트 오류:', error);
      throw error;
    }
  }

  static async deleteProgressLog(logId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('progress_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
    } catch (error) {
      console.error('진행 로그 삭제 오류:', error);
      throw error;
    }
  }

  // 이미지 업로드
  static async uploadImage(bucket: string, path: string, file: Blob): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);

      if (error) throw error;
      if (!data) throw new Error('이미지 업로드 실패');

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      throw error;
    }
  }

  // 데이터 변환 헬퍼 함수들
  private static transformProfileToUser(profile: ProfileRow): User {
    return {
      id: profile.id,
      email: profile.email,
      nickname: profile.nickname,
      birthdate: profile.birthdate || undefined,
      profileImage: profile.profile_image_url || undefined,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  }

  private static transformProjectRowToProject(projectRow: any): Project {
    return {
      id: projectRow.id,
      userId: projectRow.user_id,
      name: projectRow.name,
      type: projectRow.type,
      recipeId: projectRow.recipe_id,
      startDate: projectRow.start_date,
      expectedEndDate: projectRow.expected_end_date,
      actualEndDate: projectRow.actual_end_date,
      status: projectRow.status,
      notes: projectRow.notes,
      images: projectRow.images || [],
      ingredients: projectRow.ingredients ? projectRow.ingredients.map(this.transformIngredientRowToIngredient) : [],
      progressLogs: projectRow.progress_logs ? projectRow.progress_logs.map(this.transformProgressLogRowToProgressLog) : [],
      createdAt: projectRow.created_at,
      updatedAt: projectRow.updated_at,
    };
  }

  private static transformProgressLogRowToProgressLog(logRow: ProgressLogRow): ProgressLog {
    return {
      id: logRow.id,
      projectId: logRow.project_id,
      date: logRow.date,
      title: logRow.title,
      description: logRow.description || undefined,
      images: logRow.images || [],
      ratings: logRow.ratings as any,
      color: logRow.color || undefined,
      notes: logRow.notes || undefined,
      createdAt: logRow.created_at,
      updatedAt: logRow.updated_at,
    };
  }

  private static transformIngredientRowToIngredient(ingredientRow: any): Ingredient {
    return {
      id: ingredientRow.id,
      projectId: ingredientRow.project_id,
      name: ingredientRow.name,
      quantity: ingredientRow.quantity || '',
      unit: ingredientRow.unit || '',
      notes: ingredientRow.notes,
    };
  }
}
