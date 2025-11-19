// Type definitions for Budget Planner application

/**
 * PayBreakdown interface represents the income calculation breakdown
 * including gross pay, all statutory deductions, and net pay
 */
export interface PayBreakdown {
  grossPay: number;
  sha: number;
  payee: number;
  housingLevy: number;
  totalDeductions: number;
  netPay: number;
}

/**
 * Expense interface represents a single expense entry
 * linked to a specific budget category
 */
export interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string; // ISO format
}

/**
 * Category interface represents a budget category
 * with planned amount, actual spending, and associated expenses
 */
export interface Category {
  id: string;
  name: string;
  plannedAmount: number;
  actualSpent: number;
  expenses: Expense[];
}

/**
 * AppState interface represents the complete application state
 * including income breakdown and all budget categories
 */
export interface AppState {
  income: PayBreakdown | null;
  categories: Category[];
}
