/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Wallet, 
  PieChart as PieChartIcon, 
  History, 
  Settings, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Sparkles,
  Loader2,
  Trash2,
  CircleDollarSign,
  Calendar,
  ChevronRight,
  Globe,
  LifeBuoy,
  ShieldCheck,
  ShieldX,
  CreditCard,
  LogOut,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from './components/ui/card';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './components/ui/select';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './components/ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, startOfYear, eachMonthOfInterval } from 'date-fns';
import Markdown from 'react-markdown';
import { type Expense, type Budget, type Category, CATEGORIES, CATEGORY_COLORS, CURRENCIES, LANGUAGES, type Currency, type Language } from './types';
import { cn } from './lib/utils';
import appLogo from './assets/images/app_logo_1779182924903.png';

// Mock Data
const INITIAL_EXPENSES: Expense[] = [
  { id: '1', amount: 45.50, category: 'Food', date: subDays(new Date(), 0).toISOString(), description: 'Lunch at Cafe' },
  { id: '2', amount: 120.00, category: 'Bills', date: subDays(new Date(), 1).toISOString(), description: 'Internet Bill' },
  { id: '3', amount: 35.00, category: 'Transport', date: subDays(new Date(), 2).toISOString(), description: 'Uber ride' },
  { id: '4', amount: 200.00, category: 'Shopping', date: subDays(new Date(), 3).toISOString(), description: 'New Shoes' },
  { id: '5', amount: 15.00, category: 'Entertainment', date: subDays(new Date(), 4).toISOString(), description: 'Movie Rental' },
  { id: '6', amount: 60.00, category: 'Health', date: subDays(new Date(), 5).toISOString(), description: 'Gym Supplement' },
  { id: '7', amount: 35.00, category: 'Food', date: subDays(new Date(), 6).toISOString(), description: 'Dinner Delivery' },
  { id: '8', amount: 50.00, category: 'Transport', date: subDays(new Date(), 7).toISOString(), description: 'Fuel' },
];

const INITIAL_BUDGETS: Budget[] = [
  { category: 'Food', limit: 500, spent: 80.50 },
  { category: 'Transport', limit: 200, spent: 85.00 },
  { category: 'Entertainment', limit: 150, spent: 15.00 },
  { category: 'Shopping', limit: 300, spent: 200.00 },
  { category: 'Bills', limit: 400, spent: 120.00 },
  { category: 'Health', limit: 100, spent: 60.00 },
  { category: 'Other', limit: 100, spent: 0 },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authData, setAuthData] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [balance, setBalance] = useState(12450.00);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [language, setLanguage] = useState<Language>('en');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'budget' | 'settings' | 'help'>('dashboard');
  
  // AI Insights State
  const [insight, setInsight] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form State
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'Food' as Category,
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const [moneyToAdd, setMoneyToAdd] = useState('');

  const [editingBudget, setEditingBudget] = useState<{ category: Category, limit: string }>({
    category: 'Food',
    limit: '500'
  });

  const currencySymbol = useMemo(() => CURRENCIES.find(c => c.code === currency)?.symbol || '$', [currency]);

  const monthlySpent = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return expenses
      .filter(e => isWithinInterval(new Date(e.date), { start, end }))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  
  const categoryData = useMemo(() => {
    return CATEGORIES.map(cat => ({
      name: cat,
      value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
      color: CATEGORY_COLORS[cat]
    })).filter(d => d.value > 0);
  }, [expenses]);

  const recentDaysData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayName = format(date, 'EEE');
      const amount = expenses
        .filter(e => format(new Date(e.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
        .reduce((sum, e) => sum + e.amount, 0);
      return { name: dayName, amount };
    });
  }, [expenses]);

  const monthlyGrowthData = useMemo(() => {
    const start = startOfYear(new Date());
    const interval = eachMonthOfInterval({ start, end: new Date() });
    return interval.map(date => {
      const monthLabel = format(date, 'MMM');
      const amount = expenses
        .filter(e => format(new Date(e.date), 'MMM') === monthLabel)
        .reduce((sum, e) => sum + e.amount, 0);
      return { name: monthLabel, amount };
    });
  }, [expenses]);

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description) return;
    
    const amount = parseFloat(newExpense.amount);
    const expense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      category: newExpense.category,
      date: new Date(newExpense.date).toISOString(),
      description: newExpense.description,
    };
    
    setExpenses([expense, ...expenses]);
    setBalance(prev => prev - amount);
    setIsAddModalOpen(false);
    
    // Update budget spent locally
    setBudgets(prev => prev.map(b => 
      b.category === expense.category 
        ? { ...b, spent: b.spent + amount } 
        : b
    ));

    setNewExpense({
      amount: '',
      category: 'Food',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const handleAddMoney = () => {
    const amount = parseFloat(moneyToAdd);
    if (isNaN(amount) || amount <= 0) return;
    
    setBalance(prev => prev + amount);
    setIsAddMoneyModalOpen(false);
    setMoneyToAdd('');
  };

  const handleUpdateBudget = () => {
    const limit = parseFloat(editingBudget.limit);
    if (isNaN(limit)) return;

    setBudgets(prev => prev.map(b => 
      b.category === editingBudget.category 
        ? { ...b, limit } 
        : b
    ));
    setIsBudgetModalOpen(false);
  };

  const deleteExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    setExpenses(prev => prev.filter(e => e.id !== id));
    setBudgets(prev => prev.map(b => 
      b.category === expense.category 
        ? { ...b, spent: Math.max(0, b.spent - expense.amount) } 
        : b
    ));
  };

  const generateInsights = async () => {
    setIsGenerating(true);
    setInsight(null);
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses, budgets })
      });
      const data = await response.json();
      setInsight(data.text);
    } catch (error) {
      console.error(error);
      setInsight("Failed to generate insights. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAuth = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed');
      
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8 text-center bg-slate-900 text-white">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-lg shadow-indigo-500/20">
                <img src={appLogo} alt="Expense Tracker Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Expense Tracker</h1>
              <p className="text-slate-400 text-sm mt-1">{authMode === 'login' ? 'Welcome back to your wealth portal' : 'Start your journey to financial freedom'}</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                {authMode === 'register' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</Label>
                    <Input 
                      placeholder="Alex Sterling" 
                      className="h-11 bg-slate-50 border-slate-200"
                      value={authData.name}
                      onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</Label>
                  <Input 
                    type="email" 
                    placeholder="alex@fintrack.pro" 
                    className="h-11 bg-slate-50 border-slate-200"
                    value={authData.email}
                    onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-11 bg-slate-50 border-slate-200"
                    value={authData.password}
                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg border border-rose-100 flex items-center gap-2">
                  <ShieldX className="w-4 h-4" />
                  {authError}
                </div>
              )}

              <Button 
                onClick={handleAuth}
                disabled={isAuthLoading}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 font-bold transition-all"
              >
                {isAuthLoading ? 'Processing...' : (authMode === 'login' ? 'Access Dashboard' : 'Create Account')}
              </Button>

              <div className="text-center">
                <button 
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError(null);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </button>
              </div>
            </div>
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure 256-bit AES Encryption</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-widest font-bold">
            © 2026 Expense Tracker Financial Services Inc.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar Nav */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/10">
              <img src={appLogo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Expense Tracker</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors text-left",
              activeTab === 'dashboard' ? "bg-slate-800 text-white" : "hover:bg-slate-800"
            )}
          >
            <PieChartIcon className={cn("w-5 h-5", activeTab === 'dashboard' ? "opacity-100" : "opacity-50")} />
            <span className="font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors text-left",
              activeTab === 'history' ? "bg-slate-800 text-white" : "hover:bg-slate-800"
            )}
          >
            <History className={cn("w-5 h-5", activeTab === 'history' ? "opacity-100" : "opacity-50")} />
            <span>History</span>
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={cn(
              "w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors text-left",
              activeTab === 'budget' ? "bg-slate-800 text-white" : "hover:bg-slate-800"
            )}
          >
            <Wallet className={cn("w-5 h-5", activeTab === 'budget' ? "opacity-100" : "opacity-50")} />
            <span>Budgets</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors text-left",
              activeTab === 'settings' ? "bg-slate-800 text-white" : "hover:bg-slate-800"
            )}
          >
            <Settings className={cn("w-5 h-5", activeTab === 'settings' ? "opacity-100" : "opacity-50")} />
            <span>Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={cn(
              "w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors text-left",
              activeTab === 'help' ? "bg-slate-800 text-white" : "hover:bg-slate-800"
            )}
          >
            <LifeBuoy className={cn("w-5 h-5", activeTab === 'help' ? "opacity-100" : "opacity-50")} />
            <span>Help & Support</span>
          </button>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800">
          <button
            id="sidebar-logout-btn"
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors text-left hover:bg-rose-500/10 text-rose-400 hover:text-rose-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
        <div className="p-6 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Alex Sterling"}`} alt="avatar" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">{user?.name || 'Alex Sterling'}</p>
              <p className="text-[10px] opacity-50 uppercase tracking-widest font-bold">Premium Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-2xl font-bold text-slate-800">
            {activeTab === 'dashboard' ? 'Financial Overview' : 
             activeTab === 'history' ? 'Transaction Ledger' : 
             activeTab === 'budget' ? 'Budget Status' : 
             activeTab === 'settings' ? 'App Settings' : 
             'Support Center'}
          </h1>
          <div className="flex gap-4">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={generateInsights}
                disabled={isGenerating}
                className="hidden md:flex text-indigo-600 hover:text-indigo-700 border-slate-200"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                AI Analysis
            </Button>
            
            <Dialog open={isAddMoneyModalOpen} onOpenChange={setIsAddMoneyModalOpen}>
              <DialogTrigger
                render={
                  <div
                    id="add-money-trigger"
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer"
                  />
                }
              >
                <TrendingUp className="w-4 h-4" />
                Add Money
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-xl border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">Add Balance</DialogTitle>
                  <DialogDescription>Increase your available funds.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-amount" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount ({currencySymbol})</Label>
                    <Input 
                      id="add-amount" 
                      type="number" 
                      placeholder="0.00" 
                      className="h-12 text-lg font-semibold bg-slate-50 border-slate-200 rounded-lg"
                      value={moneyToAdd}
                      onChange={(e) => setMoneyToAdd(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddMoney} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 shadow-sm rounded-lg">
                    Confirm Add
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger
                render={
                  <div
                    id="log-expense-trigger"
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer"
                  />
                }
              >
                <Plus className="w-4 h-4" />
                Log Expense
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-xl border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">New Transaction</DialogTitle>
                  <DialogDescription>Record your latest spending.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount ({currencySymbol})</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      placeholder="0.00" 
                      className="h-12 text-lg font-semibold bg-slate-50 border-slate-200 rounded-lg"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</Label>
                      <Select 
                        value={newExpense.category} 
                        onValueChange={(val: Category) => setNewExpense({ ...newExpense, category: val })}
                      >
                        <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-lg">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</Label>
                      <Input 
                        id="date" 
                        type="date"
                        className="h-12 bg-slate-50 border-slate-200 rounded-lg"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Merchant / Label</Label>
                    <Input 
                      id="description" 
                      placeholder="e.g. Starbucks" 
                      className="h-12 bg-slate-50 border-slate-200 rounded-lg"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddExpense} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 shadow-sm rounded-lg">
                    Confirm Transaction
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-3 gap-6 animate-in fade-in duration-500">
              {/* Summary Stats Strip */}
              <div className="col-span-3 grid grid-cols-4 gap-6">
                <Card id="stat-balance" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available Balance</p>
                  <p className="text-2xl font-bold text-slate-900">{currencySymbol}{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <div className="mt-2 text-xs text-emerald-600 font-semibold font-mono flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +2.4% from last month
                  </div>
                </Card>
                <Card id="stat-spending" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Spending</p>
                  <p className="text-2xl font-bold text-slate-900">{currencySymbol}{monthlySpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <div className="mt-2 text-xs text-slate-500 font-medium font-mono">
                    Budget: {currencySymbol}{budgets.reduce((sum, b) => sum + b.limit, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </Card>
                <Card id="stat-savings" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Savings Progress</p>
                  <p className="text-2xl font-bold text-slate-900">{currencySymbol}{(balance * 0.4).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '65%' }}
                        className="bg-indigo-500 h-full"
                    />
                  </div>
                </Card>
                <Card className="bg-indigo-900 p-5 rounded-xl border border-indigo-950 shadow-sm text-white relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Critical Insights</p>
                    <p className="text-2xl font-bold">Smart Analysis</p>
                    <div 
                        className="mt-2 text-xs text-indigo-200 underline cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                        onClick={generateInsights}
                    >
                        {isGenerating ? "Analyzing..." : "Review suggestions"}
                        <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                  <Sparkles className="absolute -bottom-2 -right-2 w-16 h-16 text-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              </div>

              {/* Charts & AI */}
              <div className="col-span-2 space-y-6">
                <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[450px]">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 tracking-tight">Daily Spending Trend</h3>
                    <Tabs defaultValue="week" className="w-fit">
                      <TabsList className="bg-slate-100 h-8 p-0.5 rounded-lg">
                        <TabsTrigger value="week" className="text-[10px] h-7 px-3 uppercase font-bold tracking-widest rounded-md">Week</TabsTrigger>
                        <TabsTrigger value="month" className="text-[10px] h-7 px-3 uppercase font-bold tracking-widest rounded-md">Month</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="p-6 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={recentDaysData}>
                        <defs>
                          <linearGradient id="polishArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            tickFormatter={(val) => `${currencySymbol}${val}`}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#polishArea)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <AnimatePresence>
                  {insight && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="bg-white rounded-xl border border-indigo-100 shadow-md shadow-indigo-500/5 p-6 border-l-4 border-l-indigo-500">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                AI Wealth Advisor
                            </h4>
                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full text-slate-300 hover:text-slate-500" onClick={() => setInsight(null)}>
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                        <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed font-medium">
                            <Markdown>{insight}</Markdown>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sidebar stats */}
              <div className="col-span-1 space-y-6">
                <Card className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-6 tracking-tight">Budget Allocation</h3>
                  <div className="space-y-6">
                    {budgets.slice(0, 4).map((budget) => {
                      const percent = (budget.spent / budget.limit) * 100;
                      return (
                        <div key={budget.category}>
                          <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-widest text-slate-500">
                            <span>{budget.category}</span>
                            <span className={cn(percent > 90 ? "text-rose-600" : "text-slate-400")}>
                                {currencySymbol}{budget.spent.toFixed(0)} / {currencySymbol}{budget.limit.toFixed(0)}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(percent, 100)}%` }}
                                className={cn(
                                    "h-full transition-all duration-1000",
                                    percent > 90 ? "bg-rose-500" : percent > 75 ? "bg-orange-500" : "bg-indigo-500"
                                )}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button variant="ghost" className="w-full mt-6 text-xs font-bold text-indigo-600 hover:bg-slate-50 rounded-lg group" onClick={() => setActiveTab('budget')}>
                    Manage All Budgets
                    <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>

                <Card className="bg-rose-50 p-5 rounded-xl border border-rose-100 shadow-sm border-l-4 border-l-rose-500">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse"></div>
                    <h3 className="font-bold text-rose-900 text-sm">Action Alerts</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/80 backdrop-blur p-3 rounded-lg border border-rose-100 shadow-sm">
                      <p className="text-xs font-bold text-slate-800">Budget Limit Near</p>
                      <p className="text-[10px] text-slate-500 font-medium">Shopping is at 95% today.</p>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg border border-rose-100 shadow-sm">
                      <p className="text-xs font-bold text-slate-800">Recent Transaction</p>
                      <p className="text-[10px] text-slate-500 font-medium">{currencySymbol}{expenses[0]?.amount.toFixed(2) || '0.00'} logged for {expenses[0]?.description || 'activity'} earlier.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
             <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
               <Card className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                 <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                   <div>
                     <h3 className="font-bold text-slate-800 text-lg">Detailed Transactions</h3>
                     <p className="text-xs text-slate-400 font-medium">Showing latest spending activity</p>
                   </div>
                   <div className="flex gap-2">
                     <div className="relative">
                        <Filter className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input placeholder="Search..." className="pl-8 h-8 w-48 text-[11px] bg-slate-50 border-slate-100 rounded-lg" />
                     </div>
                     <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-widest bg-white">Export</Button>
                   </div>
                 </div>
                 <div className="p-0">
                   <table className="w-full text-left">
                     <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                       <tr>
                         <th className="px-8 py-4">Merchant / Category</th>
                         <th className="px-8 py-4">Date</th>
                         <th className="px-8 py-4 text-right">Amount</th>
                         <th className="px-8 py-4 w-10"></th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 text-sm">
                       <AnimatePresence mode="popLayout">
                         {expenses.map((expense) => (
                           <motion.tr 
                             key={expense.id}
                             layout
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             exit={{ opacity: 0, x: -10 }}
                             className="hover:bg-indigo-50/30 group transition-colors"
                           >
                             <td className="px-8 py-5">
                               <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{expense.description}</div>
                               <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: CATEGORY_COLORS[expense.category] }}>{expense.category}</div>
                             </td>
                             <td className="px-8 py-5 text-slate-500 font-medium font-mono">
                               {format(new Date(expense.date), 'MMM dd, yyyy')}
                             </td>
                             <td className="px-8 py-5 text-right font-bold text-slate-900 font-mono">
                               -{currencySymbol}{expense.amount.toFixed(2)}
                             </td>
                             <td className="px-8 py-5 text-right">
                               <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteExpense(expense.id)}>
                                 <Trash2 className="w-3 h-3" />
                               </Button>
                             </td>
                           </motion.tr>
                         ))}
                       </AnimatePresence>
                     </tbody>
                   </table>
                 </div>
               </Card>
             </div>
          )}

          {activeTab === 'budget' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
               {budgets.map((budget) => {
                 const percent = (budget.spent / budget.limit) * 100;
                 return (
                   <Card key={budget.category} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
                     <div className="flex justify-between items-start mb-6">
                        <div className="bg-slate-50 w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-inner">
                           {budget.category === 'Food' ? '🍽️' : budget.category === 'Transport' ? '⛽' : budget.category === 'Bills' ? '🧾' : '📦'}
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                            onClick={() => {
                              setEditingBudget({ category: budget.category as Category, limit: budget.limit.toString() });
                              setIsBudgetModalOpen(true);
                            }}
                        >
                            <Settings className="w-4 h-4" />
                        </Button>
                     </div>
                     <h3 className="font-bold text-slate-800 text-lg mb-1 tracking-tight">{budget.category}</h3>
                     <div className="flex justify-between items-end mb-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spent</span>
                            <span className="text-xl font-bold text-slate-900 font-mono">{currencySymbol}{budget.spent.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Limit</span>
                            <span className="text-sm font-bold text-slate-500 font-mono">{currencySymbol}{budget.limit.toFixed(2)}</span>
                        </div>
                     </div>
                     <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percent, 100)}%` }}
                            className={cn(
                                "h-full transition-all duration-1000",
                                percent > 90 ? "bg-rose-500" : percent > 75 ? "bg-orange-500" : "bg-indigo-500"
                            )}
                        />
                        {percent > 100 && (
                            <div className="absolute inset-0 bg-red-500 animate-pulse mix-blend-overlay"></div>
                        )}
                     </div>
                     <div className="mt-4 flex justify-between items-center">
                        <Badge className={cn(
                            "text-[10px] font-bold uppercase tracking-tighter rounded-md",
                            percent > 100 ? "bg-rose-100 text-rose-700" : percent > 85 ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                            {percent > 100 ? "Exceeded" : percent > 85 ? "Warning" : "Safe"}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{percent.toFixed(0)}% Utilized</span>
                     </div>
                   </Card>
                 );
               })}
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-slate-900">Application Settings</h2>
                <p className="text-slate-500">Configure your personal preferences and account security.</p>
              </div>

              <div className="grid gap-6">
                <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="w-5 h-5 text-indigo-500" />
                      Localization
                    </CardTitle>
                    <CardDescription>Adjust your region and language preferences for personalized reporting.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 grid gap-8 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base Currency</Label>
                      <Select value={currency} onValueChange={(val: Currency) => setCurrency(val)}>
                        <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {CURRENCIES.map(c => (
                            <SelectItem key={c.code} value={c.code}>{c.name} ({c.symbol})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interface Language</Label>
                      <Select value={language} onValueChange={(val: Language) => setLanguage(val)}>
                        <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {LANGUAGES.map(l => (
                            <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      Privacy & Data Control
                    </CardTitle>
                    <CardDescription>We prioritize your financial privacy. Manage your local database here.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Biometric Authentication</h4>
                          <p className="text-xs text-slate-500">Require fingerprint or face ID on app launch.</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 border-none">Enabled</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                          <CircleDollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Anonymous Analytics</h4>
                          <p className="text-xs text-slate-500">Help us improve by sharing usage patterns.</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="bg-white">Configure</Button>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                       <div className="space-y-1">
                         <h4 className="font-bold text-rose-600 text-sm">Danger Zone</h4>
                         <p className="text-xs text-slate-400">Irreversibly delete all records from this device.</p>
                       </div>
                       <Button variant="outline" className="text-rose-600 border-rose-100 hover:bg-rose-50 font-bold">Wipe Local Data</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-10">
               <div className="text-center space-y-4 pt-4">
                 <h2 className="text-4xl font-bold text-slate-900 tracking-tight">How can we help you?</h2>
                 <p className="text-slate-500 text-lg max-w-2xl mx-auto">Search our knowledge base or get in touch with our financial advisors for expert guidance.</p>
               </div>

               <div className="grid md:grid-cols-3 gap-6">
                 {[
                   { title: 'Video Tutorials', icon: '📺', desc: 'Watch step-by-step guides on mastering your budget.' },
                   { title: 'Direct Support', icon: '📞', desc: 'Speak to a human advisor for complex planning.' },
                   { title: 'Community', icon: '🤝', desc: 'Join 50k+ users in our financial wisdom forum.' }
                 ].map(item => (
                   <Card key={item.title} className="p-8 bg-white border-slate-200 hover:border-indigo-200 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                     <div className="text-4xl mb-6 group-hover:scale-110 transition-transform origin-left">{item.icon}</div>
                     <h3 className="font-bold text-lg text-slate-800">{item.title}</h3>
                     <p className="text-sm text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                     <div className="mt-4 flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore <ChevronRight className="w-3 h-3" />
                     </div>
                   </Card>
                 ))}
               </div>
               
               <Card className="bg-slate-900 text-white rounded-2xl overflow-hidden p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                  <div className="space-y-4 text-center md:text-left">
                    <h3 className="font-bold text-2xl">Upgrade to Enterprise</h3>
                    <p className="text-slate-400 max-w-sm">Get access to multi-currency portfolios, offshore tax tracking, and a dedicated account manager.</p>
                    <Button className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-12 px-8 rounded-xl transition-all">Start 14-Day Free Trial</Button>
                  </div>
                  <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                    <LifeBuoy className="w-12 h-12 text-indigo-400 animate-pulse" />
                  </div>
               </Card>
            </div>
          )}
        </div>
      </main>

      {/* Floating Plus for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-14 h-14 rounded-full bg-indigo-600 shadow-xl hover:bg-indigo-700 text-white border-none"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Budget Edit Dialog */}
      <Dialog open={isBudgetModalOpen} onOpenChange={setIsBudgetModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Adjust Budget</DialogTitle>
            <DialogDescription>Modify limit for {editingBudget.category}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</Label>
              <div className="h-12 flex items-center px-4 bg-slate-100 rounded-lg font-bold text-slate-800">
                {editingBudget.category}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit" className="text-xs font-bold text-slate-400 uppercase tracking-widest">New Limit ({currencySymbol})</Label>
              <Input 
                id="limit" 
                type="number" 
                className="h-12 text-lg font-semibold bg-slate-50 border-slate-200 rounded-lg"
                value={editingBudget.limit}
                onChange={(e) => setEditingBudget({ ...editingBudget, limit: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateBudget} className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-lg">
              Confirm Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
