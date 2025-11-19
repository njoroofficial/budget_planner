'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Category, PayBreakdown } from '@/types';
import { DEFAULT_CATEGORIES } from '@/constants';
import { saveData, loadData, isStorageAvailable } from '@/utils/storageService';
import { handleStorageError, logError, getErrorMessage } from '@/utils/errorHandling';

/**
 * Context interface for budget state management
 */
interface BudgetContextType {
  appState: AppState;
  updateIncome: (income: PayBreakdown | null) => void;
  updateCategories: (categories: Category[]) => void;
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
 * Handles data persistence with LocalStorage and provides state to child components
 */
export function BudgetProvider({ children }: BudgetProviderProps) {
  const [appState, setAppState] = useState<AppState>({
    income: null,
    categories: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(false);

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
   * Load initial data from LocalStorage on component mount
   */
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if storage is available
      const storageIsAvailable = isStorageAvailable();
      setStorageAvailable(storageIsAvailable);

      if (!storageIsAvailable) {
        throw handleStorageError(new Error('LocalStorage is not available'));
      }

      const savedData = loadData<AppState>('budgetPlannerData');
      
      if (savedData) {
        // Validate loaded data structure
        const validatedData: AppState = {
          income: savedData.income || null,
          categories: Array.isArray(savedData.categories) ? savedData.categories : []
        };

        // Validate categories structure
        validatedData.categories = validatedData.categories.filter(cat => 
          cat && 
          typeof cat.id === 'string' && 
          typeof cat.name === 'string' && 
          typeof cat.plannedAmount === 'number' && 
          typeof cat.actualSpent === 'number' &&
          Array.isArray(cat.expenses)
        );

        // If no valid categories exist, initialize with defaults
        if (validatedData.categories.length === 0) {
          validatedData.categories = initializeDefaultCategories();
        }

        setAppState(validatedData);
      } else {
        // No saved data, initialize with default categories
        const initialState: AppState = {
          income: null,
          categories: initializeDefaultCategories()
        };
        setAppState(initialState);
        
        // Try to save initial state to LocalStorage
        try {
          saveData('budgetPlannerData', initialState);
        } catch (saveError) {
          const appError = handleStorageError(saveError);
          logError(appError, 'saving initial data');
          setError(getErrorMessage(appError));
        }
      }
    } catch (err) {
      const appError = handleStorageError(err);
      logError(appError, 'loading initial budget data');
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
   * Auto-save data to LocalStorage whenever state changes
   */
  useEffect(() => {
    if (!isLoading && appState && storageAvailable) {
      try {
        saveData('budgetPlannerData', appState);
        // Clear any previous save errors
        if (error && error.includes('save')) {
          setError(null);
        }
      } catch (err) {
        const appError = handleStorageError(err);
        logError(appError, 'auto-saving budget data');
        setError(`${getErrorMessage(appError)} Your changes may not be preserved.`);
      }
    }
  }, [appState, isLoading, storageAvailable, error]);

  /**
   * Update income in the app state
   */
  const updateIncome = (income: PayBreakdown | null) => {
    setAppState(prevState => ({
      ...prevState,
      income
    }));
  };

  /**
   * Update categories in the app state
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
   * Retry loading data from storage
   */
  const retryDataLoad = () => {
    loadInitialData();
  };

  const contextValue: BudgetContextType = {
    appState,
    updateIncome,
    updateCategories,
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