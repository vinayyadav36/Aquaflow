export interface Expense {
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

export interface ExpenseCategory {
  id: string;
  name: string;
  isSystem: boolean;
  createdAt: string;
}

export interface ExpenseSettings {
  nextExpenseNumber: number;
  allowCustomCategories: boolean;
  recentCategories: string[];
}

// API DTOs for cross-module consumption
export interface CreateExpenseApiInput {
  title?: string;
  amount: number;
  category: string;
  paymentMode: 'cash' | 'upi' | 'bank' | 'card' | 'other';
  partyId?: string;
  date?: string;
  note?: string;
  tags?: string[];
  recurringHint?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  createdSource?: 'manual' | 'supplier_payment' | 'adjustment';
}

export interface ExpenseApiResponse {
  success: boolean;
  data?: Expense;
  error?: string;
}

export interface ExpenseListApiResponse {
  success: boolean;
  data: Expense[];
  totalCount: number;
}

export interface ExpenseSummaryApiResponse {
  success: boolean;
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  topCategory: { name: string; amount: number } | null;
  cashOutTotal: number;
  digitalOutTotal: number;
}

export interface CategorySummaryApiResponse {
  success: boolean;
  categories: { category: string; totalAmount: number; count: number }[];
}
