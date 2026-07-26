import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, Building2, Lightbulb, Plus } from 'lucide-react';

const PRESETS = [
  { label: 'Stock', amount: 500, category: 'stock purchase', icon: ShoppingBag },
  { label: 'Transport', amount: 50, category: 'transport', icon: Truck },
  { label: 'Rent', amount: 1200, category: 'rent', icon: Building2 },
  { label: 'Utilities', amount: 150, category: 'utilities', icon: Lightbulb },
];

export function PresetExpenses() {
  const navigate = useNavigate();

  return (
    <div className="mb-4">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PRESETS.map(preset => (
          <button
            key={preset.label}
            onClick={() => navigate(`/expenses/new?amount=${preset.amount}&category=${encodeURIComponent(preset.category)}`)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <div className="w-7 h-7 bg-gray-50 rounded-full flex items-center justify-center">
              <preset.icon className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div className="text-left">
              <span className="text-xs text-gray-400 block leading-tight">{preset.label}</span>
              <span className="text-sm font-bold text-gray-900">${preset.amount}</span>
            </div>
          </button>
        ))}
        <button
          onClick={() => navigate('/expenses/new')}
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500 font-medium">Custom</span>
        </button>
      </div>
    </div>
  );
}
