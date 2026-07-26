import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import type { CategorySummaryItem } from '../api/dto';

export function CategoryBreakdown() {
  const expenses = useLiveQuery(() => db.expenses.toArray());

  if (!expenses) return null;

  const active = expenses.filter(e => e.status === 'recorded');

  const categoryMap: Record<string, { totalAmount: number; count: number }> = {};
  active.forEach(e => {
    if (!categoryMap[e.category]) categoryMap[e.category] = { totalAmount: 0, count: 0 };
    categoryMap[e.category].totalAmount += e.amount;
    categoryMap[e.category].count += 1;
  });

  const categories: CategorySummaryItem[] = Object.entries(categoryMap)
    .map(([category, stats]) => ({ category, totalAmount: stats.totalAmount, count: stats.count }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  if (categories.length === 0) return null;

  const maxAmount = categories[0]?.totalAmount || 1;
  const totalAll = categories.reduce((s, c) => s + c.totalAmount, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Category Breakdown</h3>
      <div className="space-y-2.5">
        {categories.map(cat => {
          const pct = Math.round((cat.totalAmount / maxAmount) * 100);
          const share = Math.round((cat.totalAmount / totalAll) * 100);
          return (
            <div key={cat.category} className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-600 w-28 truncate capitalize shrink-0">{cat.category}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-800 w-20 text-right shrink-0">${cat.totalAmount.toFixed(0)}</span>
              <span className="text-xs text-gray-400 w-8 text-right shrink-0">{share}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
