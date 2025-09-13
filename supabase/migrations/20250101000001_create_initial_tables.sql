-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_claims_namespace" = 'app_metadata';

-- Create categories table (master data)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (read-only for all authenticated users)
CREATE POLICY "Categories are readable by authenticated users"
ON categories
FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for users
CREATE POLICY "Users can view own data"
ON users
FOR SELECT
TO authenticated
USING (
  id = (current_setting('request.headers', true)::json->>'x-clerk-user-id')
  OR
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

CREATE POLICY "Users can update own data"
ON users
FOR UPDATE
TO authenticated
USING (
  id = (current_setting('request.headers', true)::json->>'x-clerk-user-id')
  OR
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

CREATE POLICY "Users can insert own data"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
  id = (current_setting('request.headers', true)::json->>'x-clerk-user-id')
  OR
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- RLS Policies for expenses
CREATE POLICY "Users can view own expenses"
ON expenses
FOR SELECT
TO authenticated
USING (
  user_id = (current_setting('request.headers', true)::json->>'x-clerk-user-id')
  OR
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

CREATE POLICY "Users can insert own expenses"
ON expenses
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (current_setting('request.headers', true)::json->>'x-clerk-user-id')
  OR
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

CREATE POLICY "Users can update own expenses"
ON expenses
FOR UPDATE
TO authenticated
USING (
  user_id = (current_setting('request.headers', true)::json->>'x-clerk-user-id')
  OR
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

CREATE POLICY "Users can delete own expenses"
ON expenses
FOR DELETE
TO authenticated
USING (
  user_id = (current_setting('request.headers', true)::json->>'x-clerk-user-id')
  OR
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert category master data
INSERT INTO categories (name, slug, icon, color, sort_order) VALUES
('食費', 'food', '🍽️', '#ef4444', 1),
('日用品', 'daily-items', '🧴', '#f97316', 2),
('交通費', 'transportation', '🚗', '#eab308', 3),
('娯楽', 'entertainment', '🎮', '#22c55e', 4),
('衣服・美容', 'clothing-beauty', '👕', '#06b6d4', 5),
('医療・健康', 'medical-health', '🏥', '#3b82f6', 6),
('住居費', 'housing', '🏠', '#8b5cf6', 7),
('通信費', 'communication', '📱', '#ec4899', 8),
('その他', 'others', '📋', '#6b7280', 9);