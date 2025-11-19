# Implementation Plan

- [x] 1. Set up Next.js project with TypeScript





  - Initialize Next.js 15+ project with TypeScript and App Router
  - Install and configure Tailwind CSS
  - Set up project folder structure (app, actions, components, utils, types, constants)
  - Create basic layout with metadata and global styles
  - Configure TypeScript for Server Actions
  - _Requirements: 7.1, 7.2_

- [x] 2. Create TypeScript types and interfaces





  - Define PayBreakdown, Category, Expense, and AppState interfaces in types/index.ts
  - Export all type definitions for use across the application
  - _Requirements: 1.1, 3.1, 5.1_

- [ ] 3. Implement income calculator utility





  - Create utils/incomeCalculator.ts with tax calculation functions
  - Implement calculateSHA function (2.75% of gross pay)
  - Implement calculatePAYEE function with progressive tax brackets and personal relief
  - Implement calculateHousingLevy function (1.5% of gross pay)
  - Implement calculateNetPay function that returns complete PayBreakdown
  - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [x] 4. Implement budget manager utility





  - Create utils/budgetManager.ts with category management functions
  - Implement createCategory function with duplicate name validation
  - Implement updateCategory function
  - Implement deleteCategory function
  - Implement getTotalAllocated function
  - Implement getRemainingBudget function
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3_

- [x] 5. Implement expense tracker utility





  - Create utils/expenseTracker.ts with expense management functions
  - Implement addExpense function that updates category actualSpent
  - Implement updateExpense function
  - Implement deleteExpense function
  - Implement getExpensesByCategory function
  - Implement getTotalSpent function
  - Implement getCategorySpending function
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 6. Implement storage service utility





  - Create utils/storageService.ts with LocalStorage functions
  - Implement saveData function with error handling
  - Implement loadData function with type safety
  - Implement clearData function
  - Add error handling for quota exceeded and unavailable storage
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. Create constants file





  - Create constants/index.ts with default categories
  - Define default categories: House Rent, Transport, Savings, Food, Other Expenditures
  - Define tax rates and calculation constants
  - _Requirements: 3.1_

- [x] 8. Build IncomeSection component





  - Create components/IncomeSection.tsx as a Client Component ('use client')
  - Add input field for gross pay with validation
  - Display calculated deductions (SHA, PAYEE, Housing Levy) with labels
  - Display total deductions
  - Display net pay prominently
  - Show calculation formulas or tooltips for each deduction
  - Add proper TypeScript props interface
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 9. Build CategoryCard component





  - Create components/CategoryCard.tsx
  - Display category name, planned amount, and actual spent
  - Show remaining budget for the category
  - Calculate and display percentage used
  - Add visual indicator (color coding) for budget status
  - Highlight in red if over budget
  - Include edit and delete buttons
  - Add proper TypeScript props interface
  - _Requirements: 4.1, 5.3, 5.4, 5.5_

- [x] 10. Build BudgetAllocation component





  - Create components/BudgetAllocation.tsx as a Client Component ('use client')
  - Display list of categories using CategoryCard component
  - Add form to create new category (name and planned amount inputs)
  - Validate category name is non-empty and unique
  - Display total allocated amount
  - Display remaining unallocated funds from net pay
  - Show warning message if total allocation exceeds net pay
  - Handle category updates and deletions
  - Use useOptimistic for instant UI feedback on category operations
  - Add proper TypeScript props interface
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 11. Build ExpenseItem component





  - Create components/ExpenseItem.tsx
  - Display expense amount, description, and date
  - Add edit and delete buttons
  - Format date for display
  - Add proper TypeScript props interface
  - _Requirements: 5.1_

- [x] 12. Build ExpenseTracker component





  - Create components/ExpenseTracker.tsx as a Client Component ('use client')
  - Add form to record new expense (category dropdown, amount, description, date)
  - Validate expense inputs (positive amount, valid date)
  - Display list of expenses grouped by category using ExpenseItem component
  - Handle expense updates and deletions
  - Update category spent amounts when expenses change
  - Use useOptimistic for instant UI feedback on expense operations
  - Add proper TypeScript props interface
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 13. Build FinancialSummary component





  - Create components/FinancialSummary.tsx as a Client Component ('use client')
  - Display gross pay and net pay
  - Display total planned budget across all categories
  - Display total actual spending across all categories
  - Calculate and display total savings (net pay minus actual spending)
  - Calculate and display percentage of net pay spent
  - Add visual indicators (progress bar or chart)
  - Add proper TypeScript props interface
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 14. Create Server Actions for data mutations





  - Create actions/budgetActions.ts with 'use server' directive
  - Implement createCategoryAction for adding categories
  - Implement updateCategoryAction for modifying categories
  - Implement deleteCategoryAction for removing categories
  - Implement addExpenseAction for recording expenses
  - Implement updateExpenseAction for modifying expenses
  - Implement deleteExpenseAction for removing expenses
  - Add input validation and error handling in each action
  - Return appropriate success/error responses
  - _Requirements: 3.2, 3.4, 5.1, 5.2_

- [x] 15. Implement main page with state management





  - Create app/page.tsx as a Server Component (default)
  - Set up BudgetProvider context for sharing state across Client Components
  - Load initial data from LocalStorage (client-side)
  - Integrate IncomeSection component with income state
  - Integrate BudgetAllocation component with categories state and Server Actions
  - Integrate ExpenseTracker component with categories state and Server Actions
  - Integrate FinancialSummary component with income and categories state
  - Implement auto-save to LocalStorage on state changes using useEffect
  - Handle initial state with default categories if no saved data exists
  - Add error boundaries for component errors
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 16. Add input validation and error handling
  - Validate gross pay input (positive number, required)
  - Validate category name (non-empty, unique)
  - Validate planned amounts (positive number)
  - Validate expense amounts (positive number)
  - Validate dates (valid date format)
  - Display user-friendly error messages for validation failures
  - Handle LocalStorage errors (quota exceeded, unavailable)
  - Prevent form submissions when validation fails
  - Add loading states during Server Action execution
  - _Requirements: 1.1, 3.3, 3.4, 4.1, 5.1_

- [ ] 17. Style the application with Tailwind CSS
  - Apply responsive layout (mobile-first design)
  - Style IncomeSection with clear visual hierarchy
  - Style BudgetAllocation with card-based layout
  - Style ExpenseTracker with form and list layout
  - Style FinancialSummary with prominent display
  - Add color coding for budget status (green for under budget, red for over budget, yellow for warnings)
  - Ensure consistent spacing, typography, and colors
  - Add hover states and transitions for interactive elements
  - Test responsive design on mobile and desktop viewports
  - _Requirements: 2.1, 2.2, 2.3, 4.4, 5.5_
