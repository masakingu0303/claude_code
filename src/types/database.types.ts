export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          color: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
          color?: string | null;
          sort_order: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string | null;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: number;
          description: string | null;
          expense_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount: number;
          description?: string | null;
          expense_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          amount?: number;
          description?: string | null;
          expense_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Helper types
export type Category = Database['public']['Tables']['categories']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];

export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];

export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

// Extended types with relations
export type ExpenseWithCategory = Expense & {
  categories: Category;
};

export type ExpenseWithCategoryAndUser = Expense & {
  categories: Category;
  users: User;
};

// Form types for client components
export interface ExpenseForm {
  amount: number;
  category_id: string;
  description?: string;
  expense_date: Date;
}

export interface UserForm {
  name: string;
  email: string;
}