/**
 * Validation Utility Functions
 * Provides comprehensive input validation for the Budget Planner application
 * Requirements: 1.1, 3.3, 3.4, 4.1, 5.1
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates gross pay input
 * @param value - The gross pay value to validate
 * @returns ValidationResult with validation status and error message
 */
export function validateGrossPay(value: string | number): ValidationResult {
  // Handle empty or null values
  if (value === '' || value === null || value === undefined) {
    return {
      isValid: false,
      error: 'Gross pay is required'
    };
  }

  // Convert to number if string
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  // Check if it's a valid number
  if (isNaN(numericValue)) {
    return {
      isValid: false,
      error: 'Gross pay must be a valid number'
    };
  }

  // Check if it's positive
  if (numericValue < 0) {
    return {
      isValid: false,
      error: 'Gross pay must be a positive number'
    };
  }

  // Check for reasonable upper limit (optional business rule)
  if (numericValue > 10000000) {
    return {
      isValid: false,
      error: 'Gross pay seems unusually high. Please verify the amount'
    };
  }

  return { isValid: true };
}

/**
 * Validates category name input
 * @param name - The category name to validate
 * @param existingNames - Array of existing category names to check for duplicates
 * @param excludeId - Optional ID to exclude from duplicate check (for editing)
 * @returns ValidationResult with validation status and error message
 */
export function validateCategoryName(
  name: string, 
  existingNames: string[] = [], 
  excludeId?: string
): ValidationResult {
  // Check if name is provided
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: 'Category name is required'
    };
  }

  // Check minimum length
  if (name.trim().length < 2) {
    return {
      isValid: false,
      error: 'Category name must be at least 2 characters long'
    };
  }

  // Check maximum length
  if (name.trim().length > 50) {
    return {
      isValid: false,
      error: 'Category name must be less than 50 characters'
    };
  }

  // Check for duplicate names (case-insensitive)
  const trimmedName = name.trim().toLowerCase();
  const isDuplicate = existingNames.some(existingName => 
    existingName.toLowerCase() === trimmedName
  );

  if (isDuplicate) {
    return {
      isValid: false,
      error: 'Category name already exists'
    };
  }

  // Check for invalid characters (optional)
  const invalidCharsRegex = /[<>\"'&]/;
  if (invalidCharsRegex.test(name)) {
    return {
      isValid: false,
      error: 'Category name contains invalid characters'
    };
  }

  return { isValid: true };
}

/**
 * Validates planned amount input
 * @param value - The planned amount to validate
 * @returns ValidationResult with validation status and error message
 */
export function validatePlannedAmount(value: string | number): ValidationResult {
  // Handle empty or null values
  if (value === '' || value === null || value === undefined) {
    return {
      isValid: false,
      error: 'Planned amount is required'
    };
  }

  // Convert to number if string
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  // Check if it's a valid number
  if (isNaN(numericValue)) {
    return {
      isValid: false,
      error: 'Planned amount must be a valid number'
    };
  }

  // Check if it's positive
  if (numericValue < 0) {
    return {
      isValid: false,
      error: 'Planned amount must be a positive number'
    };
  }

  // Check for reasonable upper limit
  if (numericValue > 1000000) {
    return {
      isValid: false,
      error: 'Planned amount seems unusually high. Please verify the amount'
    };
  }

  return { isValid: true };
}

/**
 * Validates expense amount input
 * @param value - The expense amount to validate
 * @returns ValidationResult with validation status and error message
 */
export function validateExpenseAmount(value: string | number): ValidationResult {
  // Handle empty or null values
  if (value === '' || value === null || value === undefined) {
    return {
      isValid: false,
      error: 'Expense amount is required'
    };
  }

  // Convert to number if string
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  // Check if it's a valid number
  if (isNaN(numericValue)) {
    return {
      isValid: false,
      error: 'Expense amount must be a valid number'
    };
  }

  // Check if it's positive
  if (numericValue <= 0) {
    return {
      isValid: false,
      error: 'Expense amount must be greater than zero'
    };
  }

  // Check for reasonable upper limit
  if (numericValue > 1000000) {
    return {
      isValid: false,
      error: 'Expense amount seems unusually high. Please verify the amount'
    };
  }

  return { isValid: true };
}

