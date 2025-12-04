import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { Appointment, Transaction } from '../types';
import { Card, Badge } from '../components/UI';
import { DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const Dashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const load = async () => {
      const a = await StorageService.getAppointments();
      const t = await StorageService.getAll<Transaction>(StorageService.KEYS.TRANSACTIONS);
      setAppointments(a);
      setTransactions(t);
    };
    load();
  }, []);

  const totalRevenue = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingAppointments = appointments.filter(a => a.status === 'PENDING').length;
  const todayAppointments = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length;

  const data = appointments.reduce((acc: any[], curr) => {
    const day = curr.date.split('-')[2]; // Simple day extraction
    const found = acc.find(i => i.name === day);
    if (found) found.count++;
    else acc.push({ name: day, count: 1 });
    return acc;
  }, []).sort((a, b) => parseInt(a.name) - parseInt(b.name)).slice(-7);

  const StatsCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Receita Total" value={`R$ ${totalRevenue}`} icon={DollarSign} color="bg-emerald-500" />
        <StatsCard title="Agendamentos Hoje" value={todayAppointments} icon={Calendar} color="bg-indigo-500" />
        <StatsCard title="Pendentes" value={pendingAppointments} icon={Clock} color="bg-amber-500" />
        <StatsCard title="Concluídos Total" value={appointments.filter(a => a.status === 'COMPLETED').length} icon={CheckCircle} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Agendamentos por Dia" className="h-full">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Próximos Agendamentos">
            <div className="space-y-4">
              {appointments
                .filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING')
                .slice(0, 5)
                .map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{a.date.split('-').reverse().slice(0, 2).join('/')} - {a.startTime}</p>
                    <Badge color={a.status === 'PENDING' ? 'yellow' : 'blue'}>{a.status}</Badge>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && <p className="text-slate-400 text-sm">Nenhum agendamento.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};