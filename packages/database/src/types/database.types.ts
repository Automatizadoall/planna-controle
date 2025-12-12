// Auto-generated Supabase types
// Run `npm run db:types` to regenerate after schema changes

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash' | 'other'
          balance: number
          initial_balance: number
          currency: string
          icon: string | null
          color: string | null
          is_archived: boolean
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type?: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash' | 'other'
          balance?: number
          initial_balance?: number
          currency?: string
          icon?: string | null
          color?: string | null
          is_archived?: boolean
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash' | 'other'
          balance?: number
          initial_balance?: number
          currency?: string
          icon?: string | null
          color?: string | null
          is_archived?: boolean
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          period: 'weekly' | 'monthly' | 'yearly'
          alert_threshold: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          period?: 'weekly' | 'monthly' | 'yearly'
          alert_threshold?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          period?: 'weekly' | 'monthly' | 'yearly'
          alert_threshold?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string | null
          name: string
          icon: string | null
          color: string | null
          type: 'income' | 'expense'
          parent_id: string | null
          is_system: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          icon?: string | null
          color?: string | null
          type: 'income' | 'expense'
          parent_id?: string | null
          is_system?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          icon?: string | null
          color?: string | null
          type?: 'income' | 'expense'
          parent_id?: string | null
          is_system?: boolean
          created_at?: string
        }
      }
      categorization_rules: {
        Row: {
          id: string
          user_id: string | null
          category_id: string
          pattern: string
          priority: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          category_id: string
          pattern: string
          priority?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          category_id?: string
          pattern?: string
          priority?: number
          is_active?: boolean
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          target_date: string | null
          icon: string | null
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          target_date?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
      }
      recurring_transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          category_id: string | null
          type: 'income' | 'expense' | 'transfer'
          amount: number
          description: string
          frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
          start_date: string
          end_date: string | null
          next_occurrence: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          category_id?: string | null
          type: 'income' | 'expense' | 'transfer'
          amount: number
          description: string
          frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
          start_date: string
          end_date?: string | null
          next_occurrence: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          category_id?: string | null
          type?: 'income' | 'expense' | 'transfer'
          amount?: number
          description?: string
          frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
          start_date?: string
          end_date?: string | null
          next_occurrence?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          category_id: string | null
          type: 'income' | 'expense' | 'transfer'
          amount: number
          description: string | null
          date: string
          tags: string[] | null
          to_account_id: string | null
          recurring_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          category_id?: string | null
          type: 'income' | 'expense' | 'transfer'
          amount: number
          description?: string | null
          date?: string
          tags?: string[] | null
          to_account_id?: string | null
          recurring_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          category_id?: string | null
          type?: 'income' | 'expense' | 'transfer'
          amount?: number
          description?: string | null
          date?: string
          tags?: string[] | null
          to_account_id?: string | null
          recurring_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      budget_status: {
        Row: {
          id: string | null
          user_id: string | null
          category_id: string | null
          limit_amount: number | null
          period: 'weekly' | 'monthly' | 'yearly' | null
          alert_threshold: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          category_name: string | null
          category_icon: string | null
          category_color: string | null
          spent: number | null
          percentage: number | null
          status: string | null
        }
      }
    }
    Functions: {
      auto_categorize: {
        Args: {
          p_user_id: string
          p_description: string
        }
        Returns: {
          category_id: string | null
          confidence: number
        }[]
      }
      calculate_next_occurrence: {
        Args: {
          p_date: string
          p_freq: 'daily' | 'weekly' | 'monthly' | 'yearly'
        }
        Returns: string
      }
      get_user_by_phone: {
        Args: {
          p_phone: string
        }
        Returns: {
          user_id: string | null
          full_name: string | null
          default_account_id: string | null
          default_account_name: string | null
          default_account_type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash' | 'other' | null
        }
      }
      get_accounts_by_phone: {
        Args: {
          p_phone: string
        }
        Returns: {
          account_id: string
          account_name: string
          account_type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash' | 'other'
          is_default: boolean
          balance: number
        }[]
      }
    }
    Enums: {
      account_type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash' | 'other'
      budget_period: 'weekly' | 'monthly' | 'yearly'
      category_type: 'income' | 'expense'
      recurring_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
      transaction_type: 'income' | 'expense' | 'transfer'
    }
    CompositeTypes: {
      phone_lookup_result: {
        user_id: string | null
        full_name: string | null
        default_account_id: string | null
        default_account_name: string | null
        default_account_type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash' | 'other' | null
      }
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row']

// Entity types
export type Profile = Tables<'profiles'>
export type Account = Tables<'accounts'>
export type Category = Tables<'categories'>
export type Transaction = Tables<'transactions'>
export type Budget = Tables<'budgets'>
export type Goal = Tables<'goals'>
export type RecurringTransaction = Tables<'recurring_transactions'>
export type CategorizationRule = Tables<'categorization_rules'>
export type BudgetStatus = Views<'budget_status'>

// Enum types
export type AccountType = Enums<'account_type'>
export type BudgetPeriod = Enums<'budget_period'>
export type CategoryType = Enums<'category_type'>
export type RecurringFrequency = Enums<'recurring_frequency'>
export type TransactionType = Enums<'transaction_type'>

// RPC types
export type PhoneLookupResult = Database['public']['CompositeTypes']['phone_lookup_result']
