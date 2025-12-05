import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { Button, Input, Card } from '../components/UI';
import { Command } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setError('Preencha todos os campos.');
        return;
    }
    setError('');
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha inválidos.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente mais tarde.');
      } else {
        setError('Erro ao autenticar. Verifique suas credenciais.');
      }
    }
  };

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

        <Card className="shadow-xl border-0">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-slate-800">Bem-vindo de volta</h2>
              <p className="text-sm text-slate-500">Acesse sua conta para continuar.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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

                <Button type="submit" className="w-full justify-center" disabled={isLoading}>
                    {isLoading ? 'Carregando...' : 'Entrar'}
                </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600 mb-3">Não tem uma conta?</p>
              <Link to="/register">
                 <Button variant="secondary" className="w-full justify-center" type="button">
                    Criar Conta
                 </Button>
              </Link>
            </div>
        </Card>
      </div>
    </div>
  );
};