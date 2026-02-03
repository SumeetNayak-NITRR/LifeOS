"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  Plus, 
  CreditCard, 
  Banknote,
  Smartphone,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Calendar,
  Sparkles,
  History,
  Lock,
  ArrowRight,
  ArrowLeft,
  Pencil,
  Coffee,
  ShoppingBag,
  Bus,
  Activity,
  Home,
  Zap,
  GraduationCap,
  UtensilsCrossed,
  Trophy,
  HeartPulse,
  BookOpen,
  LayoutGrid,
  Users,
  Info,
  ChevronUp,
  Trash2
} from "lucide-react";
import { 
  financeStore, 
  FinanceExpense, 
  FinanceData, 
  MonthlyFinanceData, 
  subscribeToStore, 
  VariableExpenseCategory, 
  FixedExpenseCategory, 
  FixedExpense,
  SharedExpense,
  DEFAULT_MONTHLY_FINANCE
} from "@/lib/store";

const VARIABLE_CATEGORIES: VariableExpenseCategory[] = [
  'Food', 'Travel', 'Fitness', 'Study', 'Lifestyle', 'Misc'
];

const FIXED_CATEGORIES: FixedExpenseCategory[] = [
  'Room Rent', 'Hostel / Mess Fees', 'Electricity', 'Water', 'Wi-Fi / Internet', 'Mobile Recharge', 'Other recurring bills'
];

const categoryIcons: Record<string, React.ReactNode> = {
  'Food': <Coffee size={16} />,
  'Travel': <Bus size={16} />,
  'Fitness': <Activity size={16} />,
  'Study': <BookOpen size={16} />,
  'Lifestyle': <ShoppingBag size={16} />,
  'Misc': <LayoutGrid size={16} />,
  'Room Rent': <Home size={16} />,
  'Hostel / Mess Fees': <UtensilsCrossed size={16} />,
  'Electricity': <Zap size={16} />,
  'Water': <Zap size={16} />,
  'Wi-Fi / Internet': <Smartphone size={16} />,
  'Mobile Recharge': <Smartphone size={16} />,
  'Other recurring bills': <CreditCard size={16} />,
};

const categoryColors: Record<string, string> = {
  'Food': 'bg-orange-500/10 text-orange-400',
  'Travel': 'bg-blue-500/10 text-blue-400',
  'Fitness': 'bg-green-500/10 text-green-400',
  'Study': 'bg-purple-500/10 text-purple-400',
  'Lifestyle': 'bg-pink-500/10 text-pink-400',
  'Misc': 'bg-white/5 text-white/40',
};

const paymentIcons: Record<string, React.ReactNode> = {
  Cash: <Banknote size={14} />,
  UPI: <Smartphone size={14} />,
  Card: <CreditCard size={14} />,
};

