import React, { useState } from 'react';
import { Budget, Client, ServiceItem } from '../types';
import { FileText, Plus, Trash2, FileDown, MessageSquare, Check, Sparkles, PlusCircle } from 'lucide-react';
import { generateBudgetPDF } from '../utils/pdfGenerator';

interface BudgetManagerProps {
  budgets: Budget[];
  clients: Client[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onUpdateBudgetStatus: (id: string, status: Budget['status']) => void;
  onDeleteBudget: (id: string) => void;
}

const SERVICE_PRESETS = [
  { label: 'Limpeza', desc: 'Limpeza e Higienização Geral com Bolsa Coletora e Bactericida', price: 220 },
  { label: 'Instalação', desc: 'Instalação Completa de Ar Condicionado Split com Tubulação cobre de até 3m', price: 600 },
  { label: 'Manutenção', desc: 'Manutenção corretiva com substituição de capacitor e limpeza de filtros', price: 250 },
  { label: 'Recarga de gás', desc: 'Recarga de Gás Ecológico R410A / R22 com pressurização e vácuo', price: 250 }
];

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  budgets,
  clients,
  onAddBudget,
  onUpdateBudgetStatus,
  onDeleteBudget
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [observations, setObservations] = useState('Garantia de 90 dias nos serviços prestados. Pagamento à vista com 5% de desconto.');
  
  // Custom multi-row items
  const [rows, setRows] = useState<ServiceItem[]>([
    { description: 'Limpeza e Higienização de Ar Condicionado Split', quantity: 1, price: 220 }
  ]);

  const addRow = () => {
    setRows([...rows, { description: '', quantity: 1, price: 0 }]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof ServiceItem, value: any) => {
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      [field]: field === 'description' ? value : parseFloat(value) || 0
    };
    setRows(updated);
  };

  // Preset quick fill
  const applyPreset = (index: number, preset: typeof SERVICE_PRESETS[0]) => {
    const updated = [...rows];
    updated[index] = {
      description: preset.desc,
      quantity: 1,
      price: preset.price
    };
    setRows(updated);
  };

  const calculateTotal = () => {
    return rows.reduce((sum, row) => sum + (row.quantity * row.price), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert('Selecione um cliente primeiro.');
      return;
    }
    const total = calculateTotal();
    onAddBudget({
      clientId,
      date,
      status: 'Rascunho',
      services: rows,
      totalValue: total,
      observations
    });

    // Reset
    setRows([{ description: 'Limpeza e Higienização de Ar Condicionado Split', quantity: 1, price: 220 }]);
    setIsAdding(false);
  };

