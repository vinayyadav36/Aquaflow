import { describe, it, expect } from 'vitest';

// We test the validation logic directly since it's pure functions
import { validateCreateExpense, validateUpdateExpense, canVoidExpense, autoGenerateTitle } from '../../src/modules/expenses/services/expensesValidation';
import type { CreateExpenseInput, UpdateExpenseInput } from '../../src/modules/expenses/api/dto';

describe('validateCreateExpense', () => {
  it('returns empty errors for valid input', () => {
    const input: CreateExpenseInput = { amount: 100, category: 'rent', paymentMode: 'bank' };
    expect(validateCreateExpense(input)).toEqual([]);
  });

  it('rejects zero amount', () => {
    const input: CreateExpenseInput = { amount: 0, category: 'rent', paymentMode: 'cash' };
    expect(validateCreateExpense(input)).toContain('Amount must be greater than 0');
  });

  it('rejects negative amount', () => {
    const input: CreateExpenseInput = { amount: -50, category: 'rent', paymentMode: 'cash' };
    expect(validateCreateExpense(input)).toContain('Amount must be greater than 0');
  });

  it('rejects empty category', () => {
    const input: CreateExpenseInput = { amount: 100, category: '', paymentMode: 'cash' };
    expect(validateCreateExpense(input)).toContain('Category is required');
  });

  it('rejects missing payment mode', () => {
    const input = { amount: 100, category: 'rent' } as CreateExpenseInput;
    expect(validateCreateExpense(input)).toContain('Payment mode is required');
  });

  it('rejects invalid payment mode', () => {
    const input = { amount: 100, category: 'rent', paymentMode: 'bitcoin' } as CreateExpenseInput;
    expect(validateCreateExpense(input)).toContain('Invalid payment mode');
  });
});

describe('validateUpdateExpense', () => {
  it('returns empty for empty update', () => {
    expect(validateUpdateExpense({})).toEqual([]);
  });

  it('rejects zero amount update', () => {
    expect(validateUpdateExpense({ amount: 0 })).toContain('Amount must be greater than 0');
  });

  it('rejects empty category update', () => {
    expect(validateUpdateExpense({ category: '' })).toContain('Category cannot be empty');
  });

  it('rejects invalid payment mode', () => {
    expect(validateUpdateExpense({ paymentMode: 'crypto' as any })).toContain('Invalid payment mode');
  });
});

describe('canVoidExpense', () => {
  it('returns null for recorded expense', () => {
    expect(canVoidExpense('recorded')).toBeNull();
  });

  it('returns error for already voided expense', () => {
    expect(canVoidExpense('voided')).toBe('Expense has already been voided');
  });
});

describe('autoGenerateTitle', () => {
  it('creates title from category when no note', () => {
    expect(autoGenerateTitle('rent')).toBe('Rent Expense');
  });

  it('uses note as title when provided', () => {
    expect(autoGenerateTitle('rent', 'Paid office rent')).toBe('Paid office rent');
  });

  it('truncates long notes', () => {
    const long = 'a'.repeat(100);
    expect(autoGenerateTitle('rent', long).length).toBeLessThanOrEqual(63);
  });
});
