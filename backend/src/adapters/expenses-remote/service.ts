import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import type {
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseDetailDto,
  ExpenseListQueryDto,
  ExpenseListResponseDto,
  ExpenseSummaryResponseDto,
  CategorySummaryResponseDto,
  VoidExpenseResponseDto,
  DuplicateExpenseResponseDto
} from './dto';

const DATA_DIR = path.join(__dirname, '../../../../data/expenses');
const EXPENSES_FILE = path.join(DATA_DIR, 'expenses.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(EXPENSES_FILE)) {
    fs.writeFileSync(EXPENSES_FILE, '[]', 'utf-8');
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ nextExpenseNumber: 1 }), 'utf-8');
  }
}

function readExpenses(): ExpenseDetailDto[] {
  ensureDataDir();
  const raw = fs.readFileSync(EXPENSES_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeExpenses(expenses: ExpenseDetailDto[]): void {
  fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2), 'utf-8');
}

function readSettings(): { nextExpenseNumber: number } {
  ensureDataDir();
  const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeSettings(settings: { nextExpenseNumber: number }): void {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings), 'utf-8');
}

function buildExpenseNumber(seq: number): string {
  return `EXP-${seq.toString().padStart(5, '0')}`;
}

export function createExpense(input: CreateExpenseDto): ExpenseDetailDto {
  const settings = readSettings();
  const expenseNumber = buildExpenseNumber(settings.nextExpenseNumber);
  writeSettings({ nextExpenseNumber: settings.nextExpenseNumber + 1 });

  const now = new Date().toISOString();
  const expense: ExpenseDetailDto = {
    id: uuidv4(),
    expenseNumber,
    title: input.title || input.category,
    amount: input.amount,
    category: input.category,
    paymentMode: input.paymentMode,
    partyId: input.partyId,
    date: input.date || now,
    note: input.note,
    tags: input.tags,
    recurringHint: input.recurringHint || 'none',
    status: 'recorded',
    createdAt: now,
    updatedAt: now,
    createdSource: input.createdSource || 'manual'
  };

  const expenses = readExpenses();
  expenses.push(expense);
  writeExpenses(expenses);
  return expense;
}

export function getExpenses(query?: ExpenseListQueryDto): ExpenseListResponseDto {
  let expenses = readExpenses();

  if (query) {
    if (query.status) expenses = expenses.filter(e => e.status === query.status);
    if (query.category) expenses = expenses.filter(e => e.category === query.category);
    if (query.paymentMode) expenses = expenses.filter(e => e.paymentMode === query.paymentMode);
    if (query.partyId) expenses = expenses.filter(e => e.partyId === query.partyId);
    if (query.search) {
      const s = query.search.toLowerCase();
      expenses = expenses.filter(e =>
        e.title.toLowerCase().includes(s) ||
        (e.note && e.note.toLowerCase().includes(s))
      );
    }
    if (query.sortBy === 'highest_amount') expenses.sort((a, b) => b.amount - a.amount);
    else if (query.sortBy === 'oldest') expenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    else expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return { data: expenses, totalCount: expenses.length };
}

export function getExpenseById(id: string): ExpenseDetailDto | null {
  const expenses = readExpenses();
  return expenses.find(e => e.id === id) || null;
}

export function updateExpense(id: string, input: UpdateExpenseDto): ExpenseDetailDto | null {
  const expenses = readExpenses();
  const index = expenses.findIndex(e => e.id === id);
  if (index === -1) return null;

  const updated = {
    ...expenses[index],
    ...input,
    partyId: input.partyId === null ? undefined : (input.partyId || expenses[index].partyId),
    updatedAt: new Date().toISOString()
  };
  expenses[index] = updated;
  writeExpenses(expenses);
  return updated;
}

export function voidExpense(id: string): ExpenseDetailDto | null {
  return updateExpense(id, { status: 'voided' } as any);
}

export function duplicateExpense(id: string): ExpenseDetailDto | null {
  const original = getExpenseById(id);
  if (!original) return null;

  return createExpense({
    title: `${original.title} (Copy)`,
    amount: original.amount,
    category: original.category,
    paymentMode: original.paymentMode as any,
    partyId: original.partyId,
    note: original.note,
    tags: original.tags,
    recurringHint: original.recurringHint as any,
    createdSource: 'manual'
  });
}

export function getExpenseSummary(): ExpenseSummaryResponseDto {
  const expenses = readExpenses().filter(e => e.status === 'recorded');
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

  let todayTotal = 0, weekTotal = 0, monthTotal = 0;
  let cashOutTotal = 0, digitalOutTotal = 0;
  const catTotals: Record<string, number> = {};

  expenses.forEach(e => {
    const d = new Date(e.date);
    if (d >= todayStart) todayTotal += e.amount;
    if (d >= weekAgo) weekTotal += e.amount;
    if (d >= monthAgo) monthTotal += e.amount;

    if (e.paymentMode === 'cash') cashOutTotal += e.amount;
    else digitalOutTotal += e.amount;

    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });

  let topCategory: any = null;
  let max = 0;
  for (const [name, amount] of Object.entries(catTotals)) {
    if (amount > max) { max = amount; topCategory = { name, amount }; }
  }

  return { todayTotal, weekTotal, monthTotal, topCategory, cashOutTotal, digitalOutTotal };
}

export function getCategorySummary(): CategorySummaryResponseDto {
  const expenses = readExpenses().filter(e => e.status === 'recorded');
  const catMap: Record<string, { totalAmount: number; count: number }> = {};

  expenses.forEach(e => {
    if (!catMap[e.category]) catMap[e.category] = { totalAmount: 0, count: 0 };
    catMap[e.category].totalAmount += e.amount;
    catMap[e.category].count += 1;
  });

  return {
    categories: Object.entries(catMap)
      .map(([category, s]) => ({ category, totalAmount: s.totalAmount, count: s.count }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
  };
}
