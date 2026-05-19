import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { Button } from './ui/Button';
import { Launch, Parcel, TransactionType } from '../types';
import { getMonthName } from '../utils/formatters';

interface QuickLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickLaunchModal({ isOpen, onClose }: QuickLaunchModalProps) {
  const { categories, addLaunch } = useFinance();
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<TransactionType | ''>('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsSaving(true);

    const numAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    const finalType = type === '' ? 'expense' : type;
    const finalCategoryId = categoryId === '' 
      ? (finalType === 'expense' ? 'cat_desp_nao_contab' : 'cat_rec_nao_contab') 
      : categoryId;
    
    const launchId = Math.random().toString(36).substr(2, 9);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const newLaunch: Launch = {
      id: launchId,
      description: 'Lançamento Rápido',
      categoryId: finalCategoryId,
      type: finalType,
      amount: numAmount,
      installments: 1,
      startMonth: currentMonth,
      startYear: currentYear,
      notes
    };

    const newParcel: Parcel = {
      id: Math.random().toString(36).substr(2, 9),
      launchId,
      amount: numAmount,
      month: currentMonth,
      year: currentYear,
      status: finalType === 'income' ? 'received' : 'paid',
      notes
    };

    try {
      addLaunch(newLaunch, [newParcel]);
      setAmount('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error in quick launch:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-xl">🚀</span>
            </div>
            <h3 className="font-bold text-slate-900">Lançamento Rápido</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="space-y-4">
            {/* Valor - MANTATORY */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Valor (R$)*</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
                <input 
                  required 
                  autoFocus
                  type="text" 
                  value={amount} 
                  onChange={e => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (!value) return setAmount("");
                    value = (Number(value) / 100).toFixed(2);
                    value = value.replace(".", ",").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
                    setAmount(value);
                  }} 
                  className="w-full pl-10 pr-4 py-3 text-2xl font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tipo */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Tipo</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value as TransactionType)} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-slate-900 transition-all"
                >
                  <option value="">Selecione</option>
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>

              {/* Categoria - Optional */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Categoria</label>
                <select 
                  value={categoryId} 
                  onChange={e => setCategoryId(e.target.value)} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-slate-900 transition-all"
                >
                  <option value="">Selecione</option>
                  {categories.filter(c => type === '' || c.type === 'both' || c.type === type).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Observações</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all" 
                rows={3}
                placeholder="Ex: Almoço rápido, Uber, etc..."
              />
            </div>
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              disabled={isSaving || !amount} 
              className="w-full py-6 text-lg font-bold rounded-xl shadow-lg shadow-slate-200"
            >
              🚀 {isSaving ? 'Salvando...' : 'Salvar Lançamento Rápido'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
