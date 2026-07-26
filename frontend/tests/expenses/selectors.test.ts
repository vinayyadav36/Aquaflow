import { describe, it, expect } from 'vitest';
import { getTopExpenseCategory, getPaymentModeExpenseSummary, getRecurringExpenseHints, buildExpenseSummary, detectMonthlySpike } from '../../src/modules/expenses/services/expensesSelectors';
import type { ExpenseRecord } from '../../src/lib/db';

function makeExpense(overrides: Partial<ExpenseRecord>): ExpenseRecord {
  return {
    id: '1',
    expenseNumber: 'EXP-00001',
    title: 'Test',
    amount: 100,
    category: 'rent',
    paymentMode: 'cash',
    date: new Date().toISOString(),
    status: 'recorded',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recurringHint: 'none',
    ...overrides,
  };
}

describe('getTopExpenseCategory', () => {
  it('returns null for empty list', () => {
    expect(getTopExpenseCategory([])).toBeNull();
  });

  it('returns the category with highest total', () => {
    const expenses = [
      makeExpense({ amount: 100, category: 'rent' }),
      makeExpense({ amount: 200, category: 'supplies' }),
      makeExpense({ amount: 300, category: 'rent' }),
    ];
    const top = getTopExpenseCategory(expenses);
    expect(top).toEqual({ name: 'rent', amount: 400 });
  });

  it('skips voided expenses', () => {
    const expenses = [
      makeExpense({ amount: 500, category: 'rent' }),
      makeExpense({ amount: 999, category: 'rent', status: 'voided' }),
    ];
    const top = getTopExpenseCategory(expenses);
    expect(top).toEqual({ name: 'rent', amount: 500 });
  });
});

describe('getPaymentModeExpenseSummary', () => {
  it('splits cash vs digital', () => {
    const expenses = [
      makeExpense({ amount: 100, paymentMode: 'cash' }),
      makeExpense({ amount: 200, paymentMode: 'upi' }),
      makeExpense({ amount: 300, paymentMode: 'bank' }),
      makeExpense({ amount: 50, paymentMode: 'cash', status: 'voided' }),
    ];
    const summary = getPaymentModeExpenseSummary(expenses);
    expect(summary.cashOutTotal).toBe(100);
    expect(summary.digitalOutTotal).toBe(500);
  });
});

describe('getRecurringExpenseHints', () => {
  it('filters expenses with recurring hints', () => {
    const expenses = [
      makeExpense({ title: 'Rent', amount: 1200, category: 'rent', recurringHint: 'monthly', date: '2026-07-01T00:00:00.000Z' }),
      makeExpense({ title: 'One-off', amount: 50, category: 'food/tea', recurringHint: 'none' }),
      makeExpense({ title: 'Sub', amount: 15, category: 'subscriptions', recurringHint: 'monthly', date: '2026-06-28T00:00:00.000Z' }),
    ];
    const hints = getRecurringExpenseHints(expenses);
    expect(hints).toHaveLength(2);
    expect(hints[0].title).toBe('Rent');
    expect(hints[1].title).toBe('Sub');
  });
});

describe('buildExpenseSummary', () => {
  it('builds complete summary shape', () => {
    const now = new Date();
    const todayStr = now.toISOString();
    const expenses = [
      makeExpense({ amount: 100, category: 'rent', paymentMode: 'cash', date: todayStr }),
      makeExpense({ amount: 200, category: 'supplies', paymentMode: 'upi', date: todayStr }),
    ];
    const summary = buildExpenseSummary(expenses);
    expect(summary).toHaveProperty('todayTotal');
    expect(summary).toHaveProperty('weekTotal');
    expect(summary).toHaveProperty('monthTotal');
    expect(summary).toHaveProperty('topCategory');
    expect(summary).toHaveProperty('cashOutTotal');
    expect(summary).toHaveProperty('digitalOutTotal');
    expect(summary.todayTotal).toBeGreaterThan(0);
  });
});

describe('detectMonthlySpike', () => {
  it('returns false with fewer than 2 expenses', () => {
    expect(detectMonthlySpike([makeExpense({ category: 'rent' })], 'rent')).toBe(false);
  });

  it('returns true when latest expense is significantly higher', () => {
    const expenses = [
      makeExpense({ amount: 100, category: 'rent', date: '2026-06-01T00:00:00.000Z' }),
      makeExpense({ amount: 500, category: 'rent', date: new Date().toISOString() }),
    ];
    expect(detectMonthlySpike(expenses, 'rent', 2)).toBe(true);
  });

  it('returns false when spike is below threshold', () => {
    const expenses = [
      makeExpense({ amount: 100, category: 'rent', date: '2026-06-01T00:00:00.000Z' }),
      makeExpense({ amount: 110, category: 'rent', date: new Date().toISOString() }),
    ];
    expect(detectMonthlySpike(expenses, 'rent', 2)).toBe(false);
  });
});
