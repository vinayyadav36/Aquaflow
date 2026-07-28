import { describe, it, expect, beforeEach } from 'vitest';
import { expenseService } from '../../src/modules/expenses/api/expenseService';
import { db } from '../../src/lib/db';

describe('Void Domain Rules', () => {
  beforeEach(async () => {
    await db.expenses.clear();
    await db.expenseSettings.clear();
  });

  it('rejects updates to a voided expense unless explicitly un-voiding', async () => {
    // Arrange
    const expense = await expenseService.createExpense({
      amount: 100,
      category: 'transport',
      paymentMode: 'cash'
    });
    await expenseService.voidExpense(expense.id);

    // Act & Assert
    await expect(
      expenseService.updateExpense(expense.id, { amount: 200 })
    ).rejects.toThrow('Cannot edit a voided record without explicitly un-voiding it first');
  });

  it('allows un-voiding an expense', async () => {
    // Arrange
    const expense = await expenseService.createExpense({
      amount: 100,
      category: 'transport',
      paymentMode: 'cash'
    });
    await expenseService.voidExpense(expense.id);

    // Act
    const unvoided = await expenseService.updateExpense(expense.id, { status: 'recorded' });

    // Assert
    expect(unvoided.status).toBe('recorded');
  });
});
