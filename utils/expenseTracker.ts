import { Expense, Category } from '../types';
import { saveAllCategories, getAllCategories } from './budgetManager';
import { v4 as uuidv4 } from 'uuid';

export function addExpense(categoryId: string, amount: number, description: string, date: Date): Expense {
  if (amount <= 0) {
    throw new Error('Expense amount must be a positive number');
  }

  if (!description || description.trim().length === 0) {
    throw new Error('Expense description cannot be empty');
  }

  const categories = getAllCategories();
  const categoryIndex = categories.findIndex(cat => cat.id === categoryId);

  if (categoryIndex === -1) {
    throw new Error('Category not found');
  }

  const newExpense: Expense = {
    id: uuidv4(),
    categoryId,
    amount,
    description: description.trim(),
    date: date.toISOString().split('T')[0]
  };

  categories[categoryIndex].expenses.push(newExpense);
  categories[categoryIndex].actualSpent = calculateCategorySpending(categories[categoryIndex]);
  saveAllCategories(categories);

  return newExpense;
}

export function updateExpense(expenseId: string, amount: number, description: string, date: Date): Expense {
  if (amount <= 0) {
    throw new Error('Expense amount must be a positive number');
  }

  if (!description || description.trim().length === 0) {
    throw new Error('Expense description cannot be empty');
  }

  const categories = getAllCategories();
  let updatedExpense: Expense | null = null;

  for (const category of categories) {
    const expenseIndex = category.expenses.findIndex(exp => exp.id === expenseId);
    if (expenseIndex !== -1) {
      category.expenses[expenseIndex] = {
        ...category.expenses[expenseIndex],
        amount,
        description: description.trim(),
        date: date.toISOString().split('T')[0]
      };
      updatedExpense = category.expenses[expenseIndex];
      category.actualSpent = calculateCategorySpending(category);
      break;
    }
  }

  if (!updatedExpense) {
    throw new Error('Expense not found');
  }

  saveAllCategories(categories);
  return updatedExpense;
}

export function deleteExpense(expenseId: string): void {
  const categories = getAllCategories();
  let found = false;

  for (const category of categories) {
    const expenseIndex = category.expenses.findIndex(exp => exp.id === expenseId);
    if (expenseIndex !== -1) {
      category.expenses.splice(expenseIndex, 1);
      found = true;
      category.actualSpent = calculateCategorySpending(category);
      break;
    }
  }

  if (!found) {
    throw new Error('Expense not found');
  }

  saveAllCategories(categories);
}

export function getExpensesByCategory(categoryId: string): Expense[] {
  const categories = getAllCategories();
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.expenses : [];
}

export function getTotalSpent(): number {
  const categories = getAllCategories();
  return categories.reduce((total, category) => total + category.actualSpent, 0);
}

function calculateCategorySpending(category: Category): number {
  return category.expenses.reduce((total, expense) => total + expense.amount, 0);
}

export function getCategorySpending(categoryId: string): number {
  const categories = getAllCategories();
  const category = categories.find(cat => cat.id === categoryId);
  return category ? calculateCategorySpending(category) : 0;
}

export function getAllExpenses(): Expense[] {
  const categories = getAllCategories();
  const allExpenses: Expense[] = [];
  
  categories.forEach(category => {
    allExpenses.push(...category.expenses);
  });
  
  return allExpenses;
}