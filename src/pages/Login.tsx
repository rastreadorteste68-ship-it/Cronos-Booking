import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/UI';
import { Command } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('master@cronos.com');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email);
    if (success) {
      navigate('/');
    } else {
      setError('Usuário não encontrado.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200">
            <Command size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Cronos Booking SaaS</h1>
          <p className="text-slate-500 mt-2">Plataforma de gestão multi-empresas</p>
        </div>

        <Card className="shadow-xl border-0">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              label="Email de Acesso" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="seu@email.com"
              required 
            />
            
            {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}

            <Button type="submit" className="w-full justify-center" disabled={isLoading}>
              {isLoading ? 'Autenticando...' : 'Entrar na Plataforma'}
            </Button>
            
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
              <p className="font-semibold mb-3 uppercase tracking-wider">Perfis de Acesso (Demo):</p>
              <div className="space-y-2">
                <div onClick={() => setEmail('master@cronos.com')} className="p-2 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                  <span className="block font-bold text-indigo-600">Master Admin</span>
                  <span className="block text-slate-500">master@cronos.com</span>
                </div>
                <div onClick={() => setEmail('admin@barbearia.com')} className="p-2 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                  <span className="block font-bold text-slate-700">Empresa A (Barbearia)</span>
                  <span className="block text-slate-500">admin@barbearia.com</span>
                </div>
                <div onClick={() => setEmail('admin@consultoria.com')} className="p-2 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                  <span className="block font-bold text-slate-700">Empresa B (Consultoria)</span>
                  <span className="block text-slate-500">admin@consultoria.com</span>
                </div>
                <div onClick={() => setEmail('joao@cliente.com')} className="p-2 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                  <span className="block font-bold text-slate-700">Cliente Final</span>
                  <span className="block text-slate-500">joao@cliente.com</span>
                </div>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};