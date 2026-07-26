import { useState, useEffect } from 'react';
import { Users, X } from 'lucide-react';
import { db } from '../../../lib/db';
import type { PartyRecord } from '../../../lib/db';

interface PartyPickerProps {
  value?: string;
  onChange: (partyId?: string) => void;
}

export function PartyPicker({ value, onChange }: PartyPickerProps) {
  const [parties, setParties] = useState<PartyRecord[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    db.parties.toArray().then(setParties).catch(() => {});
  }, []);

  const selectedParty = value ? parties.find(p => p.id === value) : null;

  if (parties.length === 0) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Link Party (Optional)</label>
      {selectedParty ? (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          <div className="flex items-center">
            <Users className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-blue-700">{selectedParty.displayName}</span>
            <span className="text-xs text-blue-400 ml-2 capitalize">({selectedParty.primaryType})</span>
          </div>
          <button onClick={() => onChange(undefined)} className="text-blue-400 hover:text-blue-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-left text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Select a party...
          </button>
          {isOpen && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {parties.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { onChange(p.id); setIsOpen(false); }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                >
                  <span className="font-medium text-gray-900">{p.displayName}</span>
                  <span className="text-xs text-gray-400 capitalize">{p.primaryType}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
