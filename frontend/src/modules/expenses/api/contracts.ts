import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseListQuery,
  ExpenseListResponse,
  ExpenseDetailResponse,
  ExpenseSummaryResponse,
  CategorySummaryResponse,
  VoidExpenseResponse,
  DuplicateExpenseResponse
} from './dto';
import type { ExpenseCategoryRecord } from '../../../lib/db';

export interface IExpenseService {
  createExpense(input: CreateExpenseInput): Promise<ExpenseDetailResponse>;
  updateExpense(id: string, input: UpdateExpenseInput): Promise<ExpenseDetailResponse>;
  getExpenseById(id: string): Promise<ExpenseDetailResponse>;
  getExpenses(query?: ExpenseListQuery): Promise<ExpenseListResponse>;
  voidExpense(id: string): Promise<VoidExpenseResponse>;
  duplicateExpense(id: string): Promise<DuplicateExpenseResponse>;
  getExpenseSummary(query?: ExpenseListQuery): Promise<ExpenseSummaryResponse>;
  getExpenseCategorySummaryApi(query?: ExpenseListQuery): Promise<CategorySummaryResponse>;
  getCategories(): Promise<ExpenseCategoryRecord[]>;
  addCategory(name: string): Promise<ExpenseCategoryRecord>;
  deleteCategory(id: string): Promise<void>;
  renameCategory(id: string, newName: string): Promise<ExpenseCategoryRecord>;
  getSettings(): Promise<{ id: string; nextExpenseNumber: number; allowCustomCategories: boolean; recentCategories: string[] }>;
  updateSettings(updates: { allowCustomCategories?: boolean; recentCategories?: string[] }): Promise<any>;
  copyLastExpense(): Promise<CreateExpenseInput | null>;
  initializeDefaults(): Promise<void>;
}
