import { formatCurrency } from "../../../utils/currency";
import { Ban, Users, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { ExpenseDetailResponse } from '../api/dto';

interface PartySnapshot {
  id: string;
  displayName: string;
  phone?: string;
  primaryType?: string;
}

interface ExpenseDetailCardProps {
  expense: ExpenseDetailResponse;
  linkedParty?: PartySnapshot;
  onNavigateParty?: (partyId: string) => void;
}

export function ExpenseDetailCard({ expense, linkedParty, onNavigateParty }: ExpenseDetailCardProps) {
  const isVoid = expense.status === 'voided';
  return (
    <>
      {isVoid && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center mb-4">
          <Ban className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="font-semibold text-sm uppercase tracking-wide">This expense is voided</span>
        </div>
      )}

      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${isVoid ? 'opacity-70' : ''}`}>
        <h2 className={`text-3xl font-bold mb-1 ${isVoid ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
          {formatCurrency(expense.amount)}
        </h2>
        <p className="text-gray-600 font-medium text-lg mb-6">{expense.title}</p>

        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
          <div>
            <span className="block text-gray-400 text-xs font-semibold uppercase mb-1">Date</span>
            <span className="text-gray-900 font-medium">{format(parseISO(expense.date), 'MMMM d, yyyy')}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-xs font-semibold uppercase mb-1">Category</span>
            <span className="text-gray-900 font-medium capitalize bg-gray-100 px-2 py-1 rounded-md">{expense.category}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-xs font-semibold uppercase mb-1">Payment Mode</span>
            <span className="text-gray-900 font-medium capitalize">{expense.paymentMode}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-xs font-semibold uppercase mb-1">Source</span>
            <span className="text-gray-900 font-medium capitalize">{expense.createdSource}</span>
          </div>
          <div>
            <span className="block text-gray-400 text-xs font-semibold uppercase mb-1">Expense #</span>
            <span className="text-gray-900 font-medium">{expense.expenseNumber}</span>
          </div>
          {expense.recurringHint && expense.recurringHint !== 'none' && (
            <div>
              <span className="block text-gray-400 text-xs font-semibold uppercase mb-1">Recurring</span>
              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                <RefreshCw className="w-3 h-3" />
                {expense.recurringHint}
              </span>
            </div>
          )}
          {expense.note && (
            <div className="col-span-2 mt-2">
              <span className="block text-gray-400 text-xs font-semibold uppercase mb-1">Note</span>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{expense.note}</p>
            </div>
          )}
          {expense.tags && expense.tags.length > 0 && (
            <div className="col-span-2">
              <span className="block text-gray-400 text-xs font-semibold uppercase mb-1">Tags</span>
              <div className="flex flex-wrap gap-1">
                {expense.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {linkedParty && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mr-3">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Linked Party</p>
              <p className="font-semibold text-gray-900">{linkedParty.displayName}</p>
            </div>
          </div>
          {onNavigateParty && (
            <button
              onClick={() => onNavigateParty(linkedParty.id)}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              View
            </button>
          )}
        </div>
      )}
    </>
  );
}
