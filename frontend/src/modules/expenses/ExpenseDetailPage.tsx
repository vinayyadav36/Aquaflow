import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ban, Copy, Edit3 } from 'lucide-react';
import { useExpenseDetail } from './hooks/useExpenseDetail';
import { ExpenseDetailCard } from './components/ExpenseDetailCard';

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { expense, linkedParty, isLoading, error, actions } = useExpenseDetail(id || '');

  if (isLoading) return <div className="p-4 text-center text-gray-500 py-16">Loading...</div>;
  if (error || !expense) return <div className="p-4 text-center text-red-500 py-16">{error || 'Not found'}</div>;

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

  const handleEdit = () => {
    navigate(`/expenses/new`, { state: { editId: expense.id } });
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
        <ExpenseDetailCard
          expense={expense}
          linkedParty={linkedParty}
          onNavigateParty={(partyId: string) => navigate(`/parties/${partyId}?expense=1`)}
        />

        <div className="grid grid-cols-3 gap-3 mt-6">
          <button
            onClick={handleEdit}
            className="flex items-center justify-center py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={handleDuplicate}
            className="flex items-center justify-center py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
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
