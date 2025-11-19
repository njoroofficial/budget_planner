'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Category, PayBreakdown } from '@/types';
import { DEFAULT_CATEGORIES } from '@/constants';
import { handleStorageError, logError, getErrorMessage } from '@/utils/errorHandling';
import { getAllCategoriesWithExpenses } from '@/utils/budgetRepository';
import { getCurrentIncome, saveIncome } from '@/utils/budgetRepository';

/**
 * Context interface for budget state management
 */
interface BudgetContextType {
  appState: AppState;
  updateIncome: (income: PayBreakdown | null) => Promise<void>;
  updateCategories: (categories: Category[]) => void;
  refreshData: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  retryDataLoad: () => void;
}

/**
 * Create the Budget Context
 */
const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

/**
 * Props interface for BudgetProvider
 */
interface BudgetProviderProps {
  children: ReactNode;
}

/**
 * BudgetProvider component that manages global budget state
 * Handles data persistence with Supabase and provides state to child components
 */
export function BudgetProvider({ children }: BudgetProviderProps) {
  const [appState, setAppState] = useState<AppState>({
    income: null,
    categories: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize default categories if none exist
   */
  const initializeDefaultCategories = (): Category[] => {
    return DEFAULT_CATEGORIES.map((name, index) => ({
      id: `default_${index + 1}`,
      name,
      plannedAmount: 0,
      actualSpent: 0,
      expenses: []
    }));
  };

  /**
   * Load initial data from Supabase on component mount
   */
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch income and categories from Supabase
      const [income, categories] = await Promise.all([
        getCurrentIncome(),
        getAllCategoriesWithExpenses()
      ]);

      // If no categories exist, use default categories (for new users)
      const finalCategories = categories.length > 0 ? categories : initializeDefaultCategories();

      setAppState({
        income,
        categories: finalCategories
      });

    } catch (err) {
      const appError = handleStorageError(err);
      logError(appError, 'loading initial budget data from Supabase');
      setError(getErrorMessage(appError));
      
      // Fallback to default state
      const fallbackState: AppState = {
        income: null,
        categories: initializeDefaultCategories()
      };
      setAppState(fallbackState);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  /**
   * Refresh data from Supabase
   */
  const refreshData = async () => {
    await loadInitialData();
  };

  /**
   * Update income in the app state and save to Supabase
   */
  const updateIncome = async (income: PayBreakdown | null) => {
    try {
      if (income) {
        await saveIncome(income);
      }
      setAppState(prevState => ({
        ...prevState,
        income
      }));
    } catch (err) {
      const appError = handleStorageError(err);
      logError(appError, 'saving income to Supabase');
      setError(getErrorMessage(appError));
      throw appError;
    }
  };

  /**
   * Update categories in the app state
   * Note: Categories are updated via server actions which trigger revalidation
   */
  const updateCategories = (categories: Category[]) => {
    setAppState(prevState => ({
      ...prevState,
      categories
    }));
  };

  /**
   * Clear the current error
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Retry loading data from Supabase
   */
  const retryDataLoad = () => {
    loadInitialData();
  };

  const contextValue: BudgetContextType = {
    appState,
    updateIncome,
    updateCategories,
    refreshData,
    isLoading,
    error,
    clearError,
    retryDataLoad
  };

  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  );
}

/**
 * Custom hook to use the Budget Context
 * Throws an error if used outside of BudgetProvider
 */
export function useBudget(): BudgetContextType {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}