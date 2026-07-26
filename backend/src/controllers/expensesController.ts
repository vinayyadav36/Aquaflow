import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { JsonStorage } from '../storage/jsonStorage';

interface ExpenseBackendRecord {
  id: string;
  expenseNumber: string;
  title: string;
  amount: number;
  category: string;
  paymentMode: string;
  partyId?: string;
  partySnapshot?: { id: string; displayName: string; phone?: string; primaryType?: string };
  date: string;
  note?: string;
  tags?: string[];
  recurringHint?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdSource?: string;
}

const expensesDb = new JsonStorage<ExpenseBackendRecord>('expenses');

function buildExpenseNumber(sequence: number): string {
  return `EXP-${sequence.toString().padStart(5, '0')}`;
}

// GET /api/expenses
export const listExpenses = (req: Request, res: Response) => {
  const { status, category, paymentMode, partyId, search, dateRange, sortBy } = req.query;
  let records = expensesDb.readAll();

  if (status) records = records.filter(r => r.status === status);
  if (category) records = records.filter(r => r.category === category);
  if (paymentMode) records = records.filter(r => r.paymentMode === paymentMode);
  if (partyId) records = records.filter(r => r.partyId === partyId);
  if (search) {
    const s = (search as string).toLowerCase();
    records = records.filter(r =>
      r.title.toLowerCase().includes(s) ||
      (r.note && r.note.toLowerCase().includes(s)) ||
      (r.partySnapshot && r.partySnapshot.displayName.toLowerCase().includes(s))
    );
  }
  if (dateRange) {
    const now = new Date();
    let start: Date;
    if (dateRange === 'today') start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (dateRange === '7days') start = new Date(now.getTime() - 7 * 86400000);
    else if (dateRange === '30days') start = new Date(now.getTime() - 30 * 86400000);
    else start = new Date(0);
    records = records.filter(r => new Date(r.date) >= start);
  }
  if (sortBy === 'highest_amount') records.sort((a, b) => b.amount - a.amount);
  else if (sortBy === 'oldest') records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  else if (sortBy === 'category') records.sort((a, b) => a.category.localeCompare(b.category));
  else records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({ success: true, data: records, totalCount: records.length });
};

// GET /api/expenses/summary
export const getSummary = (req: Request, res: Response) => {
  const records = expensesDb.readAll().filter(r => r.status === 'recorded');
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 86400000);
  const monthStart = new Date(now.getTime() - 30 * 86400000);

  let cashOutTotal = 0, digitalOutTotal = 0;
  const categoryTotals: Record<string, number> = {};

  records.forEach(r => {
    if (r.paymentMode === 'cash') cashOutTotal += r.amount;
    else digitalOutTotal += r.amount;
    categoryTotals[r.category] = (categoryTotals[r.category] || 0) + r.amount;
  });

  let topCategory = null;
  let max = 0;
  for (const [name, amount] of Object.entries(categoryTotals)) {
    if (amount > max) { max = amount; topCategory = { name, amount }; }
  }

  res.json({
    success: true,
    todayTotal: records.filter(r => new Date(r.date) >= todayStart).reduce((s, r) => s + r.amount, 0),
    weekTotal: records.filter(r => new Date(r.date) >= weekStart).reduce((s, r) => s + r.amount, 0),
    monthTotal: records.filter(r => new Date(r.date) >= monthStart).reduce((s, r) => s + r.amount, 0),
    topCategory,
    cashOutTotal,
    digitalOutTotal,
  });
};

// GET /api/expenses/categories/summary
export const getCategorySummary = (req: Request, res: Response) => {
  const records = expensesDb.readAll().filter(r => r.status === 'recorded');
  const categoryMap: Record<string, { totalAmount: number; count: number }> = {};
  records.forEach(r => {
    if (!categoryMap[r.category]) categoryMap[r.category] = { totalAmount: 0, count: 0 };
    categoryMap[r.category].totalAmount += r.amount;
    categoryMap[r.category].count += 1;
  });
  res.json({
    success: true,
    categories: Object.entries(categoryMap)
      .map(([category, stats]) => ({ category, totalAmount: stats.totalAmount, count: stats.count }))
      .sort((a, b) => b.totalAmount - a.totalAmount),
  });
};

// GET /api/expenses/:id
export const getExpenseById = (req: Request, res: Response) => {
  const record = expensesDb.readById(req.params.id);
  if (!record) return res.status(404).json({ success: false, error: 'Expense not found' });
  res.json({ success: true, data: record });
};

// POST /api/expenses
export const createExpense = (req: Request, res: Response) => {
  const { title, amount, category, paymentMode, partyId, date, note, tags, recurringHint, createdSource } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
  if (!category) return res.status(400).json({ success: false, error: 'Category is required' });

  const all = expensesDb.readAll();
  const maxSeq = all.reduce((max, r) => {
    const match = r.expenseNumber.match(/EXP-(\d+)/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);

  const now = new Date().toISOString();
  const newRecord: ExpenseBackendRecord = {
    id: uuidv4(),
    expenseNumber: buildExpenseNumber(maxSeq + 1),
    title: title || category,
    amount,
    category,
    paymentMode: paymentMode || 'cash',
    partyId,
    date: date || now,
    note,
    tags,
    recurringHint: recurringHint || 'none',
    status: 'recorded',
    createdAt: now,
    updatedAt: now,
    createdSource: createdSource || 'manual',
  };

  expensesDb.insert(newRecord);
  res.status(201).json({ success: true, data: newRecord });
};

// PATCH /api/expenses/:id
export const updateExpense = (req: Request, res: Response) => {
  const updated = expensesDb.update(req.params.id, { ...req.body, updatedAt: new Date().toISOString() });
  if (!updated) return res.status(404).json({ success: false, error: 'Expense not found' });
  res.json({ success: true, data: updated });
};

// POST /api/expenses/:id/void
export const voidExpense = (req: Request, res: Response) => {
  const record = expensesDb.readById(req.params.id);
  if (!record) return res.status(404).json({ success: false, error: 'Expense not found' });
  if (record.status === 'voided') return res.status(400).json({ success: false, error: 'Expense already voided' });

  const updated = expensesDb.update(req.params.id, { status: 'voided', updatedAt: new Date().toISOString() });
  res.json({ success: true, data: updated });
};

// POST /api/expenses/:id/duplicate
export const duplicateExpense = (req: Request, res: Response) => {
  const record = expensesDb.readById(req.params.id);
  if (!record) return res.status(404).json({ success: false, error: 'Expense not found' });

  const all = expensesDb.readAll();
  const maxSeq = all.reduce((max, r) => {
    const match = r.expenseNumber.match(/EXP-(\d+)/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);

  const now = new Date().toISOString();
  const newRecord: ExpenseBackendRecord = {
    ...record,
    id: uuidv4(),
    expenseNumber: buildExpenseNumber(maxSeq + 1),
    title: `${record.title} (Copy)`,
    date: now,
    status: 'recorded',
    createdAt: now,
    updatedAt: now,
  };
  delete (newRecord as any).id;

  expensesDb.insert(newRecord);
  res.status(201).json({ success: true, data: newRecord });
};
