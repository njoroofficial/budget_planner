import { PayBreakdown } from '@/types';

/**
 * Calculate SHA (Social Health Authority) deduction
 * SHA rate: 2.75% of gross pay as per 2024 Kenyan law
 * 
 * @param grossPay - The gross salary amount in KSh
 * @returns SHA deduction amount
 */
export function calculateSHA(grossPay: number): number {
  const SHA_RATE = 0.0275;
  return Math.round(grossPay * SHA_RATE * 100) / 100;
}

/**
 * Calculate PAYEE (Pay As You Earn) tax deduction
 * Applies progressive tax brackets with personal relief
 * 
 * Tax brackets (2024 Kenyan law):
 * - Up to KSh 24,000: 10%
 * - KSh 24,001 - 32,333: 25%
 * - Above KSh 32,333: 30%
 * Personal relief: KSh 2,400 per month
 * 
 * @param grossPay - The gross salary amount in KSh
 * @returns PAYEE deduction amount
 */
export function calculatePAYEE(grossPay: number): number {
  const PERSONAL_RELIEF = 2400;
  const BRACKET_1_LIMIT = 24000;
  const BRACKET_2_LIMIT = 32333;
  
  let tax = 0;
  
  // First bracket: 10% on first KSh 24,000
  if (grossPay <= BRACKET_1_LIMIT) {
    tax = grossPay * 0.10;
  }
  // Second bracket: 10% on first 24,000 + 25% on amount between 24,001 and 32,333
  else if (grossPay <= BRACKET_2_LIMIT) {
    tax = (BRACKET_1_LIMIT * 0.10) + ((grossPay - BRACKET_1_LIMIT) * 0.25);
  }
  // Third bracket: 10% on first 24,000 + 25% on next 8,333 + 30% on remainder
  else {
    tax = (BRACKET_1_LIMIT * 0.10) + 
          ((BRACKET_2_LIMIT - BRACKET_1_LIMIT) * 0.25) + 
          ((grossPay - BRACKET_2_LIMIT) * 0.30);
  }
  
  // Apply personal relief and ensure non-negative result
  const payeeAfterRelief = tax - PERSONAL_RELIEF;
  return Math.max(0, Math.round(payeeAfterRelief * 100) / 100);
}

/**
 * Calculate Housing Levy deduction
 * Housing Levy rate: 1.5% of gross pay as per 2024 Kenyan law
 * 
 * @param grossPay - The gross salary amount in KSh
 * @returns Housing Levy deduction amount
 */
export function calculateHousingLevy(grossPay: number): number {
  const HOUSING_LEVY_RATE = 0.015;
  return Math.round(grossPay * HOUSING_LEVY_RATE * 100) / 100;
}

/**
 * Calculate net pay after all statutory deductions
 * Returns complete breakdown including all deductions and net pay
 * 
 * @param grossPay - The gross salary amount in KSh
 * @returns PayBreakdown object with all deduction details and net pay
 */
export function calculateNetPay(grossPay: number): PayBreakdown {
  const sha = calculateSHA(grossPay);
  const payee = calculatePAYEE(grossPay);
  const housingLevy = calculateHousingLevy(grossPay);
  
  const totalDeductions = Math.round((sha + payee + housingLevy) * 100) / 100;
  const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;
  
  return {
    grossPay,
    sha,
    payee,
    housingLevy,
    totalDeductions,
    netPay
  };
}
