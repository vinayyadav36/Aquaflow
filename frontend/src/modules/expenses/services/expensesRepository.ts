import type { ExpenseRecord } from "../../../lib/db";
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../lib/db';
import { buildExpenseNumber } from './expensesDomain';

export async function getNextExpenseNumber(): Promise<string> {
  return await db.transaction('rw', db.expenseSettings, async () => {
    let settings = await db.expenseSettings.get('singleton');
    if (!settings) {
      settings = { id: 'singleton', nextExpenseNumber: 1, allowCustomCategories: false, recentCategories: [] };
      await db.expenseSettings.add(settings);
    }

    const num = settings.nextExpenseNumber;
    await db.expenseSettings.update('singleton', { nextExpenseNumber: num + 1 });
    return buildExpenseNumber(num);
  });
}

export async function createExpenseRecord(data: Omit<ExpenseRecord, 'id' | 'expenseNumber' | 'createdAt' | 'updatedAt'>): Promise<ExpenseRecord> {
  const expenseNumber = await getNextExpenseNumber();
  const now = new Date().toISOString();

  let partySnapshot = undefined;
  if (data.partyId) {
    const party = await db.parties.get(data.partyId);
    if (party) {
      partySnapshot = {
        id: party.id,
        displayName: party.displayName,
        phone: party.phone,
        primaryType: party.primaryType
      };
    }
  }

  const newRecord: ExpenseRecord = {
    ...data,
    id: uuidv4(),
    expenseNumber,
    partySnapshot,
    createdAt: now,
    updatedAt: now,
  };

  await db.expenses.add(newRecord);
  return newRecord;
}

export async function updateExpenseRecord(id: string, updates: Partial<ExpenseRecord>): Promise<ExpenseRecord> {
  const now = new Date().toISOString();
  await db.expenses.update(id, { ...updates, updatedAt: now });
  const updated = await db.expenses.get(id);
  if (!updated) throw new Error('Expense not found');
  return updated;
}

export async function getExpenseRecordById(id: string): Promise<ExpenseRecord | undefined> {
  return await db.expenses.get(id);
}

export async function listExpenseRecords(): Promise<ExpenseRecord[]> {
  return await db.expenses.orderBy('date').reverse().toArray();
}
