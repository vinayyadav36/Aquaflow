import { JsonStorage } from './jsonStorage';

export interface ExpenseBackendRecord {
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
  date: string;
  note?: string;
  tags?: string[];
  recurringHint?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  status: 'recorded' | 'voided';
  createdAt: string;
  updatedAt: string;
  createdSource?: 'manual' | 'supplier_payment' | 'adjustment';
}

export interface ExpenseCategoryBackendRecord {
  id: string;
  name: string;
  isSystem: boolean;
  createdAt: string;
}

export interface ExpenseSettingsBackendRecord {
  id: string;
  nextExpenseNumber: number;
  allowCustomCategories: boolean;
  recentCategories: string[];
}

export const expensesDb = new JsonStorage<ExpenseBackendRecord>('expenses');
export const expenseCategoriesDb = new JsonStorage<ExpenseCategoryBackendRecord>('expenseCategories');
export const expenseSettingsDb = new JsonStorage<ExpenseSettingsBackendRecord>('expenseSettings');
