import { useState, useEffect, useCallback } from 'react';
import type { ExpenseListQuery, ExpenseDetailResponse, ExpenseSummaryResponse } from '../api/dto';
import { expenseService } from '../api/expenseService';

export function useExpensesList(initialFilters?: ExpenseListQuery) {
  const [expenses, setExpenses] = useState<ExpenseDetailResponse[]>([]);
  const [summaries, setSummaries] = useState<ExpenseSummaryResponse | null>(null);
  const [filters, setFilters] = useState<ExpenseListQuery>(initialFilters || {});
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        expenseService.getExpenses(filters),
        expenseService.getExpenseSummary(filters)
      ]);
      setExpenses(listRes.data);
      setSummaries(summaryRes);
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateFilters = (newFilters: Partial<ExpenseListQuery>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  return {
    expenses,
    summaries,
    filters,
    isLoading,
    updateFilters,
    resetFilters,
    refresh: loadData
  };
}
