import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { expensesDb, expenseCategoriesDb, expenseSettingsDb, ExpenseBackendRecord } from '../../storage/expensesStorage';
import { usersDb } from '../../storage/db';

const router = Router();

function buildExpenseNumber(sequence: number): string {
  return `EXP-${String(sequence).padStart(5, '0')}`;
}

function getNextExpenseNumber(): number {
  let settings = expenseSettingsDb.readById('singleton');
  if (!settings) {
    settings = { id: 'singleton', nextExpenseNumber: 1, allowCustomCategories: false, recentCategories: [] };
    expenseSettingsDb.insert(settings);
  }
  const num = settings.nextExpenseNumber;
  expenseSettingsDb.update('singleton', { nextExpenseNumber: num + 1 });
  return num;
}

function getTopExpenseCategory(records: ExpenseBackendRecord[]): { name: string; amount: number } | null {
  const active = records.filter(r => r.status === 'recorded');
  const totals: Record<string, number> = {};
  active.forEach(r => { totals[r.category] = (totals[r.category] || 0) + r.amount; });
  let max = 0;
  let top: { name: string; amount: number } | null = null;
  for (const [name, amount] of Object.entries(totals)) {
    if (amount > max) { max = amount; top = { name, amount }; }
  }
  return top;
}

function getTodayTotal(records: ExpenseBackendRecord[]): number {
  const today = new Date().toISOString().split('T')[0];
  return records.filter(r => r.status === 'recorded' && r.date.startsWith(today)).reduce((s, r) => s + r.amount, 0);
}

function getPeriodTotal(records: ExpenseBackendRecord[], days: number): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return records.filter(r => r.status === 'recorded' && new Date(r.date) >= cutoff).reduce((s, r) => s + r.amount, 0);
}

// GET /api/expenses
router.get('/', (req: Request, res: Response) => {
  let records = expensesDb.readAll();

  const { search, category, paymentMode, partyId, status, dateRange, sortBy } = req.query as Record<string, string | undefined>;

  if (status) records = records.filter(r => r.status === status);
  if (category) records = records.filter(r => r.category === category);
  if (paymentMode) records = records.filter(r => r.paymentMode === paymentMode);
  if (partyId) records = records.filter(r => r.partyId === partyId);
  if (search) {
    const s = search.toLowerCase();
    records = records.filter(r => r.title.toLowerCase().includes(s) || (r.note && r.note.toLowerCase().includes(s)));
  }
  if (dateRange && dateRange !== 'all') {
    const now = new Date();
    let start: Date;
    if (dateRange === 'today') start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (dateRange === '7days') { start = new Date(now); start.setDate(start.getDate() - 7); }
    else if (dateRange === '30days') { start = new Date(now); start.setDate(start.getDate() - 30); }
    else start = new Date(0);
    records = records.filter(r => new Date(r.date) >= start);
  }
  if (sortBy === 'highest_amount') records.sort((a, b) => b.amount - a.amount);
  else if (sortBy === 'oldest') records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  else if (sortBy === 'category') records.sort((a, b) => a.category.localeCompare(b.category));
  else records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({ success: true, data: records, totalCount: records.length });
});

// GET /api/expenses/summary
router.get('/summary', (req: Request, res: Response) => {
  const records = expensesDb.readAll();
  const active = records.filter(r => r.status === 'recorded');
  let cashOutTotal = 0;
  let digitalOutTotal = 0;
  active.forEach(r => {
    if (r.paymentMode === 'cash') cashOutTotal += r.amount;
    else digitalOutTotal += r.amount;
  });

  res.json({
    success: true,
    data: {
      todayTotal: getTodayTotal(records),
      weekTotal: getPeriodTotal(records, 7),
      monthTotal: getPeriodTotal(records, 30),
      topCategory: getTopExpenseCategory(records),
      cashOutTotal,
      digitalOutTotal,
    },
  });
});

// GET /api/expenses/categories/summary
router.get('/categories/summary', (req: Request, res: Response) => {
  const records = expensesDb.readAll();
  const active = records.filter(r => r.status === 'recorded');
  const map: Record<string, { totalAmount: number; count: number }> = {};
  active.forEach(r => {
    if (!map[r.category]) map[r.category] = { totalAmount: 0, count: 0 };
    map[r.category].totalAmount += r.amount;
    map[r.category].count += 1;
  });

  res.json({
    success: true,
    data: Object.entries(map)
      .map(([category, stats]) => ({ category, totalAmount: stats.totalAmount, count: stats.count }))
      .sort((a, b) => b.totalAmount - a.totalAmount),
  });
});

