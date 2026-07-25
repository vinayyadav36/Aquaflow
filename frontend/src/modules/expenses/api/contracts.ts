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

export interface IExpenseService {
  createExpense(input: CreateExpenseInput): Promise<ExpenseDetailResponse>;
  updateExpense(id: string, input: UpdateExpenseInput): Promise<ExpenseDetailResponse>;
  getExpenseById(id: string): Promise<ExpenseDetailResponse>;
  getExpenses(query?: ExpenseListQuery): Promise<ExpenseListResponse>;
  voidExpense(id: string): Promise<VoidExpenseResponse>;
  duplicateExpense(id: string): Promise<DuplicateExpenseResponse>;
  getExpenseSummary(query?: ExpenseListQuery): Promise<ExpenseSummaryResponse>;
  getExpenseCategorySummaryApi(query?: ExpenseListQuery): Promise<CategorySummaryResponse>;
}
