/**
 * LocalStorage to Supabase Migration Utility
 * 
 * This script helps migrate existing data from localStorage to Supabase.
 * Run this once after setting up Supabase to preserve existing user data.
 * 
 * Usage:
 * 1. Ensure you're logged in to the application (or using demo mode)
 * 2. Open browser console
 * 3. Run: migrateLocalStorageToSupabase()
 */

import { saveIncome } from './budgetRepository';
import { createCategoryInDb } from './budgetRepository';
import { addExpenseToDb } from './expenseRepository';
import type { AppState, Category, Expense, PayBreakdown } from '@/types';

/**
 * Load data from localStorage
 */
function loadFromLocalStorage(): AppState | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.error('LocalStorage is not available');
      return null;
    }

    const jsonData = window.localStorage.getItem('budgetPlannerData');
    
    if (!jsonData) {
      console.log('No data found in localStorage');
      return null;
    }

    const data = JSON.parse(jsonData) as AppState;
    console.log('Loaded data from localStorage:', data);
    return data;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
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
 * Call this from the browser console after logging in
 */
export async function migrateLocalStorageToSupabase(): Promise<void> {
  try {
    console.log('='.repeat(60));
    console.log('Starting migration from localStorage to Supabase...');
    console.log('='.repeat(60));

    // Load data from localStorage
    const localData = loadFromLocalStorage();

    if (!localData) {
      console.log('No data to migrate. Exiting.');
      return;
    }

    // Migrate income
    console.log('\n1. Migrating income...');
    await migrateIncome(localData.income);

    // Migrate categories and expenses
    console.log('\n2. Migrating categories and expenses...');
    await migrateCategories(localData.categories);

    console.log('\n' + '='.repeat(60));
    console.log('✓ Migration completed successfully!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Refresh the page to load data from Supabase');
    console.log('2. Verify all your data is present');
    console.log('3. Once confirmed, you can clear localStorage if desired');
    console.log('\nTo clear localStorage (ONLY after verifying data):');
    console.log('  localStorage.removeItem("budgetPlannerData")');

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
    const localData = loadFromLocalStorage();
    
    if (!localData) {
      console.log('No data to backup');
      return;
    }

    const dataStr = JSON.stringify(localData, null, 2);
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
