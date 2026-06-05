import React, { useState } from 'react';
import { Scheduling, Client } from '../types';
import { Calendar, Plus, MessageSquare, Trash2, Check, Clock, MapPin, CheckCircle, Smartphone } from 'lucide-react';

interface AgendaManagerProps {
  schedulings: Scheduling[];
  clients: Client[];
  onAddScheduling: (sch: Omit<Scheduling, 'id'>) => void;
  onUpdateSchStatus: (id: string, status: Scheduling['status']) => void;
  onDeleteScheduling: (id: string) => void;
}

export const AgendaManager: React.FC<AgendaManagerProps> = ({
  schedulings,
  clients,
  onAddScheduling,
  onUpdateSchStatus,
  onDeleteScheduling
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('2026-05-14'); // matching user's templates initially

  // New Scheduling Form State
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [serviceType, setServiceType] = useState<Scheduling['serviceType']>('Limpeza');
  const [value, setValue] = useState('220');
  const [description, setDescription] = useState('');

  // Generate calendar days strip centered around the selected date
  const calendarDays = [
    { label: 'Dom', num: '10', fullDate: '2026-05-10' },
    { label: 'Seg', num: '11', fullDate: '2026-05-11' },
    { label: 'Ter', num: '12', fullDate: '2026-05-12' },
    { label: 'Qua', num: '13', fullDate: '2026-05-13' },
    { label: 'Qui', num: '14', fullDate: '2026-05-14' },
    { label: 'Sex', num: '15', fullDate: '2026-05-15' },
    { label: 'Sáb', num: '16', fullDate: '2026-05-16' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    onAddScheduling({
      clientId,
      date,
      time,
      serviceType,
      value: parseFloat(value) || 0,
      status: 'Agendado',
      description
    });

    // Reset
    setDescription('');
    setValue('220');
    setIsAdding(false);
    setSelectedDate(date); // auto-center to created date
  };

  const filteredSchedulings = schedulings.filter(s => s.date === selectedDate);

  const getClientData = (id: string) => {
    return clients.find(c => c.id === id);
  };

  const handleSendReminderWhatsApp = (sch: Scheduling) => {
    const client = getClientData(sch.clientId);
    if (!client) return;

    const formattedDate = sch.date.split('-').reverse().join('/');
    const msg = `Olá *${client.name}*, passando para confirmar o agendamento de seu atendimento de *${sch.serviceType}* climatização comigo no dia *${formattedDate}* às *${sch.time}*.\n\nEndereço: ${client.address || 'Cadastrado'}\n\nAbraços, Clima Gest!`;
    
    const formattedPhone = client.phone.startsWith('55') ? client.phone : `55${client.phone}`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6" id="agenda-manager-root">
      
      {/* SCHEDULER LAYOUT */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar size={20} />
            </span>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Folha de Agenda</h2>
              <p className="text-xs text-slate-400">Arraste rápidos lembretes de visitas e instalações agendadas no dia</p>
            </div>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            <Plus size={16} /> Agendar Visita
          </button>
        </div>

        {/* INPUT DATE FIELD FOR RAPID DRILL DOWN */}
        <div className="flex items-center gap-2 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200/50">
          <span className="text-xs text-slate-500 font-bold uppercase">Ir para Data:</span>
          <input
            type="date"
            className="text-xs font-semibold p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* CALENDAR WEEK STRIP - EXACT REPRODUCTION FROM USER SCREENSHOT! */}
        <div className="mb-6">
          <div className="text-center font-bold text-slate-500 uppercase text-xs mb-3">
            maio de 2026
          </div>
          <div className="grid grid-cols-7 gap-2 max-w-xl mx-auto">
            {calendarDays.map((day) => {
              const isSelected = selectedDate === day.fullDate;
              // Check if any schedulings on this day
              const hasServices = schedulings.some(s => s.date === day.fullDate);

              return (
                <div
                  key={day.fullDate}
                  onClick={() => setSelectedDate(day.fullDate)}
                  className={`p-3 rounded-xl cursor-pointer text-center flex flex-col items-center transition-all border ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                      : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {day.label}
                  </span>
                  <span className="text-base font-extrabold mt-1">
                    {day.num}
                  </span>
                  {hasServices && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 block ${isSelected ? 'bg-white' : 'bg-blue-600'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SELECT DATE CURRENT SERVICES PANEL */}
        <div>
          <div className="border-t border-slate-100 pt-4 mb-4 flex justify-between items-center bg-slate-50 p-3 rounded-xl">
            <span className="text-xs font-bold text-slate-600 uppercase">
              {selectedDate.split('-').reverse().join('/')} — {filteredSchedulings.length} serviço(s)
            </span>
          </div>

          <div className="space-y-4" id="agenda-services-list">
            {filteredSchedulings.length > 0 ? (
              filteredSchedulings.map((sch) => {
                const client = getClientData(sch.clientId);
                return (
                  <div
                    key={sch.id}
                    className="p-5 border border-slate-200/60 rounded-2xl bg-white shadow-2xs space-y-4 hover:border-slate-300 transition-all"
                  >
                    {/* Customer info */}
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <span className="p-3 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 self-start">
                          <CheckCircle size={18} />
                        </span>
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">{client?.name || 'Cliente'}</h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock size={11} className="text-blue-500" /> {sch.time}
                            </span>
                            <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                              {sch.serviceType}
                            </span>
                            {client?.phone && (
                              <span className="flex items-center gap-1 pl-1">
                                <Smartphone size={10} /> {client.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full block ${
                          sch.status === 'Concluído' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {sch.status}
                        </span>
                        <span className="font-extrabold text-slate-800 text-sm block mt-1">
                          {formatBRL(sch.value)}
                        </span>
                      </div>
                    </div>

                    {/* Description details of appointment */}
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col space-y-2">
                      <p><strong>Descrição:</strong> {sch.description || 'Nenhum detalhe adicional'}</p>
                      {client?.address && (
                        <p className="flex items-center gap-1 text-slate-500">
                          <MapPin size={12} className="text-blue-500 shrink-0" /> {client.address}
                        </p>
                      )}
                    </div>

                    {/* Buttons lower row */}
                    <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                      <button
                        onClick={() => handleSendReminderWhatsApp(sch)}
                        className="flex items-center justify-center gap-1.5 bg-slate-150 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs py-2 rounded-lg transition-all cursor-pointer"
                      >
                        <MessageSquare size={13} className="text-emerald-600" /> WhatsApp
                      </button>

                      {sch.status !== 'Concluído' ? (
                        <button
                          onClick={() => onUpdateSchStatus(sch.id, 'Concluído')}
                          className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 rounded-lg transition-all cursor-pointer"
                        >
                          <Check size={13} /> Finalizar
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateSchStatus(sch.id, 'Agendado')}
                          className="flex items-center justify-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs py-2 rounded-lg transition-all cursor-pointer"
                        >
                          Reabrir
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm('Tem certeza de que deseja deletar este agendamento?')) {
                            onDeleteScheduling(sch.id);
                          }
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-2 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        <Trash2 size={13} /> Excluir
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-medium">Nenhum atendimento agendado para esta data.</p>
                <button
                  onClick={() => setIsAdding(true)}
                  className="mt-1 text-xs text-blue-600 font-bold hover:underline"
                >
                  Registrar visita para este dia
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL / NEW SCHEDULING FORM */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-bold text-slate-800 text-base">Agendar Novo Atendimento de Clima</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Selecione o Cliente *</label>
              <select
                required
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">Selecione um cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Tipo de Serviço</label>
              <select
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
              >
                <option value="Limpeza">Limpeza</option>
                <option value="Instalação">Instalação</option>
                <option value="Manutenção">Manutenção Corretiva</option>
                <option value="Carga de Gás">Carga de Gás</option>
                <option value="Visita Técnica">Visita Técnica</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Data</label>
              <input
                required
                type="date"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Horário de Atendimento</label>
              <input
                required
                type="time"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-semibold"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Valor Cobrado (R$)</label>
              <input
                type="number"
                placeholder="220"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Resumo do Serviço a ser feito</label>
            <input
              type="text"
              placeholder="Ex: Instalação compressor no terraço / Limpeza split de 12k"
              className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
              Agendar Atendimento
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
