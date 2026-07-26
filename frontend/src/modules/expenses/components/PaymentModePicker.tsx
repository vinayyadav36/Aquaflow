import { Banknote, CreditCard, Landmark, Smartphone, MoreHorizontal } from 'lucide-react';

const MODES = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'bank', label: 'Bank', icon: Landmark },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'other', label: 'Other', icon: MoreHorizontal }
] as const;

interface PaymentModePickerProps {
  value: string;
  onChange: (mode: any) => void;
  compact?: boolean;
}

export function PaymentModePicker({ value, onChange, compact }: PaymentModePickerProps) {
  const gridClass = compact ? 'grid grid-cols-5 gap-1' : 'grid grid-cols-5 gap-2';

  return (
    <div className={gridClass}>
      {MODES.map(mode => {
        const Icon = mode.icon;
        const isActive = value === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange(mode.id)}
            className={`flex flex-col items-center justify-center rounded-lg border transition-colors ${
              isActive
                ? 'bg-primary-50 border-primary-500 text-primary-700'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            } ${compact ? 'p-1.5' : 'p-2'}`}
          >
            <Icon className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} mb-0.5`} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`font-medium ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
