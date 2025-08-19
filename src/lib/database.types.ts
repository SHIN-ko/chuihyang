export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          nickname: string
          birthdate: string | null
          profile_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nickname: string
          birthdate?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nickname?: string
          birthdate?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          recipe_id: string | null
          start_date: string
          expected_end_date: string
          actual_end_date: string | null
          status: string
          notes: string | null
          images: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          recipe_id?: string | null
          start_date: string
          expected_end_date: string
          actual_end_date?: string | null
          status?: string
          notes?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          recipe_id?: string | null
          start_date?: string
          expected_end_date?: string
          actual_end_date?: string | null
          status?: string
          notes?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      progress_logs: {
        Row: {
          id: string
          project_id: string
          date: string
          title: string
          description: string | null
          images: string[] | null
          ratings: Json | null
          color: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          date: string
          title: string
          description?: string | null
          images?: string[] | null
          ratings?: Json | null
          color?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          date?: string
          title?: string
          description?: string | null
          images?: string[] | null
          ratings?: Json | null
          color?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      ingredients: {
        Row: {
          id: string
          project_id: string
          name: string
          quantity: string | null
          unit: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          quantity?: string | null
          unit?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          quantity?: string | null
          unit?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status: "planning" | "in_progress" | "completed" | "paused"
      project_type: "whiskey" | "gin" | "rum" | "fruit_wine" | "vodka" | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
