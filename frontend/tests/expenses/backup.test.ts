import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../../src/lib/db';
import { LocalExpenseService } from '../../src/modules/expenses/api/expenseService';
import { backupService } from '../../src/modules/expenses/api/backupService';

const service = new LocalExpenseService();

beforeEach(async () => {
  await db.expenses.clear();
  await db.expenseCategories.clear();
  await db.expenseSettings.clear();
  await db.parties.clear();
  await service.initializeDefaults();
});

describe('Backup/Restore cycle', () => {
  it('exports data, clears DB, imports backup, and verifies restoration', async () => {
    await service.createExpense({
      title: 'Monthly Rent',
      amount: 12000,
      category: 'rent',
      paymentMode: 'bank',
    });

    await service.createExpense({
      title: 'Office Supplies',
      amount: 2500,
      category: 'stock purchase',
      paymentMode: 'cash',
    });

    const expensesBefore = await db.expenses.count();
    expect(expensesBefore).toBe(2);

    const jsonString = await backupService.exportData();
    const backup = JSON.parse(jsonString);
    expect(backup.schemaVersion).toBe('1.0');
    expect(backup.module).toBe('expenses');
    expect(backup.data.expenses.length).toBe(2);
    expect(backup.data.expenseCategories.length).toBeGreaterThan(0);

    await db.expenses.clear();
    expect(await db.expenses.count()).toBe(0);

    await backupService.importData(jsonString);

    expect(await db.expenses.count()).toBe(2);

    const restored = await service.getExpenses();
    expect(restored.data.length).toBe(2);
    expect(restored.data.some(e => e.title === 'Monthly Rent' && e.amount === 12000)).toBe(true);
    expect(restored.data.some(e => e.title === 'Office Supplies' && e.amount === 2500)).toBe(true);

    const cats = await db.expenseCategories.count();
    expect(cats).toBeGreaterThan(0);
  });

  it('rejects backup with wrong module name', async () => {
    const badBackup = {
      schemaVersion: '1.0',
      module: 'parties',
      timestamp: new Date().toISOString(),
      data: { expenses: [], expenseCategories: [], expenseSettings: [] },
    };

    await expect(backupService.importData(JSON.stringify(badBackup)))
      .rejects.toThrow('not an expenses backup');
  });

  it('rejects backup with wrong schema version', async () => {
    const futureBackup = {
      schemaVersion: '99.0',
      module: 'expenses',
      timestamp: new Date().toISOString(),
      data: { expenses: [], expenseCategories: [], expenseSettings: [] },
    };

    await expect(backupService.importData(JSON.stringify(futureBackup)))
      .rejects.toThrow('Unsupported schema version');
  });

  it('rejects malformed JSON', async () => {
    await expect(backupService.importData('not valid json {'))
      .rejects.toThrow('Invalid JSON file format');
  });
});
