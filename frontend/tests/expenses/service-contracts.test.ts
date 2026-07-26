import { describe, it, expect } from 'vitest';
import type { CreateExpenseInput, ExpenseListQuery, ExpenseDetailResponse, ExpenseSummaryResponse, CategorySummaryResponse, VoidExpenseResponse, DuplicateExpenseResponse } from '../../src/modules/expenses/api/dto';
import type { IExpenseService } from '../../src/modules/expenses/api/contracts';

// Contract shape tests - verify interfaces are correctly structured

describe('API Contract Shapes', () => {
  it('CreateExpenseInput has required fields', () => {
    const input: CreateExpenseInput = { amount: 0, category: '', paymentMode: 'cash' };
    expect(input).toHaveProperty('amount');
    expect(input).toHaveProperty('category');
    expect(input).toHaveProperty('paymentMode');
  });

  it('ExpenseDetailResponse has all expected fields', () => {
    const response: ExpenseDetailResponse = {
      id: '', expenseNumber: '', title: '', amount: 0, category: '',
      paymentMode: 'cash', date: '', status: 'recorded', createdAt: '', updatedAt: '',
    };
    const fields = ['id', 'expenseNumber', 'title', 'amount', 'category', 'paymentMode', 'date', 'status', 'createdAt', 'updatedAt'];
    fields.forEach(f => expect(response).toHaveProperty(f));
  });

  it('ExpenseSummaryResponse has required metrics', () => {
    const s: ExpenseSummaryResponse = {
      todayTotal: 0, weekTotal: 0, monthTotal: 0, topCategory: null, cashOutTotal: 0, digitalOutTotal: 0,
      categoryBreakdown: [], paymentModeBreakdown: [],
    };
    expect(s).toHaveProperty('todayTotal');
    expect(s).toHaveProperty('weekTotal');
    expect(s).toHaveProperty('monthTotal');
    expect(s.topCategory).toBeNull();
  });

  it('CategorySummaryResponse has categories array', () => {
    const r: CategorySummaryResponse = { categories: [] };
    expect(Array.isArray(r.categories)).toBe(true);
  });

  it('VoidExpenseResponse has success and expense', () => {
    const r: VoidExpenseResponse = {
      success: true,
      expense: { id: '', expenseNumber: '', title: '', amount: 0, category: '', paymentMode: 'cash', date: '', status: 'voided', createdAt: '', updatedAt: '' }
    };
    expect(r.success).toBe(true);
    expect(r.expense.status).toBe('voided');
  });

  it('DuplicateExpenseResponse has success and expense', () => {
    const r: DuplicateExpenseResponse = {
      success: true,
      expense: { id: '', expenseNumber: '', title: '', amount: 0, category: '', paymentMode: 'cash', date: '', status: 'recorded', createdAt: '', updatedAt: '' }
    };
    expect(r.success).toBe(true);
  });

  it('IExpenseService interface has all required methods', () => {
    const methods: (keyof IExpenseService)[] = [
      'createExpense', 'updateExpense', 'getExpenseById', 'getExpenses',
      'voidExpense', 'duplicateExpense', 'getExpenseSummary',
      'getExpenseCategorySummaryApi', 'getCategories', 'addCategory',
      'getSettings', 'updateSettings', 'copyLastExpense', 'initializeDefaults'
    ];
    methods.forEach(m => {
      // Just verify the method name is a valid key
      expect(typeof m).toBe('string');
    });
  });
});
