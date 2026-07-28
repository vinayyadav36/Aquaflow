import { db } from '../../../lib/db';

const SCHEMA_VERSION = '1.0';

export interface BackupPayload {
  schemaVersion: string;
  module: 'expenses';
  timestamp: string;
  data: {
    expenses: any[];
    expenseCategories: any[];
    expenseSettings: any[];
  };
}

export class BackupService {
  async exportData(): Promise<string> {
    const expenses = await db.expenses.toArray();
    const expenseCategories = await db.expenseCategories.toArray();
    const expenseSettings = await db.expenseSettings.toArray();

    const payload: BackupPayload = {
      schemaVersion: SCHEMA_VERSION,
      module: 'expenses',
      timestamp: new Date().toISOString(),
      data: {
        expenses,
        expenseCategories,
        expenseSettings,
      },
    };

    return JSON.stringify(payload, null, 2);
  }

  async importData(jsonString: string): Promise<void> {
    let payload: BackupPayload;
    try {
      payload = JSON.parse(jsonString);
    } catch (_e) {
      throw new Error('Invalid JSON file format.');
    }

    if (payload.module !== 'expenses') {
      throw new Error('The provided file is not an expenses backup.');
    }
    if (payload.schemaVersion !== SCHEMA_VERSION) {
      throw new Error(`Unsupported schema version. Expected ${SCHEMA_VERSION}, got ${payload.schemaVersion}.`);
    }

    if (!payload.data || !Array.isArray(payload.data.expenses) || !Array.isArray(payload.data.expenseCategories)) {
      throw new Error('Backup data is malformed or missing required arrays.');
    }

    // Upsert safely using Dexie transactions
    await db.transaction('rw', db.expenses, db.expenseCategories, db.expenseSettings, async () => {
      // Clear existing first or upsert? The requirement says "upsert safely into Dexie",
      // but usually imports overwrite or merge. We will use bulkPut for upserting.

      if (payload.data.expenseCategories.length > 0) {
        await db.expenseCategories.bulkPut(payload.data.expenseCategories);
      }

      if (payload.data.expenseSettings.length > 0) {
        await db.expenseSettings.bulkPut(payload.data.expenseSettings);
      }

      if (payload.data.expenses.length > 0) {
        await db.expenses.bulkPut(payload.data.expenses);
      }
    });
  }
}

export const backupService = new BackupService();
