'use client';

import { useBudget } from './BudgetProvider';
import IncomeSection from './IncomeSection';
import BudgetAllocation from './BudgetAllocation';
import ExpenseTracker from './ExpenseTracker';
import FinancialSummary from './FinancialSummary';

/**
 * BudgetPlannerContent component contains the main application UI
 * This is a Client Component that uses the budget context and integrates all sections
 */
export default function BudgetPlannerContent() {
  const { appState, updateIncome, updateCategories, isLoading, error } = useBudget();

  // Show loading state while data is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your budget data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Budget Planner</h1>
          <p className="text-gray-600 mt-2">
            Manage your finances with Kenyan statutory deductions and expense tracking
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-800 font-medium">Notice: </span>
              <span className="text-yellow-700">{error}</span>
            </div>
          </div>
        )}

        <main className="space-y-8">
          {/* Income Section */}
          <section>
            <IncomeSection
              onIncomeChange={updateIncome}
              initialGrossPay={appState.income?.grossPay || 0}
            />
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Budget Allocation Section */}
            <section>
              <BudgetAllocation
                categories={appState.categories}
                income={appState.income}
                onCategoriesChange={updateCategories}
              />
            </section>

            {/* Expense Tracking Section */}
            <section>
              <ExpenseTracker
                categories={appState.categories}
                onCategoriesChange={updateCategories}
              />
            </section>
          </div>

          {/* Financial Summary Section */}
          <section>
            <FinancialSummary
              income={appState.income}
              categories={appState.categories}
            />
          </section>

          {/* Help Section */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Use Budget Planner</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-800 mb-2">1. Enter Income</div>
                <p className="text-blue-700">
                  Input your gross monthly salary to calculate net pay after Kenyan statutory deductions (SHA, PAYEE, Housing Levy).
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="font-semibold text-green-800 mb-2">2. Plan Budget</div>
                <p className="text-green-700">
                  Allocate your net pay across budget categories like rent, transport, savings, and food.
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="font-semibold text-orange-800 mb-2">3. Track Expenses</div>
                <p className="text-orange-700">
                  Record your actual expenses in each category to monitor spending against your budget.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="font-semibold text-purple-800 mb-2">4. Monitor Health</div>
                <p className="text-purple-700">
                  Review your financial summary to track savings, spending percentage, and budget health.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-gray-500 text-sm py-4">
            <p>
              Budget Planner - Personal Finance Management for Kenyan Users
            </p>
            <p className="mt-1">
              Tax calculations based on 2024 Kenyan statutory rates
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}