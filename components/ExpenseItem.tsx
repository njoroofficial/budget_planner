'use client';

import { Expense } from '../types';

/**
 * Props interface for ExpenseItem component
 */
export interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

/**
 * ExpenseItem component displays individual expense information
 * including amount, description, and formatted date.
 * Provides edit and delete functionality for expense management.
 */
export default function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  const { id, amount, description, date } = expense;

  /**
   * Format date for display in a user-friendly format
   * Converts ISO date string to localized date format
   */
  const formatDate = (dateString: string): string => {
    try {
      const dateObj = new Date(dateString);
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      // Format as DD/MM/YYYY for Kenyan users
      return dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleEdit = () => {
    onEdit(expense);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this expense: "${description}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md hover:bg-white transition-all duration-200 group">
      {/* Expense Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-1">
              <span className="text-lg font-bold text-gray-800">
                KSh {amount.toLocaleString()}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {formatDate(date)}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed" title={description}>
              {description}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleEdit}
            className="btn-success text-xs px-2 py-1"
            aria-label={`Edit expense: ${description}`}
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger text-xs px-2 py-1"
            aria-label={`Delete expense: ${description}`}
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
