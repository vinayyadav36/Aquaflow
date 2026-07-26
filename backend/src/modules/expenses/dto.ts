export interface CreateExpenseDto {
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

export interface UpdateExpenseDto {
  title?: string;
  amount?: number;
  category?: string;
  paymentMode?: 'cash' | 'upi' | 'bank' | 'card' | 'other';
  partyId?: string | null;
  date?: string;
  note?: string;
  tags?: string[];
  recurringHint?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
}

export interface ExpenseDetailDto {
  id: string;
  expenseNumber: string;
  title: string;
  amount: number;
  category: string;
  paymentMode: string;
  partyId?: string;
  partySnapshot?: {
    id: string;
    displayName: string;
    phone?: string;
    primaryType?: string;
  } | null;
  date: string;
  note?: string;
  tags?: string[];
  recurringHint?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdSource?: string;
}

export interface ExpenseListQueryDto {
  search?: string;
  category?: string;
  paymentMode?: string;
  partyId?: string;
  status?: string;
  dateRange?: string;
  sortBy?: string;
}

export interface ExpenseListResponseDto {
  data: ExpenseDetailDto[];
  totalCount: number;
}

export interface ExpenseSummaryResponseDto {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  topCategory: { name: string; amount: number } | null;
  cashOutTotal: number;
  digitalOutTotal: number;
}

export interface CategorySummaryResponseDto {
  categories: { category: string; totalAmount: number; count: number }[];
}

export interface VoidExpenseResponseDto {
  success: boolean;
  expense: ExpenseDetailDto;
}

export interface DuplicateExpenseResponseDto {
  success: boolean;
  expense: ExpenseDetailDto;
}
