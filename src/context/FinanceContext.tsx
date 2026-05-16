import React, { createContext, useContext, useEffect, useState } from 'react';
import { Category, Launch, Parcel } from '../types';
import { defaultCategories } from '../data/mockData';
import { useAuth } from './AuthContext';
import { safeFetch } from '../lib/api';

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);

  // Load from API
  useEffect(() => {
    if (!user) {
      setCategories(defaultCategories);
      setLaunches([]);
      setParcels([]);
      setIsLoaded(true); // Treat as loaded but empty when no user
      return;
    }
    
    setIsLoaded(false);
    const token = localStorage.getItem('token');
    
    const loadData = async () => {
      const { data, error } = await safeFetch('/api/data', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!error && data) {
        if (data.categories) setCategories(data.categories);
        setLaunches(data.launches || []);
        setParcels(data.parcels || []);
      } else {
        // If error or no data, use defaults for new user
        setCategories(defaultCategories);
        setLaunches([]);
        setParcels([]);
        if (error) console.error('Erro ao carregar dados:', error);
      }
      setIsLoaded(true);
    };

    loadData();
  }, [user]);

  // Save to API when data changes
  useEffect(() => {
    if (isLoaded && user) {
      const token = localStorage.getItem('token');
      safeFetch('/api/data', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: JSON.stringify({ categories, launches, parcels })
      }).catch(err => console.error('Erro ao salvar dados:', err));
    }
  }, [categories, launches, parcels, isLoaded, user]);

  const addLaunch = (launch: Launch, newParcels: Parcel[]) => {
    setLaunches(prev => [...prev, launch]);
    setParcels(prev => [...prev, ...newParcels]);
  };

  const updateLaunch = (launch: Launch) => {
    setLaunches(prev => prev.map(l => (l.id === launch.id ? launch : l)));
  };

  const deleteLaunch = (launchId: string) => {
    setLaunches(prev => prev.filter(l => l.id !== launchId));
    setParcels(prev => prev.filter(p => p.launchId !== launchId));
  };

  const updateParcel = (parcel: Parcel) => {
    setParcels(prev => prev.map(p => (p.id === parcel.id ? parcel : p)));
  };

  const deleteParcel = (parcelId: string) => {
    setParcels(prev => {
      const updated = prev.filter(p => p.id !== parcelId);
      // Optional: If a launch has no more parcels, we could remove the launch,
      // but keeping it is fine as it acts as a template.
      return updated;
    });
  };

  const addCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
  };

  const updateCategory = (category: Category) => {
    setCategories(prev => prev.map(c => (c.id === category.id ? category : c)));
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
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
