import { useState, useEffect } from 'react';
import { Users, X } from 'lucide-react';
import { db } from '../../../lib/db';
import type { PartyRecord } from '../../../lib/db';

interface PartySelectorProps {
  value?: string;
  onChange: (partyId?: string) => void;
  filterType?: 'supplier' | 'customer';
}

export function PartySelector({ value, onChange, filterType }: PartySelectorProps) {
  const [parties, setParties] = useState<PartyRecord[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      let collection = db.parties.toArray();
      const all = await collection;
      if (filterType) {
        setParties(all.filter(p => p.primaryType === filterType));
      } else {
        setParties(all);
      }
    };
    load();
  }, [filterType]);

  const selected = parties.find(p => p.id === value);

  if (selected) {
    return (
      <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          <div>
            <span className="text-sm font-medium text-gray-900">{selected.displayName}</span>
            <span className="text-xs text-gray-500 ml-2 capitalize">({selected.primaryType})</span>
          </div>
        </div>
        <button onClick={() => onChange(undefined)} className="p-1 hover:bg-blue-100 rounded-full transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full"
      >
        <Users className="w-4 h-4" />
        {open ? 'Close' : 'Link a Party (optional)'}
      </button>

      {open && parties.length > 0 && (
        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
          {parties.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onChange(p.id); setOpen(false); }}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <span className="font-medium text-gray-900">{p.displayName}</span>
                <span className="text-xs text-gray-500 ml-2 capitalize">({p.primaryType})</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && parties.length === 0 && (
        <p className="mt-2 text-xs text-gray-400">No parties found. Create a party first.</p>
      )}
    </div>
  );
}
