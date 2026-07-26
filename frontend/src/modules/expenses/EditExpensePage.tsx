import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ExpenseForm } from './components/ExpenseForm';
import { useExpenseDetail } from './hooks/useExpenseDetail';

export default function EditExpensePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { expense, isLoading, error } = useExpenseDetail(id || '');

  if (isLoading) return <div className="p-4 text-center text-gray-500 py-20">Loading...</div>;
  if (error || !expense) return <div className="p-4 text-center text-red-500 py-20">{error || 'Not found'}</div>;

  const initialValues = {
    id: expense.id,
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    paymentMode: expense.paymentMode as any,
    partyId: expense.partyId,
    date: expense.date.split('T')[0],
    note: expense.note,
    tags: expense.tags,
    recurringHint: expense.recurringHint
  };

  return (
    <div className="bg-white min-h-full">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center z-10">
        <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Edit Expense</h2>
      </div>
      <div className="max-w-xl mx-auto pb-8">
        <ExpenseForm initialValues={initialValues} />
      </div>
    </div>
  );
}
