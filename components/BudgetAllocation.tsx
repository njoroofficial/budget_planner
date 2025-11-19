'use client';

import { useState, useOptimistic, useTransition } from 'react';
import { Category, PayBreakdown } from '../types';
import { createCategory, updateCategory, deleteCategory, getTotalAllocated, getRemainingBudget } from '../utils/budgetManager';
import CategoryCard from './CategoryCard';
import { validateCategoryName, validatePlannedAmount, validateFormData, isFormValid, getValidationErrors } from '../utils/validation';
import { handleValidationError, logError } from '../utils/errorHandling';

/**
 * Props interface for BudgetAllocation component
 */
export interface BudgetAllocationProps {
  categories: Category[];
  income: PayBreakdown | null;
  onCategoriesChange: (categories: Category[]) => void;
}

/**
 * Form data interface for category creation/editing
 */
interface CategoryFormData {
  name: string;
  plannedAmount: string;
}

/**
 * BudgetAllocation component manages budget categories, allowing users to create,
 * edit, and delete categories while tracking total allocations against net pay.
 * Uses optimistic updates for instant UI feedback.
 */
export default function BudgetAllocation({ categories, income, onCategoriesChange }: BudgetAllocationProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', plannedAmount: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formErrors, setFormErrors] = useState<{ name?: string; plannedAmount?: string }>({});

  // Optimistic categories for instant UI updates
  const [optimisticCategories, addOptimisticCategory] = useOptimistic(
    categories,
    (state: Category[], action: { type: 'add' | 'update' | 'delete'; category?: Category; id?: string }) => {
      switch (action.type) {
        case 'add':
          return action.category ? [...state, action.category] : state;
        case 'update':
          return action.category 
            ? state.map(cat => cat.id === action.category!.id ? action.category! : cat)
            : state;
        case 'delete':
          return action.id ? state.filter(cat => cat.id !== action.id) : state;
        default:
          return state;
      }
    }
  );

  const netPay = income?.netPay || 0;
  const totalAllocated = getTotalAllocated(optimisticCategories);
  const remainingBudget = getRemainingBudget(optimisticCategories, netPay);
  const isOverAllocated = totalAllocated > netPay;

  /**
   * Validates form data for category creation/editing using validation utilities
   */
  const validateForm = (data: CategoryFormData): boolean => {
    try {
      // Get existing category names (excluding current editing category)
      const existingNames = optimisticCategories
        .filter(cat => cat.id !== editingCategory?.id)
        .map(cat => cat.name);

      // Define validation rules
      const validationRules = {
        name: (value: string) => validateCategoryName(value, existingNames),
        plannedAmount: (value: string) => validatePlannedAmount(value)
      };

      // Validate all form fields
      const validationResults = validateFormData(data, validationRules);
      
      // Check if form is valid
      const formIsValid = isFormValid(validationResults);
      
      // Extract error messages
      const errors = getValidationErrors(validationResults);
      setFormErrors(errors);
      
      return formIsValid;
    } catch (error) {
      logError(error, 'validating category form');
      setFormErrors({ name: 'Validation error occurred. Please try again.' });
      return false;
    }
  };

  /**
   * Handles form submission for creating or updating categories
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

    const amount = parseFloat(formData.plannedAmount);
    
    startTransition(() => {
      try {
        let updatedCategories: Category[];
        
        if (editingCategory) {
          // Update existing category
          updatedCategories = updateCategory(categories, editingCategory.id, formData.name.trim(), amount);
          
          // Optimistic update
          const updatedCategory = { ...editingCategory, name: formData.name.trim(), plannedAmount: amount };
          addOptimisticCategory({ type: 'update', category: updatedCategory });
        } else {
          // Create new category
          updatedCategories = createCategory(categories, formData.name.trim(), amount);
          
          // Optimistic update
          const newCategory: Category = {
            id: `temp_${Date.now()}`,
            name: formData.name.trim(),
            plannedAmount: amount,
            actualSpent: 0,
            expenses: []
          };
          addOptimisticCategory({ type: 'add', category: newCategory });
        }
        
        onCategoriesChange(updatedCategories);
        resetForm();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        if (errorMessage.includes('name')) {
          setFormErrors({ name: errorMessage });
        } else if (errorMessage.includes('amount')) {
          setFormErrors({ plannedAmount: errorMessage });
        } else {
          setFormErrors({ name: errorMessage });
        }
      }
    });
  };

  /**
   * Handles category editing
   */
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      plannedAmount: category.plannedAmount.toString()
    });
    setFormErrors({});
  };

  /**
   * Handles category deletion
   */
  const handleDelete = (categoryId: string) => {
    startTransition(() => {
      try {
        const updatedCategories = deleteCategory(categories, categoryId);
        
        // Optimistic update
        addOptimisticCategory({ type: 'delete', id: categoryId });
        
        onCategoriesChange(updatedCategories);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    });
  };

  /**
   * Resets the form to initial state
   */
  const resetForm = () => {
    setFormData({ name: '', plannedAmount: '' });
    setEditingCategory(null);
    setFormErrors({});
  };

  /**
   * Handles input changes with validation
   */
  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="card-elevated p-6 lg:p-8 h-fit">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">Budget Allocation</h2>
      </div>
      
      {/* Budget Summary */}
      <div className="mb-8 p-6 bg-linear-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center sm:text-left">
            <div className="text-sm font-medium text-gray-600 mb-1">Net Pay</div>
            <div className="text-2xl font-bold text-blue-600">KSh {netPay.toLocaleString()}</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Allocated</div>
            <div className={`text-2xl font-bold ${isOverAllocated ? 'text-red-600' : 'text-purple-600'}`}>
              KSh {totalAllocated.toLocaleString()}
            </div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-sm font-medium text-gray-600 mb-1">Remaining</div>
            <div className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
              KSh {remainingBudget.toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Allocation Progress</span>
            <span className={`text-sm font-semibold ${isOverAllocated ? 'text-red-600' : 'text-blue-600'}`}>
              {netPay > 0 ? ((totalAllocated / netPay) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                isOverAllocated ? 'bg-red-500' : 'bg-linear-to-r from-blue-500 to-purple-500'
              }`}
              style={{ width: `${Math.min((totalAllocated / netPay) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Over-allocation warning */}
        {isOverAllocated && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-red-700 font-medium">
                Over-allocated by KSh {Math.abs(remainingBudget).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Category Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingCategory ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label htmlFor="categoryName" className="block text-sm font-semibold text-gray-700 mb-2">
              Category Name
            </label>
            <input
              id="categoryName"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`input-field ${formErrors.name ? 'input-error' : ''} ${isPending ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="e.g., House Rent, Transport"
              disabled={isPending}
              maxLength={50}
              autoComplete="off"
            />
            {formErrors.name && (
              <div className="mt-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600">{formErrors.name}</p>
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="plannedAmount" className="block text-sm font-semibold text-gray-700 mb-2">
              Planned Amount (KSh)
            </label>
            <input
              id="plannedAmount"
              type="number"
              min="0"
              step="0.01"
              max="1000000"
              value={formData.plannedAmount}
              onChange={(e) => handleInputChange('plannedAmount', e.target.value)}
              className={`input-field ${formErrors.plannedAmount ? 'input-error' : ''} ${isPending ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="0.00"
              disabled={isPending}
              autoComplete="off"
            />
            {formErrors.plannedAmount && (
              <div className="mt-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600">{formErrors.plannedAmount}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
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
            <span>{isPending ? 'Processing...' : editingCategory ? 'Update Category' : 'Add Category'}</span>
          </button>
          
          {editingCategory && (
            <button
              type="button"
              onClick={resetForm}
              disabled={isPending}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Categories List */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-xl font-bold text-gray-800">
            Budget Categories ({optimisticCategories.length})
          </h3>
        </div>
        
        {optimisticCategories.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">No budget categories yet</p>
            <p className="text-gray-400 text-sm">Add your first category above to start planning your budget</p>
          </div>
        ) : (
          <div className="space-y-4">
            {optimisticCategories.map((category, index) => (
              <div key={category.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CategoryCard
                  category={category}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