// GET /api/expenses/categories
router.get('/categories', (req: Request, res: Response) => {
  const categories = expenseCategoriesDb.readAll();
  res.json({ success: true, data: categories });
});

// GET /api/expenses/:id
router.get('/:id', (req: Request, res: Response) => {
  const record = expensesDb.readById(req.params.id);
  if (!record) return res.status(404).json({ success: false, error: 'Expense not found' });
  res.json({ success: true, data: record });
});

// POST /api/expenses
router.post('/', (req: Request, res: Response) => {
  const { title, amount, category, paymentMode, partyId, date, note, tags, recurringHint, createdSource } = req.body;

  if (!amount || amount <= 0) return res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
  if (!category) return res.status(400).json({ success: false, error: 'Category is required' });

  const num = getNextExpenseNumber();
  const now = new Date().toISOString();

  let partySnapshot: any = undefined;
  if (partyId) {
    const party = usersDb.readById(partyId);
    if (party) {
      partySnapshot = { id: party.id, displayName: party.displayName || party.name, phone: party.phone, primaryType: party.primaryType || 'supplier' };
    }
  }

  const record: ExpenseBackendRecord = {
    id: uuidv4(),
    expenseNumber: buildExpenseNumber(num),
    title: title || category,
    amount,
    category,
    paymentMode: paymentMode || 'cash',
    partyId,
    partySnapshot,
    date: date || now,
    note,
    tags,
    recurringHint: recurringHint || 'none',
    status: 'recorded',
    createdAt: now,
    updatedAt: now,
    createdSource: createdSource || 'manual',
  };

  expensesDb.insert(record);
  res.status(201).json({ success: true, data: record });
});

// PATCH /api/expenses/:id
router.patch('/:id', (req: Request, res: Response) => {
  const existing = expensesDb.readById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Expense not found' });

  const { title, amount, category, paymentMode, partyId, date, note, tags, recurringHint } = req.body;
  const updates: Partial<ExpenseBackendRecord> = { updatedAt: new Date().toISOString() };
  if (title !== undefined) updates.title = title;
  if (amount !== undefined) updates.amount = amount;
  if (category !== undefined) updates.category = category;
  if (paymentMode !== undefined) updates.paymentMode = paymentMode;
  if (partyId !== undefined) updates.partyId = partyId;
  if (date !== undefined) updates.date = date;
  if (note !== undefined) updates.note = note;
  if (tags !== undefined) updates.tags = tags;
  if (recurringHint !== undefined) updates.recurringHint = recurringHint;

  if (partyId && partyId !== existing.partyId) {
    const party = usersDb.readById(partyId);
    if (party) {
      updates.partySnapshot = { id: party.id, displayName: party.displayName || party.name, phone: party.phone, primaryType: party.primaryType || 'supplier' };
    }
  }

  const updated = expensesDb.update(req.params.id, updates);
  res.json({ success: true, data: updated });
});

// POST /api/expenses/:id/void
router.post('/:id/void', (req: Request, res: Response) => {
  const record = expensesDb.readById(req.params.id);
  if (!record) return res.status(404).json({ success: false, error: 'Expense not found' });
  if (record.status === 'voided') return res.status(400).json({ success: false, error: 'Expense already voided' });

  const updated = expensesDb.update(req.params.id, { status: 'voided', updatedAt: new Date().toISOString() });
  res.json({ success: true, data: updated });
});

// POST /api/expenses/:id/duplicate
router.post('/:id/duplicate', (req: Request, res: Response) => {
  const original = expensesDb.readById(req.params.id);
  if (!original) return res.status(404).json({ success: false, error: 'Expense not found' });

  const num = getNextExpenseNumber();
  const now = new Date().toISOString();

  const record: ExpenseBackendRecord = {
    ...original,
    id: uuidv4(),
    expenseNumber: buildExpenseNumber(num),
    title: `${original.title} (Copy)`,
    date: now,
    status: 'recorded',
    createdAt: now,
    updatedAt: now,
  };

  expensesDb.insert(record);
  res.status(201).json({ success: true, data: record });
});

export default router;
