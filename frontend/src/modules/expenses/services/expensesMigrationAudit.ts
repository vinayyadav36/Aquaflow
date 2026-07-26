import { db } from '../../../lib/db';
import type { ExpenseRecord } from '../../../lib/db';

export interface MigrationAuditEntry {
  type: 'category' | 'party' | 'status' | 'duplicate' | 'orphan';
  expenseId: string;
  expenseNumber: string;
  issue: string;
  detail?: string;
}

export async function auditExpenses(): Promise<MigrationAuditEntry[]> {
  const issues: MigrationAuditEntry[] = [];
  const expenses = await db.expenses.toArray();

  const categoryNames = (await db.expenseCategories.toArray()).map(c => c.name);
  const partyIds = new Set((await db.parties.toArray()).map(p => p.id));

  const seenNumbers = new Map<string, string>();

  for (const exp of expenses) {
    if (exp.category && categoryNames.length > 0 && !categoryNames.includes(exp.category)) {
      issues.push({
        type: 'category',
        expenseId: exp.id,
        expenseNumber: exp.expenseNumber,
        issue: `Unknown category: "${exp.category}"`,
      });
    }

    if (exp.partyId && !partyIds.has(exp.partyId)) {
      issues.push({
        type: 'orphan',
        expenseId: exp.id,
        expenseNumber: exp.expenseNumber,
        issue: `References missing party: ${exp.partyId}`,
      });
    }

    if (exp.status !== 'recorded' && exp.status !== 'voided') {
      issues.push({
        type: 'status',
        expenseId: exp.id,
        expenseNumber: exp.expenseNumber,
        issue: `Invalid status: "${exp.status}"`,
      });
    }

    const existing = seenNumbers.get(exp.expenseNumber);
    if (existing) {
      issues.push({
        type: 'duplicate',
        expenseId: exp.id,
        expenseNumber: exp.expenseNumber,
        issue: `Duplicate expenseNumber with ${existing}`,
      });
    } else {
      seenNumbers.set(exp.expenseNumber, exp.id);
    }
  }

  return issues;
}

export async function migrateLegacyExpenses(): Promise<{ migrated: number; errors: string[] }> {
  const errors: string[] = [];
  let migrated = 0;

  const expenses = await db.expenses.toArray();

  for (const exp of expenses) {
    try {
      const updates: Partial<ExpenseRecord> = {};

      if (!exp.expenseNumber) {
        updates.expenseNumber = `EXP-${String(Date.now()).slice(-5)}`;
      }

      if (!exp.status) {
        updates.status = 'recorded';
      }

      if (!exp.createdAt) {
        updates.createdAt = exp.date || new Date().toISOString();
      }

      if (!exp.updatedAt) {
        updates.updatedAt = new Date().toISOString();
      }

      if (Object.keys(updates).length > 0) {
        await db.expenses.update(exp.id, updates);
        migrated++;
      }
    } catch (err: any) {
      errors.push(`Expense ${exp.id}: ${err.message}`);
    }
  }

  return { migrated, errors };
}
