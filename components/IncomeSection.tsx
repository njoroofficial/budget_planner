'use client';

import { useState, useEffect } from 'react';
import { PayBreakdown } from '@/types';
import { calculateNetPay } from '@/utils/incomeCalculator';
import { APP_CONSTANTS } from '@/constants';

interface IncomeSectionProps {
  onIncomeChange?: (payBreakdown: PayBreakdown | null) => void;
  initialGrossPay?: number;
}

export default function IncomeSection({ onIncomeChange, initialGrossPay = 0 }: IncomeSectionProps) {
  const [grossPay, setGrossPay] = useState<string>(initialGrossPay.toString());
  const [payBreakdown, setPayBreakdown] = useState<PayBreakdown | null>(null);
  const [error, setError] = useState<string>('');

  // Calculate breakdown when gross pay changes
  useEffect(() => {
    const numericGrossPay = parseFloat(grossPay);
    
    if (grossPay === '' || isNaN(numericGrossPay)) {
      setPayBreakdown(null);
      setError('');
      onIncomeChange?.(null);
      return;
    }

    if (numericGrossPay < 0) {
      setError('Gross pay must be a positive number');
      setPayBreakdown(null);
      onIncomeChange?.(null);
      return;
    }

    setError('');
    const breakdown = calculateNetPay(numericGrossPay);
    setPayBreakdown(breakdown);
    onIncomeChange?.(breakdown);
  }, [grossPay, onIncomeChange]);

  const handleGrossPayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setGrossPay(value);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `${APP_CONSTANTS.CURRENCY} ${amount.toLocaleString('en-KE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Income Calculator</h2>
      
      {/* Gross Pay Input */}
      <div className="mb-6">
        <label htmlFor="grossPay" className="block text-sm font-medium text-gray-700 mb-2">
          Gross Pay (Monthly Salary)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {APP_CONSTANTS.CURRENCY}
          </span>
          <input
            id="grossPay"
            type="text"
            value={grossPay}
            onChange={handleGrossPayChange}
            placeholder="40,000"
            className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Deductions Breakdown */}
      {payBreakdown && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Statutory Deductions</h3>
          
          {/* SHA Deduction */}
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">SHA (Social Health Authority)</span>
              <div className="group relative">
                <button className="text-blue-500 hover:text-blue-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  2.75% of gross pay
                </div>
              </div>
            </div>
            <span className="font-semibold text-gray-800">{formatCurrency(payBreakdown.sha)}</span>
          </div>

          {/* PAYEE Deduction */}
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">PAYEE (Income Tax)</span>
              <div className="group relative">
                <button className="text-green-500 hover:text-green-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  Progressive tax: 10% (0-24K), 25% (24K-32K), 30% (32K+)<br/>
                  Less personal relief: KSh 2,400
                </div>
              </div>
            </div>
            <span className="font-semibold text-gray-800">{formatCurrency(payBreakdown.payee)}</span>
          </div>

          {/* Housing Levy */}
          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">Housing Levy</span>
              <div className="group relative">
                <button className="text-yellow-500 hover:text-yellow-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  1.5% of gross pay
                </div>
              </div>
            </div>
            <span className="font-semibold text-gray-800">{formatCurrency(payBreakdown.housingLevy)}</span>
          </div>

          {/* Total Deductions */}
          <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg border-t-2 border-gray-300">
            <span className="font-semibold text-gray-800">Total Deductions</span>
            <span className="font-bold text-gray-900 text-lg">{formatCurrency(payBreakdown.totalDeductions)}</span>
          </div>

          {/* Net Pay */}
          <div className="flex justify-between items-center p-4 bg-green-100 rounded-lg border-2 border-green-300">
            <span className="font-bold text-green-800 text-lg">Net Pay (Take Home)</span>
            <span className="font-bold text-green-900 text-2xl">{formatCurrency(payBreakdown.netPay)}</span>
          </div>
        </div>
      )}

      {/* Example/Help Text */}
      {!payBreakdown && !error && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Example:</strong> Enter your monthly gross salary (e.g., KSh 40,000) to see your net pay after statutory deductions.
          </p>
        </div>
      )}
    </div>
  );
}