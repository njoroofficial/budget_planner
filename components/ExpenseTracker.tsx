'use client';

import { useState, useOptimistic } from 'react';
import { Category, Expense } from '../types';
import ExpenseItem from './ExpenseItem';
import { addExpense, updateExpense, deleteExpense } from '../utils/expenseTracker';

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
   * Validates expense form inputs
   */
  const validateForm = (data: ExpenseFormData): boolean => {
    const newErrors: Partial<ExpenseFormData> = {};

    // Validate category selection
    if (!data.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    // Validate amount (positive number)
    const amount = parseFloat(data.amount);
    if (!data.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    // Validate description (non-empty)
    if (!data.description || data.description.trim().length === 0) {
      newErrors.description = 'Description is required';
    }

    // Validate date (valid date)
    if (!data.date) {
      newErrors.date = 'Date is required';
    } else {
      const dateObj = new Date(data.date);
      if (isNaN(dateObj.getTime())) {
        newErrors.date = 'Please enter a valid date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
   * Handles adding a new expense
   */
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData)) {
      return;
    }

    const amount = parseFloat(formData.amount);
    const date = new Date(formData.date);

    try {
      // Optimistic update
      updateOptimisticCategories({
        type: 'add',
        categoryId: formData.categoryId,
        amount,
        description: formData.description,
        date: formData.date
      });

      // Actual update
      const updatedCategories = addExpense(categories, formData.categoryId, amount, formData.description, date);
      onCategoriesChange(updatedCategories);

      // Reset form
      setFormData({
        categoryId: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      // The optimistic update will be reverted automatically
    }
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
   * Handles updating an existing expense
   */
  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingExpense || !validateForm(formData)) {
      return;
    }

    const amount = parseFloat(formData.amount);
    const date = new Date(formData.date);

    try {
      // Optimistic update
      updateOptimisticCategories({
        type: 'update',
        expense: editingExpense,
        amount,
        description: formData.description,
        date: formData.date
      });

      // Actual update
      const updatedCategories = updateExpense(categories, editingExpense.id, amount, formData.description, date);
      onCategoriesChange(updatedCategories);

      // Reset form and editing state
      setEditingExpense(null);
      setFormData({
        categoryId: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      // The optimistic update will be reverted automatically
    }
  };

  /**
   * Handles deleting an expense
   */
  const handleDeleteExpense = async (expenseId: string) => {
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
      console.error('Error deleting expense:', error);
      // The optimistic update will be reverted automatically
    }
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {editingExpense ? 'Edit Expense' : 'Track Expenses'}
      </h2>

      {/* Expense Form */}
      <form onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Category Selection */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {optimisticCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (KSh)
            </label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter expense description"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Date Input */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>
        </div>

        {/* Form Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {editingExpense ? 'Update Expense' : 'Add Expense'}
          </button>
          
          {editingExpense && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Expenses List */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Recent Expenses</h3>
        
        {Object.keys(expensesByCategory).length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No expenses recorded yet. Add your first expense above.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.values(expensesByCategory).map(({ category, expenses }) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-800">{category.name}</h4>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">
                      KSh {category.actualSpent.toLocaleString()}
                    </span>
                    <span className="text-gray-400"> / </span>
                    <span>KSh {category.plannedAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {expenses.map(expense => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      onEdit={handleEditExpense}
                      onDelete={handleDeleteExpense}
                    />
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