/**
 * Form validation utilities for consistent validation across the application
 */

// Constants for validation
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MIN_TITLE_LENGTH = 3;
export const MIN_DESCRIPTION_LENGTH = 3;

/**
 * Validates a task form and returns any errors
 * @param {Object} taskData - The task data to validate
 * @param {string} taskData.title - Task title
 * @param {string} taskData.description - Task description
 * @param {string} taskData.dueDate - Task due date
 * @param {string} taskData.priority - Task priority
 * @returns {Object} An object containing any validation errors
 */
export const validateTaskForm = (taskData) => {
  const errors = {};

  // Title validation
  if (!taskData.title || !taskData.title.trim()) {
    errors.title = "Title is required";
  } else if (taskData.title.trim().length < MIN_TITLE_LENGTH) {
    errors.title = `Title must be at least ${MIN_TITLE_LENGTH} characters`;
  } else if (taskData.title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or less`;
  }

  // Description validation
  if (!taskData.description || !taskData.description.trim()) {
    errors.description = "Description is required";
  } else if (taskData.description.trim().length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`;
  } else if (taskData.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
  }

  // Due date validation
  if (!taskData.dueDate) {
    errors.dueDate = "Due date is required";
  }

  // Priority validation (optional as it usually has a default value)
  if (taskData.priority && !["high", "medium", "low"].includes(taskData.priority.toLowerCase())) {
    errors.priority = "Priority must be high, medium, or low";
  }

  return errors;
};

/**
 * Helper function to get character count color class based on limit proximity
 * @param {number} currentLength - Current number of characters
 * @param {number} maxLength - Maximum allowed characters
 * @returns {string} CSS class based on character count percentage
 */
export const getCharacterCountColor = (currentLength, maxLength) => {
  const percentage = (currentLength / maxLength) * 100;
  if (percentage < 70) return "text-success-600 dark:text-success-400";
  if (percentage < 90) return "text-warning-600 dark:text-warning-400";
  return "text-danger-600 dark:text-danger-400";
};