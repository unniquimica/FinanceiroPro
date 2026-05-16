import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function getMonthName(monthNumber: number): string {
  // monthNumber from 1 to 12
  return MONTHS[monthNumber - 1] || '';
}

export function translateStatus(status: string): string {
  switch (status) {
    case 'paid': return 'Pago';
    case 'received': return 'Recebido';
    case 'pending': return 'Pendente';
    case 'overdue': return 'Vencido';
    case 'cancelled': return 'Cancelado';
    default: return status;
  }
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback if randomUUID is not available
  return Math.random().toString(36).substring(2, 15);
}
