import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useExpensesList } from './hooks/useExpensesList';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseCategorySummary } from './components/ExpenseCategorySummary';
import { ExpenseFilters } from './components/ExpenseFilters';
import { QuickExpenseEntry } from './components/QuickExpenseEntry';
import { CategoryBreakdownView } from './components/CategoryBreakdownView';
import { PresetExpenses } from './components/PresetExpenses';
import { EmptyExpensesState } from './components/EmptyExpensesState';

export default function ExpensesListPage() {
  const { expenses, summaries, filters, isLoading, updateFilters, resetFilters } = useExpensesList();
  const [showQuickEntry, setShowQuickEntry] = useState(false);

  const monthlySpikeCategory = useMemo(() => {
    if (!summaries?.categoryBreakdown) return null;
    const cats = summaries.categoryBreakdown;
    if (cats.length < 2) return null;
    const top = cats[0];
    const avgOthers = cats.slice(1).reduce((s, c) => s + c.totalAmount, 0) / cats.slice(1).length;
    return avgOthers > 0 && top.totalAmount > avgOthers * 2.5 ? top.category : null;
  }, [summaries]);

  if (isLoading) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-16 bg-gray-200 rounded-xl"></div>
          <div className="h-16 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Expenses</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track money going out</p>
        </div>
        <Link
          to="/expenses/new"
          className="bg-gray-900 hover:bg-gray-800 text-white p-2.5 rounded-full shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      {monthlySpikeCategory && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
          Monthly spike detected in <strong className="capitalize">{monthlySpikeCategory}</strong>. Review recent expenses.
        </div>
      )}

      {expenses.length === 0 && !filters.search && !filters.category ? (
        <EmptyExpensesState />
      ) : (
        <>
          {summaries && <ExpenseCategorySummary summaries={summaries} />}
          <PresetExpenses />
          <CategoryBreakdownView />
          <div className="mt-2">
            <button
              onClick={() => setShowQuickEntry(!showQuickEntry)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 mb-2"
            >
              {showQuickEntry ? '− Hide Quick Entry' : '+ Quick Entry'}
            </button>
            {showQuickEntry && <QuickExpenseEntry />}
          </div>
          <ExpenseFilters
            filters={filters}
            onFilterChange={updateFilters}
            onReset={resetFilters}
          />
          <ExpenseList expenses={expenses} />
        </>
      )}
    </div>
  );
}
