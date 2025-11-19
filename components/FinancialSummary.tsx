'use client';

import { Category, PayBreakdown } from '../types';
import { getTotalAllocated } from '../utils/budgetManager';
import { getTotalSpent } from '../utils/expenseTracker';
import { APP_CONSTANTS } from '../constants';

/**
 * Props interface for FinancialSummary component
 */
export interface FinancialSummaryProps {
  income: PayBreakdown | null;
  categories: Category[];
}

/**
 * FinancialSummary component displays an overview of the user's financial situation
 * including income, planned budget, actual spending, savings, and spending percentage.
 * Provides visual indicators through progress bars and color coding.
 */
export default function FinancialSummary({ income, categories }: FinancialSummaryProps) {
  // Calculate financial metrics
  const grossPay = income?.grossPay || 0;
  const netPay = income?.netPay || 0;
  const totalPlanned = getTotalAllocated(categories);
  const totalSpent = getTotalSpent(categories);
  const totalSavings = netPay - totalSpent;
  const spentPercentage = netPay > 0 ? (totalSpent / netPay) * 100 : 0;
  const plannedPercentage = netPay > 0 ? (totalPlanned / netPay) * 100 : 0;

  /**
   * Formats currency amounts for display
   */
  const formatCurrency = (amount: number): string => {
    return `${APP_CONSTANTS.CURRENCY} ${amount.toLocaleString('en-KE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  /**
   * Gets color class based on financial health indicators
   */
  const getAmountColor = (amount: number, isPercentage = false): string => {
    if (isPercentage) {
      if (amount <= 70) return 'text-green-600';
      if (amount <= 90) return 'text-yellow-600';
      return 'text-red-600';
    }
    
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  /**
   * Gets progress bar color based on spending percentage
   */
  const getProgressBarColor = (percentage: number): string => {
    if (percentage <= 70) return 'bg-green-500';
    if (percentage <= 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  /**
   * Gets background color for summary cards based on values
   */
  const getCardBackground = (amount: number, isPercentage = false): string => {
    if (isPercentage) {
      if (amount <= 70) return 'bg-green-50 border-green-200';
      if (amount <= 90) return 'bg-yellow-50 border-yellow-200';
      return 'bg-red-50 border-red-200';
    }
    
    return amount >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Financial Summary</h2>
      
      {/* Income Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Income Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Gross Pay</div>
            <div className="text-2xl font-bold text-blue-800">{formatCurrency(grossPay)}</div>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Net Pay (Take Home)</div>
            <div className="text-2xl font-bold text-green-800">{formatCurrency(netPay)}</div>
          </div>
        </div>
      </div>

      {/* Budget vs Spending Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget vs Spending</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Planned Budget</div>
            <div className="text-2xl font-bold text-purple-800">{formatCurrency(totalPlanned)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {plannedPercentage.toFixed(1)}% of net pay
            </div>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Actual Spending</div>
            <div className="text-2xl font-bold text-orange-800">{formatCurrency(totalSpent)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {spentPercentage.toFixed(1)}% of net pay
            </div>
          </div>
        </div>
      </div>

      {/* Savings and Spending Percentage */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 border rounded-lg ${getCardBackground(totalSavings)}`}>
            <div className="text-sm text-gray-600 mb-1">Total Savings</div>
            <div className={`text-2xl font-bold ${getAmountColor(totalSavings)}`}>
              {formatCurrency(totalSavings)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Net pay minus actual spending
            </div>
          </div>
          <div className={`p-4 border rounded-lg ${getCardBackground(spentPercentage, true)}`}>
            <div className="text-sm text-gray-600 mb-1">Spending Rate</div>
            <div className={`text-2xl font-bold ${getAmountColor(spentPercentage, true)}`}>
              {spentPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Of net pay spent
            </div>
          </div>
        </div>
      </div>

      {/* Visual Progress Indicators */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending Progress</h3>
        
        {/* Spending vs Net Pay Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Spending vs Net Pay</span>
            <span className={`text-sm font-semibold ${getAmountColor(spentPercentage, true)}`}>
              {spentPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(spentPercentage)}`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatCurrency(0)}</span>
            <span>{formatCurrency(netPay)}</span>
          </div>
        </div>

        {/* Budget Allocation Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Budget Allocation</span>
            <span className={`text-sm font-semibold ${plannedPercentage > 100 ? 'text-red-600' : 'text-blue-600'}`}>
              {plannedPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                plannedPercentage > 100 ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(plannedPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatCurrency(0)}</span>
            <span>{formatCurrency(netPay)}</span>
          </div>
          {plannedPercentage > 100 && (
            <div className="mt-2 text-xs text-red-600">
              ⚠️ Budget allocation exceeds net pay by {formatCurrency(totalPlanned - netPay)}
            </div>
          )}
        </div>
      </div>

      {/* Financial Health Indicators */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Financial Health Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              spentPercentage <= 70 ? 'bg-green-500' : 
              spentPercentage <= 90 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-700">
              Spending: {spentPercentage <= 70 ? 'Healthy' : spentPercentage <= 90 ? 'Moderate' : 'High'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              totalSavings > 0 ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-700">
              Savings: {totalSavings > 0 ? 'Positive' : 'Negative'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              plannedPercentage <= 100 ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-700">
              Budget: {plannedPercentage <= 100 ? 'Within Limits' : 'Over-allocated'}
            </span>
          </div>
        </div>
      </div>

      {/* No Data State */}
      {!income && categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-lg font-medium">No Financial Data Available</p>
          <p className="text-sm">Enter your income and create budget categories to see your financial summary.</p>
        </div>
      )}
    </div>
  );
}