'use client';

import { Category } from '../types';

/**
 * Props interface for CategoryCard component
 */
export interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

/**
 * CategoryCard component displays individual budget category information
 * including planned amount, actual spent, remaining budget, and percentage used.
 * Provides visual indicators for budget status and edit/delete functionality.
 */
export default function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const { id, name, plannedAmount, actualSpent } = category;
  
  // Calculate remaining budget for the category
  const remainingBudget = plannedAmount - actualSpent;
  
  // Calculate percentage used (handle division by zero)
  const percentageUsed = plannedAmount > 0 ? (actualSpent / plannedAmount) * 100 : 0;
  
  // Determine budget status for color coding
  const isOverBudget = actualSpent > plannedAmount;
  const isNearBudget = percentageUsed >= 80 && percentageUsed <= 100;
  
  // Get appropriate CSS classes for budget status
  const getStatusClasses = () => {
    if (isOverBudget) {
      return 'border-red-500 bg-red-50';
    } else if (isNearBudget) {
      return 'border-yellow-500 bg-yellow-50';
    } else {
      return 'border-green-500 bg-green-50';
    }
  };
  
  const getProgressBarClasses = () => {
    if (isOverBudget) {
      return 'bg-red-500';
    } else if (isNearBudget) {
      return 'bg-yellow-500';
    } else {
      return 'bg-green-500';
    }
  };
  
  const getTextColorClasses = () => {
    if (isOverBudget) {
      return 'text-red-700';
    } else if (isNearBudget) {
      return 'text-yellow-700';
    } else {
      return 'text-green-700';
    }
  };

  const handleEdit = () => {
    onEdit(category);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the "${name}" category? This will also delete all associated expenses.`)) {
      onDelete(id);
    }
  };

  return (
    <div className={`border-2 rounded-lg p-4 mb-4 transition-all duration-200 hover:shadow-md ${getStatusClasses()}`}>
      {/* Category Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{name}</h3>
        <div className="flex gap-2 ml-2">
          <button
            onClick={handleEdit}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
            aria-label={`Edit ${name} category`}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
            aria-label={`Delete ${name} category`}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Budget Information */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Planned:</span>
          <span className="font-medium">KSh {plannedAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Spent:</span>
          <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-800'}`}>
            KSh {actualSpent.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Remaining:</span>
          <span className={`font-medium ${remainingBudget < 0 ? 'text-red-600' : 'text-gray-800'}`}>
            KSh {remainingBudget.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">Usage</span>
          <span className={`text-xs font-medium ${getTextColorClasses()}`}>
            {percentageUsed.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarClasses()}`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Status Message */}
      {isOverBudget && (
        <div className="text-xs text-red-600 font-medium mt-2">
          ⚠️ Over budget by KSh {Math.abs(remainingBudget).toLocaleString()}
        </div>
      )}
      {isNearBudget && !isOverBudget && (
        <div className="text-xs text-yellow-600 font-medium mt-2">
          ⚡ Approaching budget limit
        </div>
      )}
    </div>
  );
}