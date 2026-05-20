import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useFinance } from '../hooks/useFinance';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { ArrowDownIcon, ArrowUpIcon, Wallet, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

export function Dashboard() {
  const { parcels, selectedYear, categories, launches, currentMonth } = useFinance();

  // Totals for current month in selected year
  const currentMonthParcels = parcels.filter(p => p.month === currentMonth && p.year === selectedYear);
  
  let totalIncome = 0;
  let totalExpense = 0;
  let received = 0;
  let paid = 0;
  let overdue = 0;

  currentMonthParcels.forEach(p => {
    const launch = launches.find(l => l.id === p.launchId);
    if (!launch) return;

    const category = categories.find(c => c.id === launch.categoryId);
    if (category && (category.name === 'Despesas Não Contábeis' || category.name === 'Receitas Não Contábeis')) return;

    if (launch.type === 'income') {
      totalIncome += p.amount;
      if (p.status === 'received' || p.status === 'paid') received += p.amount;
    } else {
      totalExpense += p.amount;
      if (p.status === 'paid') paid += p.amount;
    }
  });

  // Calculate overdue for ALL pending bills in the selected year up to the current month or previous years.
  // Actually, let's just do: any expense parcel that is "pending" and its (year < selectedYear) OR (year == selectedYear && month < currentMonth).
  // Wait, the status is set manually to overdue manually right now, but they want it automated in the dashboard 'Em Atraso' value.
  // "Hoje tenho contas lançadas de meses antoreios, que está pendente, que deveria aparecer na dashboard como atraso"
  parcels.forEach(p => {
    const launch = launches.find(l => l.id === p.launchId);
    if (!launch || launch.type !== 'expense') return;
    
    const category = categories.find(c => c.id === launch.categoryId);
    if (category && category.name === 'Despesas Não Contábeis') return;

    const isPast = p.year < selectedYear || (p.year === selectedYear && p.month < currentMonth);
    const isCurrentMonAndOverdue = p.status === 'overdue' && p.year === selectedYear && p.month === currentMonth;

    if ((isPast && p.status === 'pending') || p.status === 'overdue' || isCurrentMonAndOverdue) {
      overdue += p.amount;
    }
  });

  const balance = totalIncome - totalExpense;

  // Chart Data preparation
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    let inc = 0;
    let exp = 0;
    parcels.filter(p => p.month === month && p.year === selectedYear).forEach(p => {
      const launch = launches.find(l => l.id === p.launchId);
      if (launch) {
        const category = categories.find(c => c.id === launch.categoryId);
        if (category && (category.name === 'Despesas Não Contábeis' || category.name === 'Receitas Não Contábeis')) return;

        if (launch.type === 'income') inc += p.amount;
        else exp += p.amount;
      }
    });

    return {
      name: getMonthName(month).substring(0, 3),
      Receitas: inc,
      Despesas: exp,
      Saldo: inc - exp,
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="overflow-hidden border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-3 md:pb-2 md:pt-6 md:px-6">
            <CardTitle className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo Realizado</CardTitle>
            <Wallet className="h-3.5 w-3.5 md:h-5 md:w-5 text-slate-500" />
          </CardHeader>
          <CardContent className="pb-3 pt-0 px-3 md:pb-6 md:pt-0 md:px-6">
            <div className={`text-sm md:text-2xl font-extrabold truncate ${(received - paid) >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
              {formatCurrency(received - paid)}
            </div>
            <p className="text-[9px] md:text-xs text-slate-500 mt-1 font-medium truncate">
              Previsto: <span className={(totalIncome - totalExpense) >= 0 ? 'text-slate-700 font-bold' : 'text-red-500 font-bold'}>
                {formatCurrency(totalIncome - totalExpense)}
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-3 md:pb-2 md:pt-6 md:px-6">
            <CardTitle className="text-[10px] md:text-xs font-semibold text-emerald-750 uppercase tracking-wider">Receitas Reais</CardTitle>
            <ArrowUpIcon className="h-3.5 w-3.5 md:h-5 md:w-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="pb-3 pt-0 px-3 md:pb-6 md:pt-0 md:px-6">
            <div className="text-sm md:text-2xl font-extrabold text-emerald-600 truncate">
              {formatCurrency(received)}
            </div>
            <p className="text-[9px] md:text-xs text-slate-500 mt-1 font-medium truncate">
              Previsto: <span className="text-emerald-600 font-bold">{formatCurrency(totalIncome)}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-3 md:pb-2 md:pt-6 md:px-6">
            <CardTitle className="text-[10px] md:text-xs font-semibold text-rose-750 uppercase tracking-wider">Despesas Realizadas</CardTitle>
            <ArrowDownIcon className="h-3.5 w-3.5 md:h-5 md:w-5 text-rose-500" />
          </CardHeader>
          <CardContent className="pb-3 pt-0 px-3 md:pb-6 md:pt-0 md:px-6">
            <div className="text-sm md:text-2xl font-extrabold text-rose-600 truncate">
              {formatCurrency(paid)}
            </div>
            <p className="text-[9px] md:text-xs text-slate-500 mt-1 font-medium truncate">
              Previsto: <span className="text-rose-600 font-bold">{formatCurrency(totalExpense)}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-3 md:pb-2 md:pt-6 md:px-6">
            <CardTitle className="text-[10px] md:text-xs font-semibold text-amber-750 uppercase tracking-wider">Em Atraso</CardTitle>
            <AlertCircle className="h-3.5 w-3.5 md:h-5 md:w-5 text-amber-500" />
          </CardHeader>
          <CardContent className="pb-3 pt-0 px-3 md:pb-6 md:pt-0 md:px-6">
            <div className="text-sm md:text-2xl font-extrabold text-amber-600 truncate">
              {formatCurrency(overdue)}
            </div>
            <p className="text-[9px] md:text-xs text-slate-500 mt-1 font-medium truncate">
              Previsto: <span className="text-amber-600 font-bold">{formatCurrency(overdue + (totalExpense - paid))}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Receitas vs Despesas ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart accessibilityLayer={false} data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Receitas" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Despesas" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-slate-200">
          <CardHeader>
            <CardTitle>Saldo Mensal (Evolução)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart accessibilityLayer={false} data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <ReferenceLine y={0} stroke="#94A3B8" />
                  <Bar dataKey="Saldo" radius={[4, 4, 4, 4]}>
                    {monthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.Saldo >= 0 ? '#10B981' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
