import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';

const FALLBACK_CATEGORIES = [
  'stock purchase', 'supplier payment', 'rent', 'utilities',
  'transport', 'salary/staff', 'packaging', 'marketing',
  'maintenance', 'subscriptions', 'food/tea', 'miscellaneous'
];

interface CategoryPickerProps {
  value: string;
  onChange: (cat: string) => void;
  compact?: boolean;
}

export function CategoryPicker({ value, onChange, compact }: CategoryPickerProps) {
  const dbCategories = useLiveQuery(() => db.expenseCategories.toArray());
  const categories = dbCategories && dbCategories.length > 0
    ? dbCategories.map(c => c.name)
    : FALLBACK_CATEGORIES;

  const containerClass = compact ? 'flex flex-wrap gap-1.5' : 'flex flex-wrap gap-2';

  return (
    <div className={containerClass}>
      {categories.map(cat => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            value === cat
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          } ${compact ? 'text-xs px-2 py-1' : ''}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
