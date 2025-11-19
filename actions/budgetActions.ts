'use server';

import { revalidatePath } from 'next/cache';
import { Category } from '../types';
import { createCategory, updateCategory, deleteCategory } from '../utils/budgetManager';
import { addExpense, updateExpense, deleteExpense } from '../utils/expenseTracker';

/**
 * Server Actions for Budget Planner data mutations
 * These actions handle form submissions and data validation
 * Note: Data persistence is handled client-side via LocalStorage
 */

// Action result types for consistent error handling
export type ActionResult = {
  success: boolean;
  message: string;
  data?: any;
};

/**
 * Server Action to create a new budget category
 * @param prevState - Previous action state (for useActionState)
 * @param formData - Form data containing category name, planned amount, and current categories
 * @returns ActionResult with success status and message
 */
export async function createCategoryAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Extract and validate form data
    const name = formData.get('name') as string;
    const plannedAmountStr = formData.get('plannedAmount') as string;
    const categoriesJson = formData.get('categories') as string;

    // Input validation
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        message: 'Category name is required'
      };
    }

    if (!plannedAmountStr) {
      return {
        success: false,
        message: 'Planned amount is required'
      };
    }

    const plannedAmount = parseFloat(plannedAmountStr);
    
    if (isNaN(plannedAmount) || plannedAmount < 0) {
      return {
        success: false,
        message: 'Planned amount must be a valid positive number'
      };
    }

    // Parse current categories from form data
    let categories: Category[] = [];
    if (categoriesJson) {
      try {
        categories = JSON.parse(categoriesJson);
      } catch {
        categories = [];
      }
    }

    // Create new category using utility function
    const updatedCategories = createCategory(categories, name, plannedAmount);

    // Revalidate the page to reflect changes
    revalidatePath('/');

    return {
      success: true,
      message: 'Category created successfully',
      data: updatedCategories
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create category'
    };
  }
}

/**
 * Server Action to update an existing budget category
 * @param prevState - Previous action state (for useActionState)
 * @param formData - Form data containing category ID, name, planned amount, and current categories
 * @returns ActionResult with success status and message
 */
export async function updateCategoryAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Extract and validate form data
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const plannedAmountStr = formData.get('plannedAmount') as string;
    const categoriesJson = formData.get('categories') as string;

    // Input validation
    if (!id) {
      return {
        success: false,
        message: 'Category ID is required'
      };
    }

    if (!name || name.trim().length === 0) {
      return {
        success: false,
        message: 'Category name is required'
      };
    }

    if (!plannedAmountStr) {
      return {
        success: false,
        message: 'Planned amount is required'
      };
    }

    const plannedAmount = parseFloat(plannedAmountStr);
    
    if (isNaN(plannedAmount) || plannedAmount < 0) {
      return {
        success: false,
        message: 'Planned amount must be a valid positive number'
      };
    }

    // Parse current categories from form data
    let categories: Category[] = [];
    if (categoriesJson) {
      try {
        categories = JSON.parse(categoriesJson);
      } catch {
        return {
          success: false,
          message: 'Invalid categories data'
        };
      }
    }

    // Update category using utility function
    const updatedCategories = updateCategory(categories, id, name, plannedAmount);

    // Revalidate the page to reflect changes
    revalidatePath('/');

    return {
      success: true,
      message: 'Category updated successfully',
      data: updatedCategories
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update category'
    };
  }
}

/**
 * Server Action to delete a budget category
 * @param prevState - Previous action state (for useActionState)
 * @param formData - Form data containing category ID and current categories
 * @returns ActionResult with success status and message
 */
export async function deleteCategoryAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Extract and validate form data
    const id = formData.get('id') as string;
    const categoriesJson = formData.get('categories') as string;

    // Input validation
    if (!id) {
      return {
        success: false,
        message: 'Category ID is required'
      };
    }

    // Parse current categories from form data
    let categories: Category[] = [];
    if (categoriesJson) {
      try {
        categories = JSON.parse(categoriesJson);
      } catch {
        return {
          success: false,
          message: 'Invalid categories data'
        };
      }
    }

    // Delete category using utility function
    const updatedCategories = deleteCategory(categories, id);

    // Revalidate the page to reflect changes
    revalidatePath('/');

    return {
      success: true,
      message: 'Category deleted successfully',
      data: updatedCategories
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete category'
    };
  }
}

