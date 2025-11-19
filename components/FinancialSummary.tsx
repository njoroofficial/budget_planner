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
    <div className="card-elevated p-6 lg:p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">Financial Summary</h2>
      </div>
      
      {/* Income Overview */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <h3 className="text-xl font-bold text-gray-800">Income Overview</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-blue-700">Gross Pay</div>
            </div>
            <div className="text-3xl font-bold text-blue-800">{formatCurrency(grossPay)}</div>
            <div className="text-xs text-blue-600 mt-1">Before deductions</div>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-green-700">Net Pay</div>
            </div>
            <div className="text-3xl font-bold text-green-800">{formatCurrency(netPay)}</div>
            <div className="text-xs text-green-600 mt-1">Take home amount</div>
          </div>
        </div>
      </div>

      {/* Budget vs Spending Overview */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-800">Budget vs Spending</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-purple-700">Total Planned</div>
            </div>
            <div className="text-3xl font-bold text-purple-800">{formatCurrency(totalPlanned)}</div>
            <div className="text-xs text-purple-600 mt-1">
              {plannedPercentage.toFixed(1)}% of net pay
            </div>
          </div>
          <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-orange-700">Actual Spending</div>
            </div>
            <div className="text-3xl font-bold text-orange-800">{formatCurrency(totalSpent)}</div>
            <div className="text-xs text-orange-600 mt-1">
              {spentPercentage.toFixed(1)}% of net pay
            </div>
          </div>
        </div>
      </div>

      {/* Savings and Spending Percentage */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-800">Financial Health</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 border-2 rounded-xl hover:shadow-lg transition-all duration-300 ${getCardBackground(totalSavings)}`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                totalSavings >= 0 ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-gray-700">Total Savings</div>
            </div>
            <div className={`text-3xl font-bold ${getAmountColor(totalSavings)}`}>
              {formatCurrency(totalSavings)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Net pay minus actual spending
            </div>
          </div>
          <div className={`p-6 border-2 rounded-xl hover:shadow-lg transition-all duration-300 ${getCardBackground(spentPercentage, true)}`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                spentPercentage <= 70 ? 'bg-green-500' : spentPercentage <= 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-gray-700">Spending Rate</div>
            </div>
            <div className={`text-3xl font-bold ${getAmountColor(spentPercentage, true)}`}>
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