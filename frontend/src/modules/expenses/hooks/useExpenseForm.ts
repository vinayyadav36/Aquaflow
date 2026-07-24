import { useState } from 'react';
import type { CreateExpenseInput } from '../api/dto';
import { expenseService } from '../api/expenseService';
import { useNavigate } from 'react-router-dom';

export function useExpenseForm(initialValues?: Partial<CreateExpenseInput>) {
  const navigate = useNavigate();
  const [values, setValues] = useState<CreateExpenseInput>({
    amount: 0,
    category: '',
    paymentMode: 'cash',
    title: '',
    date: new Date().toISOString().split('T')[0],
    ...initialValues
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof CreateExpenseInput, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const saveExpense = async () => {
    setIsSubmitting(true);
    setValidationErrors([]);
    try {
      const input = {
        ...values,
        title: values.title || values.category,
        date: new Date(values.date || new Date()).toISOString()
      };

      const newExpense = await expenseService.createExpense(input);
      navigate(`/expenses/${newExpense.id}`);
    } catch (err: any) {
      setValidationErrors(err.message.split(', '));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    validationErrors,
    isSubmitting,
    updateField,
    saveExpense
  };
}
