/**
 * Input validation utilities
 */

/**
 * Allows only numeric input in form fields
 * @param {Event} e - The input event
 * @returns {boolean} - Returns false if the input is not a digit
 */
export const allowOnlyNumbers = (e) => {
  // Allow: backspace, delete, tab, escape, enter
  if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode >= 65 && e.keyCode <= 90 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
    // let it happen, don't do anything
    return true;
  }
  
  // Ensure that it is a number and stop the keypress if not
  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
      (e.keyCode < 96 || e.keyCode > 105)) {
    e.preventDefault();
    return false;
  }
  
  return true;
};

/**
 * Formats input to ensure it contains only digits
 * @param {string} value - The input value
 * @returns {string} - The formatted value with only digits
 */
export const formatNumberInput = (value) => {
  // Remove any non-digit characters
  return value.replace(/[^\d]/g, '');
};

export default {
  allowOnlyNumbers,
  formatNumberInput
};
