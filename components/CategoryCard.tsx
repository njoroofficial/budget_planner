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
    <div className={`card-subtle p-5 transition-shadow duration-300 hover:shadow-lg ${getStatusClasses()}`}>
      {/* Category Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isOverBudget ? 'bg-red-500' : isNearBudget ? 'bg-yellow-500' : 'bg-green-500'
          }`}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 truncate">{name}</h3>
            <div className={`text-sm font-medium ${getTextColorClasses()}`}>
              {isOverBudget ? 'Over Budget' : isNearBudget ? 'Near Limit' : 'On Track'}
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-3">
          <button
            onClick={handleEdit}
            className="btn-success text-xs px-3 py-1.5"
            aria-label={`Edit ${name} category`}
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger text-xs px-3 py-1.5"
            aria-label={`Delete ${name} category`}
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Budget Information */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 mb-1">Planned</div>
          <div className="text-sm font-bold text-gray-800">KSh {plannedAmount.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 mb-1">Spent</div>
          <div className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-800'}`}>
            KSh {actualSpent.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 mb-1">Remaining</div>
          <div className={`text-sm font-bold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
            KSh {remainingBudget.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Budget Usage</span>
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${
            isOverBudget ? 'bg-red-100 text-red-800' : 
            isNearBudget ? 'bg-yellow-100 text-yellow-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {percentageUsed.toFixed(1)}%
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
          <div
            className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressBarClasses()}`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Status Message */}
      {isOverBudget && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-red-700 font-medium text-sm">
            Over budget by KSh {Math.abs(remainingBudget).toLocaleString()}
          </span>
        </div>
      )}
      {isNearBudget && !isOverBudget && (
        <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-yellow-700 font-medium text-sm">
            Approaching budget limit
          </span>
        </div>
      )}
      {!isOverBudget && !isNearBudget && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-green-700 font-medium text-sm">
            Budget on track
          </span>
        </div>
      )}
    </div>
  );
}