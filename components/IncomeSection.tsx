'use client';

import { useState, useEffect, useRef } from 'react';
import { PayBreakdown } from '@/types';
import { calculateNetPay } from '@/utils/incomeCalculator';
import { APP_CONSTANTS } from '@/constants';
import { validateGrossPay } from '@/utils/validation';
import { handleCalculationError, logError } from '@/utils/errorHandling';

interface IncomeSectionProps {
  onIncomeChange?: (payBreakdown: PayBreakdown | null) => void;
  initialGrossPay?: number;
}

export default function IncomeSection({ onIncomeChange, initialGrossPay = 0 }: IncomeSectionProps) {
  const [grossPay, setGrossPay] = useState<string>(initialGrossPay.toString());
  const [payBreakdown, setPayBreakdown] = useState<PayBreakdown | null>(null);
  const [error, setError] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  
  // Store the callback in a ref to avoid dependency issues
  const onIncomeChangeRef = useRef(onIncomeChange);
  
  // Update ref when callback changes
  useEffect(() => {
    onIncomeChangeRef.current = onIncomeChange;
  }, [onIncomeChange]);

  // Calculate breakdown when gross pay changes
  useEffect(() => {
    const calculateBreakdown = async () => {
      // Clear previous error
      setError('');
      
      // Handle empty input
      if (grossPay === '') {
        setPayBreakdown(null);
        onIncomeChangeRef.current?.(null);
        return;
      }

      // Validate gross pay input
      const validation = validateGrossPay(grossPay);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid gross pay');
        setPayBreakdown(null);
        onIncomeChangeRef.current?.(null);
        return;
      }

      const numericGrossPay = parseFloat(grossPay);
      
      try {
        setIsCalculating(true);
        
        // Add small delay to show loading state for better UX
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const breakdown = calculateNetPay(numericGrossPay);
        setPayBreakdown(breakdown);
        onIncomeChangeRef.current?.(breakdown);
      } catch (calculationError) {
        const appError = handleCalculationError(calculationError, 'income calculation');
        setError(appError.message);
        setPayBreakdown(null);
        onIncomeChangeRef.current?.(null);
        logError(appError, 'calculating income breakdown');
      } finally {
        setIsCalculating(false);
      }
    };

    calculateBreakdown();
  }, [grossPay]);

  const handleGrossPayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    
    // Allow empty string for clearing input
    if (value === '') {
      setGrossPay(value);
      return;
    }
    
    // Allow only valid numeric input with optional decimal point
    // This regex allows: 123, 123., 123.45, .45, etc.
    if (/^\d*\.?\d*$/.test(value)) {
      // Prevent multiple decimal points
      const decimalCount = (value.match(/\./g) || []).length;
      if (decimalCount <= 1) {
        // Limit to reasonable number of decimal places (2)
        const parts = value.split('.');
        if (parts.length === 1 || parts[1].length <= 2) {
          setGrossPay(value);
        }
      }
    }
  };

  const formatCurrency = (amount: number): string => {
    return `${APP_CONSTANTS.CURRENCY} ${amount.toLocaleString('en-KE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <div className="card-elevated p-6 lg:p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-linear-to-r from-green-500 to-blue-500 rounded-xl shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">Income Calculator</h2>
      </div>
      
      {/* Gross Pay Input */}
      <div className="mb-8">
        <label htmlFor="grossPay" className="block text-sm font-semibold text-gray-700 mb-3">
          Gross Pay (Monthly Salary)
        </label>
        <div className="relative group">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
            {APP_CONSTANTS.CURRENCY}
          </span>
          <input
            id="grossPay"
            type="text"
            value={grossPay}
            onChange={handleGrossPayChange}
            placeholder="40,000"
            className={`input-field pl-16 pr-4 py-4 text-lg font-semibold ${
              error ? 'input-error' : ''
            } ${isCalculating ? 'bg-blue-50 border-blue-300' : ''} group-hover:shadow-md`}
            disabled={isCalculating}
          />
          {isCalculating && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
        {error && (
          <div className="mt-2 flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {isCalculating && (
          <div className="mt-2 flex items-center space-x-2">
            <svg className="animate-spin w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-blue-600">Calculating...</p>
          </div>
        )}
      </div>

      {/* Deductions Breakdown */}
      {payBreakdown && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center space-x-2 mb-6">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-800">Statutory Deductions</h3>
          </div>
          
          {/* SHA Deduction */}
          <div className="group flex justify-between items-center p-4 bg-linear-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-blue-800">SHA (Social Health Authority)</span>
                <div className="group/tooltip relative inline-block ml-2">
                  <button className="text-blue-500 hover:text-blue-700 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 shadow-lg">
                    2.75% of gross pay
                  </div>
                </div>
                <div className="text-xs text-blue-600 mt-1">Health Insurance</div>
              </div>
            </div>
            <span className="font-bold text-blue-900 text-lg">{formatCurrency(payBreakdown.sha)}</span>
          </div>

          {/* PAYEE Deduction */}
          <div className="group flex justify-between items-center p-4 bg-linear-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-green-800">PAYEE (Income Tax)</span>
                <div className="group/tooltip relative inline-block ml-2">
                  <button className="text-green-500 hover:text-green-700 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 shadow-lg">
                    Progressive tax: 10% (0-24K), 25% (24K-32K), 30% (32K+)<br/>
                    Less personal relief: KSh 2,400
                  </div>
                </div>
                <div className="text-xs text-green-600 mt-1">Progressive Income Tax</div>
              </div>
            </div>
            <span className="font-bold text-green-900 text-lg">{formatCurrency(payBreakdown.payee)}</span>
          </div>

          {/* Housing Levy */}
          <div className="group flex justify-between items-center p-4 bg-linear-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-yellow-800">Housing Levy</span>
                <div className="group/tooltip relative inline-block ml-2">
                  <button className="text-yellow-500 hover:text-yellow-700 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 shadow-lg">
                    1.5% of gross pay
                  </div>
                </div>
                <div className="text-xs text-yellow-600 mt-1">Housing Fund</div>
              </div>
            </div>
            <span className="font-bold text-yellow-900 text-lg">{formatCurrency(payBreakdown.housingLevy)}</span>
          </div>

          {/* Total Deductions */}
          <div className="flex justify-between items-center p-5 bg-linear-to-r from-gray-100 to-gray-200 rounded-xl border-2 border-gray-300 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-bold text-gray-800 text-lg">Total Deductions</span>
            </div>
            <span className="font-bold text-gray-900 text-xl">{formatCurrency(payBreakdown.totalDeductions)}</span>
          </div>

          {/* Net Pay */}
          <div className="flex justify-between items-center p-6 bg-linear-to-r from-emerald-100 to-green-100 rounded-xl border-2 border-emerald-300 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-linear-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-emerald-800 text-xl">Net Pay</span>
                <div className="text-sm text-emerald-600">Take Home Amount</div>
              </div>
            </div>
            <span className="font-bold text-emerald-900 text-2xl lg:text-3xl">{formatCurrency(payBreakdown.netPay)}</span>
          </div>
        </div>
      )}

      {/* Example/Help Text */}
      {!payBreakdown && !error && (
        <div className="mt-6 p-5 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-blue-800 font-medium mb-1">Get Started</p>
              <p className="text-sm text-blue-700 leading-relaxed">
                Enter your monthly gross salary (e.g., KSh 40,000) to automatically calculate your net pay after Kenyan statutory deductions including SHA, PAYEE, and Housing Levy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
