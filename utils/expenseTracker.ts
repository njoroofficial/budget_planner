import { Category, Expense } from '../types';

/**
 * Expense Tracker Utility
 * Handles expense management operations including adding, updating, deleting expenses,
 * and calculating spending totals for the Budget Planner application.
 */

/**
 * Adds a new expense to a category and updates the category's actualSpent amount
 * @param categories - Current array of categories
 * @param categoryId - ID of the category to add the expense to
 * @param amount - Expense amount (must be positive)
 * @param description - Description of the expense
 * @param date - Date of the expense
 * @returns Updated categories array with the new expense
 * @throws Error if category not found, amount is invalid, or description is empty
 */
export function addExpense(
  categories: Category[],
  categoryId: string,
  amount: number,
  description: string,
  date: Date
): Category[] {
  // Validate inputs
  if (amount <= 0) {
    throw new Error('Expense amount must be a positive number');
  }

  if (!description || description.trim().length === 0) {
    throw new Error('Expense description cannot be empty');
  }

  // Find the category
  const categoryIndex = categories.findIndex(category => category.id === categoryId);
  
  if (categoryIndex === -1) {
    throw new Error('Category not found');
  }

  // Create new expense
  const newExpense: Expense = {
    id: generateExpenseId(),
    categoryId,
    amount,
    description: description.trim(),
    date: date.toISOString()
  };

  // Update categories array
  const updatedCategories = [...categories];
  const category = { ...updatedCategories[categoryIndex] };
  
  // Add expense to category
  category.expenses = [...category.expenses, newExpense];
  
  // Update actualSpent amount
  category.actualSpent = category.expenses.reduce((total, expense) => total + expense.amount, 0);
  
  updatedCategories[categoryIndex] = category;

  return updatedCategories;
}

/**
 * Updates an existing expense and recalculates the category's actualSpent amount
 * @param categories - Current array of categories
 * @param expenseId - ID of the expense to update
 * @param amount - New expense amount (must be positive)
 * @param description - New description of the expense
 * @param date - New date of the expense
 * @returns Updated categories array with the modified expense
 * @throws Error if expense not found, amount is invalid, or description is empty
 */
export function updateExpense(
  categories: Category[],
  expenseId: string,
  amount: number,
  description: string,
  date: Date
): Category[] {
  // Validate inputs
  if (amount <= 0) {
    throw new Error('Expense amount must be a positive number');
  }

  if (!description || description.trim().length === 0) {
    throw new Error('Expense description cannot be empty');
  }

  // Find the category and expense
  let categoryIndex = -1;
  let expenseIndex = -1;

  for (let i = 0; i < categories.length; i++) {
    const expIdx = categories[i].expenses.findIndex(expense => expense.id === expenseId);
    if (expIdx !== -1) {
      categoryIndex = i;
      expenseIndex = expIdx;
      break;
    }
  }

  if (categoryIndex === -1 || expenseIndex === -1) {
    throw new Error('Expense not found');
  }

  // Update categories array
  const updatedCategories = [...categories];
  const category = { ...updatedCategories[categoryIndex] };
  
  // Update expense
  category.expenses = [...category.expenses];
  category.expenses[expenseIndex] = {
    ...category.expenses[expenseIndex],
    amount,
    description: description.trim(),
    date: date.toISOString()
  };
  
  // Recalculate actualSpent amount
  category.actualSpent = category.expenses.reduce((total, expense) => total + expense.amount, 0);
  
  updatedCategories[categoryIndex] = category;

  return updatedCategories;
}

/**
 * Deletes an expense and recalculates the category's actualSpent amount
 * @param categories - Current array of categories
 * @param expenseId - ID of the expense to delete
 * @returns Updated categories array without the deleted expense
 * @throws Error if expense not found
 */
export function deleteExpense(categories: Category[], expenseId: string): Category[] {
  // Find the category and expense
  let categoryIndex = -1;
  let expenseIndex = -1;

  for (let i = 0; i < categories.length; i++) {
    const expIdx = categories[i].expenses.findIndex(expense => expense.id === expenseId);
    if (expIdx !== -1) {
      categoryIndex = i;
      expenseIndex = expIdx;
      break;
    }
  }

  if (categoryIndex === -1 || expenseIndex === -1) {
    throw new Error('Expense not found');
  }

  // Update categories array
  const updatedCategories = [...categories];
  const category = { ...updatedCategories[categoryIndex] };
  
  // Remove expense
  category.expenses = category.expenses.filter(expense => expense.id !== expenseId);
  
  // Recalculate actualSpent amount
  category.actualSpent = category.expenses.reduce((total, expense) => total + expense.amount, 0);
  
  updatedCategories[categoryIndex] = category;

  return updatedCategories;
}

/**
 * Gets all expenses for a specific category
 * @param categories - Array of categories
 * @param categoryId - ID of the category
 * @returns Array of expenses for the specified category
 * @throws Error if category not found
 */
export function getExpensesByCategory(categories: Category[], categoryId: string): Expense[] {
  const category = categories.find(cat => cat.id === categoryId);
  
  if (!category) {
    throw new Error('Category not found');
  }

  return [...category.expenses];
}

/**
 * Calculates the total amount spent across all categories
 * @param categories - Array of categories
 * @returns Total amount spent across all categories
 */
export function getTotalSpent(categories: Category[]): number {
  return categories.reduce((total, category) => total + category.actualSpent, 0);
}

/**
 * Calculates the total amount spent in a specific category
 * @param categories - Array of categories
 * @param categoryId - ID of the category
 * @returns Total amount spent in the specified category
 * @throws Error if category not found
 */
export function getCategorySpending(categories: Category[], categoryId: string): number {
  const category = categories.find(cat => cat.id === categoryId);
  
  if (!category) {
    throw new Error('Category not found');
  }

  return category.actualSpent;
}

/**
 * Generates a unique ID for a new expense
 * @returns Unique string ID
 */
function generateExpenseId(): string {
  return `expense_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}