import { Outlet, Link, useLocation } from 'react-router-dom';
import { Wallet, Users, LayoutDashboard } from 'lucide-react';

function App() {
  const location = useLocation();

  const navItems = [
    { name: 'Desk', path: '/desk', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: Wallet },
    { name: 'Parties', path: '/parties/1', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-3xl mx-auto bg-white shadow-sm border-x border-gray-200">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">SALTEDHASH OS</h1>
      </header>

      <main className="flex-1 overflow-y-auto bg-gray-50 pb-20 relative">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full max-w-3xl bg-white border-t border-gray-200 flex justify-around px-2 py-3 z-10">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path.split('/')[1] ? `/${item.path.split('/')[1]}` : 'notfound');
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full px-2 py-1 rounded-lg transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  );
}

export default App;
