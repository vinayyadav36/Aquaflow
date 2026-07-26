import { Router, Request, Response } from 'express';
import * as expenseService from './service';
import type { CreateExpenseDto, UpdateExpenseDto } from './dto';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const query = {
    search: req.query.search as string | undefined,
    category: req.query.category as string | undefined,
    paymentMode: req.query.paymentMode as string | undefined,
    partyId: req.query.partyId as string | undefined,
    status: req.query.status as string | undefined,
    dateRange: req.query.dateRange as string | undefined,
    sortBy: req.query.sortBy as string | undefined
  };
  const result = expenseService.getExpenses(query);
  res.json(result);
});

router.get('/summary', (_req: Request, res: Response) => {
  const summary = expenseService.getExpenseSummary();
  res.json(summary);
});

router.get('/categories/summary', (_req: Request, res: Response) => {
  const summary = expenseService.getCategorySummary();
  res.json(summary);
});

router.get('/:id', (req: Request, res: Response) => {
  const expense = expenseService.getExpenseById(req.params.id);
  if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
  res.json(expense);
});

router.post('/', (req: Request, res: Response) => {
  const input: CreateExpenseDto = req.body;
  if (!input.amount || input.amount <= 0) {
    return res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
  }
  if (!input.category) {
    return res.status(400).json({ success: false, error: 'Category is required' });
  }
  const expense = expenseService.createExpense(input);
  res.status(201).json(expense);
});

router.patch('/:id', (req: Request, res: Response) => {
  const input: UpdateExpenseDto = req.body;
  const expense = expenseService.updateExpense(req.params.id, input);
  if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
  res.json(expense);
});

router.post('/:id/void', (req: Request, res: Response) => {
  const expense = expenseService.voidExpense(req.params.id);
  if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
  res.json({ success: true, expense });
});

router.post('/:id/duplicate', (req: Request, res: Response) => {
  const expense = expenseService.duplicateExpense(req.params.id);
  if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
  res.status(201).json({ success: true, expense });
});

export default router;
