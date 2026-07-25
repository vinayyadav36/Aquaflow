import type { IExpenseService } from './contracts';
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
import {
  createExpenseRecord,
  getExpenseRecordById,
  listExpenseRecords,
  updateExpenseRecord
} from '../services/expensesRepository';
import { validateExpenseInput, getTodayExpensesTotal, getPeriodExpensesTotal } from '../services/expensesDomain';
import { parseISO, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import type { ExpenseRecord } from '../../../lib/db';

export class LocalExpenseService implements IExpenseService {
  private mapToDto(record: ExpenseRecord): ExpenseDetailResponse {
    return { ...record };
  }

  async createExpense(input: CreateExpenseInput): Promise<ExpenseDetailResponse> {
    const errors = validateExpenseInput(input);
    if (errors.length > 0) throw new Error(errors.join(', '));

    const record = await createExpenseRecord({
      title: input.title || input.category,
      amount: input.amount,
      category: input.category,
      paymentMode: input.paymentMode,
      partyId: input.partyId,
      date: input.date || new Date().toISOString(),
      note: input.note,
      tags: input.tags,
      recurringHint: input.recurringHint || 'none',
      status: 'recorded',
      createdSource: input.createdSource || 'manual'
    });

    return this.mapToDto(record);
  }

  async updateExpense(id: string, input: UpdateExpenseInput): Promise<ExpenseDetailResponse> {
    const updates = { ...input } as any; // Ignore partyId null check for now
    if (updates.partyId === null) updates.partyId = undefined;
    const record = await updateExpenseRecord(id, updates);
    return this.mapToDto(record);
  }

  async getExpenseById(id: string): Promise<ExpenseDetailResponse> {
    const record = await getExpenseRecordById(id);
    if (!record) throw new Error('Expense not found');
    return this.mapToDto(record);
  }

  async getExpenses(query?: ExpenseListQuery): Promise<ExpenseListResponse> {
    let records = await listExpenseRecords();

    if (query) {
      if (query.status) {
        records = records.filter(r => r.status === query.status);
      }
      if (query.category) {
        records = records.filter(r => r.category === query.category);
      }
      if (query.paymentMode) {
        records = records.filter(r => r.paymentMode === query.paymentMode);
      }
      if (query.partyId) {
        records = records.filter(r => r.partyId === query.partyId);
      }
      if (query.search) {
        const s = query.search.toLowerCase();
        records = records.filter(r =>
          r.title.toLowerCase().includes(s) ||
          (r.note && r.note.toLowerCase().includes(s)) ||
          (r.partySnapshot && r.partySnapshot.displayName.toLowerCase().includes(s))
        );
      }
      if (query.dateRange && query.dateRange !== 'all') {
        const end = endOfDay(new Date());
        let start = end;
        if (query.dateRange === 'today') start = startOfDay(new Date());
        if (query.dateRange === '7days') start = startOfDay(subDays(new Date(), 7));
        if (query.dateRange === '30days') start = startOfDay(subDays(new Date(), 30));

        records = records.filter(r => {
           const d = parseISO(r.date);
           return isWithinInterval(d, { start, end });
        });
      }

      if (query.sortBy) {
        if (query.sortBy === 'highest_amount') records.sort((a,b) => b.amount - a.amount);
        if (query.sortBy === 'oldest') records.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (query.sortBy === 'category') records.sort((a,b) => a.category.localeCompare(b.category));
        // default newest already applied by DB
      }
    }

    return {
      data: records.map(this.mapToDto),
      totalCount: records.length
    };
  }

  async voidExpense(id: string): Promise<VoidExpenseResponse> {
    const record = await getExpenseRecordById(id);
    if (!record) throw new Error('Expense not found');
    if (record.status === 'voided') throw new Error('Expense already voided');

    const updated = await updateExpenseRecord(id, { status: 'voided' });
    return { success: true, expense: this.mapToDto(updated) };
  }

  async duplicateExpense(id: string): Promise<DuplicateExpenseResponse> {
    const original = await getExpenseRecordById(id);
    if (!original) throw new Error('Expense not found');

    const newRecord = await this.createExpense({
      title: `${original.title} (Copy)`,
      amount: original.amount,
      category: original.category,
      paymentMode: original.paymentMode,
      partyId: original.partyId,
      date: new Date().toISOString(),
      note: original.note,
      tags: original.tags,
      recurringHint: original.recurringHint,
      createdSource: 'manual'
    });

    return { success: true, expense: newRecord };
  }

  async getExpenseSummary(_query?: ExpenseListQuery): Promise<ExpenseSummaryResponse> {
    const records = await listExpenseRecords();
    const active = records.filter(r => r.status === 'recorded');

    let cashOutTotal = 0;
    let digitalOutTotal = 0;
    const categoryTotals: Record<string, number> = {};

    active.forEach(r => {
      if (r.paymentMode === 'cash') cashOutTotal += r.amount;
      else digitalOutTotal += r.amount;

      categoryTotals[r.category] = (categoryTotals[r.category] || 0) + r.amount;
    });

    let topCategory = null;
    let max = 0;
    for (const [name, amount] of Object.entries(categoryTotals)) {
      if (amount > max) {
        max = amount;
        topCategory = { name, amount };
      }
    }

    return {
      todayTotal: getTodayExpensesTotal(records),
      weekTotal: getPeriodExpensesTotal(records, 7),
      monthTotal: getPeriodExpensesTotal(records, 30),
      topCategory,
      cashOutTotal,
      digitalOutTotal
    };
  }

  async getExpenseCategorySummaryApi(_query?: ExpenseListQuery): Promise<CategorySummaryResponse> {
    // In a real API this would apply filters and aggregate.
    const records = await listExpenseRecords();
    const active = records.filter(r => r.status === 'recorded');

    const categoryMap: Record<string, { totalAmount: number; count: number }> = {};
    active.forEach(r => {
      if (!categoryMap[r.category]) categoryMap[r.category] = { totalAmount: 0, count: 0 };
      categoryMap[r.category].totalAmount += r.amount;
      categoryMap[r.category].count += 1;
    });

    return {
      categories: Object.entries(categoryMap).map(([category, stats]) => ({
        category,
        totalAmount: stats.totalAmount,
        count: stats.count
      })).sort((a,b) => b.totalAmount - a.totalAmount)
    };
  }
}

export const expenseService = new LocalExpenseService();
