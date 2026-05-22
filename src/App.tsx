import { useState, useMemo } from 'react';
import { Plus, Wallet, PieChart as PieChartIcon, History, Settings, TrendingUp, TrendingDown, AlertCircle, ArrowUpRight, ArrowDownRight, Filter, Sparkles, Loader2, Trash2, CircleDollarSign, Calendar, ChevronRight, Globe, LifeBuoy, ShieldCheck, ShieldX, CreditCard, LogOut, Languages } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, AreaChart, Area } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import Markdown from 'react-markdown';
import { type Expense, type Budget, type Category, CATEGORIES, CATEGORY_COLORS, type Currency, type Language } from './types';
import { cn } from '@/lib/utils';const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
];

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
  const [insight, setInsight] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: '', category: 'Food' as Category, description: '', date: format(new Date(), 'yyyy-MM-dd') });
  const [moneyToAdd, setMoneyToAdd] = useState('');
  const [editingBudget, setEditingBudget] = useState<{ category: Category, limit: string }>({ category: 'Food', limit: '500' });

  const currencySymbol = useMemo(() => CURRENCIES.find(c => c.code === currency)?.symbol || '$', [currency]);
  const monthlySpent = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return expenses.filter(e => isWithinInterval(new Date(e.date), { start, end })).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);
  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const categoryData = useMemo(() => CATEGORIES.map(cat => ({ name: cat, value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0), color: CATEGORY_COLORS[cat] })).filter(d => d.value > 0), [expenses]);
  const recentDaysData = useMemo(() => Array.from({ length: 7 }).map((_, i) => { const date = subDays(new Date(), 6 - i); return { name: format(date, 'EEE'), amount: expenses.filter(e => format(new Date(e.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')).reduce((sum, e) => sum + e.amount, 0) }; }), [expenses]);

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description) return;
    const amount = parseFloat(newExpense.amount);
    const expense: Expense = { id: Math.random().toString(36).substr(2, 9), amount, category: newExpense.category, date: new Date(newExpense.date).toISOString(), description: newExpense.description };
    setExpenses([expense, ...expenses]);
    setBalance(prev => prev - amount);
    setIsAddModalOpen(false);
    setBudgets(prev => prev.map(b => b.category === expense.category ? { ...b, spent: b.spent + amount } : b));
    setNewExpense({ amount: '', category: 'Food', description: '', date: format(new Date(), 'yyyy-MM-dd') });
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
    setBudgets(prev => prev.map(b => b.category === editingBudget.category ? { ...b, limit } : b));
    setIsBudgetModalOpen(false);
  };

  const deleteExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
    setBudgets(prev => prev.map(b => b.category === expense.category ? { ...b, spent: Math.max(0, b.spent - expense.amount) } : b));
  };

  const generateInsights = async () => {
    setIsGenerating(true);
    setInsight(null);
    try {
      const response = await fetch('/api/insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expenses, budgets }) });
      const data = await response.json();
      setInsight(data.text);
    } catch (error) {
      setInsight("Failed to generate insights. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAuth = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({ name: authData.name || 'Alex Sterling', email: authData.email });
      setIsAuthenticated(true);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => { setIsAuthenticated(false); setUser(null); };if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8 text-center bg-slate-900 text-white">
              <h1 className="text-2xl font-bold">Expense Tracker</h1>
              <p className="text-slate-400 text-sm mt-1">{authMode === 'login' ? 'Welcome back' : 'Create your account'}</p>
            </div>
            <div className="p-8 space-y-4">
              {authMode === 'register' && (
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Your name" value={authData.name} onChange={(e) => setAuthData({ ...authData, name: e.target.value })} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="email@example.com" value={authData.email} onChange={(e) => setAuthData({ ...authData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" placeholder="••••••••" value={authData.password} onChange={(e) => setAuthData({ ...authData, password: e.target.value })} />
              </div>
              {authError && <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-lg">{authError}</div>}
              <Button onClick={handleAuth} disabled={isAuthLoading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {isAuthLoading ? 'Loading...' : authMode === 'login' ? 'Login' : 'Register'}
              </Button>
              <div className="text-center">
                <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(null); }} className="text-xs text-indigo-600 hover:underline">
                  {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Login"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-slate-900 text-slate-300 flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-slate-800">
          <span className="text-xl font-bold text-white">Expense Tracker</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {(['dashboard','history','budget','settings','help'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors text-left capitalize", activeTab === tab ? "bg-slate-800 text-white" : "hover:bg-slate-800")}>
              {tab === 'dashboard' ? <PieChartIcon className="w-5 h-5" /> : tab === 'history' ? <History className="w-5 h-5" /> : tab === 'budget' ? <Wallet className="w-5 h-5" /> : tab === 'settings' ? <Settings className="w-5 h-5" /> : <LifeBuoy className="w-5 h-5" />}
              <span>{tab}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full px-4 py-3 rounded-lg flex items-center gap-3 text-rose-400 hover:bg-rose-500/10">
            <LogOut className="w-5 h-5" /><span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-2xl font-bold text-slate-800 capitalize">{activeTab}</h1>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={generateInsights} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI Analysis
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsAddMoneyModalOpen(true)}>
              <TrendingUp className="w-4 h-4" /> Add Money
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4" /> Log Expense
            </Button>
          </div>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-5"><p className="text-xs text-slate-400 uppercase">Balance</p><p className="text-2xl font-bold">{currencySymbol}{balance.toLocaleString()}</p></Card>
                <Card className="p-5"><p className="text-xs text-slate-400 uppercase">Monthly Spent</p><p className="text-2xl font-bold">{currencySymbol}{monthlySpent.toFixed(2)}</p></Card>
                <Card className="p-5"><p className="text-xs text-slate-400 uppercase">Total Spent</p><p className="text-2xl font-bold">{currencySymbol}{totalSpent.toFixed(2)}</p></Card>
                <Card className="p-5 bg-indigo-900 text-white cursor-pointer" onClick={generateInsights}><p className="text-xs text-indigo-300 uppercase">AI Insights</p><p className="text-lg font-bold">{isGenerating ? 'Analyzing...' : 'Get Analysis'}</p></Card>
              </div>
              <Card className="p-6">
                <h3 className="font-bold mb-4">7-Day Spending</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={recentDaysData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={v => `${currencySymbol}${v}`} />
                    <Tooltip />
                    <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="#6366f120" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
              {insight && (
                <Card className="p-6 border-l-4 border-indigo-500">
                  <h4 className="font-bold mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-500" />AI Insights</h4>
                  <Markdown>{insight}</Markdown>
                </Card>
              )}
            </div>
          )}
          {activeTab === 'history' && (
            <Card>
              <div className="p-6 border-b"><h3 className="font-bold text-lg">Transactions</h3></div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                  <tr><th className="px-6 py-3 text-left">Description</th><th className="px-6 py-3 text-left">Category</th><th className="px-6 py-3 text-left">Date</th><th className="px-6 py-3 text-right">Amount</th><th className="px-6 py-3"></th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium">{e.description}</td>
                      <td className="px-6 py-4"><Badge variant="outline">{e.category}</Badge></td>
                      <td className="px-6 py-4 text-slate-500">{format(new Date(e.date), 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 text-right font-bold">-{currencySymbol}{e.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right"><Button variant="ghost" size="icon" onClick={() => deleteExpense(e.id)}><Trash2 className="w-4 h-4 text-rose-400" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
          {activeTab === 'budget' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map(budget => {
                const percent = (budget.spent / budget.limit) * 100;
                return (
                  <Card key={budget.category} className="p-6">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-bold">{budget.category}</h3>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingBudget({ category: budget.category as Category, limit: budget.limit.toString() }); setIsBudgetModalOpen(true); }}><Settings className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{currencySymbol}{budget.spent.toFixed(0)} spent</span>
                      <span className="text-slate-400">{currencySymbol}{budget.limit.toFixed(0)} limit</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={cn("h-full transition-all", percent > 90 ? "bg-rose-500" : percent > 75 ? "bg-orange-500" : "bg-indigo-500")} style={{ width: `${Math.min(percent, 100)}%` }} />
                    </div>
                    <Badge className={cn("mt-3 text-xs", percent > 100 ? "bg-rose-100 text-rose-700" : percent > 85 ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700")}>
                      {percent > 100 ? "Exceeded" : percent > 85 ? "Warning" : "Safe"} — {percent.toFixed(0)}%
                    </Badge>
                  </Card>
                );
              })}
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <Card className="p-6">
                <h3 className="font-bold mb-4">Currency</h3>
                <Select value={currency} onValueChange={(val: Currency) => setCurrency(val)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name} ({c.symbol})</SelectItem>)}</SelectContent>
                </Select>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold mb-4">Account</h3>
                <p className="text-sm text-slate-500 mb-4">Logged in as: {user?.email}</p>
                <Button variant="outline" className="text-rose-600 border-rose-200" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Logout</Button>
              </Card>
            </div>
          )}
          {activeTab === 'help' && (
            <div className="max-w-2xl space-y-6">
              {[{ title: 'Video Tutorials', icon: '📺', desc: 'Watch guides on budgeting.' }, { title: 'Support', icon: '📞', desc: 'Contact our team.' }, { title: 'Community', icon: '🤝', desc: 'Join 50k+ users.' }].map(item => (
                <Card key={item.title} className="p-6 flex items-center gap-4 hover:border-indigo-200 cursor-pointer">
                  <span className="text-3xl">{item.icon}</span>
                  <div><h3 className="font-bold">{item.title}</h3><p className="text-sm text-slate-400">{item.desc}</p></div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Amount</Label><Input type="number" placeholder="0.00" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} /></div>
            <div className="space-y-2"><Label>Category</Label>
              <Select value={newExpense.category} onValueChange={(val: Category) => setNewExpense({ ...newExpense, category: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Date</Label><Input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Input placeholder="e.g. Starbucks" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={handleAddExpense} className="w-full bg-indigo-600">Add Expense</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isAddMoneyModalOpen} onOpenChange={setIsAddMoneyModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Money</DialogTitle></DialogHeader>
          <div className="py-4"><Label>Amount</Label><Input type="number" placeholder="0.00" value={moneyToAdd} onChange={(e) => setMoneyToAdd(e.target.value)} /></div>
          <DialogFooter><Button onClick={handleAddMoney} className="w-full bg-emerald-600">Confirm</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isBudgetModalOpen} onOpenChange={setIsBudgetModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Budget — {editingBudget.category}</DialogTitle></DialogHeader>
          <div className="py-4"><Label>New Limit ({currencySymbol})</Label><Input type="number" value={editingBudget.limit} onChange={(e) => setEditingBudget({ ...editingBudget, limit: e.target.value })} /></div>
          <DialogFooter><Button onClick={handleUpdateBudget} className="w-full">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
