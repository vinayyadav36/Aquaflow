import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { formatCurrency } from '../../../utils/currency';
import { format, parseISO } from 'date-fns';
import { Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PartyTimelineProps {
  partyId: string;
}

export function PartyTimeline({ partyId }: PartyTimelineProps) {
  const party = useLiveQuery(() => db.parties.get(partyId));
  const expenses = useLiveQuery(() =>
    db.expenses.where('partyId').equals(partyId).toArray()
  );

  if (!party || !expenses) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-16 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const active = sorted.filter(e => e.status === 'recorded');
  const totalSpent = active.reduce((s, e) => s + e.amount, 0);

  const byMonth: Record<string, typeof active> = {};
  active.forEach(e => {
    const key = format(parseISO(e.date), 'yyyy-MM');
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(e);
  });

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/expenses" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{party.displayName}</h2>
          <p className="text-sm text-gray-500 capitalize">{party.primaryType} {party.phone ? `- ${party.phone}` : ''}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <p className="text-xs text-gray-500 mb-1">Total Linked Expenses</p>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
        <p className="text-xs text-gray-400 mt-1">{active.length} recorded expense{active.length !== 1 ? 's' : ''}</p>
      </div>

      {Object.entries(byMonth).map(([month, items]) => {
        const monthTotal = items.reduce((s, e) => s + e.amount, 0);
        return (
          <div key={month} className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-600">{format(parseISO(`${month}-01`), 'MMMM yyyy')}</h3>
              <span className="text-xs font-medium text-gray-400">{formatCurrency(monthTotal)}</span>
            </div>
            <div className="space-y-1.5">
              {items.map(e => (
                <Link
                  key={e.id}
                  to={`/expenses/${e.id}`}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                    <p className="text-xs text-gray-500">{format(parseISO(e.date), 'MMM d, yyyy')} - {e.category}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 ml-3">{formatCurrency(e.amount)}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {sorted.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-10">No expenses linked to this party yet.</p>
      )}
    </div>
  );
}
