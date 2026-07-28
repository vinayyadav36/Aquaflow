import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { expenseService } from '../api/expenseService';
import { Plus, Trash2, Tag, Shield } from 'lucide-react';

export function CategoryManager() {
  const categories = useLiveQuery(() => db.expenseCategories.toArray());
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  if (!categories) return null;

  const sorted = [...categories].sort((a, b) => {
    if (a.isSystem !== b.isSystem) return a.isSystem ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setError(null);

    const exists = categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setError('A category with this name already exists.');
      return;
    }

    setIsAdding(true);
    try {
      await expenseService.addCategory(trimmed);
      setNewName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add category');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string, isSystem: boolean) => {
    if (isSystem) {
      setError('System categories cannot be deleted.');
      return;
    }
    if (!confirm(`Delete category "${name}"?`)) return;

    try {
      await expenseService.deleteCategory(id);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete category');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700">Manage Categories</h3>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={e => { setNewName(e.target.value); setError(null); }}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="New category name..."
          className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          onClick={handleAdd}
          disabled={isAdding || !newName.trim()}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 mb-3">{error}</p>
      )}

      <div className="space-y-1">
        {sorted.map(cat => (
          <div
            key={cat.id}
            className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 group"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-800 capitalize">{cat.name}</span>
              {cat.isSystem && (
                <span className="flex items-center gap-0.5 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  <Shield className="w-2.5 h-2.5" />
                  System
                </span>
              )}
            </div>
            {!cat.isSystem && (
              <button
                onClick={() => handleDelete(cat.id, cat.name, cat.isSystem)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                title="Delete category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">No categories yet</p>
      )}
    </div>
  );
}
