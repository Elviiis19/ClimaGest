import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, Equipment, MaintenanceRecord, Budget, Scheduling, StockItem, FinancialTransaction } from './types';
import {
  INITIAL_CLIENTS,
  INITIAL_EQUIPMENT,
  INITIAL_RECORDS,
  INITIAL_BUDGETS,
  INITIAL_SCHEDULINGS,
  INITIAL_STOCK,
  INITIAL_FINANCEDATA
} from './data';

import { auth } from './firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { LoginScreen } from './Login';
import { LogOut } from 'lucide-react';
// Import Modular Components
import { ClientManager } from './components/ClientManager';
import { BudgetManager } from './components/BudgetManager';
import { FinancialManager } from './components/FinancialManager';
import { InventoryManager } from './components/InventoryManager';
import { AgendaManager } from './components/AgendaManager';
import { BtuCalculator } from './components/BtuCalculator';
import { HvacDiagnostic } from './components/HvacDiagnostic';
import { ServiceStats } from './components/ServiceStats';

// Import Icons
import {
  Gauge,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Package,
  Wrench,
  AlertTriangle,
  MessageSquare,
  Clock,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Inbox,
  UserCheck
} from 'lucide-react';

const LOCAL_STORAGE_KEYS = {
  CLIENTS: 'climagest_clients_v1',
  EQUIPMENT: 'climagest_equipment_v1',
  RECORDS: 'climagest_records_v1',
  BUDGETS: 'climagest_budgets_v1',
  SCHEDULINGS: 'climagest_schedulings_v1',
  STOCK: 'climagest_stock_v1',
  FINANCE: 'climagest_finance_v1'
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const [activeTab, setActiveTab] = useState<'painel' | 'clientes' | 'agenda' | 'financeiro' | 'orcamentos' | 'estoque'>('painel');

  // Core Sate managers
  const [clients, setClients] = useState<Client[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [finance, setFinance] = useState<FinancialTransaction[]>([]);

  // Load from LocalStorage or backup defaults
  useEffect(() => {
    if (!user) return; // Only load when user is present
    const loadState = <T,>(key: string, backup: T): T => {
      try {
        const stored = localStorage.getItem(`${key}_${user.uid}`);
        return stored ? JSON.parse(stored) : backup;
      } catch (e) {
        return backup;
      }
    };

    setClients(loadState(LOCAL_STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS));
    setEquipments(loadState(LOCAL_STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT));
    setRecords(loadState(LOCAL_STORAGE_KEYS.RECORDS, INITIAL_RECORDS));
    setBudgets(loadState(LOCAL_STORAGE_KEYS.BUDGETS, INITIAL_BUDGETS));
    setSchedulings(loadState(LOCAL_STORAGE_KEYS.SCHEDULINGS, INITIAL_SCHEDULINGS));
    setStock(loadState(LOCAL_STORAGE_KEYS.STOCK, INITIAL_STOCK));
    setFinance(loadState(LOCAL_STORAGE_KEYS.FINANCE, INITIAL_FINANCEDATA));
  }, [user]);

  // Save to LocalStorage helpers
  const saveState = (key: string, data: any) => {
    if (user) {
      localStorage.setItem(`${key}_${user.uid}`, JSON.stringify(data));
    }
  };

  // CLIENT CRUD
  const handleAddClient = (newClient: Omit<Client, 'id'>) => {
    const clientWithId: Client = {
      ...newClient,
      id: `client_${Date.now()}`
    };
    const updated = [clientWithId, ...clients];
    setClients(updated);
    saveState(LOCAL_STORAGE_KEYS.CLIENTS, updated);
  };

  const handleDeleteClient = (id: string) => {
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    saveState(LOCAL_STORAGE_KEYS.CLIENTS, updated);

    // Cascade delete of equipments related
    const updatedEqs = equipments.filter(e => e.clientId !== id);
    setEquipments(updatedEqs);
    saveState(LOCAL_STORAGE_KEYS.EQUIPMENT, updatedEqs);
  };

  // EQUIPMENT CRUD
  const handleAddEquipment = (newEq: Omit<Equipment, 'id'>) => {
    const eqWithId: Equipment = {
      ...newEq,
      id: `eq_${Date.now()}`
    };
    const updated = [eqWithId, ...equipments];
    setEquipments(updated);
    saveState(LOCAL_STORAGE_KEYS.EQUIPMENT, updated);
  };

  const handleDeleteEquipment = (id: string) => {
    const updated = equipments.filter(e => e.id !== id);
    setEquipments(updated);
    saveState(LOCAL_STORAGE_KEYS.EQUIPMENT, updated);

    // Cascade records delete
    const updatedRecords = records.filter(r => r.equipmentId !== id);
    setRecords(updatedRecords);
    saveState(LOCAL_STORAGE_KEYS.RECORDS, updatedRecords);
  };

  // MAINTENANCE RECORDS CRUD
  const handleAddRecord = (newRec: Omit<MaintenanceRecord, 'id'>) => {
    const recWithId: MaintenanceRecord = {
      ...newRec,
      id: `rec_${Date.now()}`
    };
    const updated = [recWithId, ...records];
    setRecords(updated);
    saveState(LOCAL_STORAGE_KEYS.RECORDS, updated);

    // Auto-update parent Client's lastServiceDate and nextReturnDate
    const parentClient = clients.find(c => c.id === newRec.clientId);
    if (parentClient) {
      let monthsToAdd = 6;
      if (parentClient.returnPreference === '3_months') monthsToAdd = 3;
      if (parentClient.returnPreference === '1_year') monthsToAdd = 12;

      const baseDate = new Date(newRec.date);
      baseDate.setMonth(baseDate.getMonth() + monthsToAdd);
      const nextDateStr = baseDate.toISOString().split('T')[0];

      const updatedClients = clients.map(c => {
        if (c.id === parentClient.id) {
          return {
            ...c,
            lastServiceDate: newRec.date,
            nextReturnDate: nextDateStr,
            returnStatus: 'pending' as const
          };
        }
        return c;
      });
      setClients(updatedClients);
      saveState(LOCAL_STORAGE_KEYS.CLIENTS, updatedClients);
    }

    // Auto-register corresponding Financial Transaction (as automatic receipt revenue!)
    const activeEquipment = equipments.find(e => e.id === newRec.equipmentId);
    const categoryName = activeEquipment ? `${activeEquipment.brand} (${activeEquipment.location})` : 'Equipamento';
    const txDescription = `${newRec.serviceType} — ${clients.find(c => c.id === newRec.clientId)?.name} (${categoryName})`;
    
    handleAddTransaction({
      type: 'receita',
      description: txDescription,
      value: newRec.cost,
      date: newRec.date,
      status: 'pago',
      category: 'Serviço'
    });
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    saveState(LOCAL_STORAGE_KEYS.RECORDS, updated);
  };

  // BUDGET CRUD
  const handleAddBudget = (newBudget: Omit<Budget, 'id'>) => {
    const budgetWithId: Budget = {
      ...newBudget,
      id: `orc_${Date.now().toString().slice(-4)}`
    };
    const updated = [budgetWithId, ...budgets];
    setBudgets(updated);
    saveState(LOCAL_STORAGE_KEYS.BUDGETS, updated);
  };

  const handleUpdateBudgetStatus = (id: string, status: Budget['status']) => {
    const updated = budgets.map(b => (b.id === id ? { ...b, status } : b));
    setBudgets(updated);
    saveState(LOCAL_STORAGE_KEYS.BUDGETS, updated);

    // If budget becomes Approved, auto-record a financial transaction as pending account receivable!
    if (status === 'Aprovado') {
      const budget = budgets.find(b => b.id === id);
      if (budget) {
        const client = clients.find(c => c.id === budget.clientId);
        const desc = `Orçamento Aprovado #${budget.id} — ${client?.name || 'Cliente'}`;
        
        // Check if transaction already exists to avoid duplication
        const duplicate = finance.some(f => f.description.includes(`#${budget.id}`));
        if (!duplicate) {
          handleAddTransaction({
            type: 'receita',
            description: desc,
            value: budget.totalValue,
            date: new Date().toISOString().split('T')[0],
            status: 'pendente',
            category: 'Serviço'
          });
        }
      }
    }
  };

  const handleDeleteBudget = (id: string) => {
    const updated = budgets.filter(b => b.id !== id);
    setBudgets(updated);
    saveState(LOCAL_STORAGE_KEYS.BUDGETS, updated);
  };

  // SCHEDULING CRUD
  const handleAddScheduling = (newSch: Omit<Scheduling, 'id'>) => {
    const schWithId: Scheduling = {
      ...newSch,
      id: `sch_${Date.now()}`
    };
    const updated = [schWithId, ...schedulings];
    setSchedulings(updated);
    saveState(LOCAL_STORAGE_KEYS.SCHEDULINGS, updated);
  };

  const handleUpdateSchStatus = (id: string, status: Scheduling['status']) => {
    const updated = schedulings.map(s => (s.id === id ? { ...s, status } : s));
    setSchedulings(updated);
    saveState(LOCAL_STORAGE_KEYS.SCHEDULINGS, updated);

    // Auto-register profit transaction if completed and doesn't exist
    if (status === 'Concluído') {
      const sch = schedulings.find(s => s.id === id);
      if (sch) {
        const client = clients.find(c => c.id === sch.clientId);
        const desc = `Visita Técnica Concluída — ${client?.name || 'Cliente'}`;
        handleAddTransaction({
          type: 'receita',
          description: desc,
          value: sch.value,
          date: new Date().toISOString().split('T')[0],
          status: 'pago',
          category: 'Serviço'
        });
      }
    }
  };

  const handleDeleteScheduling = (id: string) => {
    const updated = schedulings.filter(s => s.id !== id);
    setSchedulings(updated);
    saveState(LOCAL_STORAGE_KEYS.SCHEDULINGS, updated);
  };

  // INVENTORY STOCK ADJUST
  const handleAddStockItem = (newItem: Omit<StockItem, 'id'>) => {
    const itemWithId: StockItem = {
      ...newItem,
      id: `stock_${Date.now()}`
    };
    const updated = [itemWithId, ...stock];
    setStock(updated);
    saveState(LOCAL_STORAGE_KEYS.STOCK, updated);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    const updated = stock.map(s => (s.id === id ? { ...s, quantity } : s));
    setStock(updated);
    saveState(LOCAL_STORAGE_KEYS.STOCK, updated);
  };

  const handleDeleteStockItem = (id: string) => {
    const updated = stock.filter(s => s.id !== id);
    setStock(updated);
    saveState(LOCAL_STORAGE_KEYS.STOCK, updated);
  };

  // FINANCIAL TRANSACTIONS CRUD
  const handleAddTransaction = (newTx: Omit<FinancialTransaction, 'id'>) => {
    const txWithId: FinancialTransaction = {
      ...newTx,
      id: `tx_${Date.now()}`
    };
    const updated = [txWithId, ...finance];
    setFinance(updated);
    saveState(LOCAL_STORAGE_KEYS.FINANCE, updated);
  };

  const handleUpdateTxStatus = (id: string, status: FinancialTransaction['status']) => {
    const updated = finance.map(f => (f.id === id ? { ...f, status } : f));
    setFinance(updated);
    saveState(LOCAL_STORAGE_KEYS.FINANCE, updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = finance.filter(f => f.id !== id);
    setFinance(updated);
    saveState(LOCAL_STORAGE_KEYS.FINANCE, updated);
  };

  // CALCULATE RECURRENCE CLIENTS (RETORNO DE LIMPEZA E PEÇAS)
  // Check if current date (June 2026) is past nextReturnDate
  const getRecurrencePendingClients = () => {
    const currentDate = new Date('2026-06-04'); // Static preview timezone benchmark

    return clients.filter(client => {
      if (client.returnPreference === 'none' || !client.nextReturnDate) return false;
      const nextDate = new Date(client.nextReturnDate);
      return currentDate >= nextDate;
    });
  };

  const recurrencePending = getRecurrencePendingClients();

  // DASHBOARD COUNTERS (Global faturamentos)
  const totalRecebidos = finance
    .filter(t => t.type === 'receita' && t.status === 'pago')
    .reduce((sum, t) => sum + t.value, 0);

  const totalGastos = finance
    .filter(t => t.type === 'despesa' && t.status === 'pago')
    .reduce((sum, t) => sum + t.value, 0);

  const totalEmCaixa = totalRecebidos - totalGastos;
  const numHojeAgendado = schedulings.filter(s => s.date === '2026-05-14' && s.status === 'Agendado').length;
  const lowStockAlerts = stock.filter(item => item.quantity <= item.minQuantity).length;

  if (!authReady) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-medium">Carregando plataforma...</div>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24 md:pb-6" id="applet-viewport">
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-2xs px-4 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-sm">
              <Wrench size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-1">
                Clima Gest <span className="text-[10px] bg-blue-50 text-blue-600 font-extrabold px-1.5 py-0.5 rounded uppercase">PRO</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Refrigeração & Climatização</p>
            </div>
          </div>

          {/* DESKTOP TAB SELECTION */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('painel')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'painel' ? 'bg-white text-blue-600 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Gauge size={14} /> Painel
            </button>
            <button
              id="tab-clientes"
              onClick={() => setActiveTab('clientes')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'clientes' ? 'bg-white text-blue-600 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users size={14} /> Clientes
            </button>
            <button
              id="tab-agenda"
              onClick={() => setActiveTab('agenda')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'agenda' ? 'bg-white text-blue-600 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar size={14} /> Agenda
            </button>
            <button
              id="tab-financeiro"
              onClick={() => setActiveTab('financeiro')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'financeiro' ? 'bg-white text-blue-600 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <DollarSign size={14} /> Financeiro
            </button>
            <button
              id="tab-orcamentos"
              onClick={() => setActiveTab('orcamentos')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'orcamentos' ? 'bg-white text-blue-600 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText size={14} /> Orçamentos
            </button>
            <button
              id="tab-estoque"
              onClick={() => setActiveTab('estoque')}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'estoque' ? 'bg-white text-blue-600 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Package size={14} /> Estoque
            </button>
          </nav>

          {/* Quick status indicators (Offline ready + Date) */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">
              <Clock size={12} className="text-blue-500" /> 04 de Junho, 2026
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              Sincronizado
            </span>
            <div className="hidden lg:flex flex-col justify-center items-end ml-2 mr-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase leading-tight">Pro Plan</span>
              <span className="text-[11px] font-bold text-slate-700 leading-tight">{user.email}</span>
            </div>
            <button onClick={() => signOut(auth)} className="text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 p-2 rounded-full transition-colors cursor-pointer" title="Sair do sistema">
              <LogOut size={16} />
            </button>
          </div>

        </div>
      </header>

      {/* RENDER BODY FOR SELECTED TAB */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'painel' && (
            <motion.div
              key="painel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="space-y-6"
              id="dashboard-tab-panel"
            >
              
              <div className="flex flex-col gap-1 mb-6 mt-2">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Visão Geral da Operação</h2>
                <p className="text-sm text-slate-500 font-medium">Acompanhe os principais indicadores do seu negócio de climatização.</p>
              </div>

              {/* INÍCIO: METRICS OVERVIEW GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between min-h-[120px]">
                  <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-900 pointer-events-none">
                    <Users size={100} />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Clientes Ativos</span>
                  <div className="flex justify-between items-baseline mt-4 relative z-10 w-full">
                    <span className="text-3xl font-black text-slate-800">{clients.length}</span>
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">Cadastros</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between min-h-[120px]">
                  <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-900 pointer-events-none">
                    <Calendar size={100} />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Agendamentos Hoje</span>
                  <div className="flex justify-between items-baseline mt-4 relative z-10 w-full">
                    <span className="text-3xl font-black text-blue-600">{numHojeAgendado}</span>
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">A Fazer</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between min-h-[120px]">
                  <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-900 pointer-events-none">
                    <Package size={100} />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Alertas de Estoque</span>
                  <div className="flex justify-between items-baseline mt-4 relative z-10 w-full">
                    <span className={`text-3xl font-black ${lowStockAlerts > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {lowStockAlerts}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${lowStockAlerts > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'}`}>
                      Reposição
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl shadow-md hover:shadow-lg transition-shadow relative overflow-hidden group flex flex-col justify-between min-h-[120px]">
                  <div className="absolute -bottom-4 -right-2 opacity-10 group-hover:opacity-20 transition-opacity text-white pointer-events-none">
                    <DollarSign size={100} />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Liquidez / Caixa</span>
                  <div className="flex justify-between items-baseline mt-4 relative z-10 w-full flex-wrap gap-2">
                    <span className="text-2xl font-black text-white">R$ {totalEmCaixa.toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20 uppercase tracking-wider">Registrado</span>
                  </div>
                </div>

              </div>

              {/* STATS AND PIPELINE GRAPHS */}
              <ServiceStats records={records} finance={finance} budgets={budgets} />

              {/* DYNAMIC ALERT: CLIENTES EM PERÍODO DE RETORNO (PRECISAM DE LIMPEZA!) */}
              <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                      <UserCheck size={22} className="animate-bounce" />
                    </span>
                    <div>
                      <h2 className="font-bold text-slate-800 text-base">Controle de Retorno Preventivo ({recurrencePending.length})</h2>
                      <p className="text-xs text-slate-500 font-medium">Clientes que realizaram manutenção há mais de 3, 6 ou 12 meses e necessitam de nova higienização.</p>
                    </div>
                  </div>

                  <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                    Ação Recomendada
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recurrencePending.map((client) => {
                    const equip = equipments.find(e => e.clientId === client.id) || { brand: 'Split', location: 'Residência' };
                    return (
                      <div
                        key={client.id}
                        className="p-5 bg-white border border-slate-200 shadow-2xs hover:shadow-sm rounded-xl space-y-4 flex flex-col justify-between transition-all"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-800 text-sm">{client.name}</h4>
                            <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                              {client.returnPreference === '3_months' ? '3 Meses' : client.returnPreference === '6_months' ? '6 Meses' : '1 Ano'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            Último serviço: {client.lastServiceDate ? client.lastServiceDate.split('-').reverse().join('/') : 'Histórico'}
                          </p>
                          <p className="text-[11px] text-slate-400 italic mt-2 bg-white p-2 rounded border border-slate-150">
                            {equip.brand} ({equip.location || 'Geral'}) necessita de Limpeza e Higienização preventiva periódica.
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            const message = `Olá *${client.name}*!\nJá fazem ${client.returnPreference === '3_months' ? '3 meses' : client.returnPreference === '6_months' ? '6 meses' : '12 meses'} desde a sua última higienização periódica de ar condicionado feita em seu aparelho *${equip.brand}* com a *Clima Gest*.\n\nA manutenção preventiva evita ácaros nocivos à saúde e otimiza o consumo de energia da sua conta técnica. Deseja agendar um horário para esta semana?`;
                            const formattedPhone = client.phone.startsWith('55') ? client.phone : `55${client.phone}`;
                            window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer mt-2"
                        >
                          <MessageSquare size={13} /> Chamar no WhatsApp
                        </button>
                      </div>
                    );
                  })}

                  {recurrencePending.length === 0 && (
                    <div className="col-span-full py-6 text-center text-slate-400 text-xs italic">
                      Não há nenhum cliente com retorno de manutenção agendado para expirar hoje. Excelente cuidado preventivo!
                    </div>
                  )}
                </div>
              </div>

              {/* LOWER COOPERATIVE SPLIT: RAPID ACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* TODAY'S SCHEDULINGS BRIEF PANEL */}
                <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                      <Clock size={16} className="text-blue-600" /> Escopo da Agenda de Hoje
                    </h3>
                    <button
                      onClick={() => setActiveTab('agenda')}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      Ver Agenda Completa
                    </button>
                  </div>

                  <div className="space-y-3">
                    {schedulings.filter(s => s.date === '2026-05-14').map((sch) => {
                      const client = clients.find(c => c.id === sch.clientId);
                      return (
                        <div key={sch.id} className="p-3 bg-slate-50 hover:bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs transition-colors">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{client?.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({sch.time})</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{sch.description}</span>
                          </div>
                          <span className="font-extrabold text-blue-600">
                            R$ {sch.value.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}

                    {schedulings.filter(s => s.date === '2026-05-14').length === 0 && (
                      <p className="text-xs text-slate-450 italic text-center py-6 text-slate-400">Nenhum agendamento ativo para a data de hoje.</p>
                    )}
                  </div>
                </div>

                {/* QUICK STOCK WARNING FOR REPLENISHMENTS */}
                <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                      <Package size={16} className="text-amber-500" /> Nível Crítico de Peças
                    </h3>
                    <button
                      onClick={() => setActiveTab('estoque')}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      Ver Tudo
                    </button>
                  </div>

                  <div className="space-y-3">
                    {stock.filter(item => item.quantity <= item.minQuantity).slice(0, 4).map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-800 block">{item.name}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">{item.category}</span>
                        </div>
                        <span className="font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded">
                          Qtd: {item.quantity} (Mín: {item.minQuantity})
                        </span>
                      </div>
                    ))}

                    {stock.filter(item => item.quantity <= item.minQuantity).length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-xs text-slate-400 font-medium">Parabéns! Nenhuma ferramenta ou peça está com estoque baixo.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* INTERACTIVE CALCULATOR SUITE */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <BtuCalculator />
                <HvacDiagnostic />
              </div>

            </motion.div>
          )}

          {/* Tab Components Routing */}
          {activeTab === 'clientes' && (
            <motion.div
              key="clientes"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <ClientManager
                clients={clients}
                equipments={equipments}
                records={records}
                onAddClient={handleAddClient}
                onDeleteClient={handleDeleteClient}
                onAddEquipment={handleAddEquipment}
                onDeleteEquipment={handleDeleteEquipment}
                onAddRecord={handleAddRecord}
                onDeleteRecord={handleDeleteRecord}
                stock={stock}
                onUpdateStockQuantity={handleUpdateQuantity}
              />
            </motion.div>
          )}

          {activeTab === 'agenda' && (
            <motion.div
              key="agenda"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <AgendaManager
                schedulings={schedulings}
                clients={clients}
                onAddScheduling={handleAddScheduling}
                onUpdateSchStatus={handleUpdateSchStatus}
                onDeleteScheduling={handleDeleteScheduling}
              />
            </motion.div>
          )}

          {activeTab === 'financeiro' && (
            <motion.div
              key="financeiro"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <FinancialManager
                transactions={finance}
                onAddTransaction={handleAddTransaction}
                onUpdateTxStatus={handleUpdateTxStatus}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </motion.div>
          )}

          {activeTab === 'orcamentos' && (
            <motion.div
              key="orcamentos"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <BudgetManager
                budgets={budgets}
                clients={clients}
                onAddBudget={handleAddBudget}
                onUpdateBudgetStatus={handleUpdateBudgetStatus}
                onDeleteBudget={handleDeleteBudget}
              />
            </motion.div>
          )}

          {activeTab === 'estoque' && (
            <motion.div
              key="estoque"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <InventoryManager
                stock={stock}
                onAddStockItem={handleAddStockItem}
                onUpdateQuantity={handleUpdateQuantity}
                onDeleteStockItem={handleDeleteStockItem}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR - EXACT UX REPRODUCTION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-lg px-2 py-1 flex justify-around items-center z-50">
        <button
          onClick={() => setActiveTab('painel')}
          className={`flex flex-col items-center gap-0.5 p-2 text-center flex-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'painel' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Gauge size={18} />
          <span className="text-[9px]">Painel</span>
        </button>
        <button
          onClick={() => setActiveTab('clientes')}
          className={`flex flex-col items-center gap-0.5 p-2 text-center flex-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'clientes' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users size={18} />
          <span className="text-[9px]">Clientes</span>
        </button>
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center gap-0.5 p-2 text-center flex-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'agenda' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar size={18} />
          <span className="text-[9px]">Agenda</span>
        </button>
        <button
          onClick={() => setActiveTab('financeiro')}
          className={`flex flex-col items-center gap-0.5 p-2 text-center flex-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'financeiro' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <DollarSign size={18} />
          <span className="text-[9px]">Financeiro</span>
        </button>
        <button
          onClick={() => setActiveTab('orcamentos')}
          className={`flex flex-col items-center gap-0.5 p-2 text-center flex-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'orcamentos' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText size={18} />
          <span className="text-[9px]">Orçamentos</span>
        </button>
        <button
          onClick={() => setActiveTab('estoque')}
          className={`flex flex-col items-center gap-0.5 p-2 text-center flex-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'estoque' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package size={18} />
          <span className="text-[9px]">Estoque</span>
        </button>
      </nav>
    </div>
  );
}
