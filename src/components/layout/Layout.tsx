import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useFinance } from '../../hooks/useFinance';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthName } from '../../utils/formatters';
import { CalculatorModal } from '../CalculatorModal';

export function Layout() {
  const { selectedYear, setSelectedYear, currentMonth, setCurrentMonth } = useFinance();
  const location = useLocation();
  const hideYearSelector = location.pathname === '/categorias' || location.pathname === '/configuracoes';
  const isDashboard = location.pathname === '/';
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar onOpenCalculator={() => setIsCalculatorOpen(true)} />
      <CalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 hidden md:flex">
          {isDashboard ? (
            <>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Visão Geral
              </h1>
              <div className="flex items-center gap-4">
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
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-slate-100 border-none text-sm font-medium rounded-md px-3 py-1.5 cursor-pointer focus:ring-2 focus:ring-slate-900 outline-none h-8"
                >
                  {[2024, 2025, 2026, 2027, 2028].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-slate-900">
                Controle Financeiro
              </h1>
              {!hideYearSelector && (
                <div className="flex items-center gap-4">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-slate-100 border-none text-sm font-medium rounded-md px-3 py-1.5 cursor-pointer focus:ring-2 focus:ring-slate-900 outline-none"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </header>

        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:hidden sticky top-0 z-10 w-full overflow-hidden">
          {isDashboard ? (
            <>
              <span className="text-md font-bold text-slate-900">Visão Geral</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm text-sm">
                  <button 
                    onClick={() => setCurrentMonth(p => Math.max(1, p - 1))}
                    disabled={currentMonth === 1}
                    className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="font-semibold text-slate-800 min-w-[70px] text-center uppercase text-xs tracking-widest">
                    {getMonthName(currentMonth).substring(0,3)}
                  </span>
                  <button 
                    onClick={() => setCurrentMonth(p => Math.min(12, p + 1))}
                    disabled={currentMonth === 12}
                    className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-slate-100 border-none text-xs font-medium rounded-md px-2 py-1 cursor-pointer w-16"
                >
                  {[2024, 2025, 2026, 2027, 2028].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <img src="https://finance.tradecontrol.net/img/fc_logo.webp" alt="Financeiro Pró Logo" className="h-6 object-contain" />
                <span className="hidden sm:inline">Financeiro Pró</span>
              </div>
              {!hideYearSelector && (
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-slate-100 border-none text-sm font-medium rounded-md px-2 py-1 cursor-pointer"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
              )}
            </>
          )}
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
