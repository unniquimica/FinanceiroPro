import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Settings2, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Category } from '../types';

// Helper to safely render dynamic Lucide icons
const IconView = ({ name, className }: { name: string, className?: string }) => {
  const Icon = (LucideIcons as any)[name];
  if (!Icon) return <LucideIcons.Bookmark className={className} />;
  return <Icon className={className} />;
};

const ICONS = ['Bookmark', 'Zap', 'Droplet', 'Landmark', 'Car', 'Wifi', 'HeartPulse', 'Banknote', 'Wallet', 'Home', 'ShoppingCart', 'Coffee', 'Utensils', 'Bus', 'Gamepad2', 'GraduationCap', 'Activity', 'Shield'];
const COLORS = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-amber-500', 'bg-rose-500', 'bg-slate-700'];

export function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useFinance();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'both'>('expense');
  const [color, setColor] = useState('bg-blue-500');
  const [iconName, setIconName] = useState('Bookmark');

  const incomes = categories.filter(c => c.type === 'income' || c.type === 'both');
  const expenses = categories.filter(c => c.type === 'expense' || c.type === 'both');

  const openNew = () => {
    setIsNew(true);
    setEditingCategory(null);
    setName('');
    setType('expense');
    setColor('bg-blue-500');
    setIconName('Bookmark');
  };

  const openEdit = (c: Category) => {
    setIsNew(false);
    setEditingCategory(c);
    setName(c.name);
    setType(c.type);
    setColor(c.color);
    setIconName(c.iconName);
  };

  const saveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      addCategory({ id: Math.random().toString(36).substr(2, 9), name, type, color, iconName });
    } else if (editingCategory) {
      updateCategory({ ...editingCategory, name, type, color, iconName });
    }
    setEditingCategory(null);
    setIsNew(false);
  };

  const handleDelete = () => {
    if (editingCategory) {
      deleteCategory(editingCategory.id);
      setEditingCategory(null);
      setIsNew(false);
    }
  };

  const renderCategoryGroup = (title: string, data: typeof categories) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold tracking-tight text-slate-800">{title}</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3 gap-3 sm:gap-4">
        {data.map(cat => (
          <Card key={cat.id} className="hover:border-slate-300 transition-colors cursor-pointer group">
            <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
              <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white ${cat.color} shadow-sm group-hover:scale-105 transition-transform`}>
                <IconView name={cat.iconName} className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 leading-tight break-words">{cat.name}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 capitalize">{cat.type === 'income' ? 'Receita' : cat.type === 'expense' ? 'Despesa' : 'Híbrido'}</p>
              </div>
              <Button variant="ghost" size="icon" className="md:opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8" onClick={(e) => { e.stopPropagation(); openEdit(cat); }}>
                <Settings2 className="w-4 h-4 text-slate-400" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="md:hidden">
          <h2 className="text-2xl font-bold tracking-tight">Categorias</h2>
          <p className="text-sm text-slate-500">Organize suas finanças por grupos familiares.</p>
        </div>
        <div className="hidden md:block" /> { /* Spacer for desktop */ }
        <Button className="gap-2" onClick={openNew}>
          <Plus className="w-4 h-4" />
          Nova Categoria
        </Button>
      </div>

      {renderCategoryGroup('Categorias de Receita', incomes)}
      <div className="h-px bg-slate-200 my-4" />
      {renderCategoryGroup('Categorias de Despesa', expenses)}

      {(isNew || editingCategory) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-900">
                {isNew ? 'Nova Categoria' : 'Editar Categoria'}
              </h3>
              <button onClick={() => { setIsNew(false); setEditingCategory(null); }} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={saveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                  <option value="both">Ambos</option>
                </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`w-8 h-8 rounded-full ${c} ${color === c ? 'ring-2 ring-offset-2 ring-slate-900 border border-white' : 'border border-transparent'}`}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ícone</label>
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1">
                  {ICONS.map(i => (
                    <button
                      key={i}
                      type="button"
                      className={`p-2 rounded-md flex items-center justify-center transition-colors ${iconName === i ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}
                      onClick={() => setIconName(i)}
                      title={i}
                    >
                      <IconView name={i} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex justify-between gap-2">
                {!isNew && (
                  <Button type="button" variant="destructive" className="gap-2" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4"/> Excluir
                  </Button>
                )}
                <div className="flex justify-end gap-2 flex-1">
                  <Button type="button" variant="secondary" onClick={() => { setIsNew(false); setEditingCategory(null); }}>Cancelar</Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