export default function FinanceModule() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(new Date().toISOString().slice(0, 7));
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showFixedExpanded, setShowFixedExpanded] = useState(false);
  const [showSharedPanel, setShowSharedPanel] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<VariableExpenseCategory | null>(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const [editingIncome, setEditingIncome] = useState(false);
  const [tempBudget, setTempBudget] = useState('');
  const [tempIncome, setTempIncome] = useState('');
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showAutoSplit, setShowAutoSplit] = useState(false);
  const [autoSplitCount, setAutoSplitCount] = useState('2');
  
  const [expenseType, setExpenseType] = useState<'personal' | 'shared'>('personal');
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'Food' as VariableExpenseCategory,
    paymentType: 'UPI' as FinanceExpense['paymentType'],
    note: '',
    title: '',
    splits: [{ name: 'You', amount: 0, settled: true }] as SharedExpense['splits'],
  });

  useEffect(() => {
    setMounted(true);
    setData(financeStore.get());
    return subscribeToStore(() => setData(financeStore.get()));
  }, []);

  const monthData = useMemo(() => {
    if (!data || !data.months) return null;
    return data.months[selectedMonthKey] || null;
  }, [data, selectedMonthKey]);

  useEffect(() => {
    if (monthData) {
      setTempBudget(monthData.budget?.monthlyBudget?.toString() || '');
      setTempIncome(monthData.summary?.monthlyIncome?.toString() || '');
    }
  }, [monthData]);

  const expenses = monthData?.expenses || [];
  const fixedExpenses = monthData?.fixedExpenses || [];
  const sharedExpenses = monthData?.sharedExpenses || [];

  const balanceOwed = useMemo(() => {
    return sharedExpenses.reduce((sum, se) => {
      const youSplit = se.splits.find(s => s.name === 'You');
      if (!youSplit) return sum;
      return sum + se.splits.filter(s => s.name !== 'You' && !s.settled).reduce((acc, s) => acc + s.amount, 0);
    }, 0);
  }, [sharedExpenses]);

  const balanceOwing = useMemo(() => {
    return sharedExpenses.reduce((sum, se) => {
      const youSplit = se.splits.find(s => s.name === 'You');
      if (!youSplit || youSplit.settled) return sum;
      return sum + youSplit.amount;
    }, 0);
  }, [sharedExpenses]);

  const filteredExpenses = useMemo(() => {
    const all = [...expenses.map(e => ({ ...e, type: 'personal' })), ...sharedExpenses.map(se => ({ ...se, type: 'shared' }))];
    const sorted = all.sort((a, b) => b.date.localeCompare(a.date));
    if (!selectedCategory) return sorted;
    return sorted.filter(e => e.category === selectedCategory);
  }, [expenses, sharedExpenses, selectedCategory]);

  const groupedByDay = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredExpenses.forEach(e => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredExpenses]);

  const categoryTotals = useMemo(() => {
    return VARIABLE_CATEGORIES.reduce((acc, cat) => {
      const pTotal = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
      const sTotal = sharedExpenses.filter(e => e.category === cat).reduce((sum, e) => {
        const youSplit = e.splits.find(s => s.name === 'You');
        return sum + (youSplit ? youSplit.amount : 0);
      }, 0);
      acc[cat] = pTotal + sTotal;
      return acc;
    }, {} as Record<string, number>);
  }, [expenses, sharedExpenses]);

  if (!mounted || !data) return <div className="min-h-screen bg-[#0f0f0f]" />;

  const today = new Date().toISOString().split('T')[0];
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const totalVariableSpent = Object.values(categoryTotals).reduce((sum, t) => sum + t, 0);
  const totalFixedSpent = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSpent = totalVariableSpent + totalFixedSpent;
  const budget = monthData?.budget?.monthlyBudget ?? null;
  const income = monthData?.summary?.monthlyIncome ?? null;

  const handleSaveBudget = () => {
    if (!data) return;
    const val = tempBudget === '' ? null : parseFloat(tempBudget);
    const updatedMonths = { ...data.months };
    const currentMonth = updatedMonths[selectedMonthKey] || { ...DEFAULT_MONTHLY_FINANCE };
    updatedMonths[selectedMonthKey] = { 
      ...currentMonth, 
      budget: { ...currentMonth.budget, monthlyBudget: val } 
    };
    financeStore.save({ ...data, months: updatedMonths });
    setEditingBudget(false);
  };

  const handleSaveIncome = () => {
    if (!data) return;
    const val = tempIncome === '' ? null : parseFloat(tempIncome);
    const updatedMonths = { ...data.months };
    const currentMonth = updatedMonths[selectedMonthKey] || { ...DEFAULT_MONTHLY_FINANCE };
    updatedMonths[selectedMonthKey] = { 
      ...currentMonth, 
      summary: { ...currentMonth.summary, monthlyIncome: val } 
    };
    financeStore.save({ ...data, months: updatedMonths });
    setEditingIncome(false);
  };

  const handleUpdateFixedExpense = (category: FixedExpenseCategory, amount: string) => {
    if (!data) return;
    const val = amount === '' ? 0 : parseFloat(amount);
    const updatedMonths = { ...data.months };
    const currentMonth = updatedMonths[selectedMonthKey] || { ...DEFAULT_MONTHLY_FINANCE };
    
    const newFixed = [...currentMonth.fixedExpenses];
    const idx = newFixed.findIndex(fe => fe.category === category);
    
    if (idx >= 0) {
      if (val === 0) newFixed.splice(idx, 1);
      else newFixed[idx] = { ...newFixed[idx], amount: val };
    } else if (val > 0) {
      newFixed.push({
        id: Math.random().toString(36).substr(2, 9),
        category,
        amount: val,
        date: today
      });
    }
    
    updatedMonths[selectedMonthKey] = { ...currentMonth, fixedExpenses: newFixed };
    financeStore.save({ ...data, months: updatedMonths });
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpenseId(expense.id);
    setExpenseType(expense.type);
    setNewExpense({
      amount: (expense.type === 'shared' ? expense.totalAmount : expense.amount).toString(),
      category: expense.category,
      paymentType: expense.paymentType,
      note: expense.note || '',
      title: expense.title || '',
      splits: expense.splits || [{ name: 'You', amount: 0, settled: true }],
    });
    setShowAddExpense(true);
  };

  const handleDeleteExpense = (id: string, type: 'personal' | 'shared') => {
    if (!data) return;
    const updatedMonths = { ...data.months };
    const currentMonth = { ...updatedMonths[selectedMonthKey] };
    
    if (type === 'personal') {
      currentMonth.expenses = currentMonth.expenses.filter(e => e.id !== id);
    } else {
      currentMonth.sharedExpenses = currentMonth.sharedExpenses.filter(se => se.id !== id);
    }
    
    updatedMonths[selectedMonthKey] = currentMonth;
    financeStore.save({ ...data, months: updatedMonths });
  };

  const handleAddExpense = () => {
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) return;
    
    const updatedMonths = { ...data.months };
    const currentMonth = { ...(updatedMonths[selectedMonthKey] || { ...DEFAULT_MONTHLY_FINANCE }) };

    if (expenseType === 'personal') {
      const expense: FinanceExpense = {
        id: editingExpenseId || Math.random().toString(36).substr(2, 9),
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        paymentType: newExpense.paymentType,
        note: newExpense.note || undefined,
        date: today,
      };
      
      if (editingExpenseId) {
        currentMonth.expenses = currentMonth.expenses.map(e => e.id === editingExpenseId ? expense : e);
      } else {
        currentMonth.expenses = [...currentMonth.expenses, expense];
      }
    } else {
      const shared: SharedExpense = {
        id: editingExpenseId || Math.random().toString(36).substr(2, 9),
        title: newExpense.title || 'Untitled Shared',
        totalAmount: parseFloat(newExpense.amount),
        splitMethod: 'equal',
        splits: newExpense.splits,
        date: today,
        settled: newExpense.splits.every(s => s.settled),
        category: newExpense.category,
        paymentType: newExpense.paymentType,
      };

      if (editingExpenseId) {
        currentMonth.sharedExpenses = currentMonth.sharedExpenses.map(se => se.id === editingExpenseId ? shared : se);
      } else {
        currentMonth.sharedExpenses = [...currentMonth.sharedExpenses, shared];
      }
    }
    
    updatedMonths[selectedMonthKey] = currentMonth;
    financeStore.save({ ...data, months: updatedMonths });
    setNewExpense({ amount: '', category: 'Food', paymentType: 'UPI', note: '', title: '', splits: [{ name: 'You', amount: 0, settled: true }] });
    setEditingExpenseId(null);
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setShowAddExpense(false);
    }, 1000);
  };

  const handleAutoSplit = () => {
    const count = parseInt(autoSplitCount);
    if (isNaN(count) || count < 1) return;
    
    const amt = parseFloat(newExpense.amount) || 0;
    const splitAmt = amt / count;
    
    const newSplits = [{ name: 'You', amount: splitAmt, settled: true }];
    for (let i = 1; i < count; i++) {
      newSplits.push({ name: `Person ${i}`, amount: splitAmt, settled: false });
    }
    
    setNewExpense(prev => ({ ...prev, splits: newSplits }));
    setShowAutoSplit(false);
  };

  const settleSharedExpense = (expenseId: string, splitName: string) => {
    if (!data) return;
    const updatedMonths = { ...data.months };
    const currentMonth = updatedMonths[selectedMonthKey];
    if (!currentMonth) return;

    const sharedIdx = currentMonth.sharedExpenses.findIndex(se => se.id === expenseId);
    if (sharedIdx === -1) return;

    const shared = { ...currentMonth.sharedExpenses[sharedIdx] };
    shared.splits = shared.splits.map(s => s.name === splitName ? { ...s, settled: true } : s);
    
    if (shared.splits.every(s => s.settled)) {
      shared.settled = true;
    }

    currentMonth.sharedExpenses[sharedIdx] = shared;
    financeStore.save({ ...data, months: updatedMonths });
  };

  const sortedMonthKeys = Object.keys(data.months).sort().reverse();

  return (
    <section id="finance" className="relative py-32 overflow-hidden bg-[#050505]">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.02),transparent)] pointer-events-none" />

      <div className="container relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 px-4 md:px-0">
            <div>
              <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-6">
                <Wallet size={10} className="text-white/60" />
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/60">
                  Module 05 / Capital Engine
                </span>
              </div>
              <h2 className="font-display text-[clamp(40px,6vw,72px)] text-white tracking-tighter leading-[0.9] mb-4">
                Finance Control
              </h2>
              <p className="text-white/40 text-lg font-light tracking-wide max-w-xl">
                Clarity in capital is the foundation of freedom. Track, split, and optimize your financial flow.
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1">Current State</p>
                <div className="flex items-center gap-2 justify-end">
                  <Sparkles size={16} className="text-white/60" />
                  <span className="text-2xl font-display text-white">{totalSpent > (budget || Infinity) ? 'Over' : 'Safe'}</span>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                <Calendar size={14} className="text-white/40" />
                <select 
                  value={selectedMonthKey}
                  onChange={(e) => setSelectedMonthKey(e.target.value)}
                  className="bg-transparent text-white/60 text-xs font-medium focus:outline-none cursor-pointer"
                >
                  {sortedMonthKeys.map(key => (
                    <option key={key} value={key} className="bg-[#1a1a1a]">
                      {new Date(key + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto px-4">
            {/* 1. Monthly Snapshot */}
            <section className="mb-12 text-center bg-white/[0.02] border border-white/10 rounded-[32px] p-10 backdrop-blur-sm relative overflow-hidden">
               {/* Snapshot Background */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
              
              <div className="flex flex-col items-center mb-10 relative z-10">
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-2">Total Spent</p>
                <motion.h2 
                  key={totalSpent}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-6xl md:text-7xl font-display text-white tracking-tight mb-6"
                >
                  {formatCurrency(totalSpent)}
                </motion.h2>

                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Budget</p>
                    {editingBudget ? (
                      <input 
                        autoFocus
                        type="number"
                        value={tempBudget}
                        onChange={(e) => setTempBudget(e.target.value)}
                        onBlur={handleSaveBudget}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveBudget()}
                        className="w-16 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none text-center"
                      />
                    ) : (
                      <button onClick={() => setEditingBudget(true)} className="flex items-center gap-1.5 hover:text-white transition-colors group">
                        <span className="text-xs text-white/40 font-mono">{budget ? formatCurrency(budget) : 'Set Budget'}</span>
                        <Pencil size={10} className="text-white/20 group-hover:text-white/40" />
                      </button>
                    )}
                  </div>
                  <div className="w-[1px] h-8 bg-white/5" />
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Income</p>
                    {editingIncome ? (
                      <input 
                        autoFocus
                        type="number"
                        value={tempIncome}
                        onChange={(e) => setTempIncome(e.target.value)}
                        onBlur={handleSaveIncome}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveIncome()}
                        className="w-16 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none text-center"
                      />
                    ) : (
                      <button onClick={() => setEditingIncome(true)} className="flex items-center gap-1.5 hover:text-white transition-colors group">
                        <span className="text-xs text-white/40 font-mono">{income ? formatCurrency(income) : 'Set Income'}</span>
                        <Pencil size={10} className="text-white/20 group-hover:text-white/40" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-4 max-w-sm mx-auto relative z-10">
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totalSpent / (budget || 1)) * 100, 100)}%` }}
                    className={`h-full rounded-full transition-colors duration-500 ${totalSpent > (budget || Infinity) ? 'bg-red-500/40' : 'bg-white/20'}`}
                  />
                </div>
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                  {budget ? `Budgeting well this month — ${Math.round((totalSpent / budget) * 100)}% used` : "Planning starts simple"}
                </p>
              </div>
            </section>

            {/* 2. Balance Status Card */}
            <button 
              onClick={() => setShowSharedPanel(true)}
              className="w-full mb-12 p-6 bg-white/[0.03] border border-white/10 rounded-[24px] hover:bg-white/[0.05] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                  <Users size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-1">Shared Balance</p>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white/80">Owed: {formatCurrency(balanceOwed)}</span>
                    </div>
                    <div className="w-[1px] h-4 bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white/40">Owing: {formatCurrency(balanceOwing)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-colors" />
            </button>

            {/* 3. Category Summary */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Category Summary</p>
              </div>
              <div className="flex gap-4 pb-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 mask-fade-edges">
                {VARIABLE_CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className={`flex-shrink-0 w-[140px] snap-start flex flex-col items-center gap-3 p-5 rounded-[24px] border transition-all ${
                      selectedCategory === cat 
                        ? 'bg-white text-black border-white shadow-xl scale-[1.02]' 
                        : 'bg-white/[0.03] border-white/5 text-white/60 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      selectedCategory === cat 
                        ? 'bg-black text-white' 
                        : (categoryColors[cat] || 'bg-white/5 text-white/40')
                    }`}>
                      {categoryIcons[cat]}
                    </div>
                    <div className="text-center">
                      <span className="block text-[10px] font-medium uppercase tracking-wider mb-1">{cat}</span>
                      <span className={`text-xs font-mono font-medium ${selectedCategory === cat ? 'text-black/60' : 'text-white/40'}`}>
                        {formatCurrency(categoryTotals[cat])}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* 4. Fixed Expenses */}
            <section className="mb-12">
              <button 
                onClick={() => setShowFixedExpanded(!showFixedExpanded)}
                className="w-full flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-[24px] hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <CreditCard size={18} className="text-white/20 group-hover:text-white transition-colors" />
                  <span className="text-[11px] text-white/60 font-medium uppercase tracking-wider">Fixed Expenses</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-white/40">{formatCurrency(totalFixedSpent)}</span>
                  {showFixedExpanded ? <ChevronUp size={16} className="text-white/20" /> : <ChevronDown size={16} className="text-white/20" />}
                </div>
              </button>
              
              <AnimatePresence>
                {showFixedExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-2">
                      {FIXED_CATEGORIES.map(cat => {
                        const expense = fixedExpenses.find(fe => fe.category === cat);
                        return (
                          <div key={cat} className="flex items-center justify-between px-5 py-4 bg-white/[0.01] rounded-2xl border border-white/[0.03] group">
                            <div className="flex items-center gap-3">
                              <div className="text-white/20 group-hover:text-white/40 transition-colors">{categoryIcons[cat]}</div>
                              <span className="text-[11px] text-white/60 font-medium">{cat}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-white/20 font-mono">₹</span>
                              <input 
                                type="number"
                                defaultValue={expense?.amount || ''}
                                onBlur={(e) => handleUpdateFixedExpense(cat, e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                placeholder="0"
                                className="w-20 bg-transparent text-[11px] font-mono text-white/40 text-right focus:text-white focus:outline-none placeholder:text-white/5"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* 5. Transaction Timeline */}
            <section className="space-y-6 pb-20">
              <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Recent Activity</p>
                {selectedCategory && (
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors"
                  >
                    Clear Filter <X size={10} />
                  </button>
                )}
              </div>

              <div className="space-y-10">
                {groupedByDay.map(([date, dayExpenses]) => (
                  <div key={date}>
                    <h4 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-6 px-1">
                      {date === today ? "Today" : new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </h4>
                    
                    <div className="space-y-4">
                      {dayExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between group px-1 hover:bg-white/[0.02] rounded-xl p-2 -mx-2 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:scale-105 ${categoryColors[expense.category] || 'bg-white/5 text-white/40'}`}>
                              {categoryIcons[expense.category] || <LayoutGrid size={16} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-white/80 font-medium">{expense.type === 'shared' ? expense.title : expense.category}</span>
                                {expense.type === 'shared' && <span className="px-1.5 py-0.5 rounded bg-white/10 text-[8px] font-mono text-white/40 uppercase">Shared</span>}
                                {expense.settled && <Check size={10} className="text-green-500/60" />}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 opacity-40">
                                <span className="text-[10px] font-mono uppercase tracking-wider">{expense.paymentType}</span>
                                <span className="text-[10px]">•</span>
                                <span className="text-[10px] font-mono">{new Date(expense.date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`text-sm font-display ${expense.settled ? 'text-white/20 line-through' : 'text-white'}`}>
                                {formatCurrency(expense.type === 'shared' ? expense.totalAmount : expense.amount)}
                              </p>
                              {expense.type === 'shared' && !expense.settled && (
                                <p className="text-[9px] font-mono text-white/20">You owe {formatCurrency(expense.splits.find((s: any) => s.name === 'You')?.amount || 0)}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEditExpense(expense)}
                                className="p-1.5 text-white/20 hover:text-white/60 transition-colors"
                              >
                                <Pencil size={12} />
                              </button>
                              <button 
                                onClick={() => handleDeleteExpense(expense.id, expense.type)}
                                className="p-1.5 text-white/20 hover:text-red-400/60 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {filteredExpenses.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-sm text-white/20 italic font-mono">“Planning starts simple”</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* 6. Floating Add Button */}
      <AnimatePresence>
        {!showAddExpense && !showSharedPanel && (
          <motion.button 
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setEditingExpenseId(null);
              setNewExpense({
                amount: '',
                category: 'Food',
                paymentType: 'UPI',
                note: '',
                title: '',
                splits: [{ name: 'You', amount: 0, settled: true }]
              });
              setShowAddExpense(true);
            }}
            className="fixed bottom-24 md:bottom-12 right-6 md:right-12 w-16 h-16 rounded-full bg-white text-black shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all z-50 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Plus size={24} className="relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 7. Shared Expenses Panel (Drawer) */}
      <AnimatePresence>
        {showSharedPanel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSharedPanel(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 bottom-0 top-0 w-full md:max-w-md bg-[#161616] border-l border-white/10 z-[110] p-6 md:p-8 overflow-y-auto rounded-t-[32px] md:rounded-none"
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-display text-white">Shared Expenses</h3>
                <button onClick={() => setShowSharedPanel(false)} className="text-white/20 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-10">
                <section>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-6 flex items-center gap-2">
                    Pending <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/60 font-mono text-[9px]">{formatCurrency(balanceOwed)}</span>
                  </p>
                  <div className="space-y-4">
                    {sharedExpenses.filter(se => se.splits.some(s => s.name !== 'You' && !s.settled)).map(se => (
                      <div key={se.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm font-medium text-white/80">{se.title}</p>
                            <p className="text-[10px] font-mono text-white/20">{new Date(se.date).toLocaleDateString()}</p>
                          </div>
                          <p className="text-sm font-display text-white">{formatCurrency(se.totalAmount)}</p>
                        </div>
                        <div className="space-y-2">
                          {se.splits.filter(s => s.name !== 'You' && !s.settled).map(split => (
                            <div key={split.name} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl">
                              <span className="text-[11px] text-white/40">{split.name} owes {formatCurrency(split.amount)}</span>
                              <button 
                                onClick={() => settleSharedExpense(se.id, split.name)}
                                className="text-[10px] font-mono text-white/60 hover:text-white uppercase tracking-wider"
                              >
                                Mark Received
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-6 flex items-center gap-2">
                    You Owe <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/60 font-mono text-[9px]">{formatCurrency(balanceOwing)}</span>
                  </p>
                  <div className="space-y-4">
                    {sharedExpenses.filter(se => {
                      const youSplit = se.splits.find(s => s.name === 'You');
                      return youSplit && !youSplit.settled;
                    }).map(se => (
                      <div key={se.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white/80">{se.title}</p>
                          <p className="text-[10px] font-mono text-white/20">Owe {formatCurrency(se.splits.find(s => s.name === 'You')?.amount || 0)}</p>
                        </div>
                        <button 
                          onClick={() => settleSharedExpense(se.id, 'You')}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg text-[10px] font-mono uppercase tracking-wider transition-colors"
                        >
                          Mark Paid
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Settled</p>
                  </div>
                  <div className="space-y-3 opacity-40">
                    {sharedExpenses.filter(se => se.settled).map(se => (
                      <div key={se.id} className="flex items-center justify-between px-1">
                        <span className="text-[11px] text-white/60 line-through">{se.title}</span>
                        <span className="text-[10px] font-mono text-white/20">{formatCurrency(se.totalAmount)} ✓</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 8. Add Expense Flow */}
      <AnimatePresence>
        {showAddExpense && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddExpense(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120]"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-[40px] p-8 pb-12 z-[130] shadow-2xl border-t border-white/10 overflow-y-auto max-h-[90vh]"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              
              <div className="max-w-md mx-auto space-y-8">
                <div className="flex p-1 bg-white/5 rounded-2xl">
                  {(['personal', 'shared'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setExpenseType(type)}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-mono uppercase tracking-[0.2em] transition-all ${expenseType === type ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">Total Amount</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-display text-white/40">₹</span>
                    <input 
                      autoFocus
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => {
                        const amt = e.target.value;
                        setNewExpense(prev => {
                          const numAmt = parseFloat(amt) || 0;
                          return {
                            ...prev,
                            amount: amt,
                            splits: prev.splits.map(s => ({ ...s, amount: numAmt / prev.splits.length }))
                          };
                        });
                      }}
                      placeholder="0"
                      className="bg-transparent text-5xl font-display text-white focus:outline-none w-48 text-center placeholder:text-white/5"
                    />
                  </div>
                </div>

                {expenseType === 'shared' && (
                  <div className="space-y-6">
                    <input 
                      type="text"
                      value={newExpense.title}
                      onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                      placeholder="What is this for?"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20 placeholder:text-white/10"
                    />
                    
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Splits</p>
                        <button 
                          onClick={() => setShowAutoSplit(!showAutoSplit)}
                          className="text-[9px] font-mono text-white/40 hover:text-white uppercase tracking-widest flex items-center gap-1"
                        >
                          Auto Split <Zap size={10} className={showAutoSplit ? 'text-amber-400' : ''} />
                        </button>
                      </div>

                      {showAutoSplit && (
                        <div className="flex items-center gap-3 p-3 bg-amber-400/5 border border-amber-400/10 rounded-xl mb-4">
                          <span className="text-[10px] text-amber-400/60 font-mono">Split between</span>
                          <input 
                            type="number"
                            value={autoSplitCount}
                            onChange={(e) => setAutoSplitCount(e.target.value)}
                            className="w-12 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white text-center"
                          />
                          <span className="text-[10px] text-amber-400/60 font-mono">people</span>
                          <button 
                            onClick={handleAutoSplit}
                            className="ml-auto bg-amber-400/20 text-amber-400 px-3 py-1 rounded text-[10px] font-bold uppercase"
                          >
                            Apply
                          </button>
                        </div>
                      )}

                      <div className="space-y-3">
                        {newExpense.splits.map((split, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <input 
                              type="text"
                              value={split.name}
                              onChange={(e) => {
                                const newSplits = [...newExpense.splits];
                                newSplits[idx].name = e.target.value;
                                setNewExpense({ ...newExpense, splits: newSplits });
                              }}
                              className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white/80"
                              placeholder="Name"
                              disabled={split.name === 'You'}
                            />
                            <div className="w-24 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white/40 font-mono text-right">
                              {formatCurrency(split.amount)}
                            </div>
                            {newExpense.splits.length > 1 && split.name !== 'You' && (
                              <button 
                                onClick={() => {
                                  const newSplits = newExpense.splits.filter((_, i) => i !== idx);
                                  const amt = parseFloat(newExpense.amount) || 0;
                                  setNewExpense({ ...newExpense, splits: newSplits.map(s => ({ ...s, amount: amt / newSplits.length })) });
                                }}
                                className="text-white/20 hover:text-white/40"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const amt = parseFloat(newExpense.amount) || 0;
                            const newSplits = [...newExpense.splits, { name: '', amount: 0, settled: false }];
                            setNewExpense({ ...newExpense, splits: newSplits.map(s => ({ ...s, amount: amt / newSplits.length })) });
                          }}
                          className="flex items-center gap-2 text-[10px] font-mono text-white/20 hover:text-white/40 uppercase tracking-widest px-1 mt-2"
                        >
                          <Plus size={12} /> Add Person
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {VARIABLE_CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setNewExpense({ ...newExpense, category: cat })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${newExpense.category === cat ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent opacity-40 hover:opacity-70'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        newExpense.category === cat ? (categoryColors[cat] || 'bg-white/20 text-white') : 'bg-white/5 text-white/40'
                      }`}>
                        {categoryIcons[cat]}
                      </div>
                      <span className="text-[9px] font-medium uppercase tracking-wider">{cat}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    {(['Cash', 'UPI', 'Card'] as const).map((type) => (
                      <button 
                        key={type}
                        onClick={() => setNewExpense({ ...newExpense, paymentType: type })}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${newExpense.paymentType === type ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent opacity-40'}`}
                      >
                        {paymentIcons[type]}
                        <span className="text-[10px] font-medium uppercase tracking-wider">{type}</span>
                      </button>
                    ))}
                  </div>
                  {expenseType === 'personal' && (
                    <input 
                      type="text"
                      value={newExpense.note}
                      onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
                      placeholder="Add a note (optional)..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20 placeholder:text-white/10"
                    />
                  )}
                </div>

                <button 
                  onClick={handleAddExpense}
                  disabled={!newExpense.amount || isSaved}
                  className={`w-full py-5 rounded-[24px] font-display text-lg transition-all flex items-center justify-center gap-2 ${isSaved ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] disabled:opacity-20 shadow-xl'}`}
                >
                  {isSaved ? <><Check size={20} /> Saved</> : <>{editingExpenseId ? 'Update' : 'Add'} {expenseType === 'shared' ? 'Shared Expense' : 'Expense'} <ArrowRight size={20} /></>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .mask-fade-edges {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </section>
  );
}
