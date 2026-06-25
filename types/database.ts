export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TaskStatus = 'active' | 'completed' | 'archived' | 'deleted'
export type TaskOwner = 'tim' | 'wife' | 'anyone'
export type TaskLocation = 'indoor' | 'outdoor'
export type TaskPriority = 1 | 2 | 3 | 4

export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string
          name: string
          invitation_token: string | null
          invitation_used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          invitation_token?: string | null
          invitation_used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          invitation_token?: string | null
          invitation_used?: boolean
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          household_id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          household_id: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          email?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          household_id: string
          title: string
          priority: TaskPriority
          manual_order: number
          owner: TaskOwner
          location: TaskLocation
          status: TaskStatus
          description: string | null
          notes: string | null
          is_pinned: boolean
          created_by: string
          created_at: string
          updated_at: string
          completed_at: string | null
          archived_at: string | null
        }
        Insert: {
          id?: string
          household_id: string
          title: string
          priority: TaskPriority
          manual_order?: number
          owner?: TaskOwner
          location?: TaskLocation
          status?: TaskStatus
          description?: string | null
          notes?: string | null
          is_pinned?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          archived_at?: string | null
        }
        Update: {
          id?: string
          household_id?: string
          title?: string
          priority?: TaskPriority
          manual_order?: number
          owner?: TaskOwner
          location?: TaskLocation
          status?: TaskStatus
          description?: string | null
          notes?: string | null
          is_pinned?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          archived_at?: string | null
        }
      }
      checklist_items: {
        Row: {
          id: string
          task_id: string
          text: string
          completed: boolean
          manual_order: number
        }
        Insert: {
          id?: string
          task_id: string
          text: string
          completed?: boolean
          manual_order?: number
        }
        Update: {
          id?: string
          task_id?: string
          text?: string
          completed?: boolean
          manual_order?: number
        }
      }
      shopping_items: {
        Row: {
          id: string
          task_id: string
          name: string
          quantity: string | null
          completed: boolean
          manual_order: number
        }
        Insert: {
          id?: string
          task_id: string
          name: string
          quantity?: string | null
          completed?: boolean
          manual_order?: number
        }
        Update: {
          id?: string
          task_id?: string
          name?: string
          quantity?: string | null
          completed?: boolean
          manual_order?: number
        }
      }
      links: {
        Row: {
          id: string
          task_id: string
          title: string | null
          url: string
          manual_order: number
        }
        Insert: {
          id?: string
          task_id: string
          title?: string | null
          url: string
          manual_order?: number
        }
        Update: {
          id?: string
          task_id?: string
          title?: string | null
          url?: string
          manual_order?: number
        }
      }
      task_history: {
        Row: {
          id: string
          task_id: string
          changed_by: string
          changed_at: string
          change_summary: string
        }
        Insert: {
          id?: string
          task_id: string
          changed_by: string
          changed_at?: string
          change_summary: string
        }
        Update: {
          id?: string
          task_id?: string
          changed_by?: string
          changed_at?: string
          change_summary?: string
        }
      }
    }
  }
}
