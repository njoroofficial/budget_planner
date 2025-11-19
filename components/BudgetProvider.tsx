'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Category, PayBreakdown } from '@/types';
import { DEFAULT_CATEGORIES } from '@/constants';
import { saveData, loadData } from '@/utils/storageService';

/**
 * Context interface for budget state management
 */
interface BudgetContextType {
  appState: AppState;
  updateIncome: (income: PayBreakdown | null) => void;
  updateCategories: (categories: Category[]) => void;
  isLoading: boolean;
  error: string | null;
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
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);

      const savedData = loadData<AppState>('budgetPlannerData');
      
      if (savedData) {
        // Validate loaded data structure
        const validatedData: AppState = {
          income: savedData.income || null,
          categories: Array.isArray(savedData.categories) ? savedData.categories : []
        };

        // If no categories exist, initialize with defaults
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
        
        // Save initial state to LocalStorage
        saveData('budgetPlannerData', initialState);
      }
    } catch (err) {
      console.error('Error loading budget data:', err);
      setError('Failed to load saved data. Starting with default categories.');
      
      // Fallback to default state
      const fallbackState: AppState = {
        income: null,
        categories: initializeDefaultCategories()
      };
      setAppState(fallbackState);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Auto-save data to LocalStorage whenever state changes
   */
  useEffect(() => {
    if (!isLoading && appState) {
      try {
        saveData('budgetPlannerData', appState);
        setError(null);
      } catch (err) {
        console.error('Error saving budget data:', err);
        setError('Failed to save data. Your changes may not be preserved.');
      }
    }
  }, [appState, isLoading]);

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

  const contextValue: BudgetContextType = {
    appState,
    updateIncome,
    updateCategories,
    isLoading,
    error
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