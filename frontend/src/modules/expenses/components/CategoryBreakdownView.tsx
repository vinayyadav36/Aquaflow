import { formatCurrency } from "../../../utils/currency";
import { useState } from 'react';
import { useExpensesList } from '../hooks/useExpensesList';

export function CategoryBreakdownView() {
  const { expenses, isLoading } = useExpensesList();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />;
  }

  const active = expenses.filter(e => e.status === 'recorded');
  const catMap: Record<string, { totalAmount: number; count: number }> = {};
  active.forEach(e => {
    if (!catMap[e.category]) catMap[e.category] = { totalAmount: 0, count: 0 };
    catMap[e.category].totalAmount += e.amount;
    catMap[e.category].count += 1;
  });

  const categories = Object.entries(catMap)
    .map(([category, stats]) => ({ category, ...stats }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  const totalAll = categories.reduce((s, c) => s + c.totalAmount, 0);

  const filtered = selectedCategory
    ? active.filter(e => e.category === selectedCategory)
    : [];

  return (
    <div>
      <div className="space-y-2">
        {categories.map(cat => {
          const pct = totalAll > 0 ? (cat.totalAmount / totalAll) * 100 : 0;
          return (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(selectedCategory === cat.category ? null : cat.category)}
              className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-3 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-semibold text-gray-900 capitalize text-sm">{cat.category}</span>
                <span className="font-bold text-gray-900">{formatCurrency(cat.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex-1 mr-3">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-xs text-gray-500">{cat.count} entries</span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedCategory && filtered.length > 0 && (
        <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 capitalize mb-3">{selectedCategory} Details</h4>
          <div className="space-y-2">
            {filtered.slice(0, 10).map(e => (
              <div key={e.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 truncate pr-2">{e.title}</span>
                <span className="font-medium text-gray-900">{formatCurrency(e.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {categories.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No expenses to categorize yet</p>
      )}
    </div>
  );
}