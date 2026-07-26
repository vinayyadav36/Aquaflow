import { useExpensesList } from '../hooks/useExpensesList';
import { RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function RecurringHintsList() {
  const { expenses, isLoading } = useExpensesList();

  if (isLoading) return null;

  const recurring = expenses.filter(
    e => e.status === 'recorded' && e.recurringHint && e.recurringHint !== 'none'
  );

  if (recurring.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center mb-3">
        <RefreshCw className="w-4 h-4 text-primary-600 mr-2" />
        <h3 className="font-semibold text-gray-900 text-sm">Recurring Expenses</h3>
      </div>
      <div className="space-y-2">
        {recurring.map(e => (
          <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="capitalize">{e.category}</span>
                <span>•</span>
                <span className="capitalize">{e.recurringHint}</span>
                <span>•</span>
                <span>Last: {format(parseISO(e.date), 'MMM d')}</span>
              </div>
            </div>
            <span className="font-semibold text-gray-900 ml-3">${e.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
