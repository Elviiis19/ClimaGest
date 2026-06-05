import React from 'react';
import { MaintenanceRecord, FinancialTransaction, Budget } from '../types';
import { TrendingUp, FileText, CheckCircle, Clock, AlertCircle, Award } from 'lucide-react';

interface ServiceStatsProps {
  records: MaintenanceRecord[];
  finance: FinancialTransaction[];
  budgets: Budget[];
}

export const ServiceStats: React.FC<ServiceStatsProps> = ({ records, finance, budgets }) => {
  
  // 1. Calculate service type breakdown safely
  const serviceDistribution = {
    'Limpeza e Higienização': 0,
    'Carga de Gás': 0,
    'Troca de Peça': 0,
    'Instalação': 0,
    'Conserto': 0,
  };

  records.forEach((rec) => {
    const type = rec.serviceType;
    if (type in serviceDistribution) {
      serviceDistribution[type as keyof typeof serviceDistribution] += 1;
    } else {
      // fallback
      serviceDistribution['Limpeza e Higienização'] += 1;
    }
  });

  const totalServicesCount = records.length || 1;

  // 2. Budget Pipeline metrics
  const totalBudgetsCount = budgets.length || 1;
  const approvedBudgets = budgets.filter(b => b.status === 'Aprovado').length;
  const sentBudgets = budgets.filter(b => b.status === 'Enviado').length;
  const draftBudgets = budgets.filter(b => b.status === 'Rascunho').length;
  const conversionRate = Math.round((approvedBudgets / totalBudgetsCount) * 100);

  // 3. Finance totals (Receitas x Despesas of PAGOS)
  const monthlyRevenue = finance
    .filter(t => t.type === 'receita' && t.status === 'pago')
    .reduce((sum, t) => sum + t.value, 0);

  const monthlyExpense = finance
    .filter(t => t.type === 'despesa' && t.status === 'pago')
    .reduce((sum, t) => sum + t.value, 0);

  const profitMargin = monthlyRevenue > 0 
    ? Math.round(((monthlyRevenue - monthlyExpense) / monthlyRevenue) * 100) 
    : 0;

  // Color matching dictionary for service categories
  const categoryColors = {
    'Limpeza e Higienização': { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-100', fill: '#3b82f6' },
    'Carga de Gás': { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-100', fill: '#06b6d4' },
    'Troca de Peça': { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-100', fill: '#f59e0b' },
    'Instalação': { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-100', fill: '#10b981' },
    'Conserto': { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-100', fill: '#6366f1' },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
      
      {/* CARD 1: SERVICE TYPE BREAKDOWN CHART */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:border-slate-200 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
              <Award size={16} className="text-blue-600" />
              Volume de Serviços Climatização
            </h3>
            <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded">Fórmula Preventiva</span>
          </div>
          
          <div className="space-y-3.5 mt-4">
            {Object.entries(serviceDistribution).map(([category, count]) => {
              const config = categoryColors[category as keyof typeof categoryColors] || categoryColors['Limpeza e Higienização'];
              const pct = Math.round((count / totalServicesCount) * 100);
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${config.bg}`} />
                      {category}
                    </span>
                    <span className="text-slate-800 font-bold">{count} ({pct}%)</span>
                  </div>
                  
                  {/* Customized SVG/Tailwind Progress Rail */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${config.bg} rounded-full transition-all`} 
                      style={{ width: `${pct || 1}%`, duration: '1s' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 p-3 rounded-xl border border-blue-50 flex items-center gap-2 mt-4 text-[11px] text-slate-600">
          <TrendingUp size={14} className="text-blue-600 shrink-0" />
          <span>O serviço de <strong className="text-blue-800 font-bold">Higienização</strong> representa a maior recorrência fixa da sua carteira comercial.</span>
        </div>
      </div>

      {/* CARD 2: BUDGET CONVERSION & PIPELINE BAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:border-slate-200 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
              <FileText size={16} className="text-purple-600" />
              Taxa de Conversão de Orçamentos
            </h3>
            <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-100">Funil de Vendas</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/30">
              <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider">Aprovados</span>
              <p className="text-lg font-black text-emerald-800 mt-1">{approvedBudgets}</p>
            </div>

            <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/30">
              <span className="text-[9px] uppercase font-bold text-blue-600 tracking-wider">Enviados</span>
              <p className="text-lg font-black text-blue-800 mt-1">{sentBudgets}</p>
            </div>

            <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Rascunhos</span>
              <p className="text-lg font-black text-slate-700 mt-1">{draftBudgets}</p>
            </div>
          </div>

          {/* Metric conversion ring or dynamic bar */}
          <div className="mt-5 bg-slate-50/50 rounded-xl p-4 border border-slate-150 relative space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-700 block">Conversão Geral</span>
                <span className="text-[10px] text-slate-400 font-medium">Orçamentos que viraram receitas</span>
              </div>
              
              <div className="px-3 py-1 bg-white rounded-lg border border-slate-200 text-xs font-black text-emerald-600 shadow-3xs flex items-center gap-1">
                <CheckCircle size={12} />
                <span>{conversionRate}% taxa</span>
              </div>
            </div>

            {/* Custom SVG gauge line */}
            <div className="relative pt-1">
              <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-slate-200">
                <div 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all" 
                  style={{ width: `${Math.min(100, Math.max(5, conversionRate))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business diagnosis feedback */}
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between text-xs font-bold border-t border-slate-50 pt-3">
            <span className="text-slate-400 flex items-center gap-1 font-medium text-[10px]">
              <Clock size={11} className="text-purple-500" /> Lucro Líquido p/ Receita
            </span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded tracking-wide font-extrabold text-[10px] border border-emerald-100">
              {profitMargin}% de Margem
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
