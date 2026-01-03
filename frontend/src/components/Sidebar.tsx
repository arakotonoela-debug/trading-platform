import React from 'react';
import { LayoutDashboard, Wallet, TrendingUp, Zap, Settings, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      href: '/dashboard',
    },
    {
      label: 'Comptes',
      icon: <Wallet size={20} />,
      href: '/accounts',
      badge: 3,
    },
    {
      label: 'Trades',
      icon: <TrendingUp size={20} />,
      href: '/trades',
    },
    {
      label: 'Stratégies',
      icon: <Zap size={20} />,
      href: '/strategies',
    },
    {
      label: 'Statistiques',
      icon: <BarChart3 size={20} />,
      href: '/statistics',
    },
    {
      label: 'Paramètres',
      icon: <Settings size={20} />,
      href: '/settings',
    },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen overflow-y-auto fixed left-0 top-16">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition ${
              isActive(item.href)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </div>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-bold text-white mb-2">Solde Total</h3>
          <p className="text-2xl font-bold text-green-400">50,000€</p>
          <p className="text-xs text-gray-400 mt-1">+12.5% ce mois</p>
        </div>
      </div>
    </aside>
  );
};
