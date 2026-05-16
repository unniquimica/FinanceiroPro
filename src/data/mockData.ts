import { Category, Launch, Parcel } from '../types';
import { generateId } from '../utils/formatters';

// Fixed Categories
export const defaultCategories: Category[] = [
  { id: 'cat_energia', name: 'Energia Elétrica', color: 'bg-yellow-500', iconName: 'Zap', type: 'expense' },
  { id: 'cat_agua', name: 'Água e Saneamento', color: 'bg-blue-500', iconName: 'Droplet', type: 'expense' },
  { id: 'cat_impostos', name: 'Impostos (IPTU/IPVA)', color: 'bg-red-500', iconName: 'Landmark', type: 'expense' },
  { id: 'cat_veiculos', name: 'Veículos', color: 'bg-slate-700', iconName: 'Car', type: 'expense' },
  { id: 'cat_internet', name: 'Telefonia/Internet', color: 'bg-cyan-500', iconName: 'Wifi', type: 'expense' },
  { id: 'cat_saude', name: 'Saúde', color: 'bg-rose-500', iconName: 'HeartPulse', type: 'expense' },
  { id: 'cat_salario', name: 'Salários', color: 'bg-green-600', iconName: 'Banknote', type: 'expense' },
  { id: 'cat_salario_rec', name: 'Salário/Renda', color: 'bg-emerald-500', iconName: 'Wallet', type: 'income' },
  { id: 'cat_desp_nao_contab', name: 'Despesas Não Contábeis', color: 'bg-slate-400', iconName: 'Ghost', type: 'expense' },
  { id: 'cat_rec_nao_contab', name: 'Receitas Não Contábeis', color: 'bg-slate-400', iconName: 'Ghost', type: 'income' },
];

function createLaunchAndParcels(
  description: string,
  categoryId: string,
  amount: number,
  startMonth: number, // 1 a 12
  endMonth: number,   // 1 a 12
  year: number,
  paidUntilMonth: number = 0,
  overdueMonths: number[] = [],
  amountOverrides: Record<number, number> = {}
): { launch: Launch, parcels: Parcel[] } {
  const launchId = generateId();
  
  const launch: Launch = {
    id: launchId,
    description,
    categoryId,
    type: 'expense',
    amount: amount,
    installments: 12, // Forçamos 12 pro ano base na planilha fornecida
    startMonth,
    startYear: year,
  };

  const parcels: Parcel[] = [];

  for (let m = startMonth; m <= endMonth; m++) {
    let status: Parcel['status'] = 'pending';
    if (m <= paidUntilMonth) status = 'paid';
    if (overdueMonths.includes(m)) status = 'overdue';

    parcels.push({
      id: generateId(),
      launchId,
      month: m,
      year: year,
      amount: amountOverrides[m] || amount,
      status: status,
    });
  }

  return { launch, parcels };
}

// Based heavily on the image provided by the user for year 2026
const mockData2026 = [
  createLaunchAndParcels('CPFL JULIO MESQUITA', 'cat_energia', 64.43, 1, 12, 2026, 5, [], { 1: 66.48, 2: 62.31, 3: 83.32, 4: 61.43, 5: 64.43, 6: 79.54 }), // Paid until May
  createLaunchAndParcels('SAAE JULIO MESQUITA', 'cat_agua', 106.21, 1, 12, 2026, 6, [], { 1: 128.00, 2: 140.90, 3: 100.55, 4: 106.21, 5: 106.21, 6: 79.54 }),
  createLaunchAndParcels('CPFL IPANEMA VILLE', 'cat_energia', 0, 1, 12, 2026, 12, [], { 1: 0, 2: 53.13, 3: 42.05, 4: 42.47 }),
  createLaunchAndParcels('SAAE IPANEMA VILLE', 'cat_agua', 0, 1, 12, 2026, 12, [], { 1: 0, 2: 0, 3: 43.52, 4: 40.68 }),
  createLaunchAndParcels('IPTU IPANEMA VILLE', 'cat_impostos', 57.20, 1, 12, 2026, 5, [], { 1: 0, 2: 0, 3: 57.28 }),
  createLaunchAndParcels('IPTU JULIO DE MESQUITA', 'cat_impostos', 88.62, 1, 12, 2026, 5, [], { 1: 0, 2: 0, 3: 88.72 }),
  createLaunchAndParcels('TOKIO MARINE - SEGURO MOTO', 'cat_veiculos', 120.91, 1, 12, 2026, 7),
  createLaunchAndParcels('LICENCIAMENTO TITAN 160', 'cat_veiculos', 174.08, 9, 9, 2026, 0), // Apenas setembro
  createLaunchAndParcels('IPVA HB20S', 'cat_impostos', 353.75, 1, 5, 2026, 5),
  createLaunchAndParcels('LICENCIAMENTO HB20S', 'cat_veiculos', 174.08, 9, 9, 2026, 0), // Apenas setembro
  createLaunchAndParcels('NET MÃE', 'cat_internet', 207.48, 1, 12, 2026, 5, [], { 2: 216.99, 5: 216.65 }),
  createLaunchAndParcels('IPTU CASA MÃE', 'cat_impostos', 171.61, 3, 12, 2026, 5, [], { 3: 171.73 }),
  createLaunchAndParcels('PLANO DE SAÚDE MÃE', 'cat_saude', 1567.59, 1, 12, 2026, 5),
  createLaunchAndParcels('SALÁRIO CUIDADORA EDNÉIA', 'cat_salario', 3400.00, 1, 12, 2026, 5, [], { 1: 3000.00, 2: 3000.00 }),
  createLaunchAndParcels('SALÁRIO CUIDADORA ORLANETE', 'cat_salario', 1200.00, 1, 12, 2026, 5),
];

// Combine all mock data
export const initialLaunches: Launch[] = mockData2026.map(d => d.launch);

// Also add a sample income
const sampleIncomeId = generateId();
initialLaunches.push({
  id: sampleIncomeId,
  categoryId: 'cat_salario_rec',
  description: 'Salário Mensal',
  type: 'income',
  amount: 8500.00,
  installments: 12,
  startMonth: 1,
  startYear: 2026
});

export const initialParcels: Parcel[] = [];
mockData2026.forEach(d => initialParcels.push(...d.parcels));

// Generate income parcels
for (let m = 1; m <= 12; m++) {
  initialParcels.push({
    id: generateId(),
    launchId: sampleIncomeId,
    amount: 8500.00,
    month: m,
    year: 2026,
    status: m <= 5 ? 'received' : 'pending',
  });
}
