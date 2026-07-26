import { Repeat } from 'lucide-react';

const HINTS = [
  { value: 'none', label: 'One-Time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
] as const;

interface RecurringHintPickerProps {
  value: string;
  onChange: (hint: string) => void;
}

export function RecurringHintPicker({ value, onChange }: RecurringHintPickerProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        <Repeat className="w-3.5 h-3.5" />
        Recurring?
      </label>
      <div className="flex flex-wrap gap-1.5">
        {HINTS.map(hint => (
          <button
            key={hint.value}
            type="button"
            onClick={() => onChange(hint.value)}
            className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
              (value || 'none') === hint.value
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {hint.label}
          </button>
        ))}
      </div>
    </div>
  );
}
