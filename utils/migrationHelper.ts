/**
 * LocalStorage to Supabase Migration Utility
 * 
 * This script helps migrate existing data from localStorage to Supabase.
 * Run this once after setting up Supabase to preserve existing user data.
 * 
 * Usage:
 * 1. Open browser console on your Budget Planner app
 * 2. Run: migrateLocalStorageToSupabase()
 * 3. Follow the console prompts
 */

import { saveIncome } from './budgetRepository';
import { createCategoryInDb } from './budgetRepository';
import { addExpenseToDb } from './expenseRepository';
import type { Category, Expense, PayBreakdown } from '@/types';

// Old localStorage keys
const STORAGE_KEYS = {
  INCOME: 'budget_planner_income',
  CATEGORIES: 'budget_planner_categories'
};

/**
 * Load income from localStorage
 */
function loadIncomeFromLocalStorage(): PayBreakdown | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.error('LocalStorage is not available');
      return null;
    }

    const jsonData = window.localStorage.getItem(STORAGE_KEYS.INCOME);
    
    if (!jsonData) {
      console.log('No income data found in localStorage');
      return null;
    }

    const data = JSON.parse(jsonData) as PayBreakdown;
    console.log('Loaded income from localStorage:', data);
    return data;
  } catch (error) {
    console.error('Error loading income from localStorage:', error);
    return null;
  }
}

/**
 * Load categories from localStorage
 */
function loadCategoriesFromLocalStorage(): Category[] | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.error('LocalStorage is not available');
      return null;
    }

    const jsonData = window.localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    
    if (!jsonData) {
      console.log('No categories data found in localStorage');
      return null;
    }

    const data = JSON.parse(jsonData) as Category[];
    console.log('Loaded categories from localStorage:', data);
    return data;
  } catch (error) {
    console.error('Error loading categories from localStorage:', error);
    return null;
  }
}

/**
 * Migrate income data to Supabase
 */
async function migrateIncome(income: PayBreakdown | null): Promise<void> {
  if (!income) {
    console.log('No income data to migrate');
    return;
  }

  try {
    await saveIncome(income);
    console.log('✓ Income migrated successfully');
  } catch (error) {
    console.error('✗ Failed to migrate income:', error);
    throw error;
  }
}

/**
 * Migrate categories and their expenses to Supabase
 */
async function migrateCategories(categories: Category[]): Promise<Map<string, string>> {
  const oldIdToNewIdMap = new Map<string, string>();

  if (!categories || categories.length === 0) {
    console.log('No categories to migrate');
    return oldIdToNewIdMap;
  }

  console.log(`Migrating ${categories.length} categories...`);

  for (const category of categories) {
    try {
      // Create category in Supabase
      const newCategory = await createCategoryInDb(
        category.name,
        category.plannedAmount
      );

      // Map old ID to new UUID
      oldIdToNewIdMap.set(category.id, newCategory.id);
      console.log(`✓ Migrated category: ${category.name} (${category.id} → ${newCategory.id})`);

      // Migrate expenses for this category
      if (category.expenses && category.expenses.length > 0) {
        await migrateExpenses(category.expenses, newCategory.id);
      }
    } catch (error) {
      console.error(`✗ Failed to migrate category ${category.name}:`, error);
      throw error;
    }
  }

  return oldIdToNewIdMap;
}

/**
 * Migrate expenses to Supabase
 */
async function migrateExpenses(expenses: Expense[], newCategoryId: string): Promise<void> {
  console.log(`  Migrating ${expenses.length} expenses...`);

  for (const expense of expenses) {
    try {
      const expenseDate = new Date(expense.date);
      
      await addExpenseToDb(
        newCategoryId,
        expense.amount,
        expense.description,
        expenseDate
      );

      console.log(`  ✓ Migrated expense: ${expense.description} ($${expense.amount})`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate expense ${expense.description}:`, error);
      throw error;
    }
  }
}

/**
 * Main migration function
 * Call this from the browser console
 */
export async function migrateLocalStorageToSupabase(): Promise<void> {
  try {
    console.log('='.repeat(60));
    console.log('Starting migration from localStorage to Supabase...');
    console.log('='.repeat(60));

    // Load data from localStorage
    const localIncome = loadIncomeFromLocalStorage();
    const localCategories = loadCategoriesFromLocalStorage();

    if (!localIncome && (!localCategories || localCategories.length === 0)) {
      console.log('No data to migrate. Exiting.');
      return;
    }

    // Migrate income
    if (localIncome) {
      console.log('\n1. Migrating income...');
      await migrateIncome(localIncome);
    }

    // Migrate categories and expenses
    if (localCategories && localCategories.length > 0) {
      console.log('\n2. Migrating categories and expenses...');
      await migrateCategories(localCategories);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✓ Migration completed successfully!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Refresh the page to load data from Supabase');
    console.log('2. Verify all your data is present');
    console.log('3. Once confirmed, you can clear localStorage if desired');
    console.log('\nTo clear localStorage (ONLY after verifying data):');
    console.log(`  localStorage.removeItem("${STORAGE_KEYS.INCOME}")`);
    console.log(`  localStorage.removeItem("${STORAGE_KEYS.CATEGORIES}")`);

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('✗ Migration failed!');
    console.error('='.repeat(60));
    console.error('Error:', error);
    console.error('\nYour localStorage data is still intact.');
    console.error('Please check the error above and try again.');
    throw error;
  }
}

/**
 * Backup localStorage data to a downloadable JSON file
 */
export function backupLocalStorageData(): void {
  try {
    const income = loadIncomeFromLocalStorage();
    const categories = loadCategoriesFromLocalStorage();
    
    if (!income && (!categories || categories.length === 0)) {
      console.log('No data to backup');
      return;
    }

    const backupData = {
      income,
      categories,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    console.log('✓ Backup downloaded successfully');
  } catch (error) {
    console.error('Failed to backup data:', error);
  }
}

// Make functions available in browser console
if (typeof window !== 'undefined') {
  (window as any).migrateLocalStorageToSupabase = migrateLocalStorageToSupabase;
  (window as any).backupLocalStorageData = backupLocalStorageData;
}
