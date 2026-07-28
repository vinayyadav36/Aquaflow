import { formatCurrency } from "../../../utils/currency";
import { TrendingUp, Banknote, CreditCard } from 'lucide-react';
import type { ExpenseSummaryResponse } from '../api/dto';

export function ExpenseCategorySummary({ summaries }: { summaries: ExpenseSummaryResponse }) {
  return (
    <div className="space-y-3 mb-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <span className="text-xs text-gray-500 font-medium mb-1">Today</span>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(summaries.todayTotal)}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <span className="text-xs text-gray-500 font-medium mb-1">Week</span>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(summaries.weekTotal)}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <span className="text-xs text-gray-500 font-medium mb-1">Month</span>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(summaries.monthTotal)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <Banknote className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-gray-500 font-medium">Cash Out</span>
          </div>
          <span className="text-base font-bold text-gray-900">{formatCurrency(summaries.cashOutTotal)}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs text-gray-500 font-medium">Digital Out</span>
          </div>
          <span className="text-base font-bold text-gray-900">{formatCurrency(summaries.digitalOutTotal)}</span>
        </div>
      </div>

      {summaries.topCategory && (
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
          <TrendingUp className="w-3.5 h-3.5 text-primary-600" />
          <span>Top category: <strong className="text-gray-800 capitalize">{summaries.topCategory.name}</strong> ({formatCurrency(summaries.topCategory.amount)})</span>
        </div>
      )}
    </div>
  );
}
