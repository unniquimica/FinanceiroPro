import React, { createContext, useContext, useEffect, useState } from 'react';
import { Category, Launch, Parcel } from '../types';
import { defaultCategories } from '../data/mockData';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

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
  restoreData: (data: { categories?: Category[]; launches?: Launch[]; parcels?: Parcel[] }) => void;
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

  // Load from Supabase
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
        const { data, error } = await supabase
          .from('user_finance')
          .select('data')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.warn('Erro ao carregar do Supabase (pode ser que a tabela não exista):', error.message);
          }
          // Default data for new user
          setCategories(defaultCategories);
          setLaunches([]);
          setParcels([]);
        } else if (data?.data) {
          const remoteData = data.data;
          if (remoteData.categories) setCategories(remoteData.categories);
          setLaunches(remoteData.launches || []);
          setParcels(remoteData.parcels || []);
        }
      } catch (err) {
        console.error('Erro fatal ao carregar dados:', err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, [user]);

  // Save to Supabase when data changes
  useEffect(() => {
    if (isLoaded && user) {
      const saveData = async () => {
        try {
          const { error } = await supabase
            .from('user_finance')
            .upsert({ 
              user_id: user.id, 
              data: { categories, launches, parcels },
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

          if (error) {
            console.error('Erro ao salvar no Supabase:', error.message);
          }
        } catch (err) {
          console.error('Erro fatal ao salvar dados:', err);
        }
      };

      const timeoutId = setTimeout(saveData, 1000); // Debounce saves
      return () => clearTimeout(timeoutId);
    }
  }, [categories, launches, parcels, isLoaded, user]);

  const addLaunch = (launch: Launch, newParcels: Parcel[]) => {
    setLaunches(prev => [launch, ...prev]);
    setParcels(prev => [...newParcels, ...prev]);
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

  const restoreData = (data: { categories?: Category[]; launches?: Launch[]; parcels?: Parcel[] }) => {
    if (data.categories) setCategories(data.categories);
    if (data.launches) setLaunches(data.launches);
    if (data.parcels) setParcels(data.parcels);
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
        restoreData,
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
