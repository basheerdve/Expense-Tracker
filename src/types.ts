export type Category = 'Food' | 'Transport' | 'Shopping' | 'Entertainment' | 'Health' | 'Bills' | 'Other';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'PKR' | 'INR' | 'CHF' | 'CNY' | 'AED' | 'SAR';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'pk' | 'in' | 'ar' | 'zh' | 'pt';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string;
  description: string;
}

export interface Budget {
  category: Category | 'Total';
  limit: number;
  spent: number;
}

export const CATEGORIES: Category[] = ['Food','Transport','Shopping','Entertainment','Health','Bills','Other'];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Shopping: '#ec4899',
  Entertainment: '#8b5cf6',
  Health: '#10b981',
  Bills: '#ef4444',
  Other: '#6b7280',
};
