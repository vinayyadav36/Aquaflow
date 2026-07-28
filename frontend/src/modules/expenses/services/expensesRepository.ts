import type { ExpenseRecord, ExpenseSettingsRecord, ExpenseCategoryRecord } from "../../../lib/db";
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

export async function getExpenseSettings(): Promise<ExpenseSettingsRecord> {
  let settings = await db.expenseSettings.get('singleton');
  if (!settings) {
    settings = { id: 'singleton', nextExpenseNumber: 1, allowCustomCategories: false, recentCategories: [] };
    await db.expenseSettings.add(settings);
  }
  return settings;
}

export async function updateExpenseSettings(updates: Partial<ExpenseSettingsRecord>): Promise<ExpenseSettingsRecord> {
  await db.expenseSettings.update('singleton', updates);
  const settings = await db.expenseSettings.get('singleton');
  if (!settings) throw new Error('Settings not found');
  return settings;
}

export async function listExpenseCategories(): Promise<ExpenseCategoryRecord[]> {
  return await db.expenseCategories.toArray();
}

export async function addExpenseCategory(name: string): Promise<ExpenseCategoryRecord> {
  const cat: ExpenseCategoryRecord = {
    id: uuidv4(),
    name,
    isSystem: false,
    createdAt: new Date().toISOString()
  };
  await db.expenseCategories.add(cat);
  return cat;
}

export async function deleteExpenseCategory(id: string): Promise<void> {
  const cat = await db.expenseCategories.get(id);
  if (!cat) throw new Error('Category not found');
  if (cat.isSystem) throw new Error('Cannot delete system category');
  await db.expenseCategories.delete(id);
}

export async function renameExpenseCategory(id: string, newName: string): Promise<ExpenseCategoryRecord> {
  const cat = await db.expenseCategories.get(id);
  if (!cat) throw new Error('Category not found');
  await db.expenseCategories.update(id, { name: newName });
  const updated = await db.expenseCategories.get(id);
  if (!updated) throw new Error('Category not found after update');
  return updated;
}

export async function seedDefaultCategories(): Promise<void> {
  const existing = await db.expenseCategories.count();
  if (existing > 0) return;

  const defaults = [
    'stock purchase', 'supplier payment', 'rent', 'utilities',
    'transport', 'salary/staff', 'packaging', 'marketing',
    'maintenance', 'subscriptions', 'food/tea', 'miscellaneous'
  ];

  for (const name of defaults) {
    await db.expenseCategories.add({
      id: uuidv4(),
      name,
      isSystem: true,
      createdAt: new Date().toISOString()
    });
  }
}
