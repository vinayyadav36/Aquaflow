
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
}

export function PaymentModePicker({ value, onChange }: PaymentModePickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {MODES.map(mode => {
        const Icon = mode.icon;
        const isActive = value === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange(mode.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-colors ${
              isActive
                ? 'bg-primary-50 border-primary-500 text-primary-700'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
