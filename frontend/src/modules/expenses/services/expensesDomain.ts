import { startOfDay, endOfDay, subDays, isWithinInterval, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import type { ExpenseRecord } from '../../../lib/db';
import type { CreateExpenseInput } from '../api/dto';

export function validateExpenseInput(input: CreateExpenseInput): string[] {
  const errors: string[] = [];
  if (input.amount === undefined || input.amount === null || input.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  if (!input.category) {
    errors.push('Category is required');
  }
  if (input.amount && isNaN(input.amount)) {
    errors.push('Amount must be a valid number');
  }
  return errors;
}

export function buildExpenseNumber(sequence: number): string {
  const prefix = 'EXP';
  const padded = sequence.toString().padStart(5, '0');
  return `${prefix}-${padded}`;
}

export function smartTitle(category: string, note?: string): string {
  if (note && note.trim()) return note.trim();
  return category.charAt(0).toUpperCase() + category.slice(1);
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

export function getWeekExpensesTotal(expenses: ExpenseRecord[]): number {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  return expenses
    .filter(e => e.status === 'recorded')
    .filter(e => isWithinInterval(parseISO(e.date), { start: weekStart, end: weekEnd }))
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getMonthExpensesTotal(expenses: ExpenseRecord[]): number {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  return expenses
    .filter(e => e.status === 'recorded')
    .filter(e => isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd }))
    .reduce((sum, e) => sum + e.amount, 0);
}

export interface CategorySummary {
  category: string;
  totalAmount: number;
  count: number;
}

export function getExpenseCategorySummary(expenses: ExpenseRecord[]): CategorySummary[] {
  const active = expenses.filter(e => e.status === 'recorded');
  const map: Record<string, { totalAmount: number; count: number }> = {};
  active.forEach(e => {
    if (!map[e.category]) map[e.category] = { totalAmount: 0, count: 0 };
    map[e.category].totalAmount += e.amount;
    map[e.category].count += 1;
  });
  return Object.entries(map)
    .map(([category, stats]) => ({ category, totalAmount: stats.totalAmount, count: stats.count }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

export interface PaymentModeSummary {
  paymentMode: string;
  totalAmount: number;
  count: number;
}

export function getPaymentModeExpenseSummary(expenses: ExpenseRecord[]): PaymentModeSummary[] {
  const active = expenses.filter(e => e.status === 'recorded');
  const map: Record<string, { totalAmount: number; count: number }> = {};
  active.forEach(e => {
    if (!map[e.paymentMode]) map[e.paymentMode] = { totalAmount: 0, count: 0 };
    map[e.paymentMode].totalAmount += e.amount;
    map[e.paymentMode].count += 1;
  });
  return Object.entries(map)
    .map(([paymentMode, stats]) => ({ paymentMode, totalAmount: stats.totalAmount, count: stats.count }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

export function getTopExpenseCategory(expenses: ExpenseRecord[]): { name: string; amount: number } | null {
  const categories = getExpenseCategorySummary(expenses);
  if (categories.length === 0) return null;
  return { name: categories[0].category, amount: categories[0].totalAmount };
}

export interface RecurringHint {
  category: string;
  title: string;
  hint: 'daily' | 'weekly' | 'monthly' | 'custom';
  lastAmount: number;
  lastDate: string;
}

export function getRecurringExpenseHints(expenses: ExpenseRecord[]): RecurringHint[] {
  const active = expenses.filter(e => e.status === 'recorded' && e.recurringHint && e.recurringHint !== 'none');
  const latestByKey = new Map<string, ExpenseRecord>();
  active.forEach(e => {
    const key = `${e.category}::${e.title}`;
    const existing = latestByKey.get(key);
    if (!existing || new Date(e.date) > new Date(existing.date)) {
      latestByKey.set(key, e);
    }
  });
  return Array.from(latestByKey.values()).map(e => ({
    category: e.category,
    title: e.title,
    hint: e.recurringHint as 'daily' | 'weekly' | 'monthly' | 'custom',
    lastAmount: e.amount,
    lastDate: e.date,
  }));
}

export interface ExpenseTimelineItem {
  id: string;
  type: 'expense';
  title: string;
  amount: number;
  category: string;
  paymentMode: string;
  date: string;
  status: string;
}

export function buildExpenseTimelineItem(expense: ExpenseRecord): ExpenseTimelineItem {
  return {
    id: expense.id,
    type: 'expense',
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    paymentMode: expense.paymentMode,
    date: expense.date,
    status: expense.status,
  };
}

export interface ExpenseSummary {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  topCategory: { name: string; amount: number } | null;
  cashOutTotal: number;
  digitalOutTotal: number;
  categoryBreakdown: CategorySummary[];
  paymentModeBreakdown: PaymentModeSummary[];
  totalCount: number;
  recurringCount: number;
}

export function buildExpenseSummary(expenses: ExpenseRecord[]): ExpenseSummary {
  const active = expenses.filter(e => e.status === 'recorded');
  const todayTotal = getTodayExpensesTotal(expenses);
  const weekTotal = getWeekExpensesTotal(expenses);
  const monthTotal = getMonthExpensesTotal(expenses);
  const topCategory = getTopExpenseCategory(expenses);
  const categoryBreakdown = getExpenseCategorySummary(expenses);
  const paymentModeBreakdown = getPaymentModeExpenseSummary(expenses);

  let cashOutTotal = 0;
  let digitalOutTotal = 0;
  active.forEach(e => {
    if (e.paymentMode === 'cash') cashOutTotal += e.amount;
    else digitalOutTotal += e.amount;
  });

  const recurringCount = active.filter(e => e.recurringHint && e.recurringHint !== 'none').length;

  return {
    todayTotal,
    weekTotal,
    monthTotal,
    topCategory,
    cashOutTotal,
    digitalOutTotal,
    categoryBreakdown,
    paymentModeBreakdown,
    totalCount: active.length,
    recurringCount,
  };
}

export function isMonthlySpike(expenses: ExpenseRecord[], category: string, threshold: number = 1.5): boolean {
  const active = expenses.filter(e => e.status === 'recorded' && e.category === category);
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const thisMonth = active.filter(e => isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd }));
  const thisMonthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);

  const lastMonthStart = startOfMonth(subDays(monthStart, 1));
  const lastMonthEnd = endOfMonth(subDays(monthStart, 1));
  const lastMonth = active.filter(e => isWithinInterval(parseISO(e.date), { start: lastMonthStart, end: lastMonthEnd }));
  const lastMonthTotal = lastMonth.reduce((sum, e) => sum + e.amount, 0);

  if (lastMonthTotal === 0) return false;
  return thisMonthTotal > lastMonthTotal * threshold;
}
