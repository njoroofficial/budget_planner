# Budget Planner Design Document

## Overview

The Budget Planner is a web-based personal finance management application that helps Kenyan users manage their monthly budget. The application calculates net pay based on Kenyan statutory deductions (SHA, PAYEE, Housing Levy) and enables users to allocate funds across budget categories and track actual spending.

### Technology Stack

- **Framework**: Next.js 15+ (App Router with React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: Browser LocalStorage for data persistence
- **Architecture**: Hybrid architecture with Server Components and Client Components
- **Features**: Server Actions for form handling, React 19 features (useActionState, useOptimistic)

## Architecture

The application follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│      Server Components (RSC)            │
│  - Main Page (data loading)             │
│  - Static sections                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Client Components ('use client')   │
│  - IncomeSection (interactive forms)    │
│  - BudgetAllocation (state management)  │
│  - ExpenseTracker (real-time updates)   │
│  - FinancialSummary (dynamic display)   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Server Actions Layer            │
│  - Form submissions                     │
│  - Data mutations                       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Business Logic Layer (Utils)       │
│  - Income Calculator                    │
│  - Budget Manager                       │
│  - Expense Tracker                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    Data Persistence Layer               │
│  - LocalStorage Service (client-side)   │
└─────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Income Calculator Module

**Purpose**: Calculate net pay based on gross pay and Kenyan statutory deductions

**Key Functions**:
- `calculateSHA(grossPay)`: Returns SHA deduction amount
  - SHA rate: 2.75% of gross pay (as per 2024 Kenyan law)
- `calculatePAYEE(grossPay)`: Returns PAYEE deduction amount
  - Applies progressive tax brackets:
    - Up to KSh 24,000: 10%
    - KSh 24,001 - 32,333: 25%
    - Above KSh 32,333: 30%
  - Includes personal relief of KSh 2,400
- `calculateHousingLevy(grossPay)`: Returns Housing Levy amount
  - Housing Levy rate: 1.5% of gross pay
- `calculateNetPay(grossPay)`: Returns net pay and breakdown object
  - Returns: `{ grossPay, sha, payee, housingLevy, totalDeductions, netPay }`

**Interface**:
```typescript
// utils/incomeCalculator.ts
export function calculateSHA(grossPay: number): number
export function calculatePAYEE(grossPay: number): number
export function calculateHousingLevy(grossPay: number): number
export function calculateNetPay(grossPay: number): PayBreakdown

export interface PayBreakdown {
  grossPay: number
  sha: number
  payee: number
  housingLevy: number
  totalDeductions: number
  netPay: number
}
```

### 2. Budget Manager Module

**Purpose**: Manage budget categories and allocations

**Key Functions**:
- `createCategory(name, plannedAmount)`: Creates a new budget category
- `updateCategory(id, name, plannedAmount)`: Updates existing category
- `deleteCategory(id)`: Removes a category
- `getAllCategories()`: Returns all budget categories
- `getTotalAllocated()`: Returns sum of all planned amounts
- `getRemainingBudget(netPay)`: Returns unallocated funds

**Interface**:
```typescript
// utils/budgetManager.ts
export function createCategory(categories: Category[], name: string, plannedAmount: number): Category[]
export function updateCategory(categories: Category[], id: string, name: string, plannedAmount: number): Category[]
export function deleteCategory(categories: Category[], id: string): Category[]
export function getTotalAllocated(categories: Category[]): number
export function getRemainingBudget(categories: Category[], netPay: number): number

export interface Category {
  id: string
  name: string
  plannedAmount: number
  actualSpent: number
  expenses: Expense[]
}
```

### 3. Expense Tracker Module

**Purpose**: Record and track actual expenses against budget categories

**Key Functions**:
- `addExpense(categoryId, amount, description, date)`: Records a new expense
- `updateExpense(expenseId, amount, description, date)`: Updates existing expense
- `deleteExpense(expenseId)`: Removes an expense
- `getExpensesByCategory(categoryId)`: Returns expenses for a category
- `getTotalSpent()`: Returns total spending across all categories
- `getCategorySpending(categoryId)`: Returns total spent in a category

**Interface**:
```typescript
// utils/expenseTracker.ts
export function addExpense(categories: Category[], categoryId: string, amount: number, description: string, date: Date): Category[]
export function updateExpense(categories: Category[], expenseId: string, amount: number, description: string, date: Date): Category[]
export function deleteExpense(categories: Category[], expenseId: string): Category[]
export function getExpensesByCategory(categories: Category[], categoryId: string): Expense[]
export function getTotalSpent(categories: Category[]): number
export function getCategorySpending(categories: Category[], categoryId: string): number

export interface Expense {
  id: string
  categoryId: string
  amount: number
  description: string
  date: Date
}
```

### 4. Storage Service Module

**Purpose**: Persist and retrieve data using browser LocalStorage

**Key Functions**:
- `saveData(key, data)`: Saves data to LocalStorage
- `loadData(key)`: Retrieves data from LocalStorage
- `clearData()`: Clears all stored data

**Interface**:
```typescript
// utils/storageService.ts
export function saveData(key: string, data: any): void
export function loadData<T>(key: string): T | null
export function clearData(): void
```

### 5. Server Actions

**Purpose**: Handle form submissions and data mutations

**Actions**:
- `actions/budgetActions.ts`: Server actions for budget operations
  - `updateIncomeAction(grossPay)`: Process income updates
  - `createCategoryAction(formData)`: Create new category
  - `updateCategoryAction(formData)`: Update existing category
  - `deleteCategoryAction(categoryId)`: Delete category
  - `addExpenseAction(formData)`: Add new expense
  - `updateExpenseAction(formData)`: Update existing expense
  - `deleteExpenseAction(expenseId)`: Delete expense

**Benefits**:
- Progressive enhancement (works without JavaScript)
- Automatic revalidation
- Type-safe form handling
- Built-in error handling

### 6. React Components

**Purpose**: Render UI and handle user interactions

**Server Components** (default):
- `app/page.tsx`: Main budget planner page (loads initial data)
- `components/StaticHeader.tsx`: Static header/title sections

**Client Components** ('use client'):
- `components/IncomeSection.tsx`: Income input and deductions breakdown
- `components/BudgetAllocation.tsx`: Budget categories list and form
- `components/ExpenseTracker.tsx`: Expense entry form and list
- `components/FinancialSummary.tsx`: Overall financial summary display
- `components/CategoryCard.tsx`: Individual category display with progress
- `components/ExpenseItem.tsx`: Individual expense display

**State Management**:
- Use React 19 `useActionState` for form state with Server Actions
- Use `useOptimistic` for optimistic UI updates
- Use `useState` for local component state
- Use `useEffect` for LocalStorage synchronization
- Context API for sharing budget data across components

## Data Models

### Application State
```typescript
// types/index.ts
export interface AppState {
  income: PayBreakdown | null
  categories: Category[]
}

export interface PayBreakdown {
  grossPay: number
  sha: number
  payee: number
  housingLevy: number
  totalDeductions: number
  netPay: number
}

export interface Category {
  id: string
  name: string
  plannedAmount: number
  actualSpent: number
  expenses: Expense[]
}

export interface Expense {
  id: string
  categoryId: string
  amount: number
  description: string
  date: string // ISO format
}
```

### Default Categories
The application will initialize with these default categories:
- House Rent
- Transport
- Savings
- Food
- Other Expenditures

## User Interface Design

### Layout Structure

The application will use a single-page layout with distinct sections:

1. **Income Section** (Top)
   - Input field for gross pay
   - Display of deductions breakdown (SHA, PAYEE, Housing Levy)
   - Display of net pay

2. **Budget Allocation Section** (Middle Left)
   - List of budget categories with planned amounts
   - Form to add new categories
   - Display of total allocated and remaining budget
   - Warning indicator if over-allocated

3. **Expense Tracking Section** (Middle Right)
   - Form to add new expenses (category, amount, description, date)
   - List of recent expenses grouped by category
   - Display of spent vs. planned for each category

4. **Summary Section** (Bottom)
   - Total income (gross and net)
   - Total planned budget
   - Total actual spending
   - Total savings
   - Percentage of budget used
   - Visual indicators (progress bars or charts)

### Visual Feedback

- **Over-budget categories**: Highlighted in red
- **Under-budget categories**: Displayed in green
- **Warnings**: Yellow alert when total allocation exceeds net pay
- **Success messages**: Green confirmation when data is saved

## Error Handling

### Input Validation
- Gross pay must be a positive number
- Category names must be non-empty and unique
- Expense amounts must be positive numbers
- Dates must be valid

### Error Messages
- Display user-friendly error messages for invalid inputs
- Show specific guidance on how to correct errors
- Prevent form submission when validation fails

### Data Persistence Errors
- Handle LocalStorage quota exceeded errors
- Provide fallback if LocalStorage is unavailable
- Display warning if data cannot be saved

### Calculation Errors
- Validate numeric inputs before calculations
- Handle edge cases (zero income, negative values)
- Display error message if calculation fails

## Testing Strategy

### Unit Testing
- Test income calculation functions with various gross pay amounts
- Test budget allocation logic (total, remaining, over-budget detection)
- Test expense tracking calculations
- Test data validation functions

### Integration Testing
- Test data flow from UI input to storage
- Test data loading and rendering on app initialization
- Test category creation and expense addition workflows

### Manual Testing Scenarios
1. Enter gross pay of KSh 40,000 and verify net pay is approximately KSh 33,000
2. Create budget categories and verify total allocation updates
3. Add expenses and verify category spending updates
4. Refresh page and verify data persists
5. Test over-budget scenarios and verify warnings appear
6. Test with edge cases (zero amounts, very large numbers)

### Browser Compatibility
- Test on Chrome, Firefox, Safari, Edge
- Verify LocalStorage functionality across browsers
- Test responsive design on mobile devices

## Implementation Notes

### Project Structure
```
budget-planner/
├── app/
│   ├── page.tsx              # Main budget planner page (Server Component)
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── actions/
│   └── budgetActions.ts      # Server Actions for mutations
├── components/
│   ├── IncomeSection.tsx     # Client Component
│   ├── BudgetAllocation.tsx  # Client Component
│   ├── ExpenseTracker.tsx    # Client Component
│   ├── FinancialSummary.tsx  # Client Component
│   ├── CategoryCard.tsx      # Client Component
│   └── ExpenseItem.tsx       # Client Component
├── utils/
│   ├── incomeCalculator.ts
│   ├── budgetManager.ts
│   ├── expenseTracker.ts
│   └── storageService.ts
├── types/
│   └── index.ts              # TypeScript interfaces
└── constants/
    └── index.ts              # Default categories, tax rates
```

### Kenyan Tax Calculations (2024)
- **SHA**: 2.75% of gross pay
- **PAYEE**: Progressive rates with personal relief
  - First KSh 24,000: 10%
  - Next KSh 8,333 (24,001-32,333): 25%
  - Above KSh 32,333: 30%
  - Personal relief: KSh 2,400 per month
- **Housing Levy**: 1.5% of gross pay

### Data Persistence Strategy
- Client-side storage using LocalStorage
- Auto-save on every data change using useEffect
- Store data as JSON in LocalStorage
- Use key: `budgetPlannerData`
- Load data on component mount
- Server Actions handle data mutations and trigger revalidation

### Next.js 15+ Features Usage
- **Server Components**: Default for static content and initial data loading
- **Client Components**: For interactive forms and real-time updates
- **Server Actions**: Handle form submissions with progressive enhancement
- **useActionState**: Manage form state with Server Actions
- **useOptimistic**: Provide instant UI feedback before server confirmation
- **Automatic Code Splitting**: Optimize bundle size per route
- **Turbopack**: Fast development builds (when using `next dev --turbo`)

### Styling Approach
- Use Tailwind CSS for rapid development
- Responsive design (mobile-first)
- Clean, modern UI with clear visual hierarchy
- Color coding for budget status (green/yellow/red)
- Utilize Tailwind's dark mode support (optional enhancement)

### Future Enhancements (Out of Scope)
- Multi-month tracking and history
- Data export (CSV, PDF)
- Budget templates
- Expense categories with icons
- Charts and visualizations (Chart.js or Recharts)
- Backend API and database
- User authentication
- Mobile app version
