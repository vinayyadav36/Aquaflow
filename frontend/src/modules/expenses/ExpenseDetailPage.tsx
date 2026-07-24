
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ban, Copy, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useExpenseDetail } from './hooks/useExpenseDetail';

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { expense, linkedParty, isLoading, error, actions } = useExpenseDetail(id || '');

  if (isLoading) return <div className="p-4 text-center text-gray-500">Loading...</div>;
  if (error || !expense) return <div className="p-4 text-center text-red-500">{error || 'Not found'}</div>;

  const isVoid = expense.status === 'voided';

  const handleDuplicate = async () => {
    const copy = await actions.duplicateAction();
    if (copy) navigate(`/expenses/${copy.id}`);
  };

  const handleVoid = async () => {
    if (confirm('Are you sure you want to void this expense? This action only marks it as voided but preserves the record.')) {
      await actions.voidAction();
    }
  };

  return (
    <div className="bg-gray-50 min-h-full pb-8">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{expense.expenseNumber}</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4 mt-2">
        {isVoid && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center mb-4">
            <Ban className="w-5 h-5 mr-2" />
            <span className="font-semibold text-sm uppercase tracking-wide">This expense is voided</span>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className={`text-3xl font-bold mb-1 ${isVoid ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            ${expense.amount.toFixed(2)}
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
            {expense.note && (
              <div className="col-span-2 mt-2">
                <span className="block text-gray-400 text-xs font-semibold uppercase mb-1">Note</span>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{expense.note}</p>
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
            <button onClick={() => navigate(`/parties/${linkedParty.id}`)} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
              View
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={handleDuplicate}
            className="flex items-center justify-center py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </button>
          <button
            onClick={handleVoid}
            disabled={isVoid}
            className="flex items-center justify-center py-3 bg-white border border-red-200 text-red-600 rounded-xl font-semibold shadow-sm hover:bg-red-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
          >
            <Ban className="w-4 h-4 mr-2" />
            Void
          </button>
        </div>
      </div>
    </div>
  );
}
