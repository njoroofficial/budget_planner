/**
 * Supabase Database Type Definitions
 * Auto-generated types for type-safe database access
 * 
 * To regenerate these types, run:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
 */

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
          email: string | null
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      incomes: {
        Row: {
          id: string
          user_id: string
          gross_pay: number
          sha: number
          payee: number
          housing_levy: number
          total_deductions: number
          net_pay: number
          is_current: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gross_pay: number
          sha?: number
          payee?: number
          housing_levy?: number
          total_deductions?: number
          net_pay: number
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gross_pay?: number
          sha?: number
          payee?: number
          housing_levy?: number
          total_deductions?: number
          net_pay?: number
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          planned_amount: number
          actual_spent: number
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          planned_amount?: number
          actual_spent?: number
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          planned_amount?: number
          actual_spent?: number
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          description: string
          expense_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          description: string
          expense_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          description?: string
          expense_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_income: {
        Args: { user_uuid: string }
        Returns: {
          id: string
          gross_pay: number
          sha: number
          payee: number
          housing_levy: number
          total_deductions: number
          net_pay: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
