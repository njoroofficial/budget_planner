import { Category } from '../types';

/**
 * Budget Manager Utility
 * Handles budget category management operations including creation, updates, deletion,
 * and budget calculations for the Budget Planner application.
 */

/**
 * Creates a new budget category with duplicate name validation
 * @param categories - Current array of categories
 * @param name - Name of the new category (must be unique and non-empty)
 * @param plannedAmount - Planned budget amount for the category (must be positive)
 * @returns Updated categories array with the new category
 * @throws Error if category name is empty, duplicate, or planned amount is invalid
 */
export function createCategory(
  categories: Category[],
  name: string,
  plannedAmount: number
): Category[] {
  // Validate category name
  if (!name || name.trim().length === 0) {
    throw new Error('Category name cannot be empty');
  }

  const trimmedName = name.trim();

  // Check for duplicate names (case-insensitive)
  const isDuplicate = categories.some(
    category => category.name.toLowerCase() === trimmedName.toLowerCase()
  );

  if (isDuplicate) {
    throw new Error('Category name already exists');
  }

  // Validate planned amount
  if (plannedAmount < 0) {
    throw new Error('Planned amount must be a positive number');
  }

  // Create new category
  const newCategory: Category = {
    id: generateCategoryId(),
    name: trimmedName,
    plannedAmount,
    actualSpent: 0,
    expenses: []
  };

  return [...categories, newCategory];
}

/**
 * Updates an existing budget category
 * @param categories - Current array of categories
 * @param id - ID of the category to update
 * @param name - New name for the category (must be unique and non-empty)
 * @param plannedAmount - New planned budget amount (must be positive)
 * @returns Updated categories array
 * @throws Error if category not found, name is invalid, or planned amount is invalid
 */
export function updateCategory(
  categories: Category[],
  id: string,
  name: string,
  plannedAmount: number
): Category[] {
  // Find the category to update
  const categoryIndex = categories.findIndex(category => category.id === id);
  
  if (categoryIndex === -1) {
    throw new Error('Category not found');
  }

  // Validate category name
  if (!name || name.trim().length === 0) {
    throw new Error('Category name cannot be empty');
  }

  const trimmedName = name.trim();

  // Check for duplicate names (excluding the current category)
  const isDuplicate = categories.some(
    (category, index) => 
      index !== categoryIndex && 
      category.name.toLowerCase() === trimmedName.toLowerCase()
  );

  if (isDuplicate) {
    throw new Error('Category name already exists');
  }

  // Validate planned amount
  if (plannedAmount < 0) {
    throw new Error('Planned amount must be a positive number');
  }

  // Update the category
  const updatedCategories = [...categories];
  updatedCategories[categoryIndex] = {
    ...updatedCategories[categoryIndex],
    name: trimmedName,
    plannedAmount
  };

  return updatedCategories;
}

/**
 * Deletes a budget category and all its associated expenses
 * @param categories - Current array of categories
 * @param id - ID of the category to delete
 * @returns Updated categories array without the deleted category
 * @throws Error if category not found
 */
export function deleteCategory(categories: Category[], id: string): Category[] {
  const categoryExists = categories.some(category => category.id === id);
  
  if (!categoryExists) {
    throw new Error('Category not found');
  }

  return categories.filter(category => category.id !== id);
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
 * Generates a unique ID for a new category
 * @returns Unique string ID
 */
function generateCategoryId(): string {
  return `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}