

const COMMON_CATEGORIES = [
  'stock purchase', 'supplier payment', 'rent', 'utilities',
  'transport', 'salary/staff', 'packaging', 'marketing',
  'maintenance', 'subscriptions', 'food/tea', 'miscellaneous'
];

interface CategoryPickerProps {
  value: string;
  onChange: (cat: string) => void;
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COMMON_CATEGORIES.map(cat => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            value === cat
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
