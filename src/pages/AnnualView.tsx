import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency, getMonthName, translateStatus } from '../utils/formatters';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Launch, Parcel } from '../types';

export function AnnualView() {
  const { selectedYear, launches, parcels, updateParcel } = useFinance();
  const [editingParcel, setEditingParcel] = useState<Parcel | null>(null);

  // Filtramos os lançamentos por tipo
  const incomes = launches.filter(l => l.type === 'income' && l.startYear <= selectedYear);
  const expenses = launches.filter(l => l.type === 'expense' && l.startYear <= selectedYear);

  const getParcelForMonth = (launchId: string, month: number) => {
    return parcels.find(p => p.launchId === launchId && p.month === month && p.year === selectedYear);
  };

  const calculateRowTotal = (launchId: string) => {
    return parcels
      .filter(p => p.launchId === launchId && p.year === selectedYear && p.status !== 'cancelled')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const calculateColumnTotal = (month: number, type: 'income' | 'expense') => {
    const relevantLaunches = type === 'income' ? incomes : expenses;
    const launchIds = relevantLaunches.map(l => l.id);
    return parcels
      .filter(p => launchIds.includes(p.launchId) && p.month === month && p.year === selectedYear && p.status !== 'cancelled')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const handleCellClick = (parcel: Parcel | undefined) => {
    if (parcel) {
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
    if (status === 'received') return 'pending'; // handle income specially if needed
    const nextIdx = (statuses.indexOf(status) + 1) % statuses.length;
    return statuses[nextIdx];
  };

  const renderTable = (data: Launch[], type: 'income' | 'expense') => {
    const isIncome = type === 'income';
    
    return (
      <div className="rounded-lg border border-slate-200 shadow-sm bg-white mb-8 w-full overflow-hidden">
        <table className="w-full text-xs text-left" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-[#1E3A8A] text-white">
            <tr>
              <th className="py-2 pl-3 font-semibold uppercase whitespace-nowrap bg-[#1E3A8A] w-[20%]">
                {isIncome ? 'Receitas' : 'Despesas'}
              </th>
              {Array.from({ length: 12 }, (_, i) => (
                <th key={i} className="py-2 font-semibold text-center border-l border-[#1E40AF] w-[6%] truncate">
                  {getMonthName(i + 1).substring(0, 3).toUpperCase()}
                </th>
              ))}
              <th className="pr-3 py-2 font-semibold text-right border-l border-[#1E40AF] w-[8%]">
                FECHAMENTO
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((launch, idx) => (
              <tr key={launch.id} className={idx % 2 === 0 ? 'bg-[#EFF6FF]' : 'bg-[#DBEAFE]'}>
                <td className={`py-2 pl-3 font-medium text-slate-800 ${idx % 2 === 0 ? 'bg-[#EFF6FF]' : 'bg-[#DBEAFE]'} truncate`} title={launch.description}>
                  {launch.description}
                </td>
                {Array.from({ length: 12 }, (_, i) => {
                  const parcel = getParcelForMonth(launch.id, i + 1);
                  const isActive = !!parcel;
                  
                  // Stylings based on user's spreadsheet logic
                  let bgClass = '';
                  let textClass = 'text-slate-700';

                  if (isActive) {
                    if (parcel.status === 'paid' || parcel.status === 'received') {
                      bgClass = 'bg-[#00B050]'; // Excel green
                      textClass = 'text-white font-medium';
                    } else if (parcel.status === 'overdue') {
                      bgClass = 'bg-red-500';
                      textClass = 'text-white font-medium';
                    } else if (parcel.status === 'cancelled') {
                      bgClass = 'bg-slate-300';
                      textClass = 'text-slate-400 line-through';
                    }
                  } else {
                    bgClass = 'bg-white'; // Empty cells exactly as in spreadsheet
                  }

                  return (
                    <td 
                      key={i} 
                      className={`px-1 py-2 text-center border-l border-[#BFDBFE] cursor-pointer transition-colors hover:brightness-110 ${bgClass} ${textClass} tracking-tighter truncate`}
                      onClick={() => handleCellClick(parcel)}
                    >
                      {isActive && parcel.amount > 0 ? formatCurrency(parcel.amount) : isActive ? 'R$ 0,00' : ''}
                    </td>
                  );
                })}
                <td className="pr-3 py-2 text-right font-bold text-slate-800 bg-[#DBEAFE] border-l border-[#BFDBFE] tracking-tighter truncate">
                  {formatCurrency(calculateRowTotal(launch.id))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#93C5FD] font-bold text-slate-900 border-t border-[#60A5FA]">
              <td className="py-2 pl-3 bg-[#93C5FD]">TOTAL</td>
              {Array.from({ length: 12 }, (_, i) => (
                <td key={i} className="px-1 py-2 text-center border-l border-[#60A5FA] tracking-tighter truncate">
                  {formatCurrency(calculateColumnTotal(i + 1, type))}
                </td>
              ))}
              <td className="pr-3 py-2 text-right border-l border-[#60A5FA] tracking-tighter truncate">
                {formatCurrency(data.map(l => calculateRowTotal(l.id)).reduce((a, b) => a + b, 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Controle Financeiro {selectedYear}</h2>
        <p className="text-sm text-slate-500">Clique em qualquer célula para editar valor ou status.</p>
      </div>

      {renderTable(incomes, 'income')}
      {renderTable(expenses, 'expense')}

      {/* Modal Quick Edit */}
      {editingParcel && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-900">
                Editar {getMonthName(editingParcel.month)}/{editingParcel.year}
              </h3>
              <button onClick={() => setEditingParcel(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveParcel} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingParcel.amount}
                  onChange={e => setEditingParcel({ ...editingParcel, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <div className="flex gap-2 items-center">
                  <Badge variant={
                    editingParcel.status === 'paid' || editingParcel.status === 'received' ? 'success' :
                    editingParcel.status === 'overdue' ? 'destructive' : 'default'
                  }>
                    {translateStatus(editingParcel.status).toUpperCase()}
                  </Badge>
                  <button 
                    type="button" 
                    onClick={() => setEditingParcel({ ...editingParcel, status: cycleStatus(editingParcel.status) })}
                    className="text-xs text-blue-600 underline"
                  >
                    Mudar Status
                  </button>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setEditingParcel(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm"
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
