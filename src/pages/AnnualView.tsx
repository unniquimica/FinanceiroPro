import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency, getMonthName, translateStatus } from '../utils/formatters';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Launch, Parcel } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function AnnualView() {
  const { selectedYear, setSelectedYear, launches, parcels, categories, updateParcel } = useFinance();
  const [editingParcel, setEditingParcel] = useState<Parcel | null>(null);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number>(new Date().getMonth() + 1);

  // Group rapid launches helper
  const consolidateLaunches = (launchesList: Launch[], type: 'income' | 'expense'): Launch[] => {
    const isRapid = (l: Launch) => l.description.trim().toLowerCase() === 'lançamento rápido';
    const regularLaunches = launchesList.filter(l => !isRapid(l));
    const rapidLaunches = launchesList.filter(l => isRapid(l));

    if (rapidLaunches.length > 0) {
      const virtualRapidLaunch: Launch = {
        id: `rapid-${type}`,
        description: 'Lançamentos Rápidos',
        categoryId: rapidLaunches[0].categoryId,
        type,
        amount: rapidLaunches.reduce((sum, l) => sum + l.amount, 0),
        installments: 1,
        startMonth: 1,
        startYear: selectedYear,
        notes: 'Soma de todos os lançamentos rápidos'
      };
      return [...regularLaunches, virtualRapidLaunch];
    }

    return regularLaunches;
  };

  // Filter and then consolidate launches for the active selected month
  const rawIncomes = launches.filter(l => 
    l.type === 'income' && 
    l.startYear <= selectedYear && 
    parcels.some(p => p.launchId === l.id && p.year === selectedYear && p.month === selectedMonthFilter)
  );

  const rawExpenses = launches.filter(l => 
    l.type === 'expense' && 
    l.startYear <= selectedYear && 
    parcels.some(p => p.launchId === l.id && p.year === selectedYear && p.month === selectedMonthFilter)
  );

  const incomes = consolidateLaunches(rawIncomes, 'income');
  const expenses = consolidateLaunches(rawExpenses, 'expense');

  const getParcelForMonth = (launchId: string, month: number) => {
    if (launchId.startsWith('rapid-')) {
      const type = launchId.endsWith('income') ? 'income' : 'expense';
      const rapidIds = launches
        .filter(l => l.description.trim().toLowerCase() === 'lançamento rápido' && l.type === type)
        .map(l => l.id);

      const matchingParcels = parcels.filter(p => 
        rapidIds.includes(p.launchId) && 
        p.month === month && 
        p.year === selectedYear
      );

      if (matchingParcels.length === 0) return undefined;

      const totalAmount = matchingParcels.reduce((sum, p) => sum + p.amount, 0);

      // Determine synthesized status of the group
      // Priority: overdue > pending > paid / received
      const statuses = matchingParcels.map(p => p.status);
      let consolidatedStatus: Parcel['status'] = 'paid';
      if (statuses.includes('overdue')) {
        consolidatedStatus = 'overdue';
      } else if (statuses.includes('pending')) {
        consolidatedStatus = 'pending';
      } else if (statuses.every(s => s === 'cancelled')) {
        consolidatedStatus = 'cancelled';
      }

      return {
        id: `rapid-parcel-${type}-${month}`,
        launchId,
        amount: totalAmount,
        month,
        year: selectedYear,
        status: consolidatedStatus,
        notes: ''
      } as Parcel;
    }

    return parcels.find(p => p.launchId === launchId && p.month === month && p.year === selectedYear);
  };

  const calculateRowTotal = (launchId: string) => {
    if (launchId.startsWith('rapid-')) {
      const type = launchId.endsWith('income') ? 'income' : 'expense';
      const rapidIds = launches
        .filter(l => l.description.trim().toLowerCase() === 'lançamento rápido' && l.type === type)
        .map(l => l.id);
      return parcels
        .filter(p => rapidIds.includes(p.launchId) && p.year === selectedYear && p.status !== 'cancelled')
        .reduce((sum, p) => sum + p.amount, 0);
    }

    return parcels
      .filter(p => p.launchId === launchId && p.year === selectedYear && p.status !== 'cancelled')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const calculateColumnTotal = (month: number, type: 'income' | 'expense') => {
    // Collect raw launch IDs of this type and filter out Non-accounting categories
    const relevantRawLaunches = type === 'income' ? rawIncomes : rawExpenses;
    const launchIds = relevantRawLaunches
      .filter(l => {
        const cat = categories.find(c => c.id === l.categoryId);
        const isNonAccounting = cat && (cat.name === 'Despesas Não Contábeis' || cat.name === 'Receitas Não Contábeis');
        return !isNonAccounting;
      })
      .map(l => l.id);
    return parcels
      .filter(p => launchIds.includes(p.launchId) && p.month === month && p.year === selectedYear && p.status !== 'cancelled')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const handleCellClick = (parcel: Parcel | undefined) => {
    if (parcel) {
      if (parcel.id.startsWith('rapid-')) {
        // Disallow editing consolidated rapid parcel row cells in monthly view
        return;
      }
      setEditingParcel(parcel);
    }
  };

  const handleSaveParcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingParcel) {
      updateParcel(editingParcel);
      setEditingParcel(null);
    }
  };

  const cycleStatus = (status: Parcel['status']): Parcel['status'] => {
    const statuses: Parcel['status'][] = ['pending', 'paid', 'overdue', 'cancelled'];
    if (status === 'received') return 'pending';
    const nextIdx = (statuses.indexOf(status) + 1) % statuses.length;
    return statuses[nextIdx];
  };

  const renderTable = (data: Launch[], type: 'income' | 'expense') => {
    const isIncome = type === 'income';
    const monthsToRender = [selectedMonthFilter];

    return (
      <div className="rounded-xl border border-amber-200/60 shadow-sm bg-white mb-8 w-full overflow-hidden">
        <table className="w-full text-xs text-left min-w-full" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-[#FBBF24] text-[#78350F]">
            <tr>
              <th className="py-3 pl-4 font-bold uppercase text-xs tracking-wider" style={{ width: '60%' }}>
                {isIncome ? 'Receitas' : 'Despesas'}
              </th>
              {monthsToRender.map(m => (
                <th key={m} className="py-3 font-bold text-center border-l border-[#F59E0B] text-[11px] uppercase tracking-wider" style={{ width: '40%' }}>
                  {getMonthName(m).toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100">
            {data.map((launch, idx) => {
              const isRapid = launch.id.startsWith('rapid-');
              return (
                <tr key={launch.id} className={idx % 2 === 0 ? 'bg-amber-50/20 hover:bg-amber-100/30 transition-colors' : 'bg-amber-100/10 hover:bg-amber-100/30 transition-colors'}>
                  <td className={`py-3 pl-4 font-semibold text-slate-800 ${idx % 2 === 0 ? 'bg-amber-50/10' : 'bg-amber-100/5'} truncate text-xs`} title={launch.description}>
                    {launch.description}
                  </td>
                  {monthsToRender.map(m => {
                    const parcel = getParcelForMonth(launch.id, m);
                    const isActive = !!parcel;
                    
                    let bgClass = '';
                    let textClass = 'text-slate-800 font-semibold';

                    if (isActive) {
                      if (parcel.status === 'paid' || parcel.status === 'received') {
                        bgClass = 'bg-[#00B050]'; // Excel green
                        textClass = 'text-white font-bold';
                      } else if (parcel.status === 'overdue') {
                        bgClass = 'bg-[#EF4444]'; // Excel red
                        textClass = 'text-white font-bold';
                      } else if (parcel.status === 'pending') {
                        bgClass = 'bg-[#FFFF00]'; // Vibrant pure yellow
                        textClass = 'text-slate-900 font-extrabold shadow-[inset_0_0_0_1px_rgba(234,179,8,0.3)]';
                      } else if (parcel.status === 'cancelled') {
                        bgClass = 'bg-slate-200';
                        textClass = 'text-slate-400 line-through';
                      }
                    } else {
                      bgClass = 'bg-white';
                    }

                    return (
                      <td 
                        key={m} 
                        className={`px-1 py-3 text-center border-l border-amber-100 transition-colors ${
                          isRapid ? 'cursor-default' : 'cursor-pointer hover:brightness-110'
                        } ${bgClass} ${textClass} text-xs truncate`}
                        onClick={() => handleCellClick(parcel)}
                      >
                        {isActive && parcel.amount > 0 ? formatCurrency(parcel.amount) : isActive ? 'R$ 0,00' : ''}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-[#FBBF24] font-extrabold text-[#78350F] border-t border-amber-400">
              <td className="py-2.5 pl-4 bg-[#FBBF24] font-extrabold">TOTAL</td>
              {monthsToRender.map(m => (
                <td key={m} className="px-1 py-2.5 text-center border-l border-amber-400 text-xs font-black bg-[#FBBF24] truncate">
                  {formatCurrency(calculateColumnTotal(m, type))}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5">
        {/* Header Block with responsive instructions */}
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Visão Mensal</h2>
            <p className="text-sm text-slate-500">Clique em qualquer célula colorida para editar o valor ou status.</p>
          </div>

          {/* Month and Year slide selectors that occupy full width with arrows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* MONTH FILTER (Full width, no dropdown list, arrow click scrolling) */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 w-full">
              <button
                type="button"
                onClick={() => setSelectedMonthFilter(prev => prev === 1 ? 12 : prev - 1)}
                className="p-3 rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900 transition-all shadow-sm border border-slate-100 flex items-center justify-center bg-white"
                title="Mês Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">MÊS SELECIONADO</span>
                <span className="font-extrabold text-[#1E3A8A] text-sm tracking-wider select-none uppercase">
                  {getMonthName(selectedMonthFilter).toUpperCase()}
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => setSelectedMonthFilter(prev => prev === 12 ? 1 : prev + 1)}
                className="p-3 rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900 transition-all shadow-sm border border-slate-100 flex items-center justify-center bg-white"
                title="Próximo Mês"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* YEAR FILTER (Full width, no dropdown list, arrow click scrolling) */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 w-full">
              <button
                type="button"
                onClick={() => setSelectedYear(selectedYear - 1)}
                disabled={selectedYear <= 2025}
                className="p-3 rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm border border-slate-100 flex items-center justify-center bg-white"
                title="Ano Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">ANO SELECIONADO</span>
                <span className="font-extrabold text-[#1E3A8A] text-sm tracking-wider select-none">
                  {selectedYear}
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => setSelectedYear(selectedYear + 1)}
                disabled={selectedYear >= 2075}
                className="p-3 rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm border border-slate-100 flex items-center justify-center bg-white"
                title="Próximo Ano"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {renderTable(incomes, 'income')}
      {renderTable(expenses, 'expense')}

      {/* Modal Quick Edit */}
      {editingParcel && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">
                Editar {getMonthName(editingParcel.month)}/{editingParcel.year}
              </h3>
              <button onClick={() => setEditingParcel(null)} className="text-slate-400 hover:text-slate-600 font-bold p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveParcel} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingParcel.amount}
                  onChange={e => setEditingParcel({ ...editingParcel, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                <div className="flex gap-3 items-center">
                  <Badge variant={
                    editingParcel.status === 'paid' || editingParcel.status === 'received' ? 'success' :
                    editingParcel.status === 'overdue' ? 'destructive' : 'default'
                  }>
                    {translateStatus(editingParcel.status).toUpperCase()}
                  </Badge>
                  <button 
                    type="button" 
                    onClick={() => setEditingParcel({ ...editingParcel, status: cycleStatus(editingParcel.status) })}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 underline uppercase tracking-wider"
                  >
                    Mudar Status
                  </button>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setEditingParcel(null)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
