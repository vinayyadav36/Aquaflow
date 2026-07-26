import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { ExpenseListQuery } from '../api/dto';

interface ExpenseFiltersProps {
  filters: ExpenseListQuery;
  onFilterChange?: (filters: Partial<ExpenseListQuery>) => void;
  onChange?: (filters: Partial<ExpenseListQuery>) => void;
  onReset?: () => void;
}

const DATE_OPTIONS = [
  { id: 'all' as const, label: 'All' },
  { id: 'today' as const, label: 'Today' },
  { id: '7days' as const, label: '7 Days' },
  { id: '30days' as const, label: '30 Days' },
];

const SORT_OPTIONS = [
  { id: 'newest' as const, label: 'Newest' },
  { id: 'oldest' as const, label: 'Oldest' },
  { id: 'highest_amount' as const, label: 'Highest' },
  { id: 'category' as const, label: 'Category' },
];

export function ExpenseFilters({ filters, onFilterChange, onChange, onReset }: ExpenseFiltersProps) {
  const handleChange = onFilterChange || onChange || (() => {});
  const hasFilters = filters.search || filters.category || filters.dateRange || filters.sortBy || filters.status;

  return (
    <div className="space-y-3 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={filters.search || ''}
          onChange={e => handleChange({ search: e.target.value || undefined })}
          placeholder="Search expenses..."
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {filters.search && (
          <button
            onClick={() => handleChange({ search: undefined })}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DATE_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => handleChange({ dateRange: filters.dateRange === opt.id ? undefined : opt.id })}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filters.dateRange === opt.id
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => handleChange({ sortBy: filters.sortBy === opt.id ? undefined : opt.id })}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filters.sortBy === opt.id
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {hasFilters && (
        <div className="flex items-center justify-between">
          {onReset && (
            <button
              onClick={onReset}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Reset all filters
            </button>
          )}
          <span className="text-xs text-gray-400">
            <SlidersHorizontal className="w-3 h-3 inline mr-1" />
            Filtered
          </span>
        </div>
      )}
    </div>
  );
}
