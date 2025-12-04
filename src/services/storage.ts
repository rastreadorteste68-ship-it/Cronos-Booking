import { User, Client, Professional, Service, Appointment, Event, Transaction, Company, NotificationLog } from '../types';

const DELAY_MS = 400;

const STORAGE_KEYS = {
  COMPANIES: 'cronos_companies',
  USERS: 'cronos_users',
  CLIENTS: 'cronos_clients',
  PROFESSIONALS: 'cronos_professionals',
  SERVICES: 'cronos_services',
  APPOINTMENTS: 'cronos_appointments',
  EVENTS: 'cronos_events',
  TRANSACTIONS: 'cronos_transactions',
  NOTIFICATIONS: 'cronos_notifications',
  CURRENT_USER: 'cronos_session'
};

// Seeder
const seedData = () => {
  if (localStorage.getItem(STORAGE_KEYS.USERS)) return;

  const defaultTemplates = {
    appointmentCreated: "Olá {client_name}, seu agendamento de {service_name} foi confirmado para {date} às {time} com {professional_name}.📍",
    appointmentReminder: "Lembrete: Você tem um horário de {service_name} hoje às {time}. Confirma?",
    appointmentCancelled: "Olá {client_name}, seu agendamento para {date} foi cancelado. Entre em contato para reagendar.",
    paymentLink: "Olá, segue o link de pagamento para seu serviço: {link}",
    eventInvite: "Você foi inscrito no evento {event_title} dia {date}. Link: {link}"
  };

  const companies: Company[] = [
    { 
      id: 'comp1', 
      name: 'Barbearia Vintage', 
      plan: 'PRO', 
      active: true, 
      createdAt: new Date().toISOString(),
      notificationSettings: {
        provider: 'MOCK',
        apiKey: 'sk_test_123',
        active: true,
        templates: defaultTemplates
      }
    },
    { 
      id: 'comp2', 
      name: 'Consultoria Tech', 
      plan: 'ENTERPRISE', 
      active: true, 
      createdAt: new Date().toISOString(),
      notificationSettings: {
        provider: 'WHATSAPP_CLOUD',
        apiKey: '',
        active: false,
        templates: defaultTemplates
      }
    }
  ];

  const users: User[] = [
    { id: '1', name: 'Master Admin', email: 'master@cronos.com', role: 'MASTER_ADMIN' },
    { id: '2', companyId: 'comp1', name: 'Admin Barbearia', email: 'admin@barbearia.com', role: 'EMPRESA_ADMIN' },
    { id: '3', companyId: 'comp2', name: 'Admin Consultoria', email: 'admin@consultoria.com', role: 'EMPRESA_ADMIN' },
    { id: '4', companyId: 'comp1', name: 'João Cliente', email: 'joao@cliente.com', role: 'CLIENTE' }
  ];

  const services: Service[] = [
    { 
      id: 's1', companyId: 'comp1', name: 'Corte Clássico', durationMinutes: 45, price: 50, 
      customFields: [
         { id: 'cf1', label: 'Estilo preferido', type: 'text', required: false },
         { id: 'cf2', label: 'Bebida de cortesia', type: 'select', options: ['Água', 'Café', 'Cerveja'], required: true }
      ] 
    },
    { 
      id: 's2', companyId: 'comp2', name: 'Mentoria Startup', durationMinutes: 60, price: 350, customFields: [] }
  ];

  const professionals: Professional[] = [
    { 
      id: 'p1', companyId: 'comp1', name: 'Carlos Silva', email: 'carlos@barbearia.com', specialty: 'Barbeiro', 
      slotInterval: 45,
      availability: Array.from({ length: 7 }, (_, i) => ({ 
        dayOfWeek: i, 
        active: i !== 0,
        intervals: i !== 0 ? [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '18:00' }] : []
      })),
      exceptions: []
    },
    { 
      id: 'p2', companyId: 'comp2', name: 'Ana Souza', email: 'ana@consultoria.com', specialty: 'Estrategista', 
      slotInterval: 60,
      availability: Array.from({ length: 7 }, (_, i) => ({ 
        dayOfWeek: i, 
        active: i >= 1 && i <= 5,
        intervals: [{ start: '10:00', end: '16:00' }]
      })),
      exceptions: []
    }
  ];

  const clients: Client[] = [
    { id: 'c1', companyId: 'comp1', name: 'João Cliente', email: 'joao@cliente.com', phone: '5511999999999', createdAt: new Date().toISOString() },
    { id: 'c2', companyId: 'comp2', name: 'Maria CEO', email: 'maria@ceo.com', phone: '5511988888888', createdAt: new Date().toISOString() }
  ];

  const appointments: Appointment[] = [
    { 
      id: 'a1', companyId: 'comp1', clientId: 'c1', professionalId: 'p1', serviceId: 's1', 
      date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '10:45', status: 'CONFIRMED' 
    }
  ];

  const transactions: Transaction[] = [
    { id: 't1', companyId: 'comp1', date: new Date().toISOString(), amount: 50, type: 'INCOME', category: 'Serviço', description: 'Corte - João', status: 'PAID', referenceId: 'a1', paymentMethod: 'PIX' }
  ];

  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(professionals));
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
};

seedData();

const delay = () => new Promise(resolve => setTimeout(resolve, DELAY_MS));

function getItem<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setItem<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Helper to filter data based on user context
const filterByContext = <T>(data: T[], user: User): T[] => {
  if (user.role === 'MASTER_ADMIN') return data;
  if (!user.companyId) return [];
  // Handle items that might not have companyId (unlikely in this design but safe to check)
  return data.filter(item => (item as any).companyId === user.companyId);
};

export const StorageService = {
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

  getAll: async <T = any>(key: string): Promise<T[]> => {
    await delay();
    const allItems = getItem<T>(key);
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return [];
    return filterByContext(allItems, currentUser);
  },

  getById: async <T = any>(key: string, id: string): Promise<T | undefined> => {
    await delay();
    const items = getItem<T & { id: string }>(key);
    return items.find(i => i.id === id);
  },

  create: async <T extends { id: string }>(key: string, item: T): Promise<T> => {
    await delay();
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) throw new Error("Unauthorized");

    // Automatically assign companyId if user is not Master (or if they are Admin of a company)
    if (currentUser.role !== 'MASTER_ADMIN' && currentUser.companyId) {
      (item as any).companyId = currentUser.companyId;
    }

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

  getAppointments: async (): Promise<Appointment[]> => {
    return StorageService.getAll<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  },

  getCompanySettings: async (): Promise<Company | undefined> => {
    const user = StorageService.getCurrentUser();
    if (!user || !user.companyId) return undefined;
    const companies = getItem<Company>(STORAGE_KEYS.COMPANIES);
    return companies.find(c => c.id === user.companyId);
  },
  
  KEYS: STORAGE_KEYS
};