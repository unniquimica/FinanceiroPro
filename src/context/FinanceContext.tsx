import React, { createContext, useContext, useEffect, useState } from 'react';
import { Category, Launch, Parcel } from '../types';
import { defaultCategories } from '../data/mockData';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface FinanceContextType {
  categories: Category[];
  launches: Launch[];
  parcels: Parcel[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  currentMonth: number;
  setCurrentMonth: React.Dispatch<React.SetStateAction<number>>;
  addLaunch: (launch: Launch, parcels: Parcel[]) => void;
  updateLaunch: (launch: Launch) => void;
  deleteLaunch: (launchId: string) => void;
  updateParcel: (parcel: Parcel) => void;
  deleteParcel: (parcelId: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);

  // Load from local API
  useEffect(() => {
    if (!user) {
      setCategories(defaultCategories);
      setLaunches([]);
      setParcels([]);
      setIsLoaded(true);
      return;
    }
    
    setIsLoaded(false);
    
    const loadData = async () => {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          if (data.categories) setCategories(data.categories);
          setLaunches(data.launches || []);
          setParcels(data.parcels || []);
        } else {
          // Default data for new user
          setCategories(defaultCategories);
          setLaunches([]);
          setParcels([]);
        }
      } catch (err) {
        console.error('Erro fatal ao carregar dados:', err);
        showToast('Erro ao carregar seus dados. Tente atualizar a página.', 'error');
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, [user, showToast]);

  // Save to local API when data changes
  useEffect(() => {
    if (isLoaded && user) {
      const saveData = async () => {
        try {
          const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categories, launches, parcels })
          });
          if (!res.ok) throw new Error('Falha ao salvar');
        } catch (err) {
          console.error('Erro fatal ao salvar dados:', err);
          showToast('Erro ao salvar alterações. Suas mudanças podem não ser persistidas.', 'error');
        }
      };

      const timeoutId = setTimeout(saveData, 1000); // Debounce saves
      return () => clearTimeout(timeoutId);
    }
  }, [categories, launches, parcels, isLoaded, user, showToast]);

  const addLaunch = (launch: Launch, newParcels: Parcel[]) => {
    setLaunches(prev => [...prev, launch]);
    setParcels(prev => [...prev, ...newParcels]);
    showToast('Lançamento adicionado com sucesso!');
  };

  const updateLaunch = (launch: Launch) => {
    setLaunches(prev => prev.map(l => (l.id === launch.id ? launch : l)));
    showToast('Lançamento atualizado!');
  };

  const deleteLaunch = (launchId: string) => {
    setLaunches(prev => prev.filter(l => l.id !== launchId));
    setParcels(prev => prev.filter(p => p.launchId !== launchId));
    showToast('Lançamento excluído.');
  };

  const updateParcel = (parcel: Parcel) => {
    setParcels(prev => prev.map(p => (p.id === parcel.id ? parcel : p)));
    showToast('Parcela atualizada!');
  };

  const deleteParcel = (parcelId: string) => {
    setParcels(prev => prev.filter(p => p.id !== parcelId));
    showToast('Parcela excluída.');
  };

  const addCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
    showToast('Categoria adicionada!');
  };

  const updateCategory = (category: Category) => {
    setCategories(prev => prev.map(c => (c.id === category.id ? category : c)));
    showToast('Categoria atualizada!');
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    showToast('Categoria excluída.');
  };

  if (!isLoaded) return <div className="flex h-screen items-center justify-center text-slate-500">Carregando dados financeiros...</div>;

  return (
    <FinanceContext.Provider
      value={{
        categories,
        launches,
        parcels,
        selectedYear,
        setSelectedYear,
        currentMonth,
        setCurrentMonth,
        addLaunch,
        updateLaunch,
        deleteLaunch,
        updateParcel,
        deleteParcel,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
