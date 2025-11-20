import { Category } from '../types';
import { saveData, loadData } from './storageService';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'budget_planner_categories';

export function createCategory(name: string, plannedAmount: number): Category {
  if (!name || name.trim().length === 0) {
    throw new Error('Category name cannot be empty');
  }

  if (plannedAmount < 0) {
    throw new Error('Planned amount must be a positive number');
  }

  const categories = loadData<Category[]>(STORAGE_KEY) || [];

  const nameExists = categories.some(
    cat => cat.name.toLowerCase() === name.trim().toLowerCase()
  );

  if (nameExists) {
    throw new Error('Category name already exists');
  }

  const newCategory: Category = {
    id: uuidv4(),
    name: name.trim(),
    plannedAmount,
    actualSpent: 0,
    expenses: []
  };

  categories.push(newCategory);
  saveData(STORAGE_KEY, categories);

  return newCategory;
}

export function updateCategory(id: string, name: string, plannedAmount: number): Category {
  if (!name || name.trim().length === 0) {
    throw new Error('Category name cannot be empty');
  }

  if (plannedAmount < 0) {
    throw new Error('Planned amount must be a positive number');
  }

  const categories = loadData<Category[]>(STORAGE_KEY) || [];
  const categoryIndex = categories.findIndex(cat => cat.id === id);
  
  if (categoryIndex === -1) {
    throw new Error('Category not found');
  }

  const nameExists = categories.some(
    (cat, index) => 
      index !== categoryIndex && 
      cat.name.toLowerCase() === name.trim().toLowerCase()
  );

  if (nameExists) {
    throw new Error('Category name already exists');
  }

  categories[categoryIndex] = {
    ...categories[categoryIndex],
    name: name.trim(),
    plannedAmount
  };

  saveData(STORAGE_KEY, categories);
  return categories[categoryIndex];
}

export function deleteCategory(id: string): void {
  const categories = loadData<Category[]>(STORAGE_KEY) || [];
  const categoryIndex = categories.findIndex(cat => cat.id === id);
  
  if (categoryIndex === -1) {
    throw new Error('Category not found');
  }

  categories.splice(categoryIndex, 1);
  saveData(STORAGE_KEY, categories);
}

export function getTotalAllocated(categories: Category[]): number {
  return categories.reduce((total, category) => total + category.plannedAmount, 0);
}

export function getRemainingBudget(categories: Category[], netPay: number): number {
  const totalAllocated = getTotalAllocated(categories);
  return netPay - totalAllocated;
}

export function getAllCategories(): Category[] {
  return loadData<Category[]>(STORAGE_KEY) || [];
}

export function saveAllCategories(categories: Category[]): void {
  saveData(STORAGE_KEY, categories);
}