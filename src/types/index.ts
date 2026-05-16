export type TransactionType = 'income' | 'expense';
export type ParcelStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'received';

export interface Category {
  id: string;
  name: string;
  color: string;
  iconName: string;
  type: TransactionType | 'both';
}

export interface Launch {
  id: string;
  description: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  installments: number; // 0 for recurring, >0 for fixed installments
  startMonth: number;
  startYear: number;
  notes?: string;
}

export interface Parcel {
  id: string;
  launchId: string;
  month: number;
  year: number;
  amount: number;
  status: ParcelStatus;
  notes?: string;
}

export interface AnnualSummary {
  month: number;
  income: number;
  expense: number;
  balance: number;
}
