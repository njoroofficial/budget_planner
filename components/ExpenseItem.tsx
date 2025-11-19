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
    <div className="border border-gray-200 rounded-lg p-3 mb-2 bg-white hover:shadow-sm transition-shadow duration-200">
      {/* Expense Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-lg font-semibold text-gray-800">
              KSh {amount.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(date)}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate" title={description}>
            {description}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 ml-3">
          <button
            onClick={handleEdit}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
            aria-label={`Edit expense: ${description}`}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
            aria-label={`Delete expense: ${description}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}