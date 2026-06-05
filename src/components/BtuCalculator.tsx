import React, { useState } from 'react';
import { Sun, Users, Monitor, ShieldCheck, Copy, Check, Info } from 'lucide-react';

export const BtuCalculator: React.FC = () => {
  const [area, setArea] = useState<number>(12);
  const [sunExposure, setSunExposure] = useState<'shaded' | 'sunny'>('shaded');
  const [people, setPeople] = useState<number>(2);
  const [appliances, setAppliances] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>('Sala de Estar');

  // Calculates BTUs
  const baseFactor = sunExposure === 'shaded' ? 600 : 800;
  
  // Base calculation: (Area * factor) + (extra occupants * factor) + (appliances * factor)
  const calculatedBtu = (area * baseFactor) + 
                        (Math.max(0, people - 1) * baseFactor) + 
                        (appliances * baseFactor);

  // Suggests commercial sizing based on exact calculation
  const getSizingSuggestion = (btu: number) => {
    if (btu <= 9000) return { size: '9.000 BTU', model: 'Split Hi-Wall ou Janela' };
    if (btu <= 12000) return { size: '12.000 BTU', model: 'Split Hi-Wall / Inverter' };
    if (btu <= 18000) return { size: '18.000 BTU', model: 'Split Hi-Wall / Cassete' };
    if (btu <= 24000) return { size: '24.000 BTU', model: 'Split Hi-Wall / Piso-Teto' };
    if (btu <= 30000) return { size: '30.000 BTU', model: 'Piso-Teto / Cassete' };
    if (btu <= 36000) return { size: '36.000 BTU', model: 'Piso-Teto / Cassete central' };
    return { size: '60.000 BTU', model: 'Piso-Teto ou Central Dutado' };
  };

  const suggestion = getSizingSuggestion(calculatedBtu);

  // Handles copying proposal template to clipboard
  const handleCopy = () => {
    const textToCopy = `❄️ *Clima Gest PRO - Dimensionamento Térmico*
---------------------------------------
📍 *Local:* ${roomName}
📐 *Área do Ambiente:* ${area} m²
☀️ *Exposição Solar:* ${sunExposure === 'shaded' ? 'Manhã / Sombra' : 'Sol da Tarde / Intenso'}
👥 *Número de Ocupantes:* ${people} pessoa(s)
💻 *Eletrodomésticos/Luzes:* ${appliances} unidade(s)

📊 *Carga Térmica Exata:* ${calculatedBtu.toLocaleString('pt-BR')} BTUs
💡 *Equipamento Sugerido:* Ar Condicionado de *${suggestion.size}* (${suggestion.model})

_Cálculo técnico padrão PMOC de eficiência energética._`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 animate-in fade-in duration-250 hover:border-slate-200 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Sun className="animate-spin text-amber-500" style={{ animationDuration: '10s' }} size={18} />
          </span>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base leading-tight">Dimensionador Térmico (BTUs)</h3>
            <p className="text-[10px] text-slate-400 font-medium">Estudo de carga térmica sob normas de climatização</p>
          </div>
        </div>
        
        {/* Copy proposal badge */}
        <button
          onClick={handleCopy}
          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
            copied 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
          }`}
          title="Copiar relatório técnico em formato de texto para enviar no WhatsApp"
        >
          {copied ? <ShieldCheck size={11} className="text-green-600 animate-bounce" /> : <Copy size={11} />}
          <span>{copied ? 'Copiado!' : 'Copiar p/ WhatsApp'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left Inputs compartment */}
        <div className="space-y-3 bg-slate-50/40 p-4 rounded-xl border border-slate-100">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nome do Cômodo/Ambiente</label>
            <input 
              type="text" 
              className="w-full text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:border-blue-500 focus:outline-none"
              placeholder="Ex: Quarto Master, Escritório..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Área do Ambiente (m²)</label>
              <div className="relative">
                <input 
                  type="number" 
                  min="1"
                  className="w-full text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-extrabold focus:border-blue-500 focus:outline-none"
                  value={area}
                  onChange={(e) => setArea(Math.max(1, parseInt(e.target.value) || 0))}
                />
                <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-bold">m²</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Exposição Solar</label>
              <select 
                className="w-full text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:border-blue-500 focus:outline-none"
                value={sunExposure}
                onChange={(e) => setSunExposure(e.target.value as any)}
              >
                <option value="shaded">Manhã / Sombra</option>
                <option value="sunny">Sol Pleno (Tarde)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                <Users size={10} className="text-slate-400" /> Ocupantes (Pessoas)
              </label>
              <input 
                type="number" 
                min="1"
                className="w-full text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-extrabold focus:border-blue-500 focus:outline-none"
                value={people}
                onChange={(e) => setPeople(Math.max(1, parseInt(e.target.value) || 0))}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                <Monitor size={10} className="text-slate-400" /> Eletrônicos / Lâmpadas
              </label>
              <input 
                type="number" 
                min="0"
                className="w-full text-xs px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-extrabold focus:border-blue-500 focus:outline-none"
                value={appliances}
                onChange={(e) => setAppliances(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
          </div>
        </div>

        {/* Right Sizing analysis results */}
        <div className="flex flex-col justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-bold text-blue-600 block tracking-wider">Resultado da Carga</span>
            
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-800 tracking-tight">
                {calculatedBtu.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs font-black text-blue-700">BTU Exato</span>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Considerando a área de <strong className="text-slate-800">{area} m²</strong> com {people} ocupantes e {appliances} equipamentos adicionais, sob exposição solar de {sunExposure === 'shaded' ? 'manhã/sombra' : 'tarde/sol intenso'}.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-3xs space-y-1.5">
            <span className="text-[9px] uppercase font-bold text-blue-600 tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Equipamento Recomendado:
            </span>
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-slate-800">{suggestion.size}</h4>
              <span className="text-[9px] bg-slate-100 text-slate-600 font-extrabold px-1.5 py-0.5 rounded uppercase">
                {suggestion.model}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[9.5px] text-slate-400 font-medium pt-1 border-t border-slate-50">
              <Info size={11} className="text-blue-500 shrink-0" />
              <span>Sempre prefira modelos de categoria <strong>Inverter</strong> para economizar até 60% de energia.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
