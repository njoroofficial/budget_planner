'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Category, PayBreakdown } from '@/types';
import { DEFAULT_CATEGORIES } from '@/constants';
import { handleStorageError, logError, getErrorMessage } from '@/utils/errorHandling';
import { saveData, loadData, isStorageAvailable } from '@/utils/storageService';

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

// Storage keys for local storage
const STORAGE_KEYS = {
  INCOME: 'budget_planner_income',
  CATEGORIES: 'budget_planner_categories'
};

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
   * Load initial data from local storage on component mount
   */
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if storage is available
      const available = isStorageAvailable();
      setStorageAvailable(available);

      if (!available) {
        // Use default state if storage is not available
        const fallbackState: AppState = {
          income: null,
          categories: initializeDefaultCategories()
        };
        setAppState(fallbackState);
        setError('Local storage is not available. Your data will not be saved.');
        return;
      }

      // Load income and categories from local storage
      const income = loadData<PayBreakdown>(STORAGE_KEYS.INCOME);
      const categories = loadData<Category[]>(STORAGE_KEYS.CATEGORIES);

      // If no categories exist, use default categories (for first-time users)
      const finalCategories = categories && categories.length > 0 ? categories : initializeDefaultCategories();

      setAppState({
        income,
        categories: finalCategories
      });

    } catch (err) {
      const appError = handleStorageError(err);
      logError(appError, 'loading initial budget data from local storage');
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
   * Refresh data from local storage
   */
  const refreshData = async () => {
    await loadInitialData();
  };

  /**
   * Update income in the app state and save to local storage
   */
  const updateIncome = async (income: PayBreakdown | null) => {
    try {
      if (income && storageAvailable) {
        saveData(STORAGE_KEYS.INCOME, income);
      }
      setAppState(prevState => ({
        ...prevState,
        income
      }));
    } catch (err) {
      const appError = handleStorageError(err);
      logError(appError, 'saving income to local storage');
      setError(getErrorMessage(appError));
      throw appError;
    }
  };

  /**
   * Update categories in the app state and save to local storage
   */
  const updateCategories = (categories: Category[]) => {
    try {
      if (storageAvailable) {
        saveData(STORAGE_KEYS.CATEGORIES, categories);
      }
      setAppState(prevState => ({
        ...prevState,
        categories
      }));
    } catch (err) {
      const appError = handleStorageError(err);
      logError(appError, 'saving categories to local storage');
      setError(getErrorMessage(appError));
    }
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