import { Outlet, Link, useLocation } from 'react-router-dom';
import { Wallet, Users, LayoutDashboard } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Desk', path: '/desk', icon: LayoutDashboard },
  { name: 'Expenses', path: '/expenses', icon: Wallet },
  { name: 'Parties', path: '/parties/1', icon: Users },
];

function App() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/desk') return location.pathname === '/desk';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-3xl mx-auto bg-white shadow-sm border-x border-gray-200">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight text-gray-900">SALTEDHASH OS</h1>
        <Link
          to="/expenses/new"
          className="text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 px-3 py-1.5 rounded-full transition-colors"
        >
          + New Expense
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto bg-gray-50 pb-20 relative">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full max-w-3xl bg-white/90 backdrop-blur-md border-t border-gray-200 flex justify-around px-2 py-2 z-10">
        {NAV_ITEMS.map(item => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full px-2 py-1 rounded-lg transition-colors ${
                active ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default App;
