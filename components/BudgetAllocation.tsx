'use client';

import { useState, useOptimistic, useTransition } from 'react';
import { Category, PayBreakdown } from '../types';
import { createCategory, updateCategory, deleteCategory, getTotalAllocated, getRemainingBudget } from '../utils/budgetManager';
import CategoryCard from './CategoryCard';

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
   * Validates form data for category creation/editing
   */
  const validateForm = (data: CategoryFormData): boolean => {
    const errors: { name?: string; plannedAmount?: string } = {};
    
    // Validate category name
    if (!data.name.trim()) {
      errors.name = 'Category name is required';
    } else {
      // Check for duplicate names (excluding current editing category)
      const isDuplicate = optimisticCategories.some(
        cat => cat.name.toLowerCase() === data.name.trim().toLowerCase() && 
               cat.id !== editingCategory?.id
      );
      if (isDuplicate) {
        errors.name = 'Category name already exists';
      }
    }

    // Validate planned amount
    const amount = parseFloat(data.plannedAmount);
    if (!data.plannedAmount.trim()) {
      errors.plannedAmount = 'Planned amount is required';
    } else if (isNaN(amount) || amount < 0) {
      errors.plannedAmount = 'Planned amount must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Budget Allocation</h2>
      
      {/* Budget Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Net Pay:</span>
            <div className="font-semibold text-lg">KSh {netPay.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-gray-600">Total Allocated:</span>
            <div className={`font-semibold text-lg ${isOverAllocated ? 'text-red-600' : 'text-gray-800'}`}>
              KSh {totalAllocated.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Remaining:</span>
            <div className={`font-semibold text-lg ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
              KSh {remainingBudget.toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* Over-allocation warning */}
        {isOverAllocated && (
          <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-md">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-red-700 font-medium">
                Warning: Total allocation exceeds net pay by KSh {Math.abs(remainingBudget).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Category Form */}
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              id="categoryName"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter category name"
              disabled={isPending}
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="plannedAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Planned Amount (KSh)
            </label>
            <input
              id="plannedAmount"
              type="number"
              min="0"
              step="0.01"
              value={formData.plannedAmount}
              onChange={(e) => handleInputChange('plannedAmount', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.plannedAmount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter planned amount"
              disabled={isPending}
            />
            {formErrors.plannedAmount && (
              <p className="mt-1 text-sm text-red-600">{formErrors.plannedAmount}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isPending ? 'Processing...' : editingCategory ? 'Update Category' : 'Add Category'}
          </button>
          
          {editingCategory && (
            <button
              type="button"
              onClick={resetForm}
              disabled={isPending}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Categories List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Budget Categories ({optimisticCategories.length})
        </h3>
        
        {optimisticCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No budget categories yet.</p>
            <p className="text-sm">Add your first category above to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {optimisticCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}