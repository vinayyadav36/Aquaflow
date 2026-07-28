import { expenseService } from './api/expenseService';
import { db } from '../../lib/db';

import { v4 as uuidv4 } from 'uuid';
import { subDays } from 'date-fns';

export async function initDbSeed() {
  try {
    const existingExpenses = await db.expenses.count();
    const existingCategories = await db.expenseCategories.count();

    if (existingCategories === 0) {
      const defaults = [
        'stock purchase', 'supplier payment', 'rent', 'utilities',
        'transport', 'salary/staff', 'packaging', 'marketing',
        'maintenance', 'subscriptions', 'food/tea', 'miscellaneous'
      ];
      const now = new Date().toISOString();
      await db.expenseCategories.bulkAdd(
        defaults.map(name => ({ id: uuidv4(), name, isSystem: true, createdAt: now }))
      );
    }

    if (existingExpenses > 0) return;

    const supplierId = uuidv4();
    await db.parties.add({
      id: supplierId,
      displayName: 'Acme Wholesale Corp',
      primaryType: 'supplier',
      phone: '555-0199'
    });

    const customerId = uuidv4();
    await db.parties.add({
      id: customerId,
      displayName: 'Green Leaf Cafe',
      primaryType: 'customer',
      phone: '555-0246'
    });

    const daysAgo = (days: number) => subDays(new Date(), days).toISOString();

    await expenseService.createExpense({
      title: 'Monthly Rent',
      amount: 12000,
      category: 'rent',
      paymentMode: 'bank',
      date: daysAgo(5),
      recurringHint: 'monthly'
    });

    await expenseService.createExpense({
      title: 'Restock Packaging',
      amount: 3500,
      category: 'supplier payment',
      paymentMode: 'upi',
      partyId: supplierId,
      date: daysAgo(2),
      note: 'Invoice #INV-2938'
    });

    await expenseService.createExpense({
      title: 'Taxi to client',
      amount: 250,
      category: 'transport',
      paymentMode: 'cash',
      date: daysAgo(0)
    });

    await expenseService.createExpense({
      title: 'Office Supplies',
      amount: 850,
      category: 'stock purchase',
      paymentMode: 'card',
      date: daysAgo(3)
    });

    await expenseService.createExpense({
      title: 'Electricity Bill',
      amount: 1500,
      category: 'utilities',
      paymentMode: 'bank',
      date: daysAgo(7),
      recurringHint: 'monthly'
    });

    await expenseService.createExpense({
      title: 'Team Lunch',
      amount: 450,
      category: 'food/tea',
      paymentMode: 'cash',
      date: daysAgo(1)
    });

    const voidedExp = await expenseService.createExpense({
      title: 'Software Sub (Cancelled)',
      amount: 499,
      category: 'subscriptions',
      paymentMode: 'card',
      date: daysAgo(10)
    });

    await expenseService.voidExpense(voidedExp.id);
  } catch (error) {
    console.error('Failed to seed DB', error);
  }
}
