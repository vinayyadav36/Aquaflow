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
  updateExpenseRecord,
  deleteExpenseCategory as deleteCategoryRepo,
  renameExpenseCategory as renameCategoryRepo
} from '../services/expensesRepository';
import { validateExpenseInput, getTodayExpensesTotal, getPeriodExpensesTotal } from '../services/expensesDomain';
import { parseISO, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import type { ExpenseRecord, ExpenseCategoryRecord } from '../../../lib/db';
import { db } from '../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

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
      createdSource: input.createdSource || 'manual',
      receiptUrl: input.receiptUrl,
      receiptName: input.receiptName,
    });

    return this.mapToDto(record);
  }

  async updateExpense(id: string, input: UpdateExpenseInput): Promise<ExpenseDetailResponse> {
    const existing = await getExpenseRecordById(id);
    if (!existing) throw new Error('Expense not found');
    if (existing.status === 'voided' && (input as any).status !== 'recorded') {
      throw new Error('Cannot edit a voided record without explicitly un-voiding it first');
    }
    const updates = { ...input } as any;
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
      if (query.status) records = records.filter(r => r.status === query.status);
      if (query.category) records = records.filter(r => r.category === query.category);
      if (query.paymentMode) records = records.filter(r => r.paymentMode === query.paymentMode);
      if (query.partyId) records = records.filter(r => r.partyId === query.partyId);
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
      }
    }

    return { data: records.map(this.mapToDto), totalCount: records.length };
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

    let cashOutTotal = 0, digitalOutTotal = 0;
    const categoryTotals: Record<string, number> = {};
    const categoryCount: Record<string, number> = {};
    const paymentModeTotals: Record<string, number> = {};
    const paymentModeCount: Record<string, number> = {};
    active.forEach(r => {
      if (r.paymentMode === 'cash') cashOutTotal += r.amount;
      else digitalOutTotal += r.amount;
      categoryTotals[r.category] = (categoryTotals[r.category] || 0) + r.amount;
      categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
      paymentModeTotals[r.paymentMode] = (paymentModeTotals[r.paymentMode] || 0) + r.amount;
      paymentModeCount[r.paymentMode] = (paymentModeCount[r.paymentMode] || 0) + 1;
    });

    let topCategory = null;
    let max = 0;
    for (const [name, amount] of Object.entries(categoryTotals)) {
      if (amount > max) { max = amount; topCategory = { name, amount }; }
    }

    const categoryBreakdown = Object.entries(categoryTotals).map(([category, totalAmount]) => ({
      category, totalAmount, count: categoryCount[category] || 0
    })).sort((a, b) => b.totalAmount - a.totalAmount);

    const paymentModeBreakdown = Object.entries(paymentModeTotals).map(([paymentMode, totalAmount]) => ({
      paymentMode, totalAmount, count: paymentModeCount[paymentMode] || 0
    })).sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      todayTotal: getTodayExpensesTotal(records),
      weekTotal: getPeriodExpensesTotal(records, 7),
      monthTotal: getPeriodExpensesTotal(records, 30),
      topCategory, cashOutTotal, digitalOutTotal,
      categoryBreakdown, paymentModeBreakdown
    };
  }

  async getExpenseCategorySummaryApi(_query?: ExpenseListQuery): Promise<CategorySummaryResponse> {
    const records = await listExpenseRecords();
    const active = records.filter(r => r.status === 'recorded');

    const categoryMap: Record<string, { totalAmount: number; count: number }> = {};
    active.forEach(r => {
      if (!categoryMap[r.category]) categoryMap[r.category] = { totalAmount: 0, count: 0 };
      categoryMap[r.category].totalAmount += r.amount;
      categoryMap[r.category].count += 1;
    });

    return {
      categories: Object.entries(categoryMap)
        .map(([category, stats]) => ({ category, totalAmount: stats.totalAmount, count: stats.count }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
    };
  }

  async getCategories(): Promise<ExpenseCategoryRecord[]> {
    return db.expenseCategories.toArray();
  }

  async addCategory(name: string): Promise<ExpenseCategoryRecord> {
    const existing = await db.expenseCategories.where('name').equals(name).first();
    if (existing) return existing;
    const cat: ExpenseCategoryRecord = {
      id: uuidv4(), name, isSystem: false, createdAt: new Date().toISOString()
    };
    await db.expenseCategories.add(cat);
    return cat;
  }

  async deleteCategory(id: string): Promise<void> {
    return deleteCategoryRepo(id);
  }

  async renameCategory(id: string, newName: string): Promise<ExpenseCategoryRecord> {
    return renameCategoryRepo(id, newName);
  }

  async getSettings() {
    let settings = await db.expenseSettings.get('singleton');
    if (!settings) {
      settings = { id: 'singleton', nextExpenseNumber: 1, allowCustomCategories: false, recentCategories: [] };
      await db.expenseSettings.add(settings);
    }
    return settings;
  }

  async updateSettings(updates: { allowCustomCategories?: boolean; recentCategories?: string[] }) {
    await db.expenseSettings.update('singleton', updates);
    return this.getSettings();
  }

  async copyLastExpense(): Promise<CreateExpenseInput | null> {
    const records = await listExpenseRecords();
    const last = records.find(r => r.status === 'recorded');
    if (!last) return null;
    return {
      title: last.title,
      amount: last.amount,
      category: last.category,
      paymentMode: last.paymentMode,
      partyId: last.partyId,
      note: last.note,
      tags: last.tags,
      recurringHint: last.recurringHint,
    };
  }

  async initializeDefaults(): Promise<void> {
    const count = await db.expenseCategories.count();
    if (count > 0) return;

    const defaults = [
      'stock purchase', 'supplier payment', 'rent', 'utilities',
      'transport', 'salary/staff', 'packaging', 'marketing',
      'maintenance', 'subscriptions', 'food/tea', 'miscellaneous'
    ];
    const now = new Date().toISOString();
    await db.expenseCategories.bulkAdd(
      defaults.map(name => ({ id: uuidv4(), name, isSystem: true, createdAt: now }))
    );
  }
}

export const expenseService = new LocalExpenseService();

// Optional adapter stub for future sync
export class RemoteExpenseService implements IExpenseService {
  constructor(_baseUrl: string) {}

  async createExpense(_input: CreateExpenseInput): Promise<ExpenseDetailResponse> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
  async updateExpense(_id: string, _input: UpdateExpenseInput): Promise<ExpenseDetailResponse> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
  async getExpenseById(_id: string): Promise<ExpenseDetailResponse> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
  async getExpenses(_query?: ExpenseListQuery): Promise<ExpenseListResponse> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
  async voidExpense(_id: string): Promise<VoidExpenseResponse> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
  async duplicateExpense(_id: string): Promise<DuplicateExpenseResponse> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
  async getExpenseSummary(_query?: ExpenseListQuery): Promise<ExpenseSummaryResponse> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
  async getExpenseCategorySummaryApi(_query?: ExpenseListQuery): Promise<CategorySummaryResponse> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
  async getCategories(): Promise<ExpenseCategoryRecord[]> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
  async addCategory(_name: string): Promise<ExpenseCategoryRecord> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
  async getSettings(): Promise<any> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
  async updateSettings(_updates: any): Promise<any> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
  async copyLastExpense(): Promise<CreateExpenseInput | null> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
  async initializeDefaults(): Promise<void> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
  async deleteCategory(_category: string): Promise<void> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
  async renameCategory(_id: string, _newName: string): Promise<ExpenseCategoryRecord> {
    throw new Error('Not implemented: Remote sync is an optional future feature');
  }
}
