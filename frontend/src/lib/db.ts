import Dexie, { type EntityTable } from 'dexie';

export interface ExpenseRecord {
  id: string;
  expenseNumber: string;
  title: string;
  amount: number;
  category: string;
  paymentMode: 'cash' | 'upi' | 'bank' | 'card' | 'other';
  partyId?: string;
  partySnapshot?: {
    id: string;
    displayName: string;
    phone?: string;
    primaryType?: string;
  };
  date: string; // ISO date string
  note?: string;
  tags?: string[];
  recurringHint?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  status: 'recorded' | 'voided';
  createdAt: string;
  updatedAt: string;
  createdSource?: 'manual' | 'supplier_payment' | 'adjustment';
  receiptUrl?: string;
  receiptName?: string;
}

export interface ExpenseCategoryRecord {
  id: string;
  name: string;
  isSystem: boolean;
  createdAt: string;
}

export interface ExpenseSettingsRecord {
  id: string;
  nextExpenseNumber: number;
  allowCustomCategories: boolean;
  recentCategories: string[];
}

// Mock Party for testing
export interface PartyRecord {
  id: string;
  displayName: string;
  primaryType: 'customer' | 'supplier';
  phone?: string;
}

export interface BudgetRecord {
  id: string;
  category: string;
  monthlyLimit: number;
  createdAt: string;
}

const db = new Dexie('BusinessOSDB') as Dexie & {
  expenses: EntityTable<ExpenseRecord, 'id'>;
  expenseCategories: EntityTable<ExpenseCategoryRecord, 'id'>;
  expenseSettings: EntityTable<ExpenseSettingsRecord, 'id'>;
  parties: EntityTable<PartyRecord, 'id'>;
  budgets: EntityTable<BudgetRecord, 'id'>;
};

// Schema definition
db.version(1).stores({
  expenses: 'id, expenseNumber, date, category, paymentMode, partyId, status, createdAt',
  expenseCategories: 'id, name, isSystem',
  expenseSettings: 'id',
  parties: 'id, primaryType'
});

db.version(2).stores({
  budgets: 'id, category'
});

export { db };
