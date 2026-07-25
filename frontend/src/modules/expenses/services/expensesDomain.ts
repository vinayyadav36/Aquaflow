import { startOfDay, endOfDay, subDays, isWithinInterval, parseISO } from 'date-fns';
import type { ExpenseRecord } from '../../../lib/db';
import type { CreateExpenseInput } from '../api/dto';

export function validateExpenseInput(input: CreateExpenseInput): string[] {
  const errors: string[] = [];
  if (!input.amount || input.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  if (!input.category) {
    errors.push('Category is required');
  }
  return errors;
}

export function buildExpenseNumber(sequence: number): string {
  const prefix = 'EXP';
  const padded = sequence.toString().padStart(5, '0');
  return `${prefix}-${padded}`;
}

export function getTodayExpensesTotal(expenses: ExpenseRecord[]): number {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  return expenses
    .filter(e => e.status === 'recorded')
    .filter(e => isWithinInterval(parseISO(e.date), { start: todayStart, end: todayEnd }))
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getPeriodExpensesTotal(expenses: ExpenseRecord[], days: number): number {
  const todayEnd = endOfDay(new Date());
  const start = startOfDay(subDays(new Date(), days));
  return expenses
    .filter(e => e.status === 'recorded')
    .filter(e => isWithinInterval(parseISO(e.date), { start, end: todayEnd }))
    .reduce((sum, e) => sum + e.amount, 0);
}
