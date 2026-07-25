import { db } from '../../lib/db';
import { expenseService } from './api/expenseService';
import { v4 as uuidv4 } from 'uuid';
import { subDays } from 'date-fns';

export async function initDbSeed() {
  try {
    const existingExpenses = await db.expenses.count();
    if (existingExpenses > 0) return; // DB already seeded

    console.log('Seeding initial data...');

    // 1. Seed a mock supplier party
    const supplierId = uuidv4();
    await db.parties.add({
      id: supplierId,
      displayName: 'Acme Wholesale Corp',
      primaryType: 'supplier',
      phone: '555-0199'
    });

    // 2. Helper to get dates relative to today
    const daysAgo = (days: number) => subDays(new Date(), days).toISOString();

    // 3. Create dummy expenses using the internal API service to ensure consistency
    await expenseService.createExpense({
      title: 'Monthly Rent',
      amount: 1200,
      category: 'rent',
      paymentMode: 'bank',
      date: daysAgo(5),
      recurringHint: 'monthly'
    });

    await expenseService.createExpense({
      title: 'Restock Packaging',
      amount: 350.50,
      category: 'supplier payment',
      paymentMode: 'upi',
      partyId: supplierId,
      date: daysAgo(2),
      note: 'Invoice #INV-2938'
    });

    await expenseService.createExpense({
      title: 'Taxi to client',
      amount: 25,
      category: 'transport',
      paymentMode: 'cash',
      date: daysAgo(0)
    });

    const voidedExp = await expenseService.createExpense({
      title: 'Software Sub (Cancelled)',
      amount: 49.99,
      category: 'subscriptions',
      paymentMode: 'card',
      date: daysAgo(10)
    });

    await expenseService.voidExpense(voidedExp.id);

    console.log('Seed complete.');
  } catch (error) {
    console.error('Failed to seed DB', error);
  }
}
