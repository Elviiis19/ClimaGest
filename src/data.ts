import { Client, Equipment, MaintenanceRecord, Budget, Scheduling, StockItem, FinancialTransaction } from './types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'José Medeiros',
    phone: '5511999998888',
    address: 'Rua: João Gomes Bairro: Centro N:273, São Paulo - SP',
    notes: 'Ar condicionado da sala precisa de escada de 6 degraus. Preferência aos sábados pela manhã.',
    returnPreference: '6_months',
    lastServiceDate: '2025-11-14',
    nextReturnDate: '2026-05-14',
    returnStatus: 'pending'
  },
  {
    id: 'c2',
    name: 'Rafael Silva',
    phone: '5511977776666',
    address: 'Av. Paulista, 1000 - Ap 42, São Paulo - SP',
    notes: 'Cliente comercial, de preferência agendar após as 18h.',
    returnPreference: '3_months',
    lastServiceDate: '2026-04-10',
    nextReturnDate: '2026-07-10',
    returnStatus: 'none'
  },
  {
    id: 'c3',
    name: 'Maria Clara Souza',
    phone: '5521988887777',
    address: 'Rua das Flores, 54, Rio de Janeiro - RJ',
    notes: 'Tem animais de estimação, manter portas fechadas ao trabalhar.',
    returnPreference: '1_year',
    lastServiceDate: '2025-06-15',
    nextReturnDate: '2026-06-15',
    returnStatus: 'pending'
  }
];

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'eq1',
    clientId: 'c1',
    brand: 'Daikin',
    modelType: 'Split Hi-Wall Inverter',
    capacityBTU: '12000',
    serialNumber: 'DK8823719A',
    installationDate: '2023-03-12',
    location: 'Sala de Estar',
    images: []
  },
  {
    id: 'eq2',
    clientId: 'c2',
    brand: 'Springer Midea',
    modelType: 'Split Hi-Wall',
    capacityBTU: '9000',
    serialNumber: 'MD-9002381-Z',
    installationDate: '2024-05-18',
    location: 'Dormitório',
    images: []
  },
  {
    id: 'eq3',
    clientId: 'c3',
    brand: 'Consul',
    modelType: 'Janeleiro',
    capacityBTU: '7500',
    serialNumber: 'CS-750192',
    installationDate: '2021-12-05',
    location: 'Escritório',
    images: []
  }
];

export const INITIAL_RECORDS: MaintenanceRecord[] = [
  {
    id: 'rec1',
    clientId: 'c1',
    equipmentId: 'eq1',
    date: '2025-11-14',
    serviceType: 'Limpeza e Higienização',
    description: 'Limpeza completa do evaporador e condensador, higienização com bactericida e troca das pilhas do controle remoto.',
    cost: 220,
    photoBefore: '',
    photoAfter: '',
    partsUsed: 'Bactericida de Evaporadora, Pilhas AAA'
  },
  {
    id: 'rec2',
    clientId: 'c1',
    equipmentId: 'eq1',
    date: '2025-05-14',
    serviceType: 'Carga de Gás',
    description: 'Localizado pequeno vazamento na flange da tubulação de baixa, refeito flange, vácuo e adição de 250g de gás R410a.',
    cost: 250,
    photoBefore: '',
    photoAfter: '',
    partsUsed: 'Gás Fluido Refrigerante R410A (250g)'
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'b1',
    clientId: 'c1',
    date: '2026-05-10',
    status: 'Enviado',
    services: [
      { description: 'Instalação Ar novo 12K Daikin', quantity: 1, price: 600 },
      { description: 'Limpeza Ar com bolsa coletora dormitório', quantity: 1, price: 220 },
      { description: 'Recarga Gás R22', quantity: 1, price: 250 }
    ],
    totalValue: 1070,
    observations: 'Garantia de 90 dias na mão de obra de instalação. Pagamento via Pix.'
  },
  {
    id: 'b2',
    clientId: 'c2',
    date: '2026-05-11',
    status: 'Aprovado',
    services: [
      { description: 'Manutenção Corretiva Troca de Capacitor', quantity: 1, price: 180 },
      { description: 'Higienização Química do Evaporador', quantity: 1, price: 200 }
    ],
    totalValue: 380,
    observations: 'Peças novas inclusas com garantia fabricante de 1 ano.'
  }
];

export const INITIAL_SCHEDULINGS: Scheduling[] = [
  {
    id: 's1',
    clientId: 'c1',
    equipmentId: 'eq1',
    date: '2026-05-14',
    time: '09:00',
    serviceType: 'Limpeza',
    value: 1070,
    status: 'Agendado',
    description: 'Instalação de ar novo, Limpeza com bolsa e Recarga de Gás.'
  },
  {
    id: 's2',
    clientId: 'c2',
    equipmentId: 'eq2',
    date: '2026-06-10',
    time: '14:30',
    serviceType: 'Manutenção',
    value: 380,
    status: 'Agendado',
    description: 'Substituição de capacitor e higienização geral.'
  }
];

export const INITIAL_STOCK: StockItem[] = [
  {
    id: 'st1',
    name: 'Capacitor Dual 45+5 uF',
    quantity: 12,
    minQuantity: 5,
    category: 'Elétrica',
    priceBought: 22,
    priceSell: 45
  },
  {
    id: 'st2',
    name: 'Gás Fluido Refrigerante R410A (Botija 11.3kg)',
    quantity: 2,
    minQuantity: 1,
    category: 'Gases',
    priceBought: 280,
    priceSell: 450
  },
  {
    id: 'st3',
    name: 'Sensor de Temperatura 10k Evaporador',
    quantity: 18,
    minQuantity: 8,
    category: 'Sensores',
    priceBought: 5,
    priceSell: 20
  },
  {
    id: 'st4',
    name: 'Suporte Ar Split Metal 9000 a 12000 BTU',
    quantity: 4,
    minQuantity: 5,
    category: 'Ferragens',
    priceBought: 25,
    priceSell: 55
  },
  {
    id: 'st5',
    name: 'Fita Isolante de PVC Preta 20m',
    quantity: 25,
    minQuantity: 10,
    category: 'Consumíveis',
    priceBought: 4,
    priceSell: 10
  }
];

export const INITIAL_FINANCEDATA: FinancialTransaction[] = [
  {
    id: 'f1',
    type: 'despesa',
    description: 'Gasolina para deslocamento',
    value: 150,
    date: '2026-05-11',
    status: 'pago',
    category: 'Transporte'
  },
  {
    id: 'f2',
    type: 'despesa',
    description: 'Capacitor Ar',
    value: 40,
    date: '2026-05-11',
    status: 'pago',
    category: 'Peças'
  },
  {
    id: 'f3',
    type: 'despesa',
    description: 'Reposicão de Gás R410A',
    value: 400,
    date: '2026-05-11',
    status: 'pago',
    category: 'Peças'
  },
  {
    id: 'f4',
    type: 'despesa',
    description: 'Chave Inglesa para maleta de ferramentas',
    value: 45,
    date: '2026-05-11',
    status: 'pago',
    category: 'Ferramentas'
  },
  {
    id: 'f5',
    type: 'receita',
    description: 'Instalação, Limpeza — Rafael Silva',
    value: 500,
    date: '2026-05-11',
    status: 'pago',
    category: 'Serviço'
  },
  {
    id: 'f6',
    type: 'receita',
    description: 'Instalação de Split e Limpeza — Rafael Silva',
    value: 770,
    date: '2026-05-11',
    status: 'pago',
    category: 'Serviço'
  },
  {
    id: 'f7',
    type: 'receita',
    description: 'Venda de controle remoto universal',
    value: 250,
    date: '2026-05-11',
    status: 'pago',
    category: 'Venda Peça'
  },
  {
    id: 'f8',
    type: 'receita',
    description: 'Serviço higienização split - Maria Clara',
    value: 300,
    date: '2026-06-03',
    status: 'pendente',
    category: 'Serviço'
  },
  {
    id: 'f9',
    type: 'despesa',
    description: 'Aluguel do Andaime para obra',
    value: 150,
    date: '2026-06-05',
    status: 'pendente',
    category: 'Aluguel'
  }
];