  // WhatsApp Send helper
  const handleSendBudgetWhatsApp = (budget: Budget) => {
    const client = clients.find(c => c.id === budget.clientId);
    if (!client) return;

    let itemsText = budget.services.map(i => `• ${i.description} (x${i.quantity}) - R$ ${(i.price * i.quantity).toFixed(2)}`).join('\n');
    
    const message = `Olá, *${client.name}*!\nSeguem os detalhes do seu orçamento de Climatização da *Clima Gest*:\n\n*Serviços Orçados:*\n${itemsText}\n\n*Valor Total:* R$ ${budget.totalValue.toFixed(2)}\n\n*Observações:*\n${budget.observations}\n\nEstou lhe enviando o relatório oficial em PDF por aqui também. Ficamos no aguardo de sua aprovação!`;
    
    const formattedPhone = client.phone.startsWith('55') ? client.phone : `55${client.phone}`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6" id="budget-manager-root">
      {/* HEADER / ACTIONS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FileText size={20} />
          </span>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Central de Orçamentos</h2>
            <p className="text-xs text-slate-400">Monte propostas profissionais e envie rapidamente para os clientes</p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 font-bold bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <Plus size={16} /> {isAdding ? 'Ver Todos Orçamentos' : 'Novo Orçamento'}
        </button>
      </div>

      {isAdding ? (
        /* CREATE FORM */
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
          <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
            <PlusCircle size={18} className="text-blue-600" /> Novo Orçamento para Cliente
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Escolher Cliente *</label>
                <select
                  required
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Data de Emissão</label>
                <input
                  type="date"
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-600"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            {/* Service Rows Detail */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Itens e Serviços inclusos</span>
                <button
                  type="button"
                  onClick={addRow}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Adicionar Serviço
                </button>
              </div>

              <div className="space-y-3">
                {rows.map((row, index) => (
                  <div key={index} className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">Serviço #{index + 1}</span>
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="text-[10px] text-rose-500 hover:underline flex items-center gap-0.5"
                        >
                          <Trash2 size={10} /> Remover
                        </button>
                      )}
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase mr-1">Rápido:</span>
                      {SERVICE_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => applyPreset(index, preset)}
                          className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-6">
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Descrição do Serviço</label>
                        <input
                          type="text"
                          placeholder="EX: Limpeza Split Hi-Wall 12000 BTUs..."
                          required
                          className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-750 focus:outline-none"
                          value={row.description}
                          onChange={(e) => updateRow(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Qtd</label>
                        <input
                          type="number"
                          min="1"
                          required
                          className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none text-center"
                          value={row.quantity}
                          onChange={(e) => updateRow(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Vl. Unitário (R$)</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          required
                          className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none text-right"
                          value={row.price || ''}
                          onChange={(e) => updateRow(index, 'price', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2 flex flex-col justify-end text-right pr-2">
                        <span className="text-[9px] text-slate-400 font-bold">Subtotal</span>
                        <span className="text-xs font-bold text-slate-700">R$ {(row.quantity * row.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General observations */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Garantias, Condições e Observações do Orçamento</label>
              <textarea
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none h-20 text-slate-700"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>

            {/* Calculations and Actions Footer */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
              <div>
                <span className="text-xs text-slate-500">Valor Total Geral</span>
                <h4 className="text-2xl font-black text-blue-600">
                  R$ {calculateTotal().toFixed(2)}
                </h4>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="w-1/2 md:w-auto px-5 py-2.5 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 md:w-auto px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-xs"
                >
                  Salvar Orçamento
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* BUDGET LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="budget-list-grid">
          {budgets.map((budget) => {
            const client = clients.find(c => c.id === budget.clientId);
            return (
              <div
                key={budget.id}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-100 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      #{budget.id.toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      budget.status === 'Aprovado' ? 'bg-green-50 text-green-700' :
                      budget.status === 'Enviado' ? 'bg-amber-50 text-amber-700' :
                      budget.status === 'Recusado' ? 'bg-rose-50 text-rose-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {budget.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-base mt-2">{client?.name || 'Cliente excluído'}</h3>
                  <p className="text-xs text-slate-400">{new Date(budget.date).toLocaleDateString('pt-BR')}</p>

                  {/* Items list summary */}
                  <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                    {budget.services.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-600">
                        <span className="truncate max-w-[150px]">{item.description}</span>
                        <span className="font-semibold text-slate-700">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Total</span>
                    <span className="font-extrabold text-blue-600 text-lg">R$ {budget.totalValue.toFixed(2)}</span>
                  </div>

                  {/* Status Toggle quick action */}
                  <div className="flex items-center gap-1 shadow-2xs p-1 bg-slate-50 rounded-lg">
                    <span className="text-[9px] font-bold text-slate-400 pl-1">Status:</span>
                    {(['Rascunho', 'Enviado', 'Aprovado', 'Recusado'] as Budget['status'][]).map((st) => (
                      <button
                        key={st}
                        onClick={() => onUpdateBudgetStatus(budget.id, st)}
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded transition-all flex-1 text-center cursor-pointer ${
                          budget.status === st
                            ? 'bg-blue-600 text-white shadow-3xs'
                            : 'text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Quick Share buttons */}
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <button
                      onClick={() => {
                        const parsedClient = client || { name: 'Cliente', phone: '', address: '', notes: '', returnPreference: 'none' as const };
                        generateBudgetPDF(budget, parsedClient);
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <FileDown size={12} /> PDF
                    </button>
                    <button
                      onClick={() => handleSendBudgetWhatsApp(budget)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <MessageSquare size={12} /> WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Deseja realmente deletar este orçamento?')) {
                          onDeleteBudget(budget.id);
                        }
                      }}
                      className="p-2 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Orçamento"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {budgets.length === 0 && (
            <div className="col-span-full text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FileText className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-sm text-slate-400">Nenhum orçamento cadastrado ainda.</p>
              <button onClick={() => setIsAdding(true)} className="text-blue-600 font-bold text-sm mt-1 hover:underline">
                Criar primeiro orçamento
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
