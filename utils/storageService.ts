/**
 * Storage Service Utility
 * Provides LocalStorage functions with error handling and type safety
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

/**
 * Save data to LocalStorage with error handling
 * @param key - The storage key
 * @param data - The data to save (will be JSON stringified)
 * @throws Error if storage is unavailable or quota exceeded
 */
export function saveData(key: string, data: any): void {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('LocalStorage is not available');
    }

    // Convert data to JSON string
    const jsonData = JSON.stringify(data);
    
    // Save to localStorage
    window.localStorage.setItem(key, jsonData);
    
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please clear some data and try again.');
    }
    
    // Handle other storage errors
    if (error instanceof Error && error.message.includes('LocalStorage is not available')) {
      throw error;
    }
    
    // Handle JSON serialization errors
    if (error instanceof Error && error.message.includes('JSON')) {
      throw new Error('Failed to serialize data for storage');
    }
    
    // Generic storage error
    throw new Error('Failed to save data to storage');
  }
}

/**
 * Load data from LocalStorage with type safety
 * @param key - The storage key
 * @returns The parsed data or null if not found/invalid
 */
export function loadData<T>(key: string): T | null {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    // Get data from localStorage
    const jsonData = window.localStorage.getItem(key);
    
    // Return null if no data found
    if (jsonData === null) {
      return null;
    }
    
    // Parse and return the data
    return JSON.parse(jsonData) as T;
    
  } catch (error) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      console.warn(`Invalid JSON data found for key "${key}". Returning null.`);
      return null;
    }
    
    // Handle other errors
    console.warn(`Failed to load data for key "${key}":`, error);
    return null;
  }
}

/**
 * Clear all data from LocalStorage
 * @throws Error if storage is unavailable
 */
export function clearData(): void {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('LocalStorage is not available');
    }

    // Clear all localStorage data
    window.localStorage.clear();
    
  } catch (error) {
    // Handle storage unavailable error
    if (error instanceof Error && error.message.includes('LocalStorage is not available')) {
      throw error;
    }
    
    // Generic clear error
    throw new Error('Failed to clear storage data');
  }
}

/**
 * Check if LocalStorage is available
 * @returns true if LocalStorage is available, false otherwise
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    
    // Test storage by writing and reading a test value
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove specific item from LocalStorage
 * @param key - The storage key to remove
 */
export function removeData(key: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove data for key "${key}":`, error);
  }
}