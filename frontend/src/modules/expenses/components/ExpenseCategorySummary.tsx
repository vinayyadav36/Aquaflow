
import type { ExpenseSummaryResponse } from '../api/dto';

export function ExpenseCategorySummary({ summaries }: { summaries: ExpenseSummaryResponse }) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
        <span className="text-xs text-gray-500 font-medium mb-1">Today</span>
        <span className="text-lg font-bold text-gray-900">${summaries.todayTotal.toFixed(2)}</span>
      </div>
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
        <span className="text-xs text-gray-500 font-medium mb-1">Week</span>
        <span className="text-lg font-bold text-gray-900">${summaries.weekTotal.toFixed(2)}</span>
      </div>
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
        <span className="text-xs text-gray-500 font-medium mb-1">Month</span>
        <span className="text-lg font-bold text-gray-900">${summaries.monthTotal.toFixed(2)}</span>
      </div>
    </div>
  );
}
