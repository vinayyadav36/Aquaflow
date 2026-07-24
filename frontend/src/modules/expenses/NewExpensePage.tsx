
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ExpenseForm } from './components/ExpenseForm';

export default function NewExpensePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-full">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center z-10">
        <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Record Expense</h2>
      </div>

      <div className="max-w-xl mx-auto pb-8">
        <ExpenseForm />
      </div>
    </div>
  );
}
