import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BackupSettings } from './components/BackupSettings';
import { CategoryManager } from './components/CategoryManager';
import { BudgetManager } from './components/BudgetManager';

export function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 p-4">
      <div className="flex items-center gap-3">
        <Link to="/expenses" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <CategoryManager />
      <BudgetManager />
      <BackupSettings />
    </div>
  );
}
