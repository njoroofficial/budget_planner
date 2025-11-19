import { Category } from '../types';
import { 
  createCategoryInDb, 
  updateCategoryInDb, 
  deleteCategoryFromDb,
  getAllCategoriesWithExpenses 
} from './budgetRepository';

/**
 * Budget Manager Utility
 * Handles budget category management operations including creation, updates, deletion,
 * and budget calculations for the Budget Planner application.
 * 
 * NOTE: This utility now uses Supabase for persistence instead of localStorage.
 * All functions are async and return Promises.
 */

/**
 * Creates a new budget category with duplicate name validation
 * @param name - Name of the new category (must be unique and non-empty)
 * @param plannedAmount - Planned budget amount for the category (must be positive)
 * @returns Newly created category
 * @throws Error if category name is empty, duplicate, or planned amount is invalid
 */
export async function createCategory(
  name: string,
  plannedAmount: number
): Promise<Category> {
  // Validate category name
  if (!name || name.trim().length === 0) {
    throw new Error('Category name cannot be empty');
  }

  // Validate planned amount
  if (plannedAmount < 0) {
    throw new Error('Planned amount must be a positive number');
  }

  // Create category in database (handles duplicate check via unique constraint)
  return await createCategoryInDb(name, plannedAmount);
}

/**
 * Updates an existing budget category
 * @param id - ID of the category to update
 * @param name - New name for the category (must be unique and non-empty)
 * @param plannedAmount - New planned budget amount (must be positive)
 * @returns Updated category
 * @throws Error if category not found, name is invalid, or planned amount is invalid
 */
export async function updateCategory(
  id: string,
  name: string,
  plannedAmount: number
): Promise<Category> {
  // Validate category name
  if (!name || name.trim().length === 0) {
    throw new Error('Category name cannot be empty');
  }

  // Validate planned amount
  if (plannedAmount < 0) {
    throw new Error('Planned amount must be a positive number');
  }

  // Update category in database (handles duplicate check and not found errors)
  return await updateCategoryInDb(id, name, plannedAmount);
}

/**
 * Deletes a budget category and all its associated expenses
 * @param id - ID of the category to delete
 * @throws Error if category not found
 */
export async function deleteCategory(id: string): Promise<void> {
  // Delete category from database (cascade deletes expenses)
  await deleteCategoryFromDb(id);
}

/**
 * Calculates the total allocated amount across all budget categories
 * @param categories - Array of categories
 * @returns Total planned amount across all categories
 */
export function getTotalAllocated(categories: Category[]): number {
  return categories.reduce((total, category) => total + category.plannedAmount, 0);
}

/**
 * Calculates the remaining unallocated budget from net pay
 * @param categories - Array of categories
 * @param netPay - Net pay amount after deductions
 * @returns Remaining budget (net pay minus total allocated)
 */
export function getRemainingBudget(categories: Category[], netPay: number): number {
  const totalAllocated = getTotalAllocated(categories);
  return netPay - totalAllocated;
}

/**
 * Fetch all categories with their expenses from the database
 * @returns Array of categories with expenses
 */
export async function getAllCategories(): Promise<Category[]> {
  return await getAllCategoriesWithExpenses();
}