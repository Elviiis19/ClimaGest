export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  returnPreference: '3_months' | '6_months' | '1_year' | 'none';
  lastServiceDate?: string;
  nextReturnDate?: string;
  returnStatus?: 'pending' | 'notified' | 'none';
}

export interface Equipment {
  id: string;
  clientId: string;
  brand: string;
  modelType: string; // e.g. Split Hi-Wall, Cassete, Piso Teto, Janela
  capacityBTU: string; // e.g. 9000, 12000, 18000, 24000
  serialNumber?: string;
  installationDate?: string;
  location?: string; // e.g., Quarto Casal, Sala de Estar
  images: string[]; // List of base64 data URIs or local sample images
}

export interface MaintenanceRecord {
  id: string;
  clientId: string;
  equipmentId: string;
  date: string;
  serviceType: 'Limpeza e Higienização' | 'Carga de Gás' | 'Troca de Peça' | 'Instalação' | 'Conserto';
  description: string;
  photoBefore?: string; // base64
  photoAfter?: string; // base64
  cost: number;
  partsUsed?: string; // Comma-separated or free-form text of parts used
}

export interface ServiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Budget {
  id: string;
  clientId: string;
  date: string;
  status: 'Rascunho' | 'Enviado' | 'Aprovado' | 'Recusado';
  services: ServiceItem[];
  totalValue: number;
  observations: string;
}

export interface Scheduling {
  id: string;
  clientId: string;
  equipmentId?: string;
  date: string;
  time: string;
  serviceType: 'Limpeza' | 'Instalação' | 'Manutenção' | 'Carga de Gás' | 'Visita Técnica';
  value: number;
  status: 'Agendado' | 'Concluído' | 'Cancelado';
  description: string;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  category: string;
  priceBought: number;
  priceSell: number;
}

export interface FinancialTransaction {
  id: string;
  type: 'receita' | 'despesa';
  description: string;
  value: number;
  date: string;
  status: 'pago' | 'pendente';
  category: string;
}
