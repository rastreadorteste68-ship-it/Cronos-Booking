import { User, Client, Professional, Service, Appointment, Event, Transaction } from '../types';

const DELAY_MS = 600;

const STORAGE_KEYS = {
  USERS: 'cronos_users',
  CLIENTS: 'cronos_clients',
  PROFESSIONALS: 'cronos_professionals',
  SERVICES: 'cronos_services',
  APPOINTMENTS: 'cronos_appointments',
  EVENTS: 'cronos_events',
  TRANSACTIONS: 'cronos_transactions',
  CURRENT_USER: 'cronos_session'
};

// Seeder
const seedData = () => {
  if (localStorage.getItem(STORAGE_KEYS.USERS)) return;

  const users: User[] = [
    { id: '1', name: 'Master Admin', email: 'master@cronos.com', role: 'MASTER_ADMIN' },
    { id: '2', name: 'Admin Empresa', email: 'admin@empresa.com', role: 'EMPRESA_ADMIN' },
    { id: '3', name: 'João Cliente', email: 'joao@cliente.com', role: 'CLIENTE' }
  ];

  const services: Service[] = [
    { id: 's1', name: 'Corte de Cabelo', durationMinutes: 45, price: 50, customFields: [] },
    { id: 's2', name: 'Consultoria Financeira', durationMinutes: 60, price: 200, customFields: [{ id: 'cf1', label: 'Tamanho Empresa', type: 'select', options: ['Pequena', 'Média', 'Grande'], required: true }] }
  ];

  const professionals: Professional[] = [
    { 
      id: 'p1', name: 'Carlos Silva', email: 'carlos@cronos.com', specialty: 'Barbeiro', 
      availability: Array.from({ length: 7 }, (_, i) => ({ dayOfWeek: i, start: '09:00', end: '18:00', active: i !== 0 })) 
    },
    { 
      id: 'p2', name: 'Ana Souza', email: 'ana@cronos.com', specialty: 'Consultora', 
      availability: Array.from({ length: 7 }, (_, i) => ({ dayOfWeek: i, start: '10:00', end: '16:00', active: i >= 1 && i <= 5 })) 
    }
  ];

  const clients: Client[] = [
    { id: 'c1', name: 'João Cliente', email: 'joao@cliente.com', phone: '5511999999999', createdAt: new Date().toISOString() },
    { id: 'c2', name: 'Maria Oliveira', email: 'maria@cliente.com', phone: '5511988888888', createdAt: new Date().toISOString() }
  ];

  const appointments: Appointment[] = [
    { 
      id: 'a1', clientId: 'c1', professionalId: 'p1', serviceId: 's1', 
      date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '10:45', status: 'CONFIRMED' 
    }
  ];

  const transactions: Transaction[] = [
    { id: 't1', date: new Date().toISOString(), amount: 50, type: 'INCOME', category: 'Serviço', description: 'Corte de Cabelo - João', status: 'PAID', referenceId: 'a1' },
    { id: 't2', date: new Date().toISOString(), amount: 1500, type: 'EXPENSE', category: 'Aluguel', description: 'Aluguel Sala', status: 'PAID' }
  ];

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(professionals));
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify([]));
};

seedData();

// Generic Helper
const delay = () => new Promise(resolve => setTimeout(resolve, DELAY_MS));

function getItem<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setItem<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const StorageService = {
  // Auth
  login: async (email: string): Promise<User | null> => {
    await delay();
    const users = getItem<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.email === email);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    return null;
  },
  
  logout: async () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    const u = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return u ? JSON.parse(u) : null;
  },

  // Generic CRUD
  getAll: async <T>(key: string): Promise<T[]> => {
    await delay();
    return getItem<T>(key);
  },

  create: async <T extends { id: string }>(key: string, item: T): Promise<T> => {
    await delay();
    const items = getItem<T>(key);
    items.push(item);
    setItem(key, items);
    return item;
  },

  update: async <T extends { id: string }>(key: string, item: T): Promise<T> => {
    await delay();
    const items = getItem<T>(key);
    const index = items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      items[index] = item;
      setItem(key, items);
    }
    return item;
  },

  delete: async <T extends { id: string }>(key: string, id: string): Promise<void> => {
    await delay();
    const items = getItem<T>(key);
    const filtered = items.filter(i => i.id !== id);
    setItem(key, filtered);
  },

  // Specific Logic
  getAppointments: async (): Promise<Appointment[]> => {
    await delay();
    return getItem<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  },
  
  KEYS: STORAGE_KEYS
};
