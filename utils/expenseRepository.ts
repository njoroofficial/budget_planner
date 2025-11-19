/**
 * Expense Repository
 * Handles all database operations for expenses
 */

import { supabase, getCurrentUserId, requireAuth } from './supabaseClient';
import type { Expense } from '@/types';
import type { Database } from '@/types/supabase';

type DbExpense = Database['public']['Tables']['expenses']['Row'];
type DbExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
type DbExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

/**
 * Map database expense to app Expense type
 */
function mapDbExpenseToExpense(dbExpense: DbExpense): Expense {
  return {
    id: dbExpense.id,
    categoryId: dbExpense.category_id,
    amount: Number(dbExpense.amount),
    description: dbExpense.description,
    date: dbExpense.expense_date // Already in ISO date format (YYYY-MM-DD)
  };
}

/**
 * Map app Expense to database expense insert
 */
function mapExpenseToDbInsert(
  userId: string,
  categoryId: string,
  amount: number,
  description: string,
  date: Date
): DbExpenseInsert {
  return {
    user_id: userId,
    category_id: categoryId,
    amount,
    description: description.trim(),
    expense_date: date.toISOString().split('T')[0] // Convert to YYYY-MM-DD format
  };
}

// ============================================================================
// EXPENSE OPERATIONS
// ============================================================================

/**
 * Get all expenses for a specific category
 */
export async function getExpensesByCategory(categoryId: string): Promise<Expense[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('category_id', categoryId)
      .eq('user_id', userId)
      .order('expense_date', { ascending: false });

    if (error) throw error;

    return data.map(mapDbExpenseToExpense);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw new Error('Failed to fetch expenses');
  }
}

/**
 * Get all expenses for the authenticated user
 */
export async function getAllExpenses(): Promise<Expense[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('expense_date', { ascending: false });

    if (error) throw error;

    return data.map(mapDbExpenseToExpense);
  } catch (error) {
    console.error('Error fetching all expenses:', error);
    throw new Error('Failed to fetch expenses');
  }
}

/**
 * Add a new expense
 */
export async function addExpenseToDb(
  categoryId: string,
  amount: number,
  description: string,
  date: Date
): Promise<Expense> {
  try {
    const userId = await requireAuth();

    // Verify the category exists and belongs to the user
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('user_id', userId)
      .single();

    if (categoryError || !category) {
      throw new Error('Category not found');
    }

    const expenseData: DbExpenseInsert = mapExpenseToDbInsert(userId, categoryId, amount, description, date);

    const { data, error } = await supabase
      .from('expenses')
      // @ts-expect-error - Supabase type inference issue with generic types
      .insert(expenseData)
      .select()
      .single();

    if (error) throw error;

    return mapDbExpenseToExpense(data);
  } catch (error) {
    console.error('Error adding expense:', error);
    if (error instanceof Error) throw error;
    throw new Error('Failed to add expense');
  }
}

/**
 * Update an existing expense
 */
export async function updateExpenseInDb(
  id: string,
  amount: number,
  description: string,
  date: Date
): Promise<Expense> {
  try {
    const userId = await requireAuth();

    const updateData: DbExpenseUpdate = {
      amount,
      description: description.trim(),
      expense_date: date.toISOString().split('T')[0]
    };

    const { data, error } = await supabase
      .from('expenses')
      // @ts-expect-error - Supabase type inference issue with generic types
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only update their own expenses
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Expense not found');
      }
      throw error;
    }

    return mapDbExpenseToExpense(data);
  } catch (error) {
    console.error('Error updating expense:', error);
    if (error instanceof Error) throw error;
    throw new Error('Failed to update expense');
  }
}

/**
 * Delete an expense
 */
export async function deleteExpenseFromDb(id: string): Promise<void> {
  try {
    const userId = await requireAuth();

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Expense not found');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    if (error instanceof Error) throw error;
    throw new Error('Failed to delete expense');
  }
}

/**
 * Get a single expense by ID
 */
export async function getExpenseById(id: string): Promise<Expense | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('expenses')
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

    return mapDbExpenseToExpense(data);
  } catch (error) {
    console.error('Error fetching expense:', error);
    throw new Error('Failed to fetch expense');
  }
}
