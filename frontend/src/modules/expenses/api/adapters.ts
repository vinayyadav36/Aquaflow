import type { ExpenseRecord } from '../../../lib/db';
import type { ExpenseDetailResponse, ExpenseListResponse } from './dto';

export function recordToDetailResponse(record: ExpenseRecord): ExpenseDetailResponse {
  return { ...record };
}

export function recordsToListResponse(records: ExpenseRecord[]): ExpenseListResponse {
  return {
    data: records.map(recordToDetailResponse),
    totalCount: records.length,
  };
}

export function buildCategoryBreakdown(records: ExpenseRecord[]) {
  const catMap: Record<string, { totalAmount: number; count: number }> = {};
  records.filter(r => r.status === 'recorded').forEach(r => {
    if (!catMap[r.category]) catMap[r.category] = { totalAmount: 0, count: 0 };
    catMap[r.category].totalAmount += r.amount;
    catMap[r.category].count += 1;
  });
  return Object.entries(catMap)
    .map(([category, stats]) => ({ category, totalAmount: stats.totalAmount, count: stats.count }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

export function buildPaymentModeBreakdown(records: ExpenseRecord[]) {
  const pmMap: Record<string, { totalAmount: number; count: number }> = {};
  records.filter(r => r.status === 'recorded').forEach(r => {
    if (!pmMap[r.paymentMode]) pmMap[r.paymentMode] = { totalAmount: 0, count: 0 };
    pmMap[r.paymentMode].totalAmount += r.amount;
    pmMap[r.paymentMode].count += 1;
  });
  return Object.entries(pmMap)
    .map(([paymentMode, stats]) => ({ paymentMode, totalAmount: stats.totalAmount, count: stats.count }));
}