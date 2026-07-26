import { useState, useEffect, useCallback } from 'react';
import type { ExpenseDetailResponse } from '../api/dto';
import { expenseService } from '../api/expenseService';

export function useExpenseDetail(id: string) {
  const [expense, setExpense] = useState<ExpenseDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await expenseService.getExpenseById(id);
      setExpense(data);
    } catch (err: any) {
      setError(err.message || 'Error loading expense');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const voidAction = async () => {
    if (!expense || expense.status === 'voided') return;
    try {
      await expenseService.voidExpense(expense.id);
      await loadData();
    } catch (err) {
      console.error('Void failed', err);
    }
  };

  const duplicateAction = async () => {
    if (!expense) return null;
    try {
      const res = await expenseService.duplicateExpense(expense.id);
      return res.expense;
    } catch (err) {
      console.error('Duplicate failed', err);
      return null;
    }
  };

  return {
    expense,
    linkedParty: expense?.partySnapshot,
    isLoading,
    error,
    actions: { voidAction, duplicateAction },
    refresh: loadData
  };
}
