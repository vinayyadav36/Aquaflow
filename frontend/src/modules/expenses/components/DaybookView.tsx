import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { formatCurrency } from '../../../utils/currency';
import { parseISO, isToday } from 'date-fns';
import { Banknote, Smartphone, Building2, CreditCard, HelpCircle } from 'lucide-react';

const MODE_ICONS: Record<string, React.ElementType> = {
  cash: Banknote,
  upi: Smartphone,
  bank: Building2,
  card: CreditCard,
  other: HelpCircle,
};

const MODE_COLORS: Record<string, string> = {
  cash: 'bg-green-50 text-green-700 border-green-200',
  upi: 'bg-purple-50 text-purple-700 border-purple-200',
  bank: 'bg-blue-50 text-blue-700 border-blue-200',
  card: 'bg-amber-50 text-amber-700 border-amber-200',
  other: 'bg-gray-50 text-gray-700 border-gray-200',
};

export function DaybookView() {
  const expenses = useLiveQuery(() => db.expenses.toArray());

  if (!expenses) return null;

  const todayExpenses = expenses.filter(e => e.status === 'recorded' && isToday(parseISO(e.date)));

  if (todayExpenses.length === 0) return null;

  const byMode: Record<string, typeof todayExpenses> = {};
  todayExpenses.forEach(e => {
    if (!byMode[e.paymentMode]) byMode[e.paymentMode] = [];
    byMode[e.paymentMode].push(e);
  });

  const modes = Object.entries(byMode).sort((a, b) => b[1].reduce((s, e) => s + e.amount, 0) - a[1].reduce((s, e) => s + e.amount, 0));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Today's Daybook</h3>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {modes.map(([mode, items]) => {
          const total = items.reduce((s, e) => s + e.amount, 0);
          const Icon = MODE_ICONS[mode] || HelpCircle;
          return (
            <div key={mode} className={`p-3 rounded-xl border ${MODE_COLORS[mode] || MODE_COLORS.other}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase">{mode}</span>
              </div>
              <p className="text-lg font-bold">{formatCurrency(total)}</p>
              <p className="text-xs opacity-70">{items.length} transaction{items.length !== 1 ? 's' : ''}</p>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-1.5">
        {todayExpenses
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(e => (
            <div key={e.id} className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                <span className="text-gray-600 truncate">{e.title}</span>
                <span className="text-gray-400 capitalize">{e.paymentMode}</span>
              </div>
              <span className="font-medium text-gray-800 ml-2">{formatCurrency(e.amount, 'INR', { decimals: false })}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
