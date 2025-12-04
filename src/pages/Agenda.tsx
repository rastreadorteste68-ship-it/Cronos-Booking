import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment, Client, Professional, Service } from '../types';
import { StorageService } from '../services/storage';
import { Button, Modal, Input, Select, Badge, Card } from '../components/UI';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Check, X } from 'lucide-react';
import { useAuth } from '../services/authContext';

export const Agenda: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'month' | 'list'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  
  // Data for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Appointment>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    status: 'PENDING'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [a, c, p, s] = await Promise.all([
      StorageService.getAppointments(),
      StorageService.getAll<Client>(StorageService.KEYS.CLIENTS),
      StorageService.getAll<Professional>(StorageService.KEYS.PROFESSIONALS),
      StorageService.getAll<Service>(StorageService.KEYS.SERVICES)
    ]);
    setAppointments(a);
    setClients(c);
    setProfessionals(p);
    setServices(s);
  };

  const handleCreate = async () => {
    if (!formData.clientId || !formData.serviceId || !formData.professionalId) return;
    
    // Calculate End Time
    const service = services.find(s => s.id === formData.serviceId);
    if (!service) return;
    
    const [hours, minutes] = formData.startTime!.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + service.durationMinutes);
    const endTime = format(endDate, 'HH:mm');

    const newAppt: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData as any,
      endTime,
    };

    await StorageService.create(StorageService.KEYS.APPOINTMENTS, newAppt);
    setIsModalOpen(false);
    fetchData();
  };

  const updateStatus = async (appt: Appointment, status: Appointment['status']) => {
    await StorageService.update(StorageService.KEYS.APPOINTMENTS, { ...appt, status });
    // If completed/paid, create transaction logic could go here
    if (status === 'COMPLETED') {
       const service = services.find(s => s.id === appt.serviceId);
       if(service) {
         await StorageService.create(StorageService.KEYS.TRANSACTIONS, {
            id: Math.random().toString(),
            date: new Date().toISOString(),
            amount: service.price,
            type: 'INCOME',
            category: 'Serviço',
            description: `Serviço: ${service.name}`,
            status: 'PAID',
            referenceId: appt.id
         });
       }
    }
    fetchData();
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getDayAppointments = (day: Date) => {
    return appointments.filter(a => isSameDay(new Date(a.date), day));
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h1>
          <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-slate-100 rounded"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-slate-100 rounded"><ChevronRight size={20} /></button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setView(view === 'month' ? 'list' : 'month')}>
            {view === 'month' ? 'Ver Lista' : 'Ver Calendário'}
          </Button>
          <Button onClick={() => setIsModalOpen(true)}><Plus size={18} /> Novo Agendamento</Button>
        </div>
      </div>

      {view === 'month' ? (
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Calendar Grid */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="py-3 text-center text-sm font-semibold text-slate-600">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-fr">
              {daysInMonth.map((day) => {
                const dayAppts = getDayAppointments(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                return (
                  <div 
                    key={day.toISOString()} 
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[100px] p-2 border-b border-r border-slate-100 cursor-pointer transition-colors hover:bg-slate-50 ${isSelected ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-500' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-700'}`}>
                        {format(day, 'd')}
                      </span>
                      {dayAppts.length > 0 && (
                        <span className="text-xs font-bold text-slate-400">{dayAppts.length}</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayAppts.slice(0, 3).map(a => (
                        <div key={a.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate ${
                          a.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                          a.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          a.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {a.startTime}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Drawer for Details */}
          {selectedDay && (
            <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col animate-in slide-in-from-right duration-200">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 capitalize">{format(selectedDay, 'EEEE, d MMMM', { locale: ptBR })}</h3>
                <button onClick={() => setSelectedDay(null)}><X size={18} className="text-slate-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {getDayAppointments(selectedDay).length === 0 ? (
                  <p className="text-center text-slate-400 py-8">Sem agendamentos</p>
                ) : getDayAppointments(selectedDay).map(appt => {
                    const client = clients.find(c => c.id === appt.clientId);
                    const service = services.find(s => s.id === appt.serviceId);
                    return (
                      <div key={appt.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                        <div className="flex justify-between items-start mb-2">
                          <Badge color={
                            appt.status === 'CONFIRMED' ? 'blue' :
                            appt.status === 'COMPLETED' ? 'green' :
                            appt.status === 'CANCELLED' ? 'red' : 'yellow'
                          }>{appt.status}</Badge>
                          <span className="text-xs font-bold text-slate-500">{appt.startTime} - {appt.endTime}</span>
                        </div>
                        <p className="font-medium text-slate-900">{client?.name}</p>
                        <p className="text-xs text-slate-500 mb-2">{service?.name}</p>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {appt.status === 'PENDING' && (
                            <>
                              <button onClick={() => updateStatus(appt, 'CONFIRMED')} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={14} /></button>
                              <button onClick={() => updateStatus(appt, 'CANCELLED')} className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"><X size={14} /></button>
                            </>
                          )}
                           {appt.status === 'CONFIRMED' && (
                             <button onClick={() => updateStatus(appt, 'COMPLETED')} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Concluir</button>
                           )}
                        </div>
                      </div>
                    )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <div className="space-y-2">
             {appointments.map(a => (
               <div key={a.id} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0">
                 <div>
                    <p className="font-medium text-slate-900">{format(new Date(a.date), 'dd/MM/yyyy')} - {a.startTime}</p>
                    <p className="text-sm text-slate-500">{clients.find(c => c.id === a.clientId)?.name} - {services.find(s => s.id === a.serviceId)?.name}</p>
                 </div>
                 <Badge color="gray">{a.status}</Badge>
               </div>
             ))}
          </div>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Agendamento">
        <div className="space-y-4">
          <Input 
            type="date" 
            label="Data" 
            value={formData.date} 
            onChange={e => setFormData({...formData, date: e.target.value})} 
          />
          <div className="grid grid-cols-2 gap-4">
             <Input 
              type="time" 
              label="Horário Início" 
              value={formData.startTime} 
              onChange={e => setFormData({...formData, startTime: e.target.value})} 
            />
          </div>
          
          <Select 
            label="Cliente" 
            value={formData.clientId} 
            onChange={e => setFormData({...formData, clientId: e.target.value})}
          >
            <option value="">Selecione...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>

          <Select 
            label="Serviço" 
            value={formData.serviceId} 
            onChange={e => setFormData({...formData, serviceId: e.target.value})}
          >
            <option value="">Selecione...</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name} - R${s.price}</option>)}
          </Select>

          <Select 
            label="Profissional" 
            value={formData.professionalId} 
            onChange={e => setFormData({...formData, professionalId: e.target.value})}
          >
            <option value="">Selecione...</option>
            {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          
          <Button onClick={handleCreate} className="w-full mt-4">Confirmar Agendamento</Button>
        </div>
      </Modal>
    </div>
  );
};