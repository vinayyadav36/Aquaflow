import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, DollarSign, Plus } from 'lucide-react';
import { useExpensesList } from '../expenses/hooks/useExpensesList';

export default function DeskPage() {
  const { summaries, isLoading } = useExpensesList();

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Desk</h2>
        <p className="text-sm text-gray-500 mt-1">Business snapshot at a glance</p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Month Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summaries?.monthTotal.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-400">Today</span>
                <p className="text-sm font-semibold text-gray-800">${summaries?.todayTotal.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">This Week</span>
                <p className="text-sm font-semibold text-gray-800">${summaries?.weekTotal.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Category</span>
              </div>
              {summaries?.topCategory ? (
                <>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{summaries.topCategory.name}</p>
                  <p className="text-lg font-bold text-gray-900">${summaries.topCategory.amount.toFixed(2)}</p>
                </>
              ) : (
                <p className="text-sm text-gray-400">No data yet</p>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cash vs Digital</span>
              </div>
              <p className="text-sm">
                <span className="font-semibold text-gray-900">${summaries?.cashOutTotal.toFixed(2) || '0'}</span>
                <span className="text-gray-400"> cash</span>
              </p>
              <p className="text-sm">
                <span className="font-semibold text-gray-900">${summaries?.digitalOutTotal.toFixed(2) || '0'}</span>
                <span className="text-gray-400"> digital</span>
              </p>
            </div>
          </div>

          <Link
            to="/expenses/new"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white rounded-xl font-semibold shadow-sm hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Record Expense
          </Link>

          <Link
            to="/expenses"
            className="block text-center text-sm text-primary-600 font-medium hover:underline"
          >
            View all expenses
          </Link>
        </div>
      )}
    </div>
  );
}
