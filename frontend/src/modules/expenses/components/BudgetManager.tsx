import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { formatCurrency } from '../../../utils/currency';
import { Plus, Trash2, DollarSign } from 'lucide-react';

export function BudgetManager() {
  const budgets = useLiveQuery(() => db.budgets.toArray());
  const categories = useLiveQuery(() => db.expenseCategories.toArray());
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!budgets || !categories) return null;

  const budgetedCategories = new Set(budgets.map(b => b.category));
  const availableCategories = categories.filter(c => !budgetedCategories.has(c.name));

  const handleAdd = async () => {
    if (!selectedCategory || !limit) return;
    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit <= 0) {
      setError('Budget limit must be a positive number.');
      return;
    }
    setError(null);

    await db.budgets.add({
      id: crypto.randomUUID(),
      category: selectedCategory,
      monthlyLimit: numLimit,
      createdAt: new Date().toISOString(),
    });
    setSelectedCategory('');
    setLimit('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this budget limit?')) return;
    await db.budgets.delete(id);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700">Monthly Budgets</h3>
      </div>

      {budgets.length > 0 && (
        <div className="space-y-2 mb-4">
          {budgets.map(b => (
            <div key={b.id} className="flex items-center justify-between py-2 px-2 rounded-lg bg-gray-50 group">
              <div>
                <span className="text-sm font-medium text-gray-800 capitalize">{b.category}</span>
                <span className="text-xs text-gray-500 ml-2">{formatCurrency(b.monthlyLimit)}/mo</span>
              </div>
              <button
                onClick={() => handleDelete(b.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {availableCategories.length > 0 && (
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={e => { setSelectedCategory(e.target.value); setError(null); }}
            className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 capitalize"
          >
            <option value="">Category...</option>
            {availableCategories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <input
            type="number"
            value={limit}
            onChange={e => { setLimit(e.target.value); setError(null); }}
            placeholder="Limit"
            className="w-24 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleAdd}
            disabled={!selectedCategory || !limit}
            className="flex items-center gap-1 px-3 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      {budgets.length === 0 && availableCategories.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">Add categories first to set budgets</p>
      )}
    </div>
  );
}
