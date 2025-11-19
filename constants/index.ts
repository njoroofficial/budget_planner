// Default budget categories for the Budget Planner application
export const DEFAULT_CATEGORIES = [
  'House Rent',
  'Transport', 
  'Savings',
  'Food',
  'Other Expenditures'
] as const;

// Kenyan tax rates and calculation constants (2024)
export const TAX_RATES = {
  // Social Health Authority (SHA) rate
  SHA_RATE: 0.0275, // 2.75% of gross pay
  
  // Housing Levy rate
  HOUSING_LEVY_RATE: 0.015, // 1.5% of gross pay
  
  // PAYEE (Pay As You Earn) tax brackets
  PAYEE_BRACKETS: [
    { min: 0, max: 24000, rate: 0.10 },        // 10% for first KSh 24,000
    { min: 24001, max: 32333, rate: 0.25 },    // 25% for KSh 24,001 - 32,333
    { min: 32334, max: Infinity, rate: 0.30 }  // 30% for above KSh 32,333
  ],
  
  // Personal relief amount per month
  PERSONAL_RELIEF: 2400 // KSh 2,400 per month
} as const;

// Application constants
export const APP_CONSTANTS = {
  // LocalStorage key for persisting budget data
  STORAGE_KEY: 'budgetPlannerData',
  
  // Currency symbol
  CURRENCY: 'KSh',
  
  // Default gross pay for examples/testing
  DEFAULT_GROSS_PAY: 40000
} as const;

// Type definitions for constants
export type DefaultCategory = typeof DEFAULT_CATEGORIES[number];
export type PayeeBracket = typeof TAX_RATES.PAYEE_BRACKETS[number];