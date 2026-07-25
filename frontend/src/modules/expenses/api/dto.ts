// DTOs for the Expenses API
export interface CreateExpenseInput {
  title?: string; // Optional because it can auto-generate from category
  amount: number;
  category: string;
  paymentMode: 'cash' | 'upi' | 'bank' | 'card' | 'other';
  partyId?: string;
  date?: string; // ISO date string, defaults to today
  note?: string;
  tags?: string[];
  recurringHint?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  createdSource?: 'manual' | 'supplier_payment' | 'adjustment';
}

export interface UpdateExpenseInput {
  title?: string;
  amount?: number;
  category?: string;
  paymentMode?: 'cash' | 'upi' | 'bank' | 'card' | 'other';
  partyId?: string;
  date?: string;
  note?: string;
  tags?: string[];
  recurringHint?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
}

export interface ExpenseListQuery {
  search?: string;
  category?: string;
  paymentMode?: string;
  partyId?: string;
  status?: 'recorded' | 'voided';
  dateRange?: 'today' | '7days' | '30days' | 'custom' | 'all';
  customDateStart?: string;
  customDateEnd?: string;
  sortBy?: 'newest' | 'highest_amount' | 'oldest' | 'category';
}

// Responses map closely to records but are pure DTOs (no DB specifics attached)
export interface ExpenseDetailResponse {
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

export interface ExpenseListResponse {
  data: ExpenseDetailResponse[];
  totalCount: number;
}

export interface ExpenseSummaryResponse {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  topCategory: { name: string; amount: number } | null;
  cashOutTotal: number; // e.g. 'cash'
  digitalOutTotal: number; // e.g. 'upi' | 'bank' | 'card'
}

export interface CategorySummaryItem {
  category: string;
  totalAmount: number;
  count: number;
}

export interface CategorySummaryResponse {
  categories: CategorySummaryItem[];
}

export interface VoidExpenseResponse {
  success: boolean;
  expense: ExpenseDetailResponse;
}

export interface DuplicateExpenseResponse {
  success: boolean;
  expense: ExpenseDetailResponse;
}
