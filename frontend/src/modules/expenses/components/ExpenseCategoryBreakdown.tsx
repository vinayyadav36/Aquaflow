import { formatCurrency } from "../../../utils/currency";
import { useState, useEffect } from 'react';
import { PieChart, ArrowRight } from 'lucide-react';
import { expenseService } from '../api/expenseService';
import type { CategorySummaryItem } from '../api/dto';

interface ExpenseCategoryBreakdownProps {
  onSelectCategory?: (category: string) => void;
}

export function ExpenseCategoryBreakdown({ onSelectCategory }: ExpenseCategoryBreakdownProps) {
  const [categories, setCategories] = useState<CategorySummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    expenseService.getExpenseCategorySummaryApi().then(res => {
      setCategories(res.categories);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (categories.length === 0) return null;

  const total = categories.reduce((s, c) => s + c.totalAmount, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
      <div className="flex items-center mb-3">
        <PieChart className="w-4 h-4 text-gray-500 mr-2" />
        <span className="text-sm font-semibold text-gray-700">Category Breakdown</span>
      </div>
      <div className="space-y-2">
        {categories.map(cat => {
          const pct = total > 0 ? (cat.totalAmount / total) * 100 : 0;
          return (
            <button
              key={cat.category}
              onClick={() => onSelectCategory?.(cat.category)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize truncate">{cat.category}</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(cat.totalAmount)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-primary-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{cat.count} expense{cat.count !== 1 ? 's' : ''}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
