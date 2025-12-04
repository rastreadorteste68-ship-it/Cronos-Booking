export type Role = 'MASTER_ADMIN' | 'EMPRESA_ADMIN' | 'CLIENTE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: string;
}

export interface Professional {
  id: string;
  name: string;
  email: string;
  specialty: string;
  availability: AvailabilityRule[];
}

export interface AvailabilityRule {
  dayOfWeek: number; // 0-6 (Sun-Sat)
  start: string; // "08:00"
  end: string; // "18:00"
  active: boolean;
}

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox';
  options?: string[]; // For select
  required: boolean;
}

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  customFields?: CustomField[];
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  date: string; // ISO Date YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  customFieldValues?: Record<string, any>;
  notes?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  speaker: string;
  capacity: number;
  enrolledIds: string[]; // Client IDs
  meetingLink?: string;
  description?: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  status: 'PENDING' | 'PAID';
  category: string;
  referenceId?: string; // Appointment ID or Event ID
}