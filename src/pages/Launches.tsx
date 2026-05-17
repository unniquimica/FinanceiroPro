import React, { useState, useEffect } from 'react';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency, getMonthName, translateStatus } from '../utils/formatters';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Plus, Search, Filter, MoreHorizontal, CheckCircle2, XCircle, AlertCircle, Clock, Edit2, Trash2 } from 'lucide-react';
import { Parcel, ParcelStatus, Launch, TransactionType } from '../types';

export function Launches() {
  const { parcels, launches, categories, selectedYear, updateParcel, addLaunch, updateLaunch, deleteLaunch, deleteParcel } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [search, setSearch] = useState('');
  
  // New Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMinVal, setFilterMinVal] = useState<string>('');
  const [filterMaxVal, setFilterMaxVal] = useState<string>('');

  // Form State
  const [isNew, setIsNew] = useState(false);
  const [editingParcel, setEditingParcel] = useState<{ parcel: Parcel, launch: Launch } | null>(null);
  const [desc, setDesc] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [startMonth, setStartMonth] = useState(new Date().getMonth() + 1);
  const [installments, setInstallments] = useState('1');
  const [editStatus, setEditStatus] = useState<ParcelStatus>('pending');
  const [deleteConfirm, setDeleteConfirm] = useState<Parcel | null>(null);

  useEffect(() => {
    if (isNew) {
      const validCategories = categories.filter(c => c.type === 'both' || c.type === type);
      if (validCategories.length > 0 && !validCategories.some(c => c.id === categoryId)) {
        setCategoryId(validCategories[0].id);
      }
    }
  }, [type, categories, isNew, categoryId]);

  // Get parcels for selected month/year or entire year if 0
  const monthParcels = parcels.filter(p => p.year === selectedYear && (selectedMonth === 0 || p.month === selectedMonth));

  // Enrich with launch and category details
  const enrichedParcels = monthParcels.map(p => {
    const launch = launches.find(l => l.id === p.launchId);
    const category = categories.find(c => c.id === launch?.categoryId);
    return { ...p, launch, category };
  }).filter(ep => {
    if (!ep.launch) return false;
    if (search && !ep.launch.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'all' && ep.launch.type !== filterType) return false;
    if (filterStatus !== 'all' && ep.status !== filterStatus) return false;
    if (filterMinVal && ep.amount < parseFloat(filterMinVal)) return false;
    if (filterMaxVal && ep.amount > parseFloat(filterMaxVal)) return false;
    return true;
  });

  const getStatusIcon = (status: ParcelStatus) => {
    switch (status) {
      case 'paid':
      case 'received':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-slate-400" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const saveLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !categoryId || !amount) return;

    const launchId = Math.random().toString(36).substr(2, 9);
    const numAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    const numInstallments = parseInt(installments) || 1;

    const newLaunch: Launch = {
      id: launchId,
      description: desc,
      categoryId,
      type,
      amount: numAmount,
      installments: numInstallments,
      startMonth,
      startYear: selectedYear
    };

    const newParcels: Parcel[] = [];
    let currentMonth = startMonth;
    let currentYear = selectedYear;

    for (let i = 0; i < numInstallments; i++) {
      newParcels.push({
        id: Math.random().toString(36).substr(2, 9),
        launchId,
        amount: numAmount,
        month: currentMonth,
        year: currentYear,
        status: type === 'income' ? 'pending' : 'pending' // default pending
      });
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    addLaunch(newLaunch, newParcels);
    setIsNew(false);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="sticky top-16 md:top-16 z-20 bg-slate-50 pt-2 pb-4 border-b border-transparent">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 md:mb-0">
          <h2 className="text-2xl font-bold tracking-tight md:hidden">Lançamentos</h2>
          <div className="hidden md:block" /> {/* Spacer for desktop */}
          <Button className="gap-2" onClick={() => {
            setDesc('');
            setAmount('');
            setInstallments('1');
            setType('expense');
            setCategoryId(categories[0]?.id || '');
            setStartMonth(selectedMonth || new Date().getMonth() + 1);
            setIsNew(true);
          }}>
            <Plus className="w-4 h-4" />
            Novo Lançamento
          </Button>
        </div>

        <Card className="shadow-lg border-slate-200">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-white rounded-t-xl">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar lançamento..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white cursor-pointer"
              >
                <option value="0">Todos os meses</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                ))}
              </select>
              <Button 
                variant={showFilters ? "default" : "outline"} 
                size="icon" 
                className="shrink-0" 
                onClick={() => {
                  if (showFilters) {
                    setFilterType('all');
                    setFilterStatus('all');
                    setFilterMinVal('');
                    setFilterMaxVal('');
                  }
                  setShowFilters(!showFilters);
                }}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="p-4 border-b border-slate-100 bg-slate-50 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Tipo</label>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white">
                  <option value="all">Todos</option>
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Status</label>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white">
                  <option value="all">Todos</option>
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="received">Recebido</option>
                  <option value="overdue">Vencido</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Valor Mínimo (R$)</label>
                <input type="number" value={filterMinVal} onChange={e => setFilterMinVal(e.target.value)} placeholder="Ex: 100" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Valor Máximo (R$)</label>
                <input type="number" value={filterMaxVal} onChange={e => setFilterMaxVal(e.target.value)} placeholder="Ex: 5000" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white" />
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto scrollbar-hide">
          <p className="md:hidden text-[10px] text-blue-600 font-medium px-6 py-2 bg-slate-50 border-b border-slate-100">Arraste para o lado para ver mais informações →</p>
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 font-medium">Categoria</th>
                <th className="px-6 py-3 font-medium">Mês</th>
                <th className="px-6 py-3 font-medium">Tipo</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Valor</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrichedParcels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Nenhum lançamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                enrichedParcels.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.launch?.description}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.category && (
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium text-white min-w-[120px] shadow-sm ${item.category.color}`}>
                          {item.category.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 font-medium">
                        {getMonthName(item.month).substring(0, 3)}/{item.year}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={item.launch?.type === 'income' ? 'text-emerald-600 font-medium' : 'text-slate-600'}>
                        {item.launch?.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className="capitalize font-medium">{translateStatus(item.status)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      <span className={item.status === 'cancelled' ? 'line-through text-slate-400' : ''}>
                        {formatCurrency(item.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setDesc(item.launch!.description);
                        setAmount(item.amount.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."));
                        setType(item.launch!.type);
                        setCategoryId(item.launch!.categoryId);
                        setEditStatus(item.status);
                        setEditingParcel({ parcel: item, launch: item.launch! });
                      }}>
                        <Edit2 className="w-4 h-4 text-slate-500 hover:text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setDeleteConfirm(item);
                      }}>
                        <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editingParcel && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-900">Editar Parcela / Lançamento</h3>
              <button onClick={() => setEditingParcel(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              if (!desc || !categoryId || !amount) return;

              const numAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
              // Update Parcel
              updateParcel({ ...editingParcel.parcel, amount: numAmount, status: editStatus });
              // Update Launch (this updates it globally for all future parcel views)
              updateLaunch({ ...editingParcel.launch, description: desc, type, categoryId });
              
              setEditingParcel(null);
            }} className="p-6 space-y-4">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                  <input required type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                    {categories.filter(c => c.type === 'both' || c.type === type).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select value={type} onChange={e => setType(e.target.value as TransactionType)} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                      <option value="expense">Despesa</option>
                      <option value="income">Receita</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select value={editStatus} onChange={e => setEditStatus(e.target.value as ParcelStatus)} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                      <option value="pending">Pendente</option>
                      <option value="paid">Pago</option>
                      <option value="received">Recebido</option>
                      <option value="overdue">Vencido</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor desta parcela (R$)</label>
                  <input required type="text" value={amount} onChange={e => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (!value) return setAmount("");
                    value = (Number(value) / 100).toFixed(2);
                    value = value.replace(".", ",").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
                    setAmount(value);
                  }} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setEditingParcel(null)}>Cancelar</Button>
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isNew && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-900">Novo Lançamento</h3>
              <button onClick={() => setIsNew(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={saveLaunch} className="p-6 space-y-4">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                  <input required type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="Ex: Conta de Luz" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                    {categories.filter(c => c.type === 'both' || c.type === type).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select value={type} onChange={e => setType(e.target.value as TransactionType)} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                      <option value="expense">Despesa</option>
                      <option value="income">Receita</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor da Parcela (R$)</label>
                    <input required type="text" value={amount} onChange={e => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (!value) return setAmount("");
                      value = (Number(value) / 100).toFixed(2);
                      value = value.replace(".", ",").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
                      setAmount(value);
                    }} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Parcelas</label>
                    <input required type="number" min="1" max="120" value={installments} onChange={e => setInstallments(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mês Inicial</label>
                    <select value={startMonth} onChange={e => setStartMonth(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setIsNew(false)}>Cancelar</Button>
                <Button type="submit">Adicionar Lançamento</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Excluir Parcela?</h3>
              <p className="text-sm text-slate-500">
                Tem certeza que gostaria de excluir esta parcela? Esta ação não pode ser desfeita.
              </p>
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>Não</Button>
                <Button type="button" variant="destructive" className="flex-1" onClick={() => {
                  deleteParcel(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}>Sim, excluir</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
