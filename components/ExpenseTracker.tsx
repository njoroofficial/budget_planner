'use client';

import { useState, useOptimistic, useTransition } from 'react';
import { Category, Expense } from '../types';
import ExpenseItem from './ExpenseItem';
import { addExpense, updateExpense, deleteExpense } from '../utils/expenseTracker';
import { 
  validateExpenseAmount, 
  validateExpenseDescription, 
  validateDate, 
  validateCategorySelection,
  validateFormData,
  isFormValid,
  getValidationErrors
} from '../utils/validation';
import { handleValidationError, logError } from '../utils/errorHandling';

/**
 * Props interface for ExpenseTracker component
 */
export interface ExpenseTrackerProps {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
}

/**
 * Form data interface for expense form
 */
interface ExpenseFormData {
  categoryId: string;
  amount: string;
  description: string;
  date: string;
}

/**
 * ExpenseTracker component handles expense recording and management.
 * Provides form to add new expenses and displays existing expenses grouped by category.
 * Uses useOptimistic for instant UI feedback on expense operations.
 */
export default function ExpenseTracker({ categories, onCategoriesChange }: ExpenseTrackerProps) {
  const [isPending, startTransition] = useTransition();
  
  // Form state for new expense
  const [formData, setFormData] = useState<ExpenseFormData>({
    categoryId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  });

  // Editing state
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // Form validation errors
  const [errors, setErrors] = useState<Partial<ExpenseFormData>>({});

  // Optimistic updates for instant UI feedback
  const [optimisticCategories, updateOptimisticCategories] = useOptimistic(
    categories,
    (currentCategories: Category[], action: { type: 'add' | 'update' | 'delete'; expense?: Expense; expenseId?: string; categoryId?: string; amount?: number; description?: string; date?: string }) => {
      try {
        switch (action.type) {
          case 'add':
            if (action.categoryId && action.amount && action.description && action.date) {
              return addExpense(currentCategories, action.categoryId, action.amount, action.description, new Date(action.date));
            }
            return currentCategories;
          case 'update':
            if (action.expense && action.amount && action.description && action.date) {
              return updateExpense(currentCategories, action.expense.id, action.amount, action.description, new Date(action.date));
            }
            return currentCategories;
          case 'delete':
            if (action.expenseId) {
              return deleteExpense(currentCategories, action.expenseId);
            }
            return currentCategories;
          default:
            return currentCategories;
        }
      } catch (error) {
        // If optimistic update fails, return current state
        return currentCategories;
      }
    }
  );

  /**
   * Validates expense form inputs using validation utilities
   */
  const validateForm = (data: ExpenseFormData): boolean => {
    try {
      // Get available category IDs
      const availableCategoryIds = categories.map(cat => cat.id);

      // Define validation rules
      const validationRules = {
        categoryId: (value: string) => validateCategorySelection(value, availableCategoryIds),
        amount: (value: string) => validateExpenseAmount(value),
        description: (value: string) => validateExpenseDescription(value),
        date: (value: string) => validateDate(value)
      };

      // Validate all form fields
      const validationResults = validateFormData(data, validationRules);
      
      // Check if form is valid
      const formIsValid = isFormValid(validationResults);
      
      // Extract error messages
      const validationErrors = getValidationErrors(validationResults);
      setErrors(validationErrors);
      
      return formIsValid;
    } catch (error) {
      logError(error, 'validating expense form');
      setErrors({ description: 'Validation error occurred. Please try again.' });
      return false;
    }
  };

  /**
   * Handles form input changes
   */
  const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Handles adding a new expense with comprehensive error handling
   */
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData)) {
      return;
    }

    const amount = parseFloat(formData.amount);
    const date = new Date(formData.date);

    startTransition(async () => {
      try {
        // Optimistic update
        updateOptimisticCategories({
          type: 'add',
          categoryId: formData.categoryId,
          amount,
          description: formData.description.trim(),
          date: formData.date
        });

        // Actual update
        const updatedCategories = addExpense(categories, formData.categoryId, amount, formData.description.trim(), date);
        onCategoriesChange(updatedCategories);

        // Reset form on success
        setFormData({
          categoryId: '',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
        setErrors({});
      } catch (error) {
        logError(error, 'adding expense');
        // Set a general error message
        setErrors({ description: 'Failed to add expense. Please try again.' });
        // The optimistic update will be reverted automatically
      }
    });
  };

  /**
   * Handles editing an expense
   */
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      categoryId: expense.categoryId,
      amount: expense.amount.toString(),
      description: expense.description,
      date: expense.date.split('T')[0] // Convert ISO date to YYYY-MM-DD
    });
  };

  /**
   * Handles updating an existing expense with comprehensive error handling
   */
  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingExpense || !validateForm(formData)) {
      return;
    }

    const amount = parseFloat(formData.amount);
    const date = new Date(formData.date);

    startTransition(async () => {
      try {
        // Optimistic update
        updateOptimisticCategories({
          type: 'update',
          expense: editingExpense,
          amount,
          description: formData.description.trim(),
          date: formData.date
        });

        // Actual update
        const updatedCategories = updateExpense(categories, editingExpense.id, amount, formData.description.trim(), date);
        onCategoriesChange(updatedCategories);

        // Reset form and editing state on success
        setEditingExpense(null);
        setFormData({
          categoryId: '',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
        setErrors({});
      } catch (error) {
        logError(error, 'updating expense');
        // Set a general error message
        setErrors({ description: 'Failed to update expense. Please try again.' });
        // The optimistic update will be reverted automatically
      }
    });
  };

  /**
   * Handles deleting an expense with comprehensive error handling
   */
  const handleDeleteExpense = async (expenseId: string) => {
    startTransition(async () => {
      try {
        // Optimistic update
        updateOptimisticCategories({
          type: 'delete',
          expenseId
        });

        // Actual update
        const updatedCategories = deleteExpense(categories, expenseId);
        onCategoriesChange(updatedCategories);
      } catch (error) {
        logError(error, 'deleting expense');
        // The optimistic update will be reverted automatically
        // Could show a toast notification here in a real app
      }
    });
  };

  /**
   * Cancels editing mode
   */
  const handleCancelEdit = () => {
    setEditingExpense(null);
    setFormData({
      categoryId: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setErrors({});
  };

  /**
   * Groups expenses by category for display
   */
  const getExpensesByCategory = () => {
    const expensesByCategory: { [categoryId: string]: { category: Category; expenses: Expense[] } } = {};

    optimisticCategories.forEach(category => {
      if (category.expenses.length > 0) {
        expensesByCategory[category.id] = {
          category,
          expenses: [...category.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        };
      }
    });

    return expensesByCategory;
  };

  const expensesByCategory = getExpensesByCategory();

  return (
    <div className="card-elevated p-6 lg:p-8 h-fit">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
          {editingExpense ? 'Edit Expense' : 'Track Expenses'}
        </h2>
      </div>

      {/* Expense Form */}
      <form onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense} className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingExpense ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {editingExpense ? 'Update Expense' : 'Add New Expense'}
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category Selection */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
              className={`input-field ${errors.categoryId ? 'input-error' : ''} ${isPending ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              disabled={isPending}
            >
              <option value="">Select a category</option>
              {optimisticCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <div className="mt-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-sm">{errors.categoryId}</p>
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
              Amount (KSh)
            </label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              min="0"
              max="1000000"
              step="0.01"
              className={`input-field ${errors.amount ? 'input-error' : ''} ${isPending ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              disabled={isPending}
              autoComplete="off"
            />
            {errors.amount && (
              <div className="mt-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-sm">{errors.amount}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="e.g., Grocery shopping, Bus fare"
              maxLength={100}
              className={`input-field ${errors.description ? 'input-error' : ''} ${isPending ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              disabled={isPending}
              autoComplete="off"
            />
            {errors.description && (
              <div className="mt-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-sm">{errors.description}</p>
              </div>
            )}
          </div>

          {/* Date Input */}
          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`input-field ${errors.date ? 'input-error' : ''} ${isPending ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              disabled={isPending}
            />
            {errors.date && (
              <div className="mt-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-500 text-sm">{errors.date}</p>
              </div>
            )}
          </div>
        </div>

        {/* Form Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary flex items-center justify-center space-x-2 flex-1 sm:flex-none"
          >
            {isPending && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isPending ? 'Processing...' : editingExpense ? 'Update Expense' : 'Add Expense'}</span>
          </button>
          
          {editingExpense && (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isPending}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Expenses List */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
          </svg>
          <h3 className="text-xl font-bold text-gray-800">Recent Expenses</h3>
        </div>
        
        {Object.keys(expensesByCategory).length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">No expenses recorded yet</p>
            <p className="text-gray-400 text-sm">Add your first expense above to start tracking</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(expensesByCategory).map(({ category, expenses }, index) => (
              <div key={category.id} className="card-subtle p-5 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      category.actualSpent > category.plannedAmount ? 'bg-red-500' : 
                      category.actualSpent / category.plannedAmount >= 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">{category.name}</h4>
                      <div className="text-sm text-gray-500">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">
                      KSh {category.actualSpent.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      of KSh {category.plannedAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {expenses.map((expense, expenseIndex) => (
                    <div key={expense.id} className="animate-fade-in" style={{ animationDelay: `${(index * 0.1) + (expenseIndex * 0.05)}s` }}>
                      <ExpenseItem
                        expense={expense}
                        onEdit={handleEditExpense}
                        onDelete={handleDeleteExpense}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
