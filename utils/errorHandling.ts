/**
 * Error Handling Utility Functions
 * Provides comprehensive error handling for the Budget Planner application
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

export interface AppError {
  type: 'validation' | 'storage' | 'network' | 'calculation' | 'unknown';
  message: string;
  field?: string;
  code?: string;
  details?: any;
}

/**
 * Creates a standardized error object
 * @param type - The type of error
 * @param message - The error message
 * @param field - Optional field name for validation errors
 * @param code - Optional error code
 * @param details - Optional additional error details
 * @returns AppError object
 */
export function createError(
  type: AppError['type'],
  message: string,
  field?: string,
  code?: string,
  details?: any
): AppError {
  return {
    type,
    message,
    field,
    code,
    details
  };
}

/**
 * Handles LocalStorage errors with user-friendly messages
 * @param error - The caught error
 * @returns AppError with appropriate message
 */
export function handleStorageError(error: unknown): AppError {
  if (error instanceof Error) {
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
      return createError(
        'storage',
        'Storage space is full. Please clear some browser data and try again.',
        undefined,
        'QUOTA_EXCEEDED'
      );
    }

    // Handle storage unavailable error
    if (error.message.includes('LocalStorage is not available')) {
      return createError(
        'storage',
        'Local storage is not available. Please enable cookies and local storage in your browser.',
        undefined,
        'STORAGE_UNAVAILABLE'
      );
    }

    // Handle JSON serialization errors
    if (error.message.includes('JSON') || error.message.includes('serialize')) {
      return createError(
        'storage',
        'Failed to save data. The data format is invalid.',
        undefined,
        'SERIALIZATION_ERROR'
      );
    }

    // Handle security errors (private browsing, etc.)
    if (error.name === 'SecurityError') {
      return createError(
        'storage',
        'Storage access is restricted. Please disable private browsing mode.',
        undefined,
        'SECURITY_ERROR'
      );
    }
  }

  // Generic storage error
  return createError(
    'storage',
    'Failed to save data. Please try again.',
    undefined,
    'STORAGE_ERROR',
    error
  );
}

/**
 * Handles calculation errors with user-friendly messages
 * @param error - The caught error
 * @param operation - The calculation operation that failed
 * @returns AppError with appropriate message
 */
export function handleCalculationError(error: unknown, operation: string): AppError {
  if (error instanceof Error) {
    // Handle division by zero or invalid math operations
    if (error.message.includes('division') || error.message.includes('NaN')) {
      return createError(
        'calculation',
        `Invalid calculation in ${operation}. Please check your input values.`,
        undefined,
        'INVALID_CALCULATION'
      );
    }

    // Handle overflow errors
    if (error.message.includes('overflow') || error.message.includes('Infinity')) {
      return createError(
        'calculation',
        `The numbers are too large for ${operation}. Please use smaller values.`,
        undefined,
        'CALCULATION_OVERFLOW'
      );
    }
  }

  // Generic calculation error
  return createError(
    'calculation',
    `Failed to perform ${operation}. Please check your input values.`,
    undefined,
    'CALCULATION_ERROR',
    error
  );
}

/**
 * Handles network/server action errors
 * @param error - The caught error
 * @returns AppError with appropriate message
 */
export function handleNetworkError(error: unknown): AppError {
  if (error instanceof Error) {
    // Handle timeout errors
    if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      return createError(
        'network',
        'The request timed out. Please check your connection and try again.',
        undefined,
        'TIMEOUT_ERROR'
      );
    }

    // Handle connection errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return createError(
        'network',
        'Network error. Please check your internet connection.',
        undefined,
        'NETWORK_ERROR'
      );
    }

    // Handle server errors
    if (error.message.includes('500') || error.message.includes('server')) {
      return createError(
        'network',
        'Server error. Please try again later.',
        undefined,
        'SERVER_ERROR'
      );
    }
  }

  // Generic network error
  return createError(
    'network',
    'Failed to process request. Please try again.',
    undefined,
    'NETWORK_ERROR',
    error
  );
}

/**
 * Handles validation errors
 * @param field - The field that failed validation
 * @param message - The validation error message
 * @returns AppError with validation details
 */
export function handleValidationError(field: string, message: string): AppError {
  return createError(
    'validation',
    message,
    field,
    'VALIDATION_ERROR'
  );
}

/**
 * Handles unknown errors with fallback messages
 * @param error - The caught error
 * @param context - Optional context about where the error occurred
 * @returns AppError with generic message
 */
export function handleUnknownError(error: unknown, context?: string): AppError {
  const contextMessage = context ? ` while ${context}` : '';
  
  if (error instanceof Error) {
    return createError(
      'unknown',
      `An unexpected error occurred${contextMessage}: ${error.message}`,
      undefined,
      'UNKNOWN_ERROR',
      error
    );
  }

  return createError(
    'unknown',
    `An unexpected error occurred${contextMessage}. Please try again.`,
    undefined,
    'UNKNOWN_ERROR',
    error
  );
}

/**
 * Logs errors for debugging while providing user-friendly messages
 * @param error - The error to log
 * @param context - Optional context about where the error occurred
 */
export function logError(error: AppError | unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';
  
  if (typeof error === 'object' && error !== null && 'type' in error) {
    // Log AppError
    const appError = error as AppError;
    console.error(`${timestamp}${contextStr} [${appError.type.toUpperCase()}] ${appError.message}`, {
      field: appError.field,
      code: appError.code,
      details: appError.details
    });
  } else {
    // Log unknown error
    console.error(`${timestamp}${contextStr} [UNKNOWN] Unhandled error:`, error);
  }
}

/**
 * Determines if an error is recoverable (user can retry)
 * @param error - The error to check
 * @returns true if the error is recoverable, false otherwise
 */
export function isRecoverableError(error: AppError): boolean {
  switch (error.type) {
    case 'validation':
      return true; // User can fix validation errors
    case 'network':
      return true; // Network errors are usually temporary
    case 'calculation':
      return true; // User can fix input values
    case 'storage':
      // Some storage errors are recoverable
      return error.code !== 'STORAGE_UNAVAILABLE';
    case 'unknown':
      return true; // Give user benefit of doubt
    default:
      return false;
  }
}

/**
 * Gets user-friendly error message with action suggestions
 * @param error - The error to format
 * @returns Formatted error message with suggestions
 */
export function getErrorMessage(error: AppError): string {
  let message = error.message;

  // Add action suggestions based on error type
  switch (error.type) {
    case 'validation':
      message += ' Please correct the highlighted fields and try again.';
      break;
    case 'storage':
      if (error.code === 'QUOTA_EXCEEDED') {
        message += ' You can clear browser data or use a different browser.';
      } else if (error.code === 'STORAGE_UNAVAILABLE') {
        message += ' Please enable local storage in your browser settings.';
      }
      break;
    case 'network':
      message += ' Please check your internet connection and try again.';
      break;
    case 'calculation':
      message += ' Please verify your input values are correct.';
      break;
    case 'unknown':
      message += ' If the problem persists, please refresh the page.';
      break;
  }

  return message;
}

/**
 * Creates a retry function for recoverable errors
 * @param originalFunction - The function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param delay - Delay between retries in milliseconds
 * @returns Promise that resolves with the function result or rejects with the final error
 */
export async function withRetry<T>(
  originalFunction: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await originalFunction();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Don't retry non-recoverable errors
      if (typeof error === 'object' && error !== null && 'type' in error) {
        const appError = error as AppError;
        if (!isRecoverableError(appError)) {
          break;
        }
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
}