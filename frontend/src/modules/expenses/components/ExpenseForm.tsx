
import { useExpenseForm } from '../hooks/useExpenseForm';
import { CategoryPicker } from './CategoryPicker';
import { PaymentModePicker } from './PaymentModePicker';
import type { CreateExpenseInput } from '../api/dto';

interface ExpenseFormProps {
  initialValues?: Partial<CreateExpenseInput>;
}

export function ExpenseForm({ initialValues }: ExpenseFormProps) {
  const { values, validationErrors, isSubmitting, updateField, saveExpense } = useExpenseForm(initialValues);

  return (
    <div className="flex flex-col gap-6 p-4">
      {validationErrors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          <ul className="list-disc pl-4">
            {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">$</span>
          <input
            type="number"
            step="0.01"
            value={values.amount || ''}
            onChange={e => updateField('amount', parseFloat(e.target.value) || 0)}
            className="w-full pl-8 pr-4 py-3 text-2xl font-bold bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <CategoryPicker value={values.category} onChange={v => updateField('category', v)} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
        <PaymentModePicker value={values.paymentMode} onChange={v => updateField('paymentMode', v)} />
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <details className="group">
          <summary className="text-sm font-medium text-primary-600 cursor-pointer list-none select-none">
            + Show Optional Details (Title, Note, Date)
          </summary>
          <div className="mt-4 space-y-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
              <input
                type="text"
                value={values.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder="Auto-generated from category if empty"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea
                value={values.note || ''}
                onChange={e => updateField('note', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Add a note..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={values.date}
                onChange={e => updateField('date', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </details>
      </div>

      <button
        onClick={saveExpense}
        disabled={isSubmitting}
        className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold shadow-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Saving...' : 'Save Expense'}
      </button>
    </div>
  );
}
