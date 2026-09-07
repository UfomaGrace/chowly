import { useState } from 'react';
import Home from './pages/Home';
import WaiterDashboard from './pages/WaiterDashboard';

function App() {
  const [role, setRole] = useState('customer');

  return (
    <div>
      {/* Role Switcher */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              CHOWLY
            </h1>

            <p className="text-xs text-gray-500">
              Digital Dining & Order Management
            </p>
          </div>

          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setRole('customer')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                role === 'customer'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Customer
            </button>

            <button
              onClick={() => setRole('waiter')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                role === 'waiter'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Waiter
            </button>
          </div>
        </div>
      </div>

      {/* Role-based screen */}
      {role === 'customer' ? (
        <Home />
      ) : (
        <WaiterDashboard />
      )}
    </div>
  );
}

export default App;