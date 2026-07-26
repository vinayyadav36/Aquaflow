import { startOfDay, endOfDay, subDays, isWithinInterval, parseISO } from 'date-fns';
import type { ExpenseRecord } from '../../../lib/db';
import type { ExpenseSummaryResponse, CategorySummaryResponse } from '../api/dto';

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

export function getTopExpenseCategory(expenses: ExpenseRecord[]): { name: string; amount: number } | null {
  const catTotals: Record<string, number> = {};
  expenses.filter(e => e.status === 'recorded').forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });
  let top: { name: string; amount: number } | null = null;
  for (const [name, amount] of Object.entries(catTotals)) {
    if (!top || amount > top.amount) top = { name, amount };
  }
  return top;
}

export function getExpenseCategorySummary(expenses: ExpenseRecord[]): CategorySummaryResponse {
  const catMap: Record<string, { totalAmount: number; count: number }> = {};
  expenses.filter(e => e.status === 'recorded').forEach(e => {
    if (!catMap[e.category]) catMap[e.category] = { totalAmount: 0, count: 0 };
    catMap[e.category].totalAmount += e.amount;
    catMap[e.category].count += 1;
  });
  return {
    categories: Object.entries(catMap)
      .map(([category, stats]) => ({ category, totalAmount: stats.totalAmount, count: stats.count }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
  };
}

export function getPaymentModeExpenseSummary(expenses: ExpenseRecord[]): { cashOutTotal: number; digitalOutTotal: number } {
  let cashOutTotal = 0;
  let digitalOutTotal = 0;
  expenses.filter(e => e.status === 'recorded').forEach(e => {
    if (e.paymentMode === 'cash') cashOutTotal += e.amount;
    else digitalOutTotal += e.amount;
  });
  return { cashOutTotal, digitalOutTotal };
}

export function getRecurringExpenseHints(expenses: ExpenseRecord[]): Array<{ category: string; title: string; amount: number; recurringHint: string; lastDate: string }> {
  return expenses
    .filter(e => e.status === 'recorded' && e.recurringHint && e.recurringHint !== 'none')
    .map(e => ({
      category: e.category,
      title: e.title,
      amount: e.amount,
      recurringHint: e.recurringHint!,
      lastDate: e.date
    }));
}

export function buildExpenseSummary(expenses: ExpenseRecord[]): ExpenseSummaryResponse {
  const todayTotal = getTodayExpensesTotal(expenses);
  const weekTotal = getPeriodExpensesTotal(expenses, 7);
  const monthTotal = getPeriodExpensesTotal(expenses, 30);
  const topCategory = getTopExpenseCategory(expenses);
  const { cashOutTotal, digitalOutTotal } = getPaymentModeExpenseSummary(expenses);
  const catSummary = getExpenseCategorySummary(expenses);
  const catBreakdown = catSummary.categories.map(c => ({ category: c.category, totalAmount: c.totalAmount, count: c.count }));
  const pmMap: Record<string, { totalAmount: number; count: number }> = {};
  expenses.filter(e => e.status === 'recorded').forEach(e => {
    if (!pmMap[e.paymentMode]) pmMap[e.paymentMode] = { totalAmount: 0, count: 0 };
    pmMap[e.paymentMode].totalAmount += e.amount;
    pmMap[e.paymentMode].count += 1;
  });
  const paymentModeBreakdown = Object.entries(pmMap).map(([paymentMode, stats]) => ({ paymentMode, totalAmount: stats.totalAmount, count: stats.count }));
  return { todayTotal, weekTotal, monthTotal, topCategory, cashOutTotal, digitalOutTotal, categoryBreakdown: catBreakdown, paymentModeBreakdown };
}

export function buildExpenseTimelineItem(expense: ExpenseRecord) {
  return {
    type: 'expense' as const,
    id: expense.id,
    expenseNumber: expense.expenseNumber,
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    paymentMode: expense.paymentMode,
    date: expense.date,
    status: expense.status
  };
}

export function detectMonthlySpike(expenses: ExpenseRecord[], category: string, thresholdMultiplier: number = 2): boolean {
  const catExpenses = expenses.filter(e => e.status === 'recorded' && e.category === category);
  if (catExpenses.length < 2) return false;
  const sorted = catExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latest = sorted[0].amount;
  const avg = sorted.slice(1).reduce((s, e) => s + e.amount, 0) / sorted.slice(1).length;
  return latest > avg * thresholdMultiplier;
}