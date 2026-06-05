import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, Equipment, MaintenanceRecord, StockItem } from '../types';
import { Users, Plus, Search, Trash2, ShieldAlert, Phone, MapPin, ClipboardList, AppWindow, Wrench, Camera, FileDown, CheckCircle, Package, Info, Tag, QrCode, Printer } from 'lucide-react';
import { generateServiceReportPDF } from '../utils/pdfGenerator';

interface ClientManagerProps {
  clients: Client[];
  equipments: Equipment[];
  records: MaintenanceRecord[];
  onAddClient: (client: Omit<Client, 'id'>) => void;
  onDeleteClient: (id: string) => void;
  onAddEquipment: (equipment: Omit<Equipment, 'id'>) => void;
  onDeleteEquipment: (id: string) => void;
  onAddRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
  onDeleteRecord: (id: string) => void;
  stock?: StockItem[];
  onUpdateStockQuantity?: (id: string, qty: number) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({
  clients,
  equipments,
  records,
  onAddClient,
  onDeleteClient,
  onAddEquipment,
  onDeleteEquipment,
  onAddRecord,
  onDeleteRecord,
  stock = [],
  onUpdateStockQuantity
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id || null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  // Form states
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [newClientReturn, setNewClientReturn] = useState<'3_months' | '6_months' | '1_year' | 'none'>('6_months');

  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [newEqBrand, setNewEqBrand] = useState('');
  const [newEqModel, setNewEqModel] = useState('');
  const [newEqCapacity, setNewEqCapacity] = useState('12000');
  const [newEqSerial, setNewEqSerial] = useState('');
  const [newEqInstallDate, setNewEqInstallDate] = useState('');
  const [newEqLocation, setNewEqLocation] = useState('');

  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [newRecDate, setNewRecDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRecType, setNewRecType] = useState<MaintenanceRecord['serviceType']>('Limpeza e Higienização');
  const [newRecDesc, setNewRecDesc] = useState('');
  const [newRecCost, setNewRecCost] = useState('220');
  const [photoBefore, setPhotoBefore] = useState<string>('');
  const [photoAfter, setPhotoAfter] = useState<string>('');
  const [newRecPartsUsed, setNewRecPartsUsed] = useState<string>('');
  const [recordSearchTerm, setRecordSearchTerm] = useState<string>('');
  const [scopeFilter, setScopeFilter] = useState<'selected' | 'all'>('selected');
  const [selectedStockDeductions, setSelectedStockDeductions] = useState<{ id: string; name: string }[]>([]);
  const [activeLightboxImg, setActiveLightboxImg] = useState<{ src: string; title: string } | null>(null);
  const [activeStickerEquipment, setActiveStickerEquipment] = useState<Equipment | null>(null);

  const fileBeforeRef = useRef<HTMLInputElement>(null);
  const fileAfterRef = useRef<HTMLInputElement>(null);

  // Filters
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeClient = clients.find(c => c.id === selectedClientId);
  const clientEquipments = equipments.filter(e => e.clientId === selectedClientId);

  const activeEquipment = clientEquipments.find(e => e.id === selectedEquipmentId) || clientEquipments[0];
  
  const relevantRecords = scopeFilter === 'all'
    ? (selectedClientId ? records.filter(r => r.clientId === selectedClientId) : [])
    : (activeEquipment ? records.filter(r => r.equipmentId === activeEquipment.id) : []);

  const filteredRecords = relevantRecords.filter(rec => {
    if (!recordSearchTerm) return true;
    const term = recordSearchTerm.toLowerCase();
    const matchDesc = rec.description.toLowerCase().includes(term);
    const matchType = rec.serviceType.toLowerCase().includes(term);
    const matchParts = rec.partsUsed ? rec.partsUsed.toLowerCase().includes(term) : false;
    const matchDate = rec.date.includes(term);
    return matchDesc || matchType || matchParts || matchDate;
  });

  // Convert files to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (type === 'before') setPhotoBefore(reader.result);
          else setPhotoAfter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const submitClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;
    onAddClient({
      name: newClientName,
      phone: newClientPhone.replace(/\D/g, ''), // only digits
      address: newClientAddress,
      notes: newClientNotes,
      returnPreference: newClientReturn,
      lastServiceDate: new Date().toISOString().split('T')[0]
    });
    // Reset
    setNewClientName('');
    setNewClientPhone('');
    setNewClientAddress('');
    setNewClientNotes('');
    setNewClientReturn('6_months');
    setIsAddingClient(false);
  };

  const submitEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEqBrand || !newEqModel || !selectedClientId) return;
    onAddEquipment({
      clientId: selectedClientId,
      brand: newEqBrand,
      modelType: newEqModel,
      capacityBTU: newEqCapacity,
      serialNumber: newEqSerial,
      installationDate: newEqInstallDate,
      location: newEqLocation,
      images: []
    });
    setNewEqBrand('');
    setNewEqModel('');
    setNewEqCapacity('12000');
    setNewEqSerial('');
    setNewEqInstallDate('');
    setNewEqLocation('');
    setIsAddingEquipment(false);
  };

  const submitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEquipment || !selectedClientId) return;
    onAddRecord({
      clientId: selectedClientId,
      equipmentId: activeEquipment.id,
      date: newRecDate,
      serviceType: newRecType,
      description: newRecDesc,
      cost: parseFloat(newRecCost) || 0,
      photoBefore: photoBefore || undefined,
      photoAfter: photoAfter || undefined,
      partsUsed: newRecPartsUsed || undefined
    });

    // Automatically decrement selected stock items in inventory
    if (onUpdateStockQuantity && selectedStockDeductions.length > 0) {
      selectedStockDeductions.forEach(deduction => {
        const item = stock.find(s => s.id === deduction.id);
        if (item) {
          onUpdateStockQuantity(item.id, Math.max(0, item.quantity - 1));
        }
      });
    }

    // Add selected photos to active equipment's image bank if registered
    if (photoBefore) {
      activeEquipment.images = [...(activeEquipment.images || []), photoBefore];
    }
    if (photoAfter) {
      activeEquipment.images = [...(activeEquipment.images || []), photoAfter];
    }

    setNewRecDesc('');
    setNewRecCost('220');
    setPhotoBefore('');
    setPhotoAfter('');
    setNewRecPartsUsed('');
    setSelectedStockDeductions([]);
    setIsAddingRecord(false);
  };

  // Quick WhatsApp callback
  const handleOpenWhatsApp = (client: Client, message: string) => {
    const formattedPhone = client.phone.startsWith('55') ? client.phone : `55${client.phone}`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="client-manager-container">
      {/* SIDEBAR: Client list */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-col h-[calc(100vh-220px)] min-h-[480px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={18} />
            </span>
            <h2 className="font-semibold text-slate-800 text-lg">Clientes ({clients.length})</h2>
          </div>
          <button
            id="add-client-btn"
            onClick={() => setIsAddingClient(!isAddingClient)}
            className="flex items-center gap-1 text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} /> Novo
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            id="search-client-input"
            type="text"
            placeholder="Buscar por nome, telefone..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Client List */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {filteredClients.map((client) => {
            const isSelected = client.id === selectedClientId;
            return (
              <div
                id={`client-item-${client.id}`}
                key={client.id}
                onClick={() => {
                  setSelectedClientId(client.id);
                  setSelectedEquipmentId(null); // Reset selected equipment
                }}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-200 shadow-2xs'
                    : 'bg-slate-50/50 hover:bg-slate-50 border-transparent'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-sm text-slate-800">{client.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Phone size={10} /> {client.phone}
                    </p>
                  </div>
                  {client.returnPreference !== 'none' && (
                    <span className="text-[10px] bg-slate-200/70 text-slate-700 font-medium px-2 py-0.5 rounded-full">
                      Retorno {client.returnPreference === '3_months' ? '3m' : client.returnPreference === '6_months' ? '6m' : '1a'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredClients.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-slate-400">Nenhum cliente cadastrado.</p>
            </div>
          )}
        </div>
      </div>

      {/* DETAILED AREA */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        {/* ADD CLIENT FORM (MODAL INLINE) */}
        {isAddingClient && (
          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs animate-fade-in">
            <h3 className="font-semibold text-slate-800 mb-4 text-base">Cadastrar Novo Cliente</h3>
            <form onSubmit={submitClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: José da Silva"
                    className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Celular / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 11999998888 (com DDD)"
                    className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  placeholder="Rua, número, complemento, bairro e cidade"
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Preferência de Retorno (Preventiva)</label>
                  <select
                    className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                    value={newClientReturn}
                    onChange={(e) => setNewClientReturn(e.target.value as any)}
                  >
                    <option value="none">Não Notificar</option>
                    <option value="3_months">Notificar a cada 3 Meses</option>
                    <option value="6_months">Notificar a cada 6 Meses</option>
                    <option value="1_year">Notificar a cada 1 Ano</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Observações do Cliente</label>
                  <input
                    type="text"
                    placeholder="Ex: Prédio exige liberação de acesso"
                    className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                    value={newClientNotes}
                    onChange={(e) => setNewClientNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingClient(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        )}

        {activeClient ? (
          <div className="space-y-6">
            {/* Active Client Header/Dashboard details */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded">CLIENTE SELECIONADO</span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">{activeClient.name}</h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Phone size={14} className="text-blue-500" /> WhatsApp: {activeClient.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-emerald-500" /> {activeClient.address || 'Endereço não cadastrado'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const msg = `Olá ${activeClient.name}, gostaríamos de agendar a sua próxima higienização preventiva preventiva de ar condicionado. Desse modo, evitam-se poeiras nocivas e prolonga-se a vida útil de seu aparelho. Abraços, Clima Gest!`;
                      handleOpenWhatsApp(activeClient, msg);
                    }}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Contato WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Tem certeza de que deseja deletar este cliente?')) {
                        onDeleteClient(activeClient.id);
                        setSelectedClientId(clients.find(c => c.id !== activeClient.id)?.id || null);
                      }
                    }}
                    className="p-2 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Deletar Cliente"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {activeClient.notes && (
                <div className="mt-4 p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs text-amber-800">
                  <strong>Observação interna:</strong> {activeClient.notes}
                </div>
              )}
            </div>

            {/* REGISTERED DEVICES (EQUIPAMENTOS) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <AppWindow size={18} />
                  </span>
                  <h3 className="font-semibold text-slate-800 text-base">Equipamentos Cadastrados ({clientEquipments.length})</h3>
                </div>
                <button
                  onClick={() => setIsAddingEquipment(!isAddingEquipment)}
                  className="flex items-center gap-1 text-xs font-semibold bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                >
                  <Plus size={14} /> Novo Equipamento
                </button>
              </div>

              {/* Form to Add Equipment */}
              {isAddingEquipment && (
                <form onSubmit={submitEquipment} className="p-4 border border-slate-100 rounded-xl bg-slate-50 mb-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700">Adicionar Aparelho de Ar Condicionado</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Marca *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Daikin, Consul, LG"
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                        value={newEqBrand}
                        onChange={(e) => setNewEqBrand(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Modelo / Tipo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Split Hi-Wall Inverter"
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                        value={newEqModel}
                        onChange={(e) => setNewEqModel(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Capacidade (BTUs) *</label>
                      <select
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                        value={newEqCapacity}
                        onChange={(e) => setNewEqCapacity(e.target.value)}
                      >
                        <option value="7500">7.500 BTUs</option>
                        <option value="9000">9.000 BTUs</option>
                        <option value="12000">12.000 BTUs</option>
                        <option value="18000">18.000 BTUs</option>
                        <option value="24000">24.000 BTUs</option>
                        <option value="30000">30.000 BTUs</option>
                        <option value="360000">36.000+ BTUs</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Número de Série</label>
                      <input
                        type="text"
                        placeholder="Ex: SN-88329"
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                        value={newEqSerial}
                        onChange={(e) => setNewEqSerial(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Instalado Em</label>
                      <input
                        type="date"
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none text-slate-600"
                        value={newEqInstallDate}
                        onChange={(e) => setNewEqInstallDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Localização Física</label>
                      <input
                        type="text"
                        placeholder="Ex: Quarto Casal, Escritório"
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                        value={newEqLocation}
                        onChange={(e) => setNewEqLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingEquipment(false)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs rounded-lg hover:bg-slate-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                    >
                      Salvar Equipamento
                    </button>
                  </div>
                </form>
              )}

              {/* Equips Tabs */}
              {clientEquipments.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100">
                    {clientEquipments.map((eq) => {
                      const isSelected = selectedEquipmentId === eq.id || (!selectedEquipmentId && clientEquipments[0].id === eq.id);
                      if (isSelected && !selectedEquipmentId) {
                        setSelectedEquipmentId(eq.id);
                      }
                      return (
                        <button
                          key={eq.id}
                          onClick={() => setSelectedEquipmentId(eq.id)}
                          className={`px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Wrench size={12} />
                          {eq.brand} ({eq.capacityBTU} BTU) - {eq.location || 'Geral'}
                        </button>
                      );
                    })}
                  </div>

                  {activeEquipment && (
                    <div className="bg-slate-50/55 p-4 rounded-xl border border-slate-100 space-y-4">
                      {/* Equipment Spec Sheet */}
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">MARCA / TIPO</span>
                            <span className="font-semibold text-slate-700">{activeEquipment.brand} / {activeEquipment.modelType}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">CAPACIDADE</span>
                            <span className="font-semibold text-slate-700">{activeEquipment.capacityBTU} BTUs</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">NÚMERO DE SÉRIE</span>
                            <span className="font-mono text-slate-700">{activeEquipment.serialNumber || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">INSTALAÇÃO / LOCAL</span>
                            <span className="font-semibold text-slate-700">{activeEquipment.installationDate ? new Date(activeEquipment.installationDate).toLocaleDateString() : 'N/A'} - {activeEquipment.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveStickerEquipment(activeEquipment)}
                            className="flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-extrabold px-3 py-2 rounded-lg border border-blue-200/50 transition-all cursor-pointer select-none shadow-3xs hover:scale-102 active:scale-98"
                            title="Gerar Etiqueta de QR Code PMOC para colar no Ar Condicionado"
                          >
                            <QrCode size={13} /> Etiqueta QR PMOC
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Deseja realmente deletar este equipamento? O histórico também será deletado.')) {
                                onDeleteEquipment(activeEquipment.id);
                                setSelectedEquipmentId(null);
                              }
                            }}
                            className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Deletar Equipamento"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* CAMERA/IMAGE BANK FOR DEVICE */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Camera size={12} /> Banco de Imagens do Aparelho (Reparos Registrados)
                          </span>
                        </div>
                        {activeEquipment.images && activeEquipment.images.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {activeEquipment.images.map((img, idx) => (
                              <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                                <img src={img} alt="AC state" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-[10px] text-white font-bold">Estágio</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">Nenhuma foto salva no banco de imagens para este equipamento ainda. Adicione fotos em uma nova manutenção abaixo.</p>
                        )}
                      </div>

                      <div className="border-t border-slate-200/50 pt-4">
                        {/* HISTÓRICO DE MANUTENÇÕES */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 animate-in fade-in duration-200">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-blue-600 uppercase flex items-center gap-1">
                              <ClipboardList size={13} /> Histórico de Manutenções
                            </span>
                            <span className="text-[10px] text-slate-400 block font-normal">
                              {scopeFilter === 'all' ? 'Verificando todos os aparelhos do cliente' : `Aparelho ativo: ${activeEquipment?.brand} - Loc. ${activeEquipment?.location || 'Não informada'}`}
                            </span>
                          </div>

                          {/* Search bar inside equipment history */}
                          <div className="flex flex-1 max-w-md items-center gap-2">
                            <div className="relative flex-1">
                              <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Buscar no histórico (ex: gás, peças)..."
                                className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                                value={recordSearchTerm}
                                onChange={(e) => setRecordSearchTerm(e.target.value)}
                              />
                            </div>
                            
                            <select
                              className="text-xs p-1 border border-slate-200 rounded-lg bg-white text-slate-600 font-medium"
                              value={scopeFilter}
                              onChange={(e) => setScopeFilter(e.target.value as 'selected' | 'all')}
                            >
                              <option value="selected">Aparelho atual</option>
                              <option value="all">Todos aparelhos</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsAddingRecord(!isAddingRecord)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus size={10} /> Registrar Manutenção
                          </button>
                        </div>

                        {/* FORM: Maintenance Record */}
                        {isAddingRecord && (
                          <form onSubmit={submitRecord} className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm space-y-3 mb-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-2 pb-2 border-b border-blue-50">
                              <span className="p-1.5 bg-blue-50 text-blue-600 rounded">
                                <Plus size={14} />
                              </span>
                              <h5 className="text-xs font-bold text-slate-700">Registrar Nova Manutenção</h5>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5 font-semibold">Data do Serviço</label>
                                <input
                                  type="date"
                                  className="w-full text-xs p-1.5 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                                  value={newRecDate}
                                  onChange={(e) => setNewRecDate(e.target.value)}
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5 font-semibold">Tipo de Intervenção</label>
                                <select
                                  className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white focus:border-blue-500 focus:outline-none"
                                  value={newRecType}
                                  onChange={(e) => setNewRecType(e.target.value as any)}
                                >
                                  <option value="Limpeza e Higienização">Limpeza & Higienização</option>
                                  <option value="Carga de Gás">Carga de Gás</option>
                                  <option value="Troca de Peça">Troca de Peça</option>
                                  <option value="Instalação">Instalação</option>
                                  <option value="Conserto">Conserto</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5 font-semibold">Preço Cobrado (R$)</label>
                                <input
                                  type="number"
                                  placeholder="220"
                                  className="w-full text-xs p-1.5 border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                                  value={newRecCost}
                                  onChange={(e) => setNewRecCost(e.target.value)}
                                  required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5 font-semibold">Descrição Técnica do Serviço</label>
                              <textarea
                                placeholder="Especifique as pressões em PSI, vácuo, testes elétricos e detalhes do serviço..."
                                className="w-full text-xs p-2 border border-slate-200 rounded h-16 text-slate-700 focus:border-blue-500 focus:outline-none"
                                value={newRecDesc}
                                onChange={(e) => setNewRecDesc(e.target.value)}
                                required
                              />
                            </div>

                            {/* New Parts Used block with Inventory linkage */}
                            <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                              <label className="block text-[10px] text-slate-500 font-bold mb-1 flex items-center justify-between">
                                <span className="flex items-center gap-1"><Tag size={10} className="text-blue-500" /> Peças / Insumos Utilizados</span>
                                <span className="font-normal text-slate-400 text-[9px]">Separar por vírgula se digitar manual</span>
                              </label>
                              <input
                                type="text"
                                placeholder="Ex: Capacitor 45uF, 2 metros de cobre, esponja isolante"
                                className="w-full text-xs p-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-none bg-white font-medium text-slate-700"
                                value={newRecPartsUsed}
                                onChange={(e) => setNewRecPartsUsed(e.target.value)}
                              />
                              
                              {stock && stock.length > 0 && (
                                <div className="mt-2 text-[10px]">
                                  <span className="text-[9px] text-slate-400 block mb-1 uppercase tracking-wider font-bold">Insumos em Estoque no Clima Gest (Clique para usar):</span>
                                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white border border-slate-200 rounded-md">
                                    {stock.map((item) => {
                                      const isAlreadySelected = selectedStockDeductions.some(d => d.id === item.id);
                                      const isOutOfStock = item.quantity <= 0;
                                      return (
                                        <button
                                          key={item.id}
                                          type="button"
                                          disabled={isOutOfStock}
                                          onClick={() => {
                                            if (isAlreadySelected) {
                                              setSelectedStockDeductions(prev => prev.filter(p => p.id !== item.id));
                                              const partsArray = newRecPartsUsed.split(',').map(p => p.trim()).filter(Boolean);
                                              const updatedArray = partsArray.filter(p => p !== item.name && !p.startsWith(item.name));
                                              setNewRecPartsUsed(updatedArray.join(', '));
                                            } else {
                                              setSelectedStockDeductions(prev => [...prev, { id: item.id, name: item.name }]);
                                              if (newRecPartsUsed.trim()) {
                                                setNewRecPartsUsed(prev => `${prev.trim()}, ${item.name}`);
                                              } else {
                                                setNewRecPartsUsed(item.name);
                                              }
                                            }
                                          }}
                                          className={`px-2 py-0.5 rounded border text-[9px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                            isOutOfStock
                                              ? 'bg-slate-50 text-slate-350 border-slate-100 cursor-not-allowed opacity-50'
                                              : isAlreadySelected
                                                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                                          }`}
                                          title={isOutOfStock ? "Esgotado!" : `Quantidade em estoque: ${item.quantity}`}
                                        >
                                          <Package size={8} /> {item.name} ({item.quantity})
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {selectedStockDeductions.length > 0 && (
                                    <div className="text-[9px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
                                      <Info size={10} className="shrink-0" />
                                      <span>Atenção: Ao registrar, 1 unidade de cada item selecionado em azul acima será deduzida automaticamente do controle de estoque.</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Camera Snap Upload simulator */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-1 flex items-center gap-1">
                                  <Camera size={10} className="text-slate-400" /> Foto de ANTES (Sujeira/Defeito)
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  ref={fileBeforeRef}
                                  onChange={(e) => handleFileChange(e, 'before')}
                                  className="hidden"
                                />
                                <div className="flex gap-2 items-center">
                                  <button
                                    type="button"
                                    onClick={() => fileBeforeRef.current?.click()}
                                    className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[10px] py-1 px-2.5 rounded flex items-center gap-1"
                                  >
                                    Carregar Imagem
                                  </button>
                                  {photoBefore ? (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                                        <CheckCircle size={10} /> Carregada
                                      </span>
                                      <img src={photoBefore} className="w-6 h-6 object-cover rounded border" />
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic font-medium">Nenhuma</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-500 font-bold mb-1 flex items-center gap-1">
                                  <Camera size={10} className="text-slate-400" /> Foto de DEPOIS (Limpo/Consertado)
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  ref={fileAfterRef}
                                  onChange={(e) => handleFileChange(e, 'after')}
                                  className="hidden"
                                />
                                <div className="flex gap-2 items-center">
                                  <button
                                    type="button"
                                    onClick={() => fileAfterRef.current?.click()}
                                    className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[10px] py-1 px-2.5 rounded flex items-center gap-1"
                                  >
                                    Carregar Imagem
                                  </button>
                                  {photoAfter ? (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                                        <CheckCircle size={10} /> Carregada
                                      </span>
                                      <img src={photoAfter} className="w-6 h-6 object-cover rounded border" />
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic font-medium">Nenhuma</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingRecord(false);
                                  setSelectedStockDeductions([]);
                                  setNewRecPartsUsed('');
                                }}
                                className="px-3 py-1.5 text-slate-400 text-xs hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                              >
                                Registrar Serviço
                              </button>
                            </div>
                          </form>
                        )}

                        {/* List of maintenance done */}
                        <div className="space-y-3 mt-2">
                          {filteredRecords.length > 0 ? (
                            filteredRecords.map((rec) => {
                              const recEquipment = equipments.find(e => e.id === rec.equipmentId);
                              return (
                                <div key={rec.id} className="p-4 bg-white border border-slate-100 rounded-xl hover:shadow-2xs hover:border-slate-200 transition-all flex flex-col md:flex-row justify-between gap-4 text-xs animate-in fade-in duration-200">
                                  <div className="space-y-2 flex-grow">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-slate-400 font-mono text-[10px] font-bold">
                                        🗓️ {new Date(rec.date).toLocaleDateString('pt-BR')}
                                      </span>
                                      <span className="bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded text-[10px]">
                                        {rec.serviceType}
                                      </span>
                                      <span className="font-bold text-slate-800">
                                        R$ {rec.cost.toFixed(2)}
                                      </span>
                                      {/* Equipment badge if showing all or as a helpful hint */}
                                      {recEquipment && (
                                        <span className="bg-slate-50 text-slate-500 font-bold px-2 py-0.5 rounded text-[10px] border border-slate-100 flex items-center gap-0.5">
                                          <Wrench size={8} /> {recEquipment.brand} ({recEquipment.location || recEquipment.modelType})
                                        </span>
                                      )}
                                    </div>
                                    
                                    <p className="text-slate-600 leading-relaxed font-normal bg-slate-50/20 p-2 rounded-lg border border-slate-100 uppercase-placeholder">
                                      {rec.description}
                                    </p>
                                    
                                    {/* Used parts rendering */}
                                    {rec.partsUsed && (
                                      <div className="text-[10px] text-slate-600 font-medium flex items-center gap-1.5 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/30 w-full md:w-fit">
                                        <Tag size={12} className="text-emerald-600 shrink-0" />
                                        <span>
                                          <strong className="text-emerald-800 font-bold">Peças Utilizadas: </strong> 
                                          {rec.partsUsed}
                                        </span>
                                      </div>
                                    )}

                                    {/* Photos indicator */}
                                    {(rec.photoBefore || rec.photoAfter) && (
                                      <div className="flex flex-wrap gap-4 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 inline-flex">
                                        {rec.photoBefore && (
                                          <div className="text-[9px] text-slate-500 font-bold space-y-1">
                                            <span>📷 Estado Antes:</span>
                                            <div 
                                              onClick={() => setActiveLightboxImg({ src: rec.photoBefore!, title: `Antes: ${rec.serviceType} (${new Date(rec.date).toLocaleDateString('pt-BR')})` })}
                                              className="relative overflow-hidden cursor-pointer group w-20 h-16 rounded-lg border border-slate-200"
                                            >
                                              <img src={rec.photoBefore} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                <span className="text-[8px] text-white font-extrabold uppercase bg-blue-600 rounded px-1">Ver</span>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        {rec.photoAfter && (
                                          <div className="text-[9px] text-slate-500 font-bold space-y-1">
                                            <span>📷 Estado Depois:</span>
                                            <div 
                                              onClick={() => setActiveLightboxImg({ src: rec.photoAfter!, title: `Depois: ${rec.serviceType} (${new Date(rec.date).toLocaleDateString('pt-BR')})` })}
                                              className="relative overflow-hidden cursor-pointer group w-20 h-16 rounded-lg border border-slate-200"
                                            >
                                              <img src={rec.photoAfter} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                <span className="text-[8px] text-white font-extrabold uppercase bg-blue-600 rounded px-1">Ver</span>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center md:flex-col justify-end gap-1.5 whitespace-nowrap self-start md:self-stretch">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const eq = equipments.find(e => e.id === rec.equipmentId) || activeEquipment;
                                        if (eq && activeClient) generateServiceReportPDF(rec, activeClient, eq);
                                      }}
                                      className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-705 font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition-all text-xs select-none cursor-pointer"
                                      title="Exportar Relatório Clínico PDF"
                                    >
                                      <FileDown size={12} /> PDF OS
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm('Tem certeza que deseja remover este registro?')) {
                                          onDeleteRecord(rec.id);
                                        }
                                      }}
                                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                      title="Excluir Registro"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="bg-slate-50 rounded-xl p-6 text-center border border-dashed border-slate-150">
                              <ClipboardList className="mx-auto text-slate-300 mb-1" size={24} />
                              <p className="text-xs text-slate-400 italic">
                                {recordSearchTerm ? 'Nenhum registro encontrado para estes termos de busca.' : 'Nenhum histórico registrado com os critérios selecionados.'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400">Nenhum equipamento cadastrado para este cliente.</p>
                  <button
                    onClick={() => setIsAddingEquipment(true)}
                    className="text-blue-600 font-bold text-xs mt-1 hover:underline"
                  >
                    Adicionar o primeiro aparelho
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl border border-slate-100 text-center shadow-xs">
            <Users className="mx-auto text-slate-300 mb-2" size={40} />
            <h3 className="font-semibold text-slate-700 text-lg">Nenhum cliente selecionado</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">Selecione um cliente no menu lateral ou clique em "Novo" para começar a gerenciar.</p>
          </div>
        )}
      </div>
      {/* Lightbox Preview Modal */}
      <AnimatePresence>
        {activeLightboxImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/85 backdrop-blur-xs z-[999] flex items-center justify-center p-4" 
            onClick={() => setActiveLightboxImg(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative" 
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h4 className="font-bold text-slate-800 text-sm">{activeLightboxImg.title}</h4>
                <button 
                  type="button"
                  onClick={() => setActiveLightboxImg(null)} 
                  className="text-slate-500 hover:text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
              <div className="p-4 flex items-center justify-center bg-slate-950 min-h-[320px] max-h-[70vh]">
                <img 
                  src={activeLightboxImg.src} 
                  alt="Visualização ampliada" 
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg select-none" 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PMOC QR Label Sticker Generator Modal */}
      <AnimatePresence>
        {activeStickerEquipment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-[999] flex items-center justify-center p-4"
            onClick={() => setActiveStickerEquipment(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-blue-600 font-bold text-sm">
                  <QrCode size={16} />
                  <span>Gerador de Etiqueta QR PMOC</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setActiveStickerEquipment(null)} 
                  className="text-slate-500 hover:text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-3xs cursor-pointer hover:bg-slate-50 transition-all"
                >
                  Fechar
                </button>
              </div>
              
              <div className="p-5 bg-slate-100 border-b border-slate-200/50 flex flex-col items-center justify-center space-y-4">
                <div className="text-center">
                  <span className="text-[10px] text-blue-600 font-extrabold uppercase bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Molde Brother / Zebra (80x50 mm)</span>
                  <p className="text-[10px] text-slate-400 mt-1">Cole esta etiqueta física no aparelho. Escaneie-a para ver o prontuário no celular.</p>
                </div>

                {/* Printable Physical Technical Sticker Layout */}
                <div 
                  id="pmoc-thermal-sticker"
                  className="bg-white p-5 border-3 border-black w-[340px] h-[210px] shadow-sm flex flex-col justify-between font-sans text-black overflow-hidden relative select-none"
                >
                  {/* Header sticker */}
                  <div className="flex justify-between items-start border-b-2 border-black pb-1">
                    <div>
                      <h5 className="text-[12px] font-black tracking-tight leading-none uppercase">CLIMA GEST PRO</h5>
                      <span className="text-[7px] font-bold block leading-none text-slate-500 mt-0.5">PMOC - LEI FEDERAL 13.589</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-black border border-black px-1 py-0.2 rounded uppercase">Selo de Qualidade</span>
                    </div>
                  </div>

                  {/* Sticker body content */}
                  <div className="flex gap-3 my-2 items-center">
                    {/* Left: Authentic crisp Vector QR Code path */}
                    <div className="shrink-0 flex flex-col items-center justify-center border border-black p-1 bg-white">
                      <svg width="68" height="68" viewBox="0 0 29 29" shape-rendering="crispEdges">
                        <path fill="#000000" d="M0 0h7v7H0zm22 0h7v7h-7zM0 22h7v7H0zm2 2h3v3H2zm20-22h3v3h-3zM2 2h3v3H2zm7 0h1v1H9zm2 0h3v1h-3zm5 0h1v2h-1zm2 0h2v1h-2zm-9 2h1v3H9zm2 0h1v1h-1zm2 1h2v1h-2zm3-1h1v1h-1zm-6 2h2v1h-2zm4 0h1v1h-1zm1 1h1v1h-1zm2-1h1v2h-1zm-9 3h1v1H9zm2 0h2v1h-2zm3 0h1v1h-1zm3 0h1v1h-1zm1 0h1v1h-1zm3 0h2v2h-2zm-15 2h1v1H8zm2 0h2v1h-2zm3 0h1v1h-1zm3 0h2v1h-2zm6 0h1v2h-1zm-15 2h2v1H8zm3 0h1v1h-1zm3 0h1v1h-1zm1 0h1v1h-1zm3 0h2v1h-2zm1 1h1v1h-1zm-12 2h2v1h-2zm3 0h1v2H9zm2 0h1v1h-1zm4 0h2v1h-2zm3 0h1v1h-1zm1 0h1v1h-1zm2 0h1v1h-1z"/>
                      </svg>
                      <span className="text-[6px] font-black text-center mt-1 font-mono uppercase tracking-widest bg-black text-white px-1 py-0.2 leading-none">REGISTRO #{activeStickerEquipment.id.substring(activeStickerEquipment.id.length - 4).toUpperCase()}</span>
                    </div>

                    {/* Right: Technical Specs */}
                    <div className="flex-grow space-y-1 text-[8px] font-bold leading-normal">
                      <p className="border-b border-dashed border-slate-300 pb-0.5 truncate">
                        <span className="text-slate-400 font-medium">Cliente: </span>
                        {clients.find(c => c.id === activeStickerEquipment.clientId)?.name || 'Consumidor'}
                      </p>
                      <p className="border-b border-dashed border-slate-300 pb-0.5">
                        <span className="text-slate-400 font-medium">Equipamento: </span>
                        {activeStickerEquipment.brand} {activeStickerEquipment.capacityBTU} BTU
                      </p>
                      <p className="border-b border-dashed border-slate-300 pb-0.5 truncate">
                        <span className="text-slate-400 font-medium">Modelo/Série: </span>
                        {activeStickerEquipment.serialNumber || 'N/A'} ({activeStickerEquipment.modelType})
                      </p>
                      <p className="border-b border-dashed border-slate-300 pb-0.5 truncate">
                        <span className="text-slate-400 font-medium">Loc: </span>
                        {activeStickerEquipment.location || 'Sem Especificação'}
                      </p>
                    </div>
                  </div>

                  {/* Footer sticker with Dates */}
                  <div className="border-t-2 border-black pt-1 flex justify-between items-center text-[7.5px] font-black bg-slate-50 p-1 rounded">
                    <div className="flex items-center gap-1">
                      <span className="text-[6px] text-emerald-800 font-bold bg-emerald-100 rounded px-1 uppercase">Última Higienização:</span>
                      <span>{clients.find(c => c.id === activeStickerEquipment.clientId)?.lastServiceDate?.split('-').reverse().join('/') || '04/06/2026'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[6px] text-amber-800 font-bold bg-amber-100 rounded px-1 uppercase">Vencimento Próxima:</span>
                      <span>{clients.find(c => c.id === activeStickerEquipment.clientId)?.nextReturnDate?.split('-').reverse().join('/') || '04/12/2026'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action controls */}
              <div className="p-4 bg-white border-t border-slate-100 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const printContents = document.getElementById('pmoc-thermal-sticker')?.outerHTML;
                    const originalContents = document.body.innerHTML;
                    if (printContents) {
                      const printWindow = window.open('', '', 'height=500, width=500');
                      if (printWindow) {
                        printWindow.document.write('<html><head><title>Imprimir Etiqueta PMOC</title>');
                        printWindow.document.write('<style>body { display: flex; align-items: center; justify-center: center; height: 100vh; margin: 0; font-family: sans-serif; }</style>');
                        printWindow.document.write('</head><body>');
                        printWindow.document.write(printContents);
                        printWindow.document.write('</body></html>');
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95 text-center"
                >
                  <Printer size={13} />
                  <span>Imprimir QR Adesivo</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveStickerEquipment(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-705 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition-all"
                >
                  Voltar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