/**
 * Server Action to add a new expense to a category
 * @param prevState - Previous action state (for useActionState)
 * @param formData - Form data containing category ID, amount, description, date, and current categories
 * @returns ActionResult with success status and message
 */
export async function addExpenseAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Extract and validate form data
    const categoryId = formData.get('categoryId') as string;
    const amountStr = formData.get('amount') as string;
    const description = formData.get('description') as string;
    const dateStr = formData.get('date') as string;
    const categoriesJson = formData.get('categories') as string;

    // Input validation
    if (!categoryId) {
      return {
        success: false,
        message: 'Category ID is required'
      };
    }

    if (!amountStr) {
      return {
        success: false,
        message: 'Expense amount is required'
      };
    }

    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) {
      return {
        success: false,
        message: 'Expense amount must be a valid positive number'
      };
    }

    if (!description || description.trim().length === 0) {
      return {
        success: false,
        message: 'Expense description is required'
      };
    }

    if (!dateStr) {
      return {
        success: false,
        message: 'Expense date is required'
      };
    }

    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      return {
        success: false,
        message: 'Invalid date format'
      };
    }

    // Parse current categories from form data
    let categories: Category[] = [];
    if (categoriesJson) {
      try {
        categories = JSON.parse(categoriesJson);
      } catch {
        return {
          success: false,
          message: 'Invalid categories data'
        };
      }
    }

    // Add expense using utility function
    const updatedCategories = addExpense(categories, categoryId, amount, description, date);

    // Revalidate the page to reflect changes
    revalidatePath('/');

    return {
      success: true,
      message: 'Expense added successfully',
      data: updatedCategories
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add expense'
    };
  }
}

/**
 * Server Action to update an existing expense
 * @param prevState - Previous action state (for useActionState)
 * @param formData - Form data containing expense ID, amount, description, date, and current categories
 * @returns ActionResult with success status and message
 */
export async function updateExpenseAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Extract and validate form data
    const id = formData.get('id') as string;
    const amountStr = formData.get('amount') as string;
    const description = formData.get('description') as string;
    const dateStr = formData.get('date') as string;
    const categoriesJson = formData.get('categories') as string;

    // Input validation
    if (!id) {
      return {
        success: false,
        message: 'Expense ID is required'
      };
    }

    if (!amountStr) {
      return {
        success: false,
        message: 'Expense amount is required'
      };
    }

    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) {
      return {
        success: false,
        message: 'Expense amount must be a valid positive number'
      };
    }

    if (!description || description.trim().length === 0) {
      return {
        success: false,
        message: 'Expense description is required'
      };
    }

    if (!dateStr) {
      return {
        success: false,
        message: 'Expense date is required'
      };
    }

    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      return {
        success: false,
        message: 'Invalid date format'
      };
    }

    // Parse current categories from form data
    let categories: Category[] = [];
    if (categoriesJson) {
      try {
        categories = JSON.parse(categoriesJson);
      } catch {
        return {
          success: false,
          message: 'Invalid categories data'
        };
      }
    }

    // Update expense using utility function
    const updatedCategories = updateExpense(categories, id, amount, description, date);

    // Revalidate the page to reflect changes
    revalidatePath('/');

    return {
      success: true,
      message: 'Expense updated successfully',
      data: updatedCategories
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update expense'
    };
  }
}

/**
 * Server Action to delete an expense
 * @param prevState - Previous action state (for useActionState)
 * @param formData - Form data containing expense ID and current categories
 * @returns ActionResult with success status and message
 */
export async function deleteExpenseAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Extract and validate form data
    const id = formData.get('id') as string;
    const categoriesJson = formData.get('categories') as string;

    // Input validation
    if (!id) {
      return {
        success: false,
        message: 'Expense ID is required'
      };
    }

    // Parse current categories from form data
    let categories: Category[] = [];
    if (categoriesJson) {
      try {
        categories = JSON.parse(categoriesJson);
      } catch {
        return {
          success: false,
          message: 'Invalid categories data'
        };
      }
    }

    // Delete expense using utility function
    const updatedCategories = deleteExpense(categories, id);

    // Revalidate the page to reflect changes
    revalidatePath('/');

    return {
      success: true,
      message: 'Expense deleted successfully',
      data: updatedCategories
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete expense'
    };
  }
}