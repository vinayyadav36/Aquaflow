import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import DeskPage from './modules/desk/DeskPage.tsx';
import ExpensesListPage from './modules/expenses/ExpensesListPage.tsx';
import NewExpensePage from './modules/expenses/NewExpensePage.tsx';
import ExpenseDetailPage from './modules/expenses/ExpenseDetailPage.tsx';
import { SettingsPage } from './modules/expenses/SettingsPage.tsx';
import PartyDetailPage from './modules/expenses/PartyDetailPage.tsx';
import { initDbSeed } from './modules/expenses/seed.ts';
import { expenseService } from './modules/expenses/api/expenseService.ts';

// Initialize DB seed and defaults
initDbSeed().catch(console.error);
expenseService.initializeDefaults().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/expenses" replace />} />
          <Route path="desk" element={<DeskPage />} />
          <Route path="expenses" element={<ExpensesListPage />} />
          <Route path="expenses/settings" element={<SettingsPage />} />
          <Route path="expenses/new" element={<NewExpensePage />} />
          <Route path="expenses/:id" element={<ExpenseDetailPage />} />
          <Route path="expenses/:id/edit" element={<NewExpensePage />} />
          <Route path="parties/:id" element={<PartyDetailPage />} />
          <Route path="*" element={<Navigate to="/expenses" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
