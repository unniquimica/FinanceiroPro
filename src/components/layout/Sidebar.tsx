import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Receipt, Bookmark, Settings, CalendarClock, CircleDollarSign, LogOut, Calculator } from 'lucide-react';
import { cn } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Visão Mensal', path: '/anual', icon: CalendarDays },
  { name: 'Lançamentos', path: '/lancamentos', icon: Receipt },
  { name: 'Categorias', path: '/categorias', icon: Bookmark },
  { name: 'Configurações', path: '/configuracoes', icon: Settings },
];

export function Sidebar({ onOpenCalculator }: { onOpenCalculator?: () => void }) {
  const { user, logout } = useAuth();
  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 hidden md:flex flex-col h-screen fixed top-0 left-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-2.5 font-extrabold text-xl text-slate-900 tracking-tight">
          <img src="https://finance.tradecontrol.net/img/fc_logo.webp" alt="Financeiro Pró Logo" className="h-10 object-contain" />
          Financeiro Pró
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-slate-200 text-slate-900" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
        {onOpenCalculator && (
          <button 
            onClick={onOpenCalculator}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <Calculator className="w-5 h-5" />
            Calculadora
          </button>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
              {user?.username?.substring(0, 2) || 'US'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">{user?.username}</span>
              <span className="text-xs text-slate-500 capitalize">Usuário Pró</span>
            </div>
          </div>
          <button onClick={logout} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-200 rounded-md transition-colors" title="Sair">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-400">Desenvolvido por César Augusto Amorim</p>
            <p className="text-[10px] text-slate-400 font-medium">Versão 1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
