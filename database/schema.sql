-- ============================================================================
-- Budget Planner Database Schema
-- ============================================================================
-- This file contains the complete database schema for the Budget Planner app
-- Run this in your Supabase SQL Editor to set up the database
--
-- Features:
-- - Income tracking with historical records
-- - Budget categories with planning
-- - Expense tracking
-- - Automatic timestamp management
-- - Row Level Security (RLS) for data isolation (disabled for single-user)
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Profiles Table (Optional - for future multi-user support)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- Incomes Table
-- Stores income information with statutory deductions
-- Multiple records per user for historical tracking
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.incomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    gross_pay NUMERIC(12, 2) NOT NULL CHECK (gross_pay >= 0),
    sha NUMERIC(12, 2) DEFAULT 0 CHECK (sha >= 0),
    payee NUMERIC(12, 2) DEFAULT 0 CHECK (payee >= 0),
    housing_levy NUMERIC(12, 2) DEFAULT 0 CHECK (housing_levy >= 0),
    total_deductions NUMERIC(12, 2) DEFAULT 0 CHECK (total_deductions >= 0),
    net_pay NUMERIC(12, 2) NOT NULL CHECK (net_pay >= 0),
    is_current BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON public.incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_is_current ON public.incomes(is_current);
CREATE INDEX IF NOT EXISTS idx_incomes_created_at ON public.incomes(created_at DESC);

-- ----------------------------------------------------------------------------
-- Categories Table
-- Stores budget categories with planned amounts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    planned_amount NUMERIC(12, 2) DEFAULT 0 CHECK (planned_amount >= 0),
    actual_spent NUMERIC(12, 2) DEFAULT 0 CHECK (actual_spent >= 0),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure unique category names per user
    CONSTRAINT unique_user_category UNIQUE (user_id, name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);

-- ----------------------------------------------------------------------------
-- Expenses Table
-- Stores individual expenses linked to categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses(expense_date DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function to automatically update updated_at timestamp
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Function to update category actual_spent based on expenses
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_category_actual_spent()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate actual_spent for the affected category
    UPDATE public.categories
    SET actual_spent = (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.expenses
        WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
    )
    WHERE id = COALESCE(NEW.category_id, OLD.category_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Function to get current income for a user
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_current_income(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    gross_pay NUMERIC,
    sha NUMERIC,
    payee NUMERIC,
    housing_levy NUMERIC,
    total_deductions NUMERIC,
    net_pay NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.gross_pay,
        i.sha,
        i.payee,
        i.housing_levy,
        i.total_deductions,
        i.net_pay
    FROM public.incomes i
    WHERE i.user_id = user_uuid
        AND i.is_current = true
    ORDER BY i.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on incomes
DROP TRIGGER IF EXISTS update_incomes_updated_at ON public.incomes;
CREATE TRIGGER update_incomes_updated_at
    BEFORE UPDATE ON public.incomes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at on categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at on expenses
DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update category actual_spent when expense is added/updated/deleted
DROP TRIGGER IF EXISTS update_category_spent_on_insert ON public.expenses;
CREATE TRIGGER update_category_spent_on_insert
    AFTER INSERT ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_category_actual_spent();

DROP TRIGGER IF EXISTS update_category_spent_on_update ON public.expenses;
CREATE TRIGGER update_category_spent_on_update
    AFTER UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_category_actual_spent();

DROP TRIGGER IF EXISTS update_category_spent_on_delete ON public.expenses;
CREATE TRIGGER update_category_spent_on_delete
    AFTER DELETE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_category_actual_spent();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Note: For single-user personal app, we're disabling RLS
-- If you want to enable it later for multi-user support, uncomment below

-- Enable RLS on tables
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Policies for single user (replace 'your-user-id' with your NEXT_PUBLIC_USER_ID)
-- Or use authenticated user policies for future auth integration

-- DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
-- CREATE POLICY "Users can view their own profile" ON public.profiles
--     FOR SELECT USING (true);

-- DROP POLICY IF EXISTS "Users can view their own incomes" ON public.incomes;
-- CREATE POLICY "Users can view their own incomes" ON public.incomes
--     FOR ALL USING (true);

-- DROP POLICY IF EXISTS "Users can manage their own categories" ON public.categories;
-- CREATE POLICY "Users can manage their own categories" ON public.categories
--     FOR ALL USING (true);

-- DROP POLICY IF EXISTS "Users can manage their own expenses" ON public.expenses;
-- CREATE POLICY "Users can manage their own expenses" ON public.expenses
--     FOR ALL USING (true);

-- ============================================================================
-- SAMPLE DATA (Optional - uncomment to insert sample data)
-- ============================================================================

-- Replace '00000000-0000-0000-0000-000000000001' with your NEXT_PUBLIC_USER_ID

/*
-- Insert sample income
INSERT INTO public.incomes (user_id, gross_pay, sha, payee, housing_levy, total_deductions, net_pay, is_current)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    100000.00,
    2750.00,
    16100.00,
    1500.00,
    20350.00,
    79650.00,
    true
);

-- Insert sample categories
INSERT INTO public.categories (user_id, name, planned_amount, display_order)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Rent', 25000.00, 0),
    ('00000000-0000-0000-0000-000000000001', 'Transport', 5000.00, 1),
    ('00000000-0000-0000-0000-000000000001', 'Savings', 15000.00, 2),
    ('00000000-0000-0000-0000-000000000001', 'Food', 10000.00, 3),
    ('00000000-0000-0000-0000-000000000001', 'Utilities', 4000.00, 4),
    ('00000000-0000-0000-0000-000000000001', 'Entertainment', 3000.00, 5);
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if tables were created successfully
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check incomes
-- SELECT * FROM public.incomes;

-- Check categories
-- SELECT * FROM public.categories ORDER BY display_order;

-- Check expenses
-- SELECT * FROM public.expenses ORDER BY expense_date DESC;

-- Check current income
-- SELECT * FROM get_current_income('00000000-0000-0000-0000-000000000001');
