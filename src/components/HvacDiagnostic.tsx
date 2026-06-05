import React, { useState } from 'react';
import { Gauge, Thermometer, ShieldAlert, CheckCircle2, Copy, HelpCircle, RefreshCw } from 'lucide-react';

interface RefrigerantData {
  name: string;
  // Pressure (psi) to Saturated Temperature (°C) approximations
  toTemp: (pressurePsi: number) => number;
}

// Simple empirical modeling for common refrigerants in normal HVAC ranges
const REFRIGERANTS: Record<string, RefrigerantData> = {
  'R410A': {
    name: 'R-410A (Padrão Inverter)',
    toTemp: (p) => 0.28 * p - 38.3, // Approximation around typical suction/liquid pressures
  },
  'R22': {
    name: 'R-22 (Sistemas Antigos)',
    toTemp: (p) => 0.44 * p - 32.1,
  },
  'R32': {
    name: 'R-32 (Nova Geração)',
    toTemp: (p) => 0.27 * p - 37.8,
  },
  'R134a': {
    name: 'R-134a (Automotivo / Balcões)',
    toTemp: (p) => 0.58 * p - 27.5,
  }
};

export const HvacDiagnostic: React.FC = () => {
  const [gasType, setGasType] = useState<string>('R410A');
  
  // States for Superheat
  const [suctionPressure, setSuctionPressure] = useState<number>(120); // psi
  const [suctionLineTemp, setSuctionLineTemp] = useState<number>(12); // °C
  
  // States for Subcooling
  const [liquidPressure, setLiquidPressure] = useState<number>(340); // psi
  const [liquidLineTemp, setLiquidLineTemp] = useState<number>(38); // °C

  const [copied, setCopied] = useState<boolean>(false);

  // Saturated temperatures calculated from pressure
  const gasData = REFRIGERANTS[gasType];
  const satEvapTemp = parseFloat(gasData.toTemp(suctionPressure).toFixed(1));
  const satCondTemp = parseFloat(gasData.toTemp(liquidPressure).toFixed(1));

  // Calculations
  const superheat = parseFloat((suctionLineTemp - satEvapTemp).toFixed(1));
  const subcooling = parseFloat((satCondTemp - liquidLineTemp).toFixed(1));

  // Diagnostic feedback
  const getSuperheatStatus = (sh: number) => {
    if (sh <= 0) return { label: 'Risco de Retorno de Líquido', desc: ' compressor corre risco de calço hidráulico.', color: 'text-rose-600 bg-rose-50 border-rose-100' };
    if (sh < 5) return { label: 'Superaquecimento Baixo', desc: 'Excesso de gás ou alta umidade na serpentina.', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    if (sh <= 11) return { label: 'Ideal (Normal)', desc: 'Carga de fluído correta no compressor.', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    return { label: 'Superaquecimento Alto (Insuficiente)', desc: 'Falta de gás, vazamento ou obstrução no expansor.', color: 'text-rose-600 bg-rose-50 border-rose-100' };
  };

  const getSubcoolingStatus = (sc: number) => {
    if (sc < 4) return { label: 'Subresfriamento Baixo', desc: 'Falta de fluído ou ineficiência no compressor.', color: 'text-rose-600 bg-rose-50 border-rose-100' };
    if (sc <= 10) return { label: 'Ideal (Normal)', desc: 'Condensação de alta performance.', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    return { label: 'Subresfriamento Alto', desc: 'Excesso de gás ou condensadora suja/com restrição.', color: 'text-amber-600 bg-amber-50 border-amber-100' };
  };

  const shStatus = getSuperheatStatus(superheat);
  const scStatus = getSubcoolingStatus(subcooling);

  const handleCopyReport = () => {
    const text = `❄️ *Clima Gest PRO - Prontuário de Ciclo de Refrigeração*
---------------------------------------
🧪 *Fluído Refrigerante:* ${gasData.name}

🔵 *SUPERAQUECIMENTO (Evaporação / Sucção):*
- Pressão de Sucção: ${suctionPressure} PSI
- Temp. Saturação (T1): ${satEvapTemp}°C
- Temp. Tubo de Sucção (T2): ${suctionLineTemp}°C
- *Superaquecimento Calculado:* ${superheat}°C
- *Diagnóstico:* ${shStatus.label}

🔴 *SUBRESFRIAMENTO (Condensação / Líquido):*
- Pressão de Alta: ${liquidPressure} PSI
- Temp. Saturação (T3): ${satCondTemp}°C
- Temp. Tubo de Líquido (T4): ${liquidLineTemp}°C
- *Subresfriamento Calculado:* ${subcooling}°C
- *Diagnóstico:* ${scStatus.label}

_Análise de engenharia térmica realizada via Clima Gest App._`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:border-slate-200 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Gauge size={18} className="animate-pulse" />
          </span>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base leading-tight">Diagnóstico Avançado de Gás</h3>
            <p className="text-[10px] text-slate-400 font-medium">Análise de Rendimento, Superaquecimento e Subresfriamento</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refrigerant Selector */}
          <select
            className="text-[11px] font-extrabold p-2 border border-slate-200 bg-slate-50 text-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={gasType}
            onChange={(e) => setGasType(e.target.value)}
          >
            {Object.keys(REFRIGERANTS).map(key => (
              <option key={key} value={key}>{REFRIGERANTS[key].name}</option>
            ))}
          </select>

          <button
            onClick={handleCopyReport}
            className={`px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              copied 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {copied ? <CheckCircle2 size={11} className="text-green-600" /> : <Copy size={11} />}
            <span>{copied ? 'Copiado!' : 'Copiar Laudo'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* COMPONENT 1: SUPERAQUECIMENTO (SUCTION SIDE/EVAPORATOR) */}
        <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/15 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Lado de Baixa Pressão (Sucção)
            </span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded-md">
              Superaquecimento (SH)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pressão de Sucção (Manifold)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg text-slate-850 font-extrabold focus:border-indigo-500 bg-white"
                  value={suctionPressure}
                  onChange={(e) => setSuctionPressure(Math.max(1, parseInt(e.target.value) || 0))}
                />
                <span className="absolute right-2 top-2 text-[10px] font-black text-slate-400">PSI</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Temp. na Linha de Sucção (Tubaço)</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg text-slate-850 font-extrabold focus:border-indigo-500 bg-white"
                  value={suctionLineTemp}
                  onChange={(e) => setSuctionLineTemp(parseFloat(e.target.value) || 0)}
                />
                <span className="absolute right-2 top-2 text-[10px] font-black text-slate-400">°C</span>
              </div>
            </div>
          </div>

          {/* Saturated Temp calculation helper */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1"><Thermometer size={12} className="text-blue-500" /> Saturação Teórica (T-Saturado)</span>
            <span className="font-extrabold text-slate-800">{satEvapTemp}°C</span>
          </div>

          {/* SUPERHEAT DIAGNOSTIC DISPLAY */}
          <div className={`p-3 rounded-xl border ${shStatus.color} space-y-1`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase">Superaquecimento Reclutado:</span>
              <span className="text-base font-black">{superheat}°C</span>
            </div>
            <p className="text-[10.5px] font-bold flex items-center gap-1">
              <ShieldAlert size={12} className="shrink-0" />
              <span>{shStatus.label}: {shStatus.desc}</span>
            </p>
          </div>
        </div>

        {/* COMPONENT 2: SUBRESFRIAMENTO (LIQUID SIDE/CONDENSER) */}
        <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/15 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-rose-700 uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Lado de Alta Pressão (Líquido)
            </span>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.2 rounded-md">
              Subresfriamento (SC)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pressão de Alta (Descarga)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg text-slate-850 font-extrabold focus:border-indigo-500 bg-white"
                  value={liquidPressure}
                  onChange={(e) => setLiquidPressure(Math.max(1, parseInt(e.target.value) || 0))}
                />
                <span className="absolute right-2 top-2 text-[10px] font-black text-slate-400">PSI</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Temp. Linha de Líquido (Saída)</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg text-slate-850 font-extrabold focus:border-indigo-500 bg-white"
                  value={liquidLineTemp}
                  onChange={(e) => setLiquidLineTemp(parseFloat(e.target.value) || 0)}
                />
                <span className="absolute right-2 top-2 text-[10px] font-black text-slate-400">°C</span>
              </div>
            </div>
          </div>

          {/* Saturated Condensing Temp calculation helper */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1"><Thermometer size={12} className="text-rose-500" /> Saturação Condensação (T-Saturado)</span>
            <span className="font-extrabold text-slate-800">{satCondTemp}°C</span>
          </div>

          {/* SUBCOOLING DIAGNOSTIC DISPLAY */}
          <div className={`p-3 rounded-xl border ${scStatus.color} space-y-1`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase">Subresfriamento Reclutado:</span>
              <span className="text-base font-black">{subcooling}°C</span>
            </div>
            <p className="text-[10.5px] font-bold flex items-center gap-1">
              <ShieldAlert size={12} className="shrink-0" />
              <span>{scStatus.label}: {scStatus.desc}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
