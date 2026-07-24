import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import ExpensesListPage from './modules/expenses/ExpensesListPage.tsx';
import NewExpensePage from './modules/expenses/NewExpensePage.tsx';
import ExpenseDetailPage from './modules/expenses/ExpenseDetailPage.tsx';
import { initDbSeed } from './modules/expenses/seed.ts';

// Initialize DB seed
initDbSeed().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/expenses" replace />} />
          <Route path="expenses" element={<ExpensesListPage />} />
          <Route path="expenses/new" element={<NewExpensePage />} />
          <Route path="expenses/:id" element={<ExpenseDetailPage />} />
          <Route path="parties/:id" element={<div className="p-4">Party Detail Page (Mock)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
