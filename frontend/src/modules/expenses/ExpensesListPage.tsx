
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useExpensesList } from './hooks/useExpensesList';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseCategorySummary } from './components/ExpenseCategorySummary';

export default function ExpensesListPage() {
  const { expenses, summaries, isLoading } = useExpensesList();

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Expenses</h2>
        <Link
          to="/expenses/new"
          className="bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-full shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                <div className="h-2 bg-gray-200 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {summaries && <ExpenseCategorySummary summaries={summaries} />}
          <ExpenseList expenses={expenses} />
        </>
      )}
    </div>
  );
}
