import { useNavigate } from 'react-router-dom';
import { useExpensesList } from '../hooks/useExpensesList';
import { formatCurrency } from '../../../utils/currency';
import { RefreshCw, Plus, Clock, AlertCircle } from 'lucide-react';
import { format, parseISO, differenceInDays, addDays, addWeeks, addMonths } from 'date-fns';

function getNextDueDate(lastDate: string, hint: string): Date | null {
  const d = parseISO(lastDate);
  switch (hint) {
    case 'daily': return addDays(d, 1);
    case 'weekly': return addWeeks(d, 1);
    case 'monthly': return addMonths(d, 1);
    default: return null;
  }
}

export function RecurringHintsList() {
  const { expenses, isLoading } = useExpensesList();
  const navigate = useNavigate();

  if (isLoading) return null;

  const recurring = expenses.filter(
    e => e.status === 'recorded' && e.recurringHint && e.recurringHint !== 'none'
  );

  if (recurring.length === 0) return null;

  const today = new Date();

  const suggestions = recurring.map(e => {
    const nextDue = getNextDueDate(e.date, e.recurringHint!);
    if (!nextDue) return { ...e, nextDue: null, daysOverdue: 0, isOverdue: false };
    const daysOverdue = differenceInDays(today, nextDue);
    return { ...e, nextDue, daysOverdue, isOverdue: daysOverdue >= 0 };
  }).sort((a, b) => (b.daysOverdue) - (a.daysOverdue));

  const handleQuickCreate = (s: typeof suggestions[0]) => {
    const params = new URLSearchParams({
      amount: String(s.amount),
      category: s.category,
      title: s.title,
    });
    navigate(`/expenses/new?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center mb-3">
        <RefreshCw className="w-4 h-4 text-primary-600 mr-2" />
        <h3 className="font-semibold text-gray-900 text-sm">Recurring Due</h3>
      </div>
      <div className="space-y-2">
        {suggestions.map(e => (
          <div
            key={e.id}
            className={`flex items-center justify-between py-2 px-2 rounded-lg ${
              e.isOverdue ? 'bg-amber-50 border border-amber-100' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                {e.isOverdue && <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="capitalize">{e.category}</span>
                <span>·</span>
                <span className="capitalize">{e.recurringHint}</span>
                <span>·</span>
                {e.nextDue ? (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {e.isOverdue
                      ? `${e.daysOverdue}d overdue`
                      : `Due ${format(e.nextDue, 'MMM d')}`
                    }
                  </span>
                ) : (
                  <span>Last: {format(parseISO(e.date), 'MMM d')}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(e.amount)}</span>
              {e.isOverdue && (
                <button
                  onClick={() => handleQuickCreate(e)}
                  className="p-1.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                  title="Quick create this expense"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
