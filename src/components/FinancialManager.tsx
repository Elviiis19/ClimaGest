import React, { useState } from 'react';
import { FinancialTransaction } from '../types';
import { DollarSign, Plus, ArrowUpRight, ArrowDownRight, Trash2, Calendar, FileDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { generateFinancialReportPDF } from '../utils/pdfGenerator';

interface FinancialManagerProps {
  transactions: FinancialTransaction[];
  onAddTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  onUpdateTxStatus: (id: string, status: FinancialTransaction['status']) => void;
  onDeleteTransaction: (id: string) => void;
}

export const FinancialManager: React.FC<FinancialManagerProps> = ({
  transactions,
  onAddTransaction,
  onUpdateTxStatus,
  onDeleteTransaction
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<'dia' | 'semana' | 'mes' | 'total'>('total');
  
  // Form states
  const [type, setType] = useState<'receita' | 'despesa'>('receita');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'pago' | 'pendente'>('pago');
  const [category, setCategory] = useState('Serviço');

  // Filter logic based on date
  const getFilteredTransactions = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDate = new Date(todayStr);

    return transactions.filter(t => {
      if (filterPeriod === 'total') return true;

      const tDate = new Date(t.date);
      const diffTime = Math.abs(todayDate.getTime() - tDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (filterPeriod === 'dia') {
        return t.date === todayStr;
      }
      if (filterPeriod === 'semana') {
        return diffDays <= 7;
      }
      if (filterPeriod === 'mes') {
        return diffDays <= 30;
      }
      return true;
    });
  };

  const filtered = getFilteredTransactions();

  // Calculations for display cards (only taking actual transaction amounts)
  const totalReceitas = filtered
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.value, 0);

  const totalDespesas = filtered
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.value, 0);

  const profit = totalReceitas - totalDespesas;

  const contasAPagarPendentes = transactions
    .filter(t => t.type === 'despesa' && t.status === 'pendente')
    .reduce((sum, t) => sum + t.value, 0);

  const contasAReceberPendentes = transactions
    .filter(t => t.type === 'receita' && t.status === 'pendente')
    .reduce((sum, t) => sum + t.value, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !value) return;

    onAddTransaction({
      type,
      description,
      value: parseFloat(value) || 0,
      date,
      status,
      category
    });

    setDescription('');
    setValue('');
    setIsAdding(false);
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6" id="financial-manager-root">
      {/* COUNTERS PANEL (Exact look as in user photos!) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="financial-scorecard">
        {/* Real-time entradas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Entradas / Receitas</span>
            <span className="text-2xl font-black text-green-600 block">{formatBRL(totalReceitas)}</span>
            <span className="text-[10px] text-emerald-500 font-semibold">Total no período</span>
          </div>
          <span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <ArrowUpRight size={24} />
          </span>
        </div>

        {/* Real-time saídas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Saídas / Despesas</span>
            <span className="text-2xl font-black text-rose-600 block">{formatBRL(totalDespesas)}</span>
            <span className="text-[10px] text-rose-450 font-semibold text-rose-500">Gasto operacional</span>
          </div>
          <span className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <ArrowDownRight size={24} />
          </span>
        </div>

        {/* Real-time Saldo líquido / lucro */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Lucro Líquido</span>
            <span className={`text-2xl font-black block ${profit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              {formatBRL(profit)}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Faturamento líquido</span>
          </div>
          <span className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <DollarSign size={24} />
          </span>
        </div>
      </div>

      {/* PENDING BILLS CARDS (Contas a Pagar & Receber) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-100/50 p-4 rounded-2xl border border-slate-200/50">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
            <AlertTriangle size={18} />
          </span>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Contas a Receber (Pendentes)</span>
            <span className="text-base font-bold text-amber-700">{formatBRL(contasAReceberPendentes)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200/80 pt-3 md:pt-0 md:pl-4">
          <span className="p-2.5 bg-red-50 rounded-xl text-red-600">
            <DollarSign size={18} />
          </span>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Contas a Pagar (A Vencer)</span>
            <span className="text-base font-bold text-red-600">{formatBRL(contasAPagarPendentes)}</span>
          </div>
        </div>
      </div>

      {/* FILTER & CONTROL BAR (From user screenshot: "Dia", "Semana", "Mês", "Período") */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        {/* Toggle choices */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          {(['dia', 'semana', 'mes', 'total'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPeriod(p)}
              className={`text-xs font-bold px-4 py-2 rounded-lg text-center flex-1 cursor-pointer transition-all ${
                filterPeriod === p
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              {p === 'dia' ? 'Dia' : p === 'semana' ? 'Semana' : p === 'mes' ? 'Mês' : 'Todo Período'}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => generateFinancialReportPDF(filtered, filterPeriod === 'dia' ? 'Hoje' : filterPeriod === 'semana' ? 'Últimos 7 dias' : filterPeriod === 'mes' ? 'Últimos 30 dias' : 'Todo Período')}
            className="flex items-center justify-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex-1 md:flex-initial"
          >
            <FileDown size={14} /> PDF Relatório
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex-1 md:flex-initial"
          >
            <Plus size={14} /> Lançar Fluxo
          </button>
        </div>
      </div>

      {/* ADD TRANSACTION IN-LINE MODAL */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-bold text-slate-800 text-base">Lançar Nova Transação Financeira</h3>
          
          {/* Toggle Type */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setType('receita'); setCategory('Serviço'); }}
              className={`py-2 text-xs font-bold rounded-lg text-center transition-all cursor-pointer ${
                type === 'receita' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              Receita / Entrada (+)
            </button>
            <button
              type="button"
              onClick={() => { setType('despesa'); setCategory('Peças'); }}
              className={`py-2 text-xs font-bold rounded-lg text-center transition-all cursor-pointer ${
                type === 'despesa' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              Despesa / Saída (-)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Descrição Comercial</label>
              <input
                required
                type="text"
                placeholder="Ex: Instalação ar condicionado - Rafael Silva"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Valor da Operação (R$)</label>
              <input
                required
                type="number"
                placeholder="0.00"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Data de Lançamento</label>
              <input
                type="date"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-600"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Categoria de Serviço</label>
              <select
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {type === 'receita' ? (
                  <>
                    <option value="Serviço">Manutenção / Serviço</option>
                    <option value="Venda Peça">Venda de Equipamento/Peça</option>
                    <option value="Contrato Comercial">Contrato de Manutenção PMOC</option>
                    <option value="Outros">Outras Entradas</option>
                  </>
                ) : (
                  <>
                    <option value="Transporte">Combustível / Pedágio - Transporte</option>
                    <option value="Peças">Peça de Reposição (Capacitores etc)</option>
                    <option value="Ferramentas">Ferramentas de Medição</option>
                    <option value="Gás">Cilindros de Gás</option>
                    <option value="Marketing">Divulgação / Cartões</option>
                    <option value="Outros">Despesas Gerais</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Status da Transação</label>
              <select
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="pago">Liquidado / Pago</option>
                <option value="pendente">Pendente / Em Aberto</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-medium rounded-xl hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700"
            >
              Confirmar Lançamento
            </button>
          </div>
        </form>
      )}

      {/* TRANSACTION HISTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden" id="transaction-table-view">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500 uppercase">Lista de Transações ({filtered.length})</span>
          <span className="text-[10px] text-slate-400">Total cadastrado no período</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="p-4">Data</th>
                <th className="p-4">Descrição</th>
                <th className="p-4">Categoria</th>
                <th className="p-4 text-center">Fluxo</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Valor</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono text-[11px] text-slate-400">
                    {t.date.split('-').reverse().join('/')}
                  </td>
                  <td className="p-4 font-medium text-slate-800">
                    {t.description}
                  </td>
                  <td className="p-4">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
                      {t.category}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {t.type === 'receita' ? (
                      <span className="inline-flex gap-1 items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Entrada
                      </span>
                    ) : (
                      <span className="inline-flex gap-1 items-center text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        Saída
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => onUpdateTxStatus(t.id, t.status === 'pago' ? 'pendente' : 'pago')}
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer hover:opacity-85 ${
                        t.status === 'pago'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                      title="Clique para alternar o status"
                    >
                      {t.status === 'pago' ? 'Pago' : 'Pendente'}
                    </button>
                  </td>
                  <td className={`p-4 text-right font-black ${t.type === 'receita' ? 'text-green-600' : 'text-rose-600'}`}>
                    {t.type === 'receita' ? '+' : '-'} {formatBRL(t.value)}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onDeleteTransaction(t.id)}
                      className="p-1 hover:bg-rose-50 text-rose-500 rounded transition-colors"
                      title="Deletar Transação"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    Nenhuma movimentação lançada neste período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
