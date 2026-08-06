'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const menuItems = [
    { label: '📊 Dashboard', href: '/dashboard' },
    { label: '✈️ Roteiros', href: '/roteiros' },
    { label: '💰 Vendas', href: '/vendas' },
    { label: '👥 Clientes', href: '/clientes' },
    { label: '✅ Tarefas', href: '/tarefas' },
    { label: '💡 Sugestões', href: '/sugestoes' },
    { label: '📈 Financeiro', href: '/financeiro' },
    { label: '⚙️ Configurações', href: '/configuracoes' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          menuOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 fixed h-screen z-40 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {menuOpen && <h1 className="text-xl font-bold">🌍 Viagens</h1>}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            ☰
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="py-4 space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="px-4 py-3 flex items-center hover:bg-gray-800 transition whitespace-nowrap"
                  title={item.label}
                >
                  <span className="text-2xl">{item.label.split(' ')[0]}</span>
                  {menuOpen && (
                    <span className="ml-3 text-sm">{item.label.split(' ')[1]}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-gray-700 p-4">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition font-medium text-sm"
          >
            {menuOpen ? '🚪 Sair' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`${menuOpen ? 'ml-64' : 'ml-20'} flex-1 overflow-auto transition-all duration-300`}>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
