
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import type { ExpenseDetailResponse } from '../api/dto';

export function ExpenseList({ expenses }: { expenses: ExpenseDetailResponse[] }) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4 bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">💸</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses yet</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Keep track of your money out. Add your first expense like rent, supplies, or transport.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      {expenses.map(expense => (
        <Link
          key={expense.id}
          to={`/expenses/${expense.id}`}
          className={`block bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${expense.status === 'voided' ? 'opacity-60' : ''}`}
        >
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-semibold text-gray-900 truncate pr-2">
              {expense.status === 'voided' && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded mr-2 uppercase tracking-wider font-bold">Void</span>}
              {expense.title}
            </h4>
            <span className={`font-bold whitespace-nowrap ${expense.status === 'voided' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              ${expense.amount.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <span className="bg-gray-100 px-2 py-1 rounded-md capitalize">{expense.category}</span>
              <span className="capitalize">{expense.paymentMode}</span>
            </div>
            <span>{format(parseISO(expense.date), 'MMM d, yyyy')}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
