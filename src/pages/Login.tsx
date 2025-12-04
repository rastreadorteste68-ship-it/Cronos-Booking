import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { Button, Input, Card } from '../components/UI';
import { Command, ArrowRight, Shield, Building2, User } from 'lucide-react';
import { Role } from '../types';

export const Login: React.FC = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>('MASTER_ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleRoleSelect = (selected: Role) => {
    setRole(selected);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setError('Preencha todos os campos.');
        return;
    }
    setError('');
    
    try {
      await login(email, password, role);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setError('Senha incorreta.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente mais tarde.');
      } else {
        setError('Erro ao autenticar. Verifique suas credenciais.');
      }
    }
  };

  const RoleCard = ({ r, icon: Icon, title, desc }: any) => (
    <button 
      onClick={() => handleRoleSelect(r)}
      className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all group bg-white"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{desc}</p>
        </div>
        <ArrowRight className="ml-auto text-slate-300 group-hover:text-indigo-600" size={20} />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200">
            <Command size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Cronos</h1>
          <p className="text-slate-500 mt-2">Sistema de Agendamento Inteligente</p>
        </div>

        {step === 1 ? (
           <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
              <p className="text-center text-slate-600 font-medium mb-2">Selecione seu perfil de acesso:</p>
              <RoleCard r="MASTER_ADMIN" icon={Shield} title="Master Admin" desc="Gestão total da plataforma" />
              <RoleCard r="EMPRESA_ADMIN" icon={Building2} title="Empresa" desc="Gerenciar meu negócio" />
              <RoleCard r="CLIENTE" icon={User} title="Cliente" desc="Acessar meus agendamentos" />
           </div>
        ) : (
          <Card className="shadow-xl border-0 overflow-hidden relative">
            <button onClick={() => setStep(1)} className="absolute top-4 left-4 text-xs font-semibold text-slate-400 hover:text-indigo-600">
              &larr; Voltar
            </button>
            <div className="mt-6 text-center">
              <h2 className="text-lg font-semibold text-slate-800">Login {role.replace('_', ' ')}</h2>
              <p className="text-sm text-slate-500">Digite seu e-mail e senha para entrar.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                <Input 
                  label="Email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="seu@email.com"
                  required 
                  autoFocus
                />
                
                <Input 
                  label="Senha" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required 
                />
                
                {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-100">{error}</p>}

                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full justify-center" disabled={isLoading}>
                      {isLoading ? 'Carregando...' : 'Entrar'}
                  </Button>
                  
                  <Button type="submit" variant="secondary" className="w-full justify-center" disabled={isLoading}>
                      Criar Conta
                  </Button>
                </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};