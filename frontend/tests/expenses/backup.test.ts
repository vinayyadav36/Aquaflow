import { describe, it, expect, beforeEach } from 'vitest';
import { backupService } from '../../src/modules/expenses/api/backupService';
import { db } from '../../src/lib/db';

describe('Backup and Restore', () => {
  beforeEach(async () => {
    await db.expenses.clear();
    await db.expenseCategories.clear();
    await db.expenseSettings.clear();
  });

  it('exports and imports expenses, categories, and settings', async () => {
    // Seed initial data
    await db.expenseCategories.add({ id: 'cat1', name: 'Software', isSystem: false, createdAt: new Date().toISOString() });
    await db.expenseSettings.add({ id: 'singleton', nextExpenseNumber: 42, allowCustomCategories: true, recentCategories: [] });
    await db.expenses.add({
      id: 'exp1', title: 'GitHub', amount: 400, category: 'Software',
      paymentMode: 'card', date: new Date().toISOString(), status: 'recorded',
      expenseNumber: 'EXP-00041', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });

    // Export
    const backupJson = await backupService.exportData();
    const payload = JSON.parse(backupJson);

    expect(payload.schemaVersion).toBe('1.0');
    expect(payload.data.expenses.length).toBe(1);
    expect(payload.data.expenseCategories.length).toBe(1);
    expect(payload.data.expenseSettings[0].nextExpenseNumber).toBe(42);

    // Clear db
    await db.expenses.clear();
    await db.expenseCategories.clear();
    await db.expenseSettings.clear();

    expect(await db.expenses.count()).toBe(0);

    // Import
    await backupService.importData(backupJson);

    // Verify
    expect(await db.expenses.count()).toBe(1);
    expect(await db.expenseCategories.count()).toBe(1);
    const settings = await db.expenseSettings.get('singleton');
    expect(settings?.nextExpenseNumber).toBe(42);
  });
});
