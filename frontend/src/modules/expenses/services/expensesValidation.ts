import type { CreateExpenseInput, UpdateExpenseInput } from '../api/dto';

export function validateCreateExpense(input: CreateExpenseInput): string[] {
  const errors: string[] = [];
  if (!input.amount || input.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  if (!input.category || input.category.trim() === '') {
    errors.push('Category is required');
  }
  if (!input.paymentMode) {
    errors.push('Payment mode is required');
  }
  const validPaymentModes = ['cash', 'upi', 'bank', 'card', 'other'];
  if (input.paymentMode && !validPaymentModes.includes(input.paymentMode)) {
    errors.push('Invalid payment mode');
  }
  return errors;
}

export function validateUpdateExpense(input: UpdateExpenseInput): string[] {
  const errors: string[] = [];
  if (input.amount !== undefined && input.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  if (input.category !== undefined && input.category.trim() === '') {
    errors.push('Category cannot be empty');
  }
  if (input.paymentMode !== undefined) {
    const validPaymentModes = ['cash', 'upi', 'bank', 'card', 'other'];
    if (!validPaymentModes.includes(input.paymentMode)) {
      errors.push('Invalid payment mode');
    }
  }
  return errors;
}

export function canVoidExpense(status: string): string | null {
  if (status === 'voided') return 'Expense has already been voided';
  return null;
}

export function autoGenerateTitle(category: string, note?: string): string {
  if (note && note.length > 0) {
    return note.length > 60 ? note.substring(0, 60) + '...' : note;
  }
  const cat = category.charAt(0).toUpperCase() + category.slice(1);
  return `${cat} Expense`;
}
