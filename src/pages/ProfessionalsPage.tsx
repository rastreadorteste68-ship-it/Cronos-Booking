import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { Professional, AvailabilityRule, AvailabilityException } from '../types';
import { Button, Card, Badge, Modal, Input } from '../components/UI';
import { Mail, Clock, Calendar as CalendarIcon, Edit2, Check, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ProfessionalsPage: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [editingProf, setEditingProf] = useState<Professional | null>(null);
  const [activeTab, setActiveTab] = useState<'weekly' | 'exceptions'>('weekly');
  
  // Exception Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    load();
  }, []);

  const load = async () => setProfessionals(await StorageService.getAll(StorageService.KEYS.PROFESSIONALS));

  const handleSave = async () => {
    if (editingProf) {
      await StorageService.update(StorageService.KEYS.PROFESSIONALS, editingProf);
      setEditingProf(null);
      load();
    }
  };

  const toggleDay = (dayIndex: number) => {
    if (!editingProf) return;
    const newAvailability = [...editingProf.availability];
    const ruleIndex = newAvailability.findIndex(r => r.dayOfWeek === dayIndex);
    if (ruleIndex >= 0) {
      newAvailability[ruleIndex] = { ...newAvailability[ruleIndex], active: !newAvailability[ruleIndex].active };
      setEditingProf({ ...editingProf, availability: newAvailability });
    }
  };

  const updateRule = (dayIndex: number, field: keyof AvailabilityRule, value: string) => {
    if (!editingProf) return;
    const newAvailability = [...editingProf.availability];
    const ruleIndex = newAvailability.findIndex(r => r.dayOfWeek === dayIndex);
    if (ruleIndex >= 0) {
      newAvailability[ruleIndex] = { ...newAvailability[ruleIndex], [field]: value };
      setEditingProf({ ...editingProf, availability: newAvailability });
    }
  };

  const toggleException = (date: Date) => {
    if (!editingProf) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingIndex = editingProf.exceptions?.findIndex(e => e.date === dateStr);
    
    let newExceptions = editingProf.exceptions ? [...editingProf.exceptions] : [];

    if (existingIndex !== undefined && existingIndex >= 0) {
       // Toggle active state or remove? Let's just remove for simplicity in this interaction
       newExceptions.splice(existingIndex, 1);
    } else {
       // Add exception (assume day off by default)
       newExceptions.push({ date: dateStr, active: false, reason: 'Folga' });
    }
    setEditingProf({ ...editingProf, exceptions: newExceptions });
  };

  const renderCalendar = () => {
    if (!editingProf) return null;
    const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
    
    return (
      <div className="bg-white rounded border border-slate-200">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {['D','S','T','Q','Q','S','S'].map(d => <div key={d} className="p-2 text-center text-xs font-bold text-slate-500">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const exception = editingProf.exceptions?.find(e => e.date === dateStr);
            const isException = !!exception;
            
            // Determine visual state
            // 1. Is it an exception?
            // 2. If not, is it a working day by weekly rule?
            const dayOfWeek = getDay(day);
            const weeklyRule = editingProf.availability.find(r => r.dayOfWeek === dayOfWeek);
            const isWorkDay = isException ? exception.active : (weeklyRule?.active);

            let bgClass = "bg-white";
            if (isException) {
              bgClass = exception.active ? "bg-indigo-100" : "bg-orange-100"; // Orange for Day Off Exception
            } else if (!isWorkDay) {
               bgClass = "bg-slate-50 opacity-50";
            }

            return (
              <div 
                key={dateStr} 
                onClick={() => toggleException(day)}
                className={`aspect-square border-r border-b border-slate-100 p-1 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 ${bgClass}`}
              >
                <span className="text-sm">{format(day, 'd')}</span>
                {isException && (
                  <span className="text-[10px] leading-tight text-center text-slate-600 font-medium">
                    {exception.active ? 'Extra' : 'Folga'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Gerenciar Profissionais</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {professionals.map(p => (
          <Card key={p.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{p.name}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1"><Mail size={12} /> {p.email}</p>
                  <Badge color="indigo" className="mt-1">{p.specialty}</Badge>
                </div>
              </div>
              <Button variant="secondary" onClick={() => setEditingProf(p)}><Edit2 size={16} /></Button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
               <div>
                 <span className="text-slate-500 block">Tempo de Serviço</span>
                 <span className="font-medium">{p.slotInterval || 60} min</span>
               </div>
               <div>
                 <span className="text-slate-500 block">Dias Úteis</span>
                 <span className="font-medium">{p.availability.filter(a => a.active).length} / 7</span>
               </div>
            </div>
          </Card>
        ))}
      </div>

      {/* EDIT MODAL */}
      <Modal isOpen={!!editingProf} onClose={() => setEditingProf(null)} title={`Editar: ${editingProf?.name}`}>
        <div className="space-y-6">
          
          <div className="flex gap-2 border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('weekly')} 
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'weekly' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}
            >
              Semanal
            </button>
            <button 
              onClick={() => setActiveTab('exceptions')} 
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'exceptions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}
            >
              Exceções / Folgas
            </button>
          </div>

          {activeTab === 'weekly' && editingProf && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="flex items-center gap-4">
                 <div className="w-1/3">
                    <Input 
                      label="Duração Padrão (min)" 
                      type="number" 
                      value={editingProf.slotInterval || 60} 
                      onChange={e => setEditingProf({...editingProf, slotInterval: Number(e.target.value)})}
                    />
                 </div>
              </div>
              <hr />
              {editingProf.availability.map((rule, idx) => (
                <div key={rule.dayOfWeek} className={`p-3 rounded-lg border ${rule.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-700 w-20">{['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][rule.dayOfWeek]}</span>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={rule.active} onChange={() => toggleDay(idx)} />
                        <div className={`block w-10 h-6 rounded-full ${rule.active ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${rule.active ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                  
                  {rule.active && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                       <div>
                         <label className="text-xs text-slate-500 block mb-1">Horário</label>
                         <div className="flex gap-1 items-center">
                           <input type="time" className="text-xs border rounded p-1 w-full" value={rule.start} onChange={e => updateRule(idx, 'start', e.target.value)} />
                           <span className="text-slate-400">-</span>
                           <input type="time" className="text-xs border rounded p-1 w-full" value={rule.end} onChange={e => updateRule(idx, 'end', e.target.value)} />
                         </div>
                       </div>
                       <div>
                         <label className="text-xs text-slate-500 block mb-1">Intervalo (Almoço)</label>
                         <div className="flex gap-1 items-center">
                           <input type="time" className="text-xs border rounded p-1 w-full" value={rule.breakStart || ''} onChange={e => updateRule(idx, 'breakStart', e.target.value)} />
                           <span className="text-slate-400">-</span>
                           <input type="time" className="text-xs border rounded p-1 w-full" value={rule.breakEnd || ''} onChange={e => updateRule(idx, 'breakEnd', e.target.value)} />
                         </div>
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'exceptions' && (
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <h4 className="font-medium text-slate-800">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</h4>
                 <div className="text-xs text-slate-500">Clique no dia para alternar exceção</div>
               </div>
               {renderCalendar()}
               
               <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                 <p className="font-medium mb-1">Legenda:</p>
                 <div className="flex gap-3">
                   <div className="flex items-center gap-1"><span className="w-3 h-3 bg-white border border-slate-300"></span> Normal</div>
                   <div className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-100 border border-orange-200"></span> Folga/Bloqueado</div>
                   <div className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-100 border border-indigo-200"></span> Extra</div>
                 </div>
               </div>
            </div>
          )}

          <Button onClick={handleSave} className="w-full">Salvar Alterações</Button>
        </div>
      </Modal>
    </div>
  );
};