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

export const CATEGORIES: Category[] = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Health',
  'Bills',
  'Other'
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f59e0b', // Amber
  Transport: '#3b82f6', // Blue
  Shopping: '#ec4899', // Pink
  Entertainment: '#8b5cf6', // Violet
  Health: '#10b981', // Emerald
  Bills: '#ef4444', // Red
  Other: '#6b7280', // Gray
};

export const CURRENCIES: { code: Currency; symbol: string; name: string }[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AED', symbol: 'DH', name: 'UAE Dirham' },
  { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal' },
];

export const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pk', name: 'Urdu' },
  { code: 'in', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'pt', name: 'Português' },
];
