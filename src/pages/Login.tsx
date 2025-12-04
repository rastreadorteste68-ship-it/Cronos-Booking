import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { Button, Input, Card } from '../components/UI';
import { Command, Mail, ArrowRight, CheckCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const { sendLink, isLoading } = useAuth();
  const [error, setError] = useState('');

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
        setError('Digite um e-mail válido.');
        return;
    }
    setError('');
    
    try {
      await sendLink(email);
      setIsSent(true);
    } catch (err) {
      console.error(err);
      setError('Erro ao enviar link. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200">
            <Command size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Cronos Booking</h1>
          <p className="text-slate-500 mt-2">Acesso via Link Mágico</p>
        </div>

        <Card className="shadow-xl border-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          
          {!isSent ? (
            <form onSubmit={handleSendLink} className="space-y-5 animate-in slide-in-from-right duration-300">
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-slate-800">Bem-vindo(a)</h2>
                    <p className="text-sm text-slate-500">Digite seu e-mail para receber o link de acesso.</p>
                </div>

                <div className="relative">
                    <Mail className="absolute left-3 top-9 text-slate-400" size={18} />
                    <Input 
                        label="Email Profissional" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="nome@empresa.com"
                        className="pl-10"
                        required 
                        autoFocus
                    />
                </div>
                
                {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-100">{error}</p>}

                <Button type="submit" className="w-full justify-center group" disabled={isLoading}>
                    {isLoading ? 'Enviando...' : 'Enviar Link de Acesso'}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Button>

                <p className="text-xs text-center text-slate-400">
                   Você receberá um link no seu e-mail para entrar.
                </p>
            </form>
          ) : (
            <div className="space-y-5 animate-in slide-in-from-right duration-300 text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                    <CheckCircle size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Verifique seu E-mail</h2>
                    <p className="text-slate-500 mt-2">
                      Enviamos um link mágico para <br/>
                      <span className="font-medium text-slate-900">{email}</span>
                    </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
                   Clique no link enviado para entrar automaticamente. Pode fechar esta aba se preferir.
                </div>
                
                <button 
                    type="button" 
                    onClick={() => { setIsSent(false); setEmail(''); setError(''); }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    Tentar outro e-mail
                </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
