import React, { useState } from 'react';
import { StockItem } from '../types';
import { Package, Plus, Trash2, ShieldAlert, BadgeInfo, CheckCircle } from 'lucide-react';

interface InventoryManagerProps {
  stock: StockItem[];
  onAddStockItem: (item: Omit<StockItem, 'id'>) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onDeleteStockItem: (id: string) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  stock,
  onAddStockItem,
  onUpdateQuantity,
  onDeleteStockItem
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [minQuantity, setMinQuantity] = useState('5');
  const [category, setCategory] = useState('Elétrica');
  const [priceBought, setPriceBought] = useState('');
  const [priceSell, setPriceSell] = useState('');

  const lowStockItems = stock.filter(item => item.quantity <= item.minQuantity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onAddStockItem({
      name,
      quantity: parseInt(quantity) || 0,
      minQuantity: parseInt(minQuantity) || 0,
      category,
      priceBought: parseFloat(priceBought) || 0,
      priceSell: parseFloat(priceSell) || 0
    });

    // Reset
    setName('');
    setQuantity('10');
    setMinQuantity('5');
    setPriceBought('');
    setPriceSell('');
    setIsAdding(false);
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6" id="inventory-manager-root">
      {/* ALERTS FOR LOW STOCK */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-start gap-3 animate-fade-in">
          <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-sm">Alerta de Estoque Baixo!</h3>
            <p className="text-xs text-amber-700 mt-0.5">
              Os seguintes componentes estão abaixo do limite mínimo recomendado e devem ser reabastecidos para evitar paradas em atendimentos de campo:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {lowStockItems.map(item => (
                <span key={item.id} className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 rounded font-semibold px-2 py-0.5">
                  {item.name} ({item.quantity} restando)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HEADER / BAR ACTIONS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Package size={20} />
          </span>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Controle de Estoque</h2>
            <p className="text-xs text-slate-400">Gerencie peças sobressalentes, cilindros de gás e suprimentos de instalação física</p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <Plus size={16} /> Adicionar Item ao Inventário
        </button>
      </div>

      {/* FORM: Register Stock Item */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-bold text-slate-800 text-base">Cadastrar Novo Item de Estoque</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Nome do Item / Peça *</label>
              <input
                required
                type="text"
                placeholder="Ex: Sensor de Degelo 10K Consul"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Categoria</label>
              <select
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Elétrica">Elétrica & Capacitores</option>
                <option value="Gases">Gases Refrigerantes</option>
                <option value="Sensores">Sensores / Placas</option>
                <option value="Ferragens">Ferragens / Suportes</option>
                <option value="Consumíveis">Fitas / Isolamento - Consumíveis</option>
                <option value="Outros">Outras Categorias</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Quantidade Atual *</label>
              <input
                required
                type="number"
                min="0"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Limite Mínimo *</label>
              <input
                required
                type="number"
                min="0"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Preço de Compra (R$)</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                value={priceBought}
                onChange={(e) => setPriceBought(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Preço Sugerido Venda (R$)</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                value={priceSell}
                onChange={(e) => setPriceSell(e.target.value)}
              />
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
              Salvar Peça no Estoque
            </button>
          </div>
        </form>
      )}

      {/* STOCK VIEW TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden" id="stock-table-view">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="p-4">Peça / Insumo</th>
                <th className="p-4">Categoria</th>
                <th className="p-4 text-center">Quantidade</th>
                <th className="p-4 text-center">Limite Alerta</th>
                <th className="p-4 text-right">Preço de Compra</th>
                <th className="p-4 text-right">Venda Consumidor</th>
                <th className="p-4 text-center">Status Estoque</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stock.map((item) => {
                const isUnderStock = item.quantity <= item.minQuantity;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-800">
                      {item.name}
                    </td>
                    <td className="p-4">
                      <span className="text-xs bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold w-6">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center text-slate-500 font-bold">
                      {item.minQuantity}
                    </td>
                    <td className="p-4 text-right font-mono text-slate-500">
                      {formatBRL(item.priceBought)}
                    </td>
                    <td className="p-4 text-right font-bold font-mono text-slate-800">
                      {formatBRL(item.priceSell)}
                    </td>
                    <td className="p-4 text-center">
                      {isUnderStock ? (
                        <span className="inline-flex gap-1 items-center text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                          Abastecer Urgente
                        </span>
                      ) : (
                        <span className="inline-flex gap-1 items-center text-xs font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
                          Estoque Seguro
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm('Deseja deletar este item do estoque?')) {
                            onDeleteStockItem(item.id);
                          }
                        }}
                        className="p-1 hover:bg-rose-50 text-rose-500 rounded transition-colors"
                        title="Deletar Item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
