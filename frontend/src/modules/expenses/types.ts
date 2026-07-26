export type PaymentMode = 'cash' | 'upi' | 'bank' | 'card' | 'other';
export type ExpenseStatus = 'recorded' | 'voided';
export type RecurringHint = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
export type CreatedSource = 'manual' | 'supplier_payment' | 'adjustment';
export type DateRange = 'today' | '7days' | '30days' | 'custom' | 'all';
export type SortBy = 'newest' | 'highest_amount' | 'oldest' | 'category';

export interface PartySnapshot {
  id: string;
  displayName: string;
  phone?: string;
  primaryType?: string;
}

export const DEFAULT_CATEGORIES = [
  'stock purchase', 'supplier payment', 'rent', 'utilities',
  'transport', 'salary/staff', 'packaging', 'marketing',
  'maintenance', 'subscriptions', 'food/tea', 'miscellaneous'
] as const;

export const PAYMENT_MODES: { id: PaymentMode; label: string }[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'upi', label: 'UPI' },
  { id: 'bank', label: 'Bank' },
  { id: 'card', label: 'Card' },
  { id: 'other', label: 'Other' },
];

export const RECURRING_HINTS: { id: RecurringHint; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'custom', label: 'Custom' },
];
