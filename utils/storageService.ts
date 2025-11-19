/**
 * Storage Service Utility
 * Provides LocalStorage functions with error handling and type safety
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { handleStorageError, logError, AppError } from './errorHandling';

/**
 * Save data to LocalStorage with comprehensive error handling
 * @param key - The storage key
 * @param data - The data to save (will be JSON stringified)
 * @throws AppError if storage is unavailable or quota exceeded
 */
export function saveData(key: string, data: any): void {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      const error = new Error('LocalStorage is not available');
      error.name = 'StorageUnavailableError';
      throw error;
    }

    // Validate key
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      throw new Error('Storage key must be a non-empty string');
    }

    // Convert data to JSON string with error handling
    let jsonData: string;
    try {
      jsonData = JSON.stringify(data);
    } catch (serializationError) {
      const error = new Error('Failed to serialize data for storage');
      error.name = 'SerializationError';
      throw error;
    }

    // Check data size (localStorage typically has 5-10MB limit)
    const dataSize = new Blob([jsonData]).size;
    if (dataSize > 5 * 1024 * 1024) { // 5MB limit
      const error = new Error('Data is too large to store (exceeds 5MB limit)');
      error.name = 'DataTooLargeError';
      throw error;
    }
    
    // Save to localStorage
    window.localStorage.setItem(key, jsonData);
    
    // Verify the data was saved correctly
    const savedData = window.localStorage.getItem(key);
    if (savedData !== jsonData) {
      throw new Error('Data verification failed after saving');
    }
    
  } catch (error) {
    const appError = handleStorageError(error);
    logError(appError, `saving data with key: ${key}`);
    throw appError;
  }
}

/**
 * Load data from LocalStorage with comprehensive error handling and type safety
 * @param key - The storage key
 * @returns The parsed data or null if not found/invalid
 */
export function loadData<T>(key: string): T | null {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      logError(
        handleStorageError(new Error('LocalStorage is not available')), 
        `loading data with key: ${key}`
      );
      return null;
    }

    // Validate key
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      logError(
        new Error('Storage key must be a non-empty string'), 
        `loading data with invalid key: ${key}`
      );
      return null;
    }

    // Get data from localStorage
    const jsonData = window.localStorage.getItem(key);
    
    // Return null if no data found
    if (jsonData === null) {
      return null;
    }

    // Check if data is empty string
    if (jsonData.trim().length === 0) {
      logError(
        new Error('Empty data found in storage'), 
        `loading data with key: ${key}`
      );
      return null;
    }
    
    // Parse and return the data with error handling
    try {
      const parsedData = JSON.parse(jsonData) as T;
      
      // Basic validation - ensure we got something back
      if (parsedData === undefined) {
        logError(
          new Error('Parsed data is undefined'), 
          `loading data with key: ${key}`
        );
        return null;
      }
      
      return parsedData;
    } catch (parseError) {
      // Handle JSON parsing errors
      logError(
        handleStorageError(parseError), 
        `parsing JSON data with key: ${key}`
      );
      
      // Optionally remove corrupted data
      try {
        window.localStorage.removeItem(key);
      } catch (removeError) {
        logError(removeError, `removing corrupted data with key: ${key}`);
      }
      
      return null;
    }
    
  } catch (error) {
    // Handle other errors
    logError(
      handleStorageError(error), 
      `loading data with key: ${key}`
    );
    return null;
  }
}

/**
 * Clear all data from LocalStorage with error handling
 * @throws AppError if storage is unavailable
 */
export function clearData(): void {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      const error = new Error('LocalStorage is not available');
      error.name = 'StorageUnavailableError';
      throw error;
    }

    // Get current storage size for logging
    const storageSize = JSON.stringify(window.localStorage).length;
    
    // Clear all localStorage data
    window.localStorage.clear();
    
    // Verify storage was cleared
    if (window.localStorage.length > 0) {
      throw new Error('Failed to clear all storage data');
    }
    
    console.log(`Cleared ${storageSize} bytes from localStorage`);
    
  } catch (error) {
    const appError = handleStorageError(error);
    logError(appError, 'clearing all storage data');
    throw appError;
  }
}

/**
 * Check if LocalStorage is available and functional
 * @returns true if LocalStorage is available and working, false otherwise
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    
    // Test storage by writing and reading a test value
    const testKey = '__budget_planner_storage_test__';
    const testValue = 'test_' + Date.now();
    
    // Test write
    window.localStorage.setItem(testKey, testValue);
    
    // Test read
    const retrievedValue = window.localStorage.getItem(testKey);
    
    // Test remove
    window.localStorage.removeItem(testKey);
    
    // Verify the test worked correctly
    return retrievedValue === testValue;
  } catch (error) {
    logError(
      handleStorageError(error), 
      'testing storage availability'
    );
    return false;
  }
}

/**
 * Remove specific item from LocalStorage with error handling
 * @param key - The storage key to remove
 * @throws AppError if removal fails critically
 */
export function removeData(key: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      logError(
        handleStorageError(new Error('LocalStorage is not available')), 
        `removing data with key: ${key}`
      );
      return;
    }

    // Validate key
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      logError(
        new Error('Storage key must be a non-empty string'), 
        `removing data with invalid key: ${key}`
      );
      return;
    }
    
    // Check if key exists before removal
    const exists = window.localStorage.getItem(key) !== null;
    
    // Remove the item
    window.localStorage.removeItem(key);
    
    // Verify removal if item existed
    if (exists) {
      const stillExists = window.localStorage.getItem(key) !== null;
      if (stillExists) {
        const error = new Error(`Failed to remove data for key: ${key}`);
        logError(handleStorageError(error), `removing data with key: ${key}`);
      }
    }
    
  } catch (error) {
    const appError = handleStorageError(error);
    logError(appError, `removing data with key: ${key}`);
    // Don't throw for removal errors unless critical
    if (appError.code === 'STORAGE_UNAVAILABLE') {
      throw appError;
    }
  }
}

/**
 * Get storage usage information
 * @returns Object with storage usage details
 */
export function getStorageInfo(): {
  available: boolean;
  used: number;
  remaining: number;
  total: number;
  items: number;
} {
  const defaultInfo = {
    available: false,
    used: 0,
    remaining: 0,
    total: 0,
    items: 0
  };

  try {
    if (!isStorageAvailable()) {
      return defaultInfo;
    }

    let used = 0;
    const items = window.localStorage.length;
    
    // Calculate used space
    for (let i = 0; i < items; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        const value = window.localStorage.getItem(key) || '';
        used += key.length + value.length;
      }
    }

    // Estimate total available space (typically 5-10MB, we'll use 5MB as conservative estimate)
    const total = 5 * 1024 * 1024; // 5MB in bytes
    const remaining = Math.max(0, total - used);

    return {
      available: true,
      used,
      remaining,
      total,
      items
    };
  } catch (error) {
    logError(
      handleStorageError(error), 
      'getting storage information'
    );
    return defaultInfo;
  }
}