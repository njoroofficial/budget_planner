import { Expense } from '../types';
import { 
  addExpenseToDb, 
  updateExpenseInDb, 
  deleteExpenseFromDb,
  getExpensesByCategory as getExpensesByCategoryFromDb,
  getAllExpenses as getAllExpensesFromDb
} from './expenseRepository';
import { getAllCategoriesWithExpenses } from './budgetRepository';

/**
 * Expense Tracker Utility
 * Handles expense management operations including adding, updating, deleting expenses,
 * and calculating spending totals for the Budget Planner application.
 * 
 * NOTE: This utility now uses Supabase for persistence instead of localStorage.
 * All functions are async and return Promises.
 */

/**
 * Adds a new expense to a category
 * @param categoryId - ID of the category to add the expense to
 * @param amount - Expense amount (must be positive)
 * @param description - Description of the expense
 * @param date - Date of the expense
 * @returns The newly created expense
 * @throws Error if category not found, amount is invalid, or description is empty
 */
export async function addExpense(
  categoryId: string,
  amount: number,
  description: string,
  date: Date
): Promise<Expense> {
  // Validate inputs
  if (amount <= 0) {
    throw new Error('Expense amount must be a positive number');
  }

  if (!description || description.trim().length === 0) {
    throw new Error('Expense description cannot be empty');
  }

  // Add expense to database (category existence is checked in repository)
  return await addExpenseToDb(categoryId, amount, description, date);
}

/**
 * Updates an existing expense
 * @param expenseId - ID of the expense to update
 * @param amount - New expense amount (must be positive)
 * @param description - New description of the expense
 * @param date - New date of the expense
 * @returns The updated expense
 * @throws Error if expense not found, amount is invalid, or description is empty
 */
export async function updateExpense(
  expenseId: string,
  amount: number,
  description: string,
  date: Date
): Promise<Expense> {
  // Validate inputs
  if (amount <= 0) {
    throw new Error('Expense amount must be a positive number');
  }

  if (!description || description.trim().length === 0) {
    throw new Error('Expense description cannot be empty');
  }

  // Update expense in database
  return await updateExpenseInDb(expenseId, amount, description, date);
}

/**
 * Deletes an expense
 * @param expenseId - ID of the expense to delete
 * @throws Error if expense not found
 */
export async function deleteExpense(expenseId: string): Promise<void> {
  // Delete expense from database
  await deleteExpenseFromDb(expenseId);
}

/**
 * Gets all expenses for a specific category
 * @param categoryId - ID of the category
 * @returns Array of expenses for the specified category
 */
export async function getExpensesByCategory(categoryId: string): Promise<Expense[]> {
  return await getExpensesByCategoryFromDb(categoryId);
}

/**
 * Calculates the total amount spent across all categories
 * @returns Total amount spent across all categories
 */
export async function getTotalSpent(): Promise<number> {
  const categories = await getAllCategoriesWithExpenses();
  return categories.reduce((total, category) => total + category.actualSpent, 0);
}

/**
 * Calculates the total amount spent in a specific category
 * @param categoryId - ID of the category
 * @returns Total amount spent in the specified category
 */
export async function getCategorySpending(categoryId: string): Promise<number> {
  const expenses = await getExpensesByCategoryFromDb(categoryId);
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Get all expenses for the current user
 * @returns Array of all expenses
 */
export async function getAllExpenses(): Promise<Expense[]> {
  return await getAllExpensesFromDb();
}