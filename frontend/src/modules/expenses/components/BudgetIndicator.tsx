import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { formatCurrency } from '../../../utils/currency';
import { AlertTriangle } from 'lucide-react';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export function BudgetIndicator() {
  const budgets = useLiveQuery(() => db.budgets.toArray());
  const expenses = useLiveQuery(() => db.expenses.where('status').equals('recorded').toArray());

  if (!budgets || budgets.length === 0 || !expenses) return null;

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const monthlyExpenses = expenses.filter(e => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start: monthStart, end: monthEnd });
  });

  const categoryTotals: Record<string, number> = {};
  monthlyExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const overBudgets = budgets
    .map(b => ({
      ...b,
      spent: categoryTotals[b.category] || 0,
      pct: ((categoryTotals[b.category] || 0) / b.monthlyLimit) * 100,
    }))
    .filter(b => b.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  if (overBudgets.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {overBudgets.map(b => {
        const isOver = b.pct >= 100;
        return (
          <div
            key={b.id}
            className={`p-3 rounded-xl border text-sm ${
              isOver
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold capitalize">{b.category}</span>
              <span className="text-xs ml-auto">{Math.round(b.pct)}%</span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-1.5 mb-1">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  isOver ? 'bg-red-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(b.pct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs opacity-75">
              <span>{formatCurrency(b.spent)} spent</span>
              <span>{formatCurrency(b.monthlyLimit)} limit</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
