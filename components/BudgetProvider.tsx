'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Category, PayBreakdown } from '@/types';
import { DEFAULT_CATEGORIES } from '@/constants';
import { handleStorageError, logError, getErrorMessage } from '@/utils/errorHandling';
import { saveData, loadData, isStorageAvailable } from '@/utils/storageService';
import { createCategory, getAllCategories } from '@/utils/budgetManager';

const STORAGE_KEYS = {
  INCOME: 'budget_planner_income',
  CATEGORIES: 'budget_planner_categories'
};

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

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

interface BudgetProviderProps {
  children: ReactNode;
}

export function BudgetProvider({ children }: BudgetProviderProps) {
  const [appState, setAppState] = useState<AppState>({
    income: null,
    categories: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(true);

  const initializeDefaultCategories = (): Category[] => {
    const createdCategories: Category[] = [];
    
    for (const name of DEFAULT_CATEGORIES) {
      try {
        const category = createCategory(name, 0);
        createdCategories.push(category);
      } catch (error) {
        console.error(`Failed to create default category "${name}":`, error);
      }
    }
    
    return createdCategories;
  };

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const available = isStorageAvailable();
      setStorageAvailable(available);

      if (!available) {
        const fallbackState: AppState = { income: null, categories: [] };
        setAppState(fallbackState);
        setError('Local storage is not available. Please enable cookies and local storage in your browser.');
        return;
      }

      const income = loadData<PayBreakdown>(STORAGE_KEYS.INCOME);
      let categories = loadData<Category[]>(STORAGE_KEYS.CATEGORIES) || [];

      if (categories.length === 0) {
        categories = initializeDefaultCategories();
      }

      setAppState({ income, categories });
    } catch (err) {
      const appError = handleStorageError(err);
      logError(appError, 'loading initial budget data from localStorage');
      setError(getErrorMessage(appError));
      setAppState({ income: null, categories: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const refreshData = async () => {
    await loadInitialData();
  };

  const updateIncome = async (income: PayBreakdown | null) => {
    try {
      if (income && storageAvailable) {
        saveData(STORAGE_KEYS.INCOME, income);
      }
      setAppState(prevState => ({ ...prevState, income }));
    } catch (err) {
      const appError = handleStorageError(err);
      logError(appError, 'saving income to localStorage');
      setError(getErrorMessage(appError));
      throw appError;
    }
  };

  const updateCategories = (categories: Category[]) => {
    try {
      if (storageAvailable) {
        saveData(STORAGE_KEYS.CATEGORIES, categories);
      }
      setAppState(prevState => ({ ...prevState, categories }));
    } catch (err) {
      const appError = handleStorageError(err);
      logError(appError, 'saving categories to localStorage');
      setError(getErrorMessage(appError));
    }
  };

  const clearError = () => {
    setError(null);
  };

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

export function useBudget(): BudgetContextType {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}