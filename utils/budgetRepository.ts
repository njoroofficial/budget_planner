/**
 * Budget Repository
 * Handles all database operations for categories and incomes
 */

import { supabase, getCurrentUserId, requireAuth } from './supabaseClient';
import type { Category, PayBreakdown } from '@/types';
import type { Database } from '@/types/supabase';

type DbCategory = Database['public']['Tables']['categories']['Row'];
type DbCategoryInsert = Database['public']['Tables']['categories']['Insert'];
type DbCategoryUpdate = Database['public']['Tables']['categories']['Update'];

type DbIncome = Database['public']['Tables']['incomes']['Row'];
type DbIncomeInsert = Database['public']['Tables']['incomes']['Insert'];
type DbIncomeUpdate = Database['public']['Tables']['incomes']['Update'];

/**
 * Map database category to app Category type
 */
function mapDbCategoryToCategory(dbCategory: DbCategory, expenses: any[] = []): Category {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    plannedAmount: Number(dbCategory.planned_amount),
    actualSpent: Number(dbCategory.actual_spent),
    expenses: expenses
  };
}

/**
 * Map PayBreakdown to database income insert
 */
function mapPayBreakdownToDbIncome(userId: string, payBreakdown: PayBreakdown): DbIncomeInsert {
  return {
    user_id: userId,
    gross_pay: payBreakdown.grossPay,
    sha: payBreakdown.sha,
    payee: payBreakdown.payee,
    housing_levy: payBreakdown.housingLevy,
    total_deductions: payBreakdown.totalDeductions,
    net_pay: payBreakdown.netPay,
    is_current: true
  };
}

/**
 * Map database income to PayBreakdown type
 */
function mapDbIncomeToPayBreakdown(dbIncome: DbIncome): PayBreakdown {
  return {
    grossPay: Number(dbIncome.gross_pay),
    sha: Number(dbIncome.sha),
    payee: Number(dbIncome.payee),
    housingLevy: Number(dbIncome.housing_levy),
    totalDeductions: Number(dbIncome.total_deductions),
    netPay: Number(dbIncome.net_pay)
  };
}

// ============================================================================
// INCOME OPERATIONS
// ============================================================================

/**
 * Get current income for the authenticated user
 */
export async function getCurrentIncome(): Promise<PayBreakdown | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_current', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned, user has no income yet
        return null;
      }
      throw error;
    }

    return data ? mapDbIncomeToPayBreakdown(data) : null;
  } catch (error) {
    console.error('Error fetching current income:', error);
    throw new Error('Failed to fetch income data');
  }
}

/**
 * Save or update income for the authenticated user
 * Sets is_current = false for all previous incomes
 */
export async function saveIncome(payBreakdown: PayBreakdown): Promise<PayBreakdown> {
  try {
    const userId = await requireAuth();
    // First, set all existing incomes to not current
    const updateData: DbIncomeUpdate = { is_current: false };
    const { error: updateError } = await supabase
      .from('incomes')
      // @ts-expect-error - Supabase type inference issue with generic types
      .update(updateData)
      .eq('user_id', userId)
      .eq('is_current', true);

    if (updateError) {
      console.error('Error updating previous incomes:', updateError);
      // Continue anyway - this isn't critical
    }

    // Insert new income as current
    const incomeData: DbIncomeInsert = mapPayBreakdownToDbIncome(userId, payBreakdown);
    const { data, error } = await supabase
      .from('incomes')
      // @ts-expect-error - Supabase type inference issue with generic types
      .insert(incomeData)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    return mapDbIncomeToPayBreakdown(data);
  } catch (error) {
    console.error('Error saving income:', error);
    throw new Error('Failed to save income data');
  }
}

// ============================================================================
// CATEGORY OPERATIONS
// ============================================================================

/**
 * Get all categories for the authenticated user
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true });

    if (error) throw error;

    // For each category, we'll fetch expenses separately (done in expense repository)
    // For now, return categories with empty expenses arrays
    return data.map(cat => mapDbCategoryToCategory(cat, []));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

/**
 * Get all categories with their expenses populated
 */
export async function getAllCategoriesWithExpenses(): Promise<Category[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    // Fetch categories with their expenses in a single query using join
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        expenses (
          id,
          category_id,
          amount,
          description,
          expense_date
        )
      `)
      .eq('user_id', userId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    // Map the data to Category type
    return data.map((cat: any) => {
      const expenses = (cat.expenses as any[] || []).map((exp: any) => ({
        id: exp.id,
        categoryId: exp.category_id,
        amount: Number(exp.amount),
        description: exp.description,
        date: exp.expense_date
      }));

      return mapDbCategoryToCategory(cat, expenses);
    });
  } catch (error) {
    console.error('Error fetching categories with expenses:', error);
    throw new Error('Failed to fetch categories with expenses');
  }
}

/**
 * Create a new category
 */
export async function createCategoryInDb(name: string, plannedAmount: number): Promise<Category> {
  try {
    const userId = await requireAuth();
    console.log('Creating category with userId:', userId);

    // Get the highest display_order to append new category at the end
    const { data: maxOrderData, error: maxOrderError } = await supabase
      .from('categories')
      .select('display_order')
      .eq('user_id', userId)
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxOrderError) {
      console.error('Error fetching max display order:', maxOrderError);
    }

    const nextOrder = maxOrderData ? (maxOrderData as any).display_order + 1 : 0;

    const categoryData: DbCategoryInsert = {
      user_id: userId,
      name: name.trim(),
      planned_amount: plannedAmount,
      actual_spent: 0,
      display_order: nextOrder
    };

    console.log('Inserting category data:', categoryData);

    const { data, error } = await supabase
      .from('categories')
      // @ts-expect-error - Supabase type inference issue with generic types
      .insert([categoryData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === '23505') {
        // Unique constraint violation
        throw new Error('Category name already exists');
      }
      if (error.code === '42501') {
        // Permission denied
        throw new Error('Database permission denied. Please check RLS policies or disable RLS.');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from database insert');
    }

    console.log('Category created successfully:', data);
    return mapDbCategoryToCategory(data, []);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof Error) throw error;
    throw new Error('Failed to create category');
  }
}

/**
 * Update an existing category
 */
export async function updateCategoryInDb(
  id: string,
  name: string,
  plannedAmount: number
): Promise<Category> {
  try {
    const userId = await requireAuth();

    const updateData: DbCategoryUpdate = {
      name: name.trim(),
      planned_amount: plannedAmount
    };

    const { data, error } = await supabase
      .from('categories')
      // @ts-expect-error - Supabase type inference issue with generic types
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only update their own categories
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Category name already exists');
      }
      if (error.code === 'PGRST116') {
        throw new Error('Category not found');
      }
      throw error;
    }

    return mapDbCategoryToCategory(data, []);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error instanceof Error) throw error;
    throw new Error('Failed to update category');
  }
}

/**
 * Delete a category and all its expenses
 */
export async function deleteCategoryFromDb(id: string): Promise<void> {
  try {
    const userId = await requireAuth();

    // Delete category (expenses will be cascade deleted)
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Category not found');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error instanceof Error) throw error;
    throw new Error('Failed to delete category');
  }
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return mapDbCategoryToCategory(data, []);
  } catch (error) {
    console.error('Error fetching category:', error);
    throw new Error('Failed to fetch category');
  }
}
