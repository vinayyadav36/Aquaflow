import { formatCurrency } from "../../../utils/currency";
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { RefreshCw, Users } from 'lucide-react';
import type { ExpenseDetailResponse } from '../api/dto';

export function ExpenseList({ expenses, compact }: { expenses: ExpenseDetailResponse[]; compact?: boolean }) {
  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3 mt-4'}>
      {expenses.map(expense => (
        <Link
          key={expense.id}
          to={`/expenses/${expense.id}`}
          className={`block bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${expense.status === 'voided' ? 'opacity-60' : ''}`}
        >
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-semibold text-gray-900 truncate pr-2 flex items-center gap-2">
              {expense.status === 'voided' && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold shrink-0">Void</span>}
              {expense.title}
              {expense.recurringHint && expense.recurringHint !== 'none' && (
                <RefreshCw className="w-3 h-3 text-amber-500 shrink-0" />
              )}
            </h4>
            <span className={`font-bold whitespace-nowrap ${expense.status === 'voided' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {formatCurrency(expense.amount)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="bg-gray-100 px-2 py-1 rounded-md capitalize">{expense.category}</span>
              <span className="capitalize">{expense.paymentMode}</span>
              {expense.partySnapshot && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Users className="w-3 h-3" />
                  {expense.partySnapshot.displayName}
                </span>
              )}
            </div>
            <span>{format(parseISO(expense.date), 'MMM d, yyyy')}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
