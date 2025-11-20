'use client';

import { useBudget } from './BudgetProvider';
import IncomeSection from './IncomeSection';
import BudgetAllocation from './BudgetAllocation';
import ExpenseTracker from './ExpenseTracker';
import FinancialSummary from './FinancialSummary';
import ErrorDisplay, { LoadingSpinner } from './ErrorDisplay';

/**
 * BudgetPlannerContent component contains the main application UI
 * This is a Client Component that uses the budget context and integrates all sections
 */
export default function BudgetPlannerContent() {
  const { 
    appState, 
    updateIncome, 
    updateCategories, 
    isLoading, 
    error, 
    clearError, 
    retryDataLoad, 
    storageAvailable 
  } = useBudget();

  // Show loading state while data is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your budget data...</p>
          <p className="text-sm text-gray-500 mt-2">
            {storageAvailable ? 'Retrieving saved data...' : 'Initializing application...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center lg:text-left animate-fade-in">
          <div className="inline-flex items-center justify-center lg:justify-start space-x-3 mb-4">
            <div className="p-3 bg-linear-to-r from-blue-600 to-green-600 rounded-xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-linear-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                My Budget Planner
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto lg:mx-0">
            Personal finance tracker with Kenyan statutory deductions
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <ErrorDisplay
            error={error}
            onRetry={retryDataLoad}
            onDismiss={clearError}
            className="mb-6"
          />
        )}

        {/* Storage Warning */}
        {!storageAvailable && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="text-orange-800 font-medium">Storage Unavailable: </span>
                <span className="text-orange-700">
                  Your data cannot be saved. Changes will be lost when you refresh the page. 
                  Please enable local storage in your browser settings.
                </span>
              </div>
            </div>
          </div>
        )}

        <main className="space-y-8">
          {/* Income Section */}
          <section className="animate-slide-up">
            <IncomeSection
              onIncomeChange={updateIncome}
              initialGrossPay={appState.income?.grossPay && appState.income.grossPay > 0 ? appState.income.grossPay : undefined}
            />
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Budget Allocation Section */}
            <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <BudgetAllocation
                categories={appState.categories}
                income={appState.income}
                onCategoriesChange={updateCategories}
              />
            </section>

            {/* Expense Tracking Section */}
            <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <ExpenseTracker
                categories={appState.categories}
                onCategoriesChange={updateCategories}
              />
            </section>
          </div>

          {/* Financial Summary Section */}
          <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <FinancialSummary
              income={appState.income}
              categories={appState.categories}
            />
          </section>

          {/* Help Section */}
          <section className="card-elevated p-6 lg:p-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-linear-to-r from-purple-500 to-pink-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">How to Use Budget Planner</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
              <div className="group p-5 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <div className="font-bold text-blue-800">Enter Income</div>
                </div>
                <p className="text-blue-700 text-sm leading-relaxed">
                  Input your gross monthly salary to calculate net pay after Kenyan statutory deductions (SHA, PAYEE, Housing Levy).
                </p>
              </div>
              <div className="group p-5 bg-linear-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <div className="font-bold text-green-800">Plan Budget</div>
                </div>
                <p className="text-green-700 text-sm leading-relaxed">
                  Allocate your net pay across budget categories like rent, transport, savings, and food.
                </p>
              </div>
              <div className="group p-5 bg-linear-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <div className="font-bold text-orange-800">Track Expenses</div>
                </div>
                <p className="text-orange-700 text-sm leading-relaxed">
                  Record your actual expenses in each category to monitor spending against your budget.
                </p>
              </div>
              <div className="group p-5 bg-linear-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                  <div className="font-bold text-purple-800">Monitor Health</div>
                </div>
                <p className="text-purple-700 text-sm leading-relaxed">
                  Review your financial summary to track savings, spending percentage, and budget health.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-gray-500 text-sm py-6 border-t border-gray-200 mt-12">
            <div className="space-y-2">
              <p className="font-medium">
                My Personal Budget Planner
              </p>
              <p className="text-xs">
                Tax calculations based on 2024 Kenyan statutory rates
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs pt-2">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Data saved locally in your browser</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Real-time calculations</span>
                </span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}