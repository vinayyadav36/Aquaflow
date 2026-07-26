import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Zap, ClipboardList } from 'lucide-react';
import { ExpenseForm } from './components/ExpenseForm';
import { QuickExpenseEntry } from './components/QuickExpenseEntry';
import { expenseService } from './api/expenseService';
import { useExpenseDetail } from './hooks/useExpenseDetail';
import type { CreateExpenseInput } from './api/dto';

export default function NewExpensePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editId = (location.state as any)?.editId;
  const prefilled = (location.state as any)?.prefilled;
  const [mode, setMode] = useState<'quick' | 'full'>(editId ? 'full' : 'quick');
  const [editInitial, setEditInitial] = useState<Partial<CreateExpenseInput> | undefined>(prefilled || undefined);
  const { expense: editExpense } = useExpenseDetail(editId || '');

  useEffect(() => {
    if (editExpense) {
      setEditInitial({
        title: editExpense.title,
        amount: editExpense.amount,
        category: editExpense.category,
        paymentMode: editExpense.paymentMode,
        partyId: editExpense.partyId,
        date: editExpense.date.split('T')[0],
        note: editExpense.note,
        tags: editExpense.tags,
        recurringHint: editExpense.recurringHint,
      });
    }
  }, [editExpense]);

  const handleCopyLast = async () => {
    const last = await expenseService.copyLastExpense();
    if (last) {
      navigate('/expenses/new', { state: { prefilled: last } });
    }
  };

  return (
    <div className="bg-white min-h-full">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Record Expense</h2>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleCopyLast}
            className="text-xs text-primary-600 font-medium px-2 py-1 rounded-lg hover:bg-primary-50"
          >
            Copy Last
          </button>
          <button
            onClick={() => setMode(mode === 'quick' ? 'full' : 'quick')}
            className={`text-xs font-medium px-2 py-1 rounded-lg ${
              mode === 'quick' ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {mode === 'quick' ? (
              <span className="flex items-center gap-1"><ClipboardList className="w-3 h-3" />Full</span>
            ) : (
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" />Quick</span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto pb-8">
        {mode === 'quick' && !editId ? (
          <div className="p-4">
            <QuickExpenseEntry />
            <p className="text-center text-xs text-gray-400 mt-4">
              Need more fields? Switch to Full mode above.
            </p>
          </div>
        ) : (
          <ExpenseForm initialValues={editInitial} isEditing={!!editId} />
        )}
      </div>
    </div>
  );
}
