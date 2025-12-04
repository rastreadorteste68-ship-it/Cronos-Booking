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
      setError('Usuário não encontrado. Tente master@cronos.com ou admin@empresa.com');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200">
            <Command size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Bem-vindo ao Cronos</h1>
          <p className="text-slate-500 mt-2">Faça login para gerenciar seus agendamentos</p>
        </div>

        <Card className="shadow-xl border-0">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              label="Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="seu@email.com"
              required 
            />
            
            {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}

            <Button type="submit" className="w-full justify-center" disabled={isLoading}>
              {isLoading ? 'Acessando...' : 'Entrar com Email'}
            </Button>
            
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
              <p className="font-semibold mb-2">Usuários de Teste:</p>
              <ul className="space-y-1">
                <li onClick={() => setEmail('master@cronos.com')} className="cursor-pointer hover:text-indigo-600 transition-colors">• master@cronos.com (Master)</li>
                <li onClick={() => setEmail('admin@empresa.com')} className="cursor-pointer hover:text-indigo-600 transition-colors">• admin@empresa.com (Empresa)</li>
                <li onClick={() => setEmail('joao@cliente.com')} className="cursor-pointer hover:text-indigo-600 transition-colors">• joao@cliente.com (Cliente)</li>
              </ul>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};