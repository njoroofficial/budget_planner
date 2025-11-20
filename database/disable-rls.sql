-- ============================================================================
-- DISABLE ROW LEVEL SECURITY FOR PERSONAL USE
-- ============================================================================
-- This script disables RLS on all tables for single-user personal applications
-- Run this in your Supabase SQL Editor if you're getting permission errors
--
-- Note: Only use this for personal, single-user applications
-- For multi-user apps, keep RLS enabled and add proper policies
-- ============================================================================

-- Disable RLS on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;

-- Verify RLS status
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'incomes', 'categories', 'expenses')
ORDER BY tablename;

-- Expected output: rls_enabled should be 'false' for all tables
