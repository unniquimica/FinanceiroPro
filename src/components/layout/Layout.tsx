import React, { useState } from 'react';
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useFinance } from '../../hooks/useFinance';
import { ChevronLeft, ChevronRight, Menu, X, LayoutDashboard, CalendarDays, Receipt, Bookmark, Settings, Calculator } from 'lucide-react';
import { getMonthName } from '../../utils/formatters';
import { CalculatorModal } from '../CalculatorModal';
import { QuickLaunchModal } from '../QuickLaunchModal';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/formatters';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Visão Mensal', path: '/anual', icon: CalendarDays },
  { name: 'Lançamentos', path: '/lancamentos', icon: Receipt },
  { name: 'Categorias', path: '/categorias', icon: Bookmark },
  { name: 'Configurações', path: '/configuracoes', icon: Settings },
];

export function Layout() {
  const { selectedYear, setSelectedYear, currentMonth, setCurrentMonth } = useFinance();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hideYearSelector = location.pathname === '/categorias' || location.pathname === '/configuracoes';
  const isDashboard = location.pathname === '/';

  // Touch gesture swipe handling
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);

  const minSwipeDistance = 60;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchEndY(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null || touchStartY === null || touchEndY === null) return;
    
    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY - touchEndY;
    
    // Ensure gesture is horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        const paths = ['/', '/anual', '/lancamentos', '/categorias', '/configuracoes'];
        const currentIdx = paths.indexOf(location.pathname);
        if (currentIdx !== -1) {
          if (deltaX > 0 && currentIdx < paths.length - 1) {
            navigate(paths[currentIdx + 1]);
          } else if (deltaX < 0 && currentIdx > 0) {
            navigate(paths[currentIdx - 1]);
          }
        }
      }
    }
  };
  
  const getHeaderTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/anual': return 'Visão Mensal';
      case '/lancamentos': return 'Lançamentos';
      case '/categorias': return 'Categorias';
      case '/configuracoes': return 'Configurações';
      default: return 'Controle Financeiro';
    }
  };

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isQuickLaunchOpen, setIsQuickLaunchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div 
      className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Sidebar onOpenCalculator={() => setIsCalculatorOpen(true)} />
      <CalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
      <QuickLaunchModal isOpen={isQuickLaunchOpen} onClose={() => setIsQuickLaunchOpen(false)} />
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Side Menu */}
      <div className={cn(
        "fixed top-0 left-0 bottom-0 w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5 font-extrabold text-xl text-slate-900 tracking-tight">
            <img src="https://finance.tradecontrol.net/img/fc_logo.webp" alt="Logo" className="h-8 object-contain" />
            <span>Financeiro Pró</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-slate-100 text-slate-900" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
          <button 
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsCalculatorOpen(true);
            }}
            className="flex w-full items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          >
            <Calculator className="w-5 h-5" />
            Calculadora
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <X className="w-5 h-5" />
            Sair da Conta
          </button>
        </div>
      </div>

      <div className="md:pl-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 hidden md:flex">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {getHeaderTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {isDashboard && (
              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setCurrentMonth(p => Math.max(1, p - 1))}
                  disabled={currentMonth === 1}
                  className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <span className="font-semibold text-slate-800 min-w-[120px] text-center uppercase text-sm tracking-widest">
                  {getMonthName(currentMonth)}
                </span>
                <button 
                  onClick={() => setCurrentMonth(p => Math.min(12, p + 1))}
                  disabled={currentMonth === 12}
                  className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            )}
            {!hideYearSelector && (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button 
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  disabled={selectedYear <= 2025}
                  className="p-1 rounded-md hover:bg-white active:bg-white disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-700" />
                </button>
                <span className="font-bold text-slate-800 min-w-[50px] text-center text-xs font-mono leading-none">
                  {selectedYear}
                </span>
                <button 
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  disabled={selectedYear >= 2075}
                  className="p-1 rounded-md hover:bg-white active:bg-white disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:hidden sticky top-0 z-40 w-full">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 -ml-2 rounded-md hover:bg-slate-100 text-slate-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="font-extrabold text-lg text-slate-900 flex items-center gap-2.5">
              <img src="https://finance.tradecontrol.net/img/fc_logo.webp" alt="Logo" className="h-8 object-contain" />
              <span className="text-base tracking-tight font-black">Financeiro Pró</span>
            </div>
          </div>

          <button 
            onClick={() => setIsQuickLaunchOpen(true)}
            className="p-2 -mr-1 animate-pulse"
            title="Lançamento Rápido"
          >
            <img 
              src="https://static.vecteezy.com/system/resources/thumbnails/047/247/671/small_2x/flying-space-rocket-with-spewing-fire-spaceship-launch-3d-rendering-icon-illustration-png.png" 
              alt="Quick Launch" 
              className="h-9 w-9 object-contain drop-shadow-sm active:scale-95 transition-transform"
            />
          </button>
        </header>

        {/* Mobile Sub-Header for Selectors */}
        {isDashboard && (
          <div className="bg-white border-b border-slate-200 px-4 py-3 md:hidden flex items-center justify-between sticky top-16 z-30 shadow-sm animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setCurrentMonth(p => Math.max(1, p - 1))}
                  disabled={currentMonth === 1}
                  className="p-2 rounded-lg hover:bg-white active:bg-white disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <span className="flex-1 font-bold text-slate-900 text-center uppercase text-sm tracking-widest py-1">
                  {getMonthName(currentMonth)}
                </span>
                <button 
                  onClick={() => setCurrentMonth(p => Math.min(12, p + 1))}
                  disabled={currentMonth === 12}
                  className="p-2 rounded-lg hover:bg-white active:bg-white disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </div>
              
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm w-32 shrink-0">
                <button 
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  disabled={selectedYear <= 2025}
                  className="p-2 rounded-lg hover:bg-white active:bg-white disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-700" />
                </button>
                <span className="flex-1 font-bold text-slate-900 text-center text-xs font-mono leading-none py-1">
                  {selectedYear}
                </span>
                <button 
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  disabled={selectedYear >= 2075}
                  className="p-2 rounded-lg hover:bg-white active:bg-white disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:px-8 md:py-4 w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