/**
 * Validates expense description input
 * @param description - The expense description to validate
 * @returns ValidationResult with validation status and error message
 */
export function validateExpenseDescription(description: string): ValidationResult {
  // Check if description is provided
  if (!description || description.trim().length === 0) {
    return {
      isValid: false,
      error: 'Expense description is required'
    };
  }

  // Check minimum length
  if (description.trim().length < 3) {
    return {
      isValid: false,
      error: 'Description must be at least 3 characters long'
    };
  }

  // Check maximum length
  if (description.trim().length > 100) {
    return {
      isValid: false,
      error: 'Description must be less than 100 characters'
    };
  }

  return { isValid: true };
}

/**
 * Validates date input
 * @param dateValue - The date value to validate (string or Date)
 * @returns ValidationResult with validation status and error message
 */
export function validateDate(dateValue: string | Date): ValidationResult {
  // Handle empty values
  if (!dateValue) {
    return {
      isValid: false,
      error: 'Date is required'
    };
  }

  // Convert to Date object
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;

  // Check if it's a valid date
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: 'Please enter a valid date'
    };
  }

  // Check if date is not in the future (more than 1 day ahead)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  if (date > tomorrow) {
    return {
      isValid: false,
      error: 'Date cannot be in the future'
    };
  }

  // Check if date is not too far in the past (more than 2 years)
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  if (date < twoYearsAgo) {
    return {
      isValid: false,
      error: 'Date cannot be more than 2 years in the past'
    };
  }

  return { isValid: true };
}

/**
 * Validates category selection for expenses
 * @param categoryId - The selected category ID
 * @param availableCategories - Array of available category IDs
 * @returns ValidationResult with validation status and error message
 */
export function validateCategorySelection(
  categoryId: string, 
  availableCategories: string[] = []
): ValidationResult {
  // Check if category is selected
  if (!categoryId || categoryId.trim().length === 0) {
    return {
      isValid: false,
      error: 'Please select a category'
    };
  }

  // Check if selected category exists
  if (availableCategories.length > 0 && !availableCategories.includes(categoryId)) {
    return {
      isValid: false,
      error: 'Selected category is not valid'
    };
  }

  return { isValid: true };
}

/**
 * Validates form data for multiple fields at once
 * @param formData - Object containing form field values
 * @param validationRules - Object containing validation functions for each field
 * @returns Object with validation results for each field
 */
export function validateFormData<T extends Record<string, any>>(
  formData: T,
  validationRules: Partial<Record<keyof T, (value: any) => ValidationResult>>
): Record<keyof T, ValidationResult> {
  const results = {} as Record<keyof T, ValidationResult>;

  for (const [field, value] of Object.entries(formData)) {
    const validator = validationRules[field as keyof T];
    if (validator) {
      results[field as keyof T] = validator(value);
    } else {
      results[field as keyof T] = { isValid: true };
    }
  }

  return results;
}

/**
 * Checks if all validation results are valid
 * @param validationResults - Object containing validation results
 * @returns true if all validations pass, false otherwise
 */
export function isFormValid<T extends Record<string, ValidationResult>>(
  validationResults: T
): boolean {
  return Object.values(validationResults).every(result => result.isValid);
}

/**
 * Extracts error messages from validation results
 * @param validationResults - Object containing validation results
 * @returns Object with error messages for invalid fields
 */
export function getValidationErrors<T extends Record<string, ValidationResult>>(
  validationResults: T
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const [field, result] of Object.entries(validationResults)) {
    if (!result.isValid && result.error) {
      errors[field as keyof T] = result.error;
    }
  }

  return errors;
}