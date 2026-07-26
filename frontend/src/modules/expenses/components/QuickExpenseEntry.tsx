import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import { CategoryPicker } from './CategoryPicker';
import { PaymentModePicker } from './PaymentModePicker';
import { expenseService } from '../api/expenseService';

interface QuickExpenseEntryProps {
  onDone?: () => void;
}

export function QuickExpenseEntry({ onDone }: QuickExpenseEntryProps) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || amount <= 0 || !category) return;
    setIsSaving(true);
    try {
      const exp = await expenseService.createExpense({
        amount,
        category,
        paymentMode: paymentMode as any,
      });
      onDone?.();
      navigate(`/expenses/${exp.id}`);
    } catch (err) {
      console.error('Quick save failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-primary-600" />
        <span className="text-sm font-semibold text-gray-700">Quick Entry</span>
      </div>

      <div className="space-y-3">
        <input
          type="number"
          step="0.01"
          value={amount || ''}
          onChange={e => setAmount(parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-3 text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="0.00"
        />

        <CategoryPicker value={category} onChange={setCategory} compact />
        <PaymentModePicker value={paymentMode} onChange={setPaymentMode} />

        <button
          onClick={handleSave}
          disabled={!amount || amount <= 0 || !category || isSaving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-xl font-semibold shadow-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
