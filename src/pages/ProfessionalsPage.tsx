import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { Professional } from '../types';
import { Button, Card, Badge } from '../components/UI';
import { Mail, Clock } from 'lucide-react';

export const ProfessionalsPage: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    const load = async () => setProfessionals(await StorageService.getAll(StorageService.KEYS.PROFESSIONALS));
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Profissionais</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {professionals.map(p => (
          <Card key={p.id}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                {p.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{p.name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1"><Mail size={12} /> {p.email}</p>
              </div>
              <div className="ml-auto">
                <Badge color="indigo">{p.specialty}</Badge>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Disponibilidade</p>
              <div className="grid grid-cols-2 gap-2">
                {p.availability.filter(a => a.active).map(a => (
                  <div key={a.dayOfWeek} className="text-xs flex justify-between bg-slate-50 p-2 rounded">
                    <span className="font-medium text-slate-700">{['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][a.dayOfWeek]}</span>
                    <span className="text-slate-500">{a.start} - {a.end}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};