'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Category, PayBreakdown } from '@/types';
import { DEFAULT_CATEGORIES } from '@/constants';
import { handleStorageError, logError, getErrorMessage } from '@/utils/errorHandling';
import { getCurrentIncome, saveIncome, getAllCategoriesWithExpenses } from '@/utils/budgetRepository';
import { createCategory } from '@/utils/budgetManager';
import { getCurrentUserId } from '@/utils/supabaseClient';

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
  storageAvailable: boolean;
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
  const [storageAvailable, setStorageAvailable] = useState(true);

  /**
   * Initialize default categories if none exist
   */
  const initializeDefaultCategories = async (): Promise<Category[]> => {
    const createdCategories: Category[] = [];
    
    for (const name of DEFAULT_CATEGORIES) {
      try {
        const category = await createCategory(name, 0);
        createdCategories.push(category);
      } catch (error) {
        console.error(`Failed to create default category "${name}":`, error);
      }
    }
    
    return createdCategories;
  };

  /**
   * Load initial data from database on component mount
   */
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user ID is configured
      const userId = await getCurrentUserId();
      const available = !!userId;
      setStorageAvailable(available);

      if (!available) {
        // User ID not configured
        const fallbackState: AppState = {
          income: null,
          categories: []
        };
        setAppState(fallbackState);
        setError('User ID not configured. Please set NEXT_PUBLIC_USER_ID in your .env.local file.');
        return;
      }

      // Load income and categories from database
      const income = await getCurrentIncome();
      let categories = await getAllCategoriesWithExpenses();

      // If no categories exist, initialize default categories (for first-time users)
      if (!categories || categories.length === 0) {
        categories = await initializeDefaultCategories();
      }

      setAppState({
        income,
        categories
      });

    } catch (err) {
      const appError = handleStorageError(err);
      logError(appError, 'loading initial budget data from database');
      setError(getErrorMessage(appError));
      
      // Fallback to empty state
      const fallbackState: AppState = {
        income: null,
        categories: []
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
   * Refresh data from database
   */
  const refreshData = async () => {
    await loadInitialData();
  };

  /**
   * Update income in the app state and save to database
   */
  const updateIncome = async (income: PayBreakdown | null) => {
    try {
      if (income && storageAvailable) {
        await saveIncome(income);
      }
      setAppState(prevState => ({
        ...prevState,
        income
      }));
    } catch (err) {
      const appError = handleStorageError(err);
      logError(appError, 'saving income to database');
      setError(getErrorMessage(appError));
      throw appError;
    }
  };

  /**
   * Update categories in the app state (local state only)
   * Note: Categories should be updated through repository functions
   * This is primarily for UI state synchronization
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
   * Retry loading data from local storage
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
    retryDataLoad,
    storageAvailable
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