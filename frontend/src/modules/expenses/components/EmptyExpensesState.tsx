import { Link } from 'react-router-dom';
import { Plus, Wallet } from 'lucide-react';

export function EmptyExpensesState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
        <Wallet className="w-10 h-10 text-primary-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No expenses recorded yet</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-8">
        Track money going out — rent, supplies, transport, salaries, and more.
        Your expense records stay on this device, safe and private.
      </p>

      <div className="space-y-3 w-full max-w-xs">
        <Link
          to="/expenses/new"
          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl font-semibold shadow-sm hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Record Your First Expense
        </Link>

        <p className="text-xs text-gray-400 mt-4">
          Common categories: stock purchase, supplier payment, rent, utilities,
          transport, salary/staff, packaging, marketing, maintenance, subscriptions, food/tea
        </p>
      </div>
    </div>
  );
}
