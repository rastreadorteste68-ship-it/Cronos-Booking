import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/UI';
import { Command, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'CODE'>('EMAIL');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  
  const { sendCode, verifyCode, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
        setError('Digite um e-mail válido.');
        return;
    }
    setError('');
    const codeReceived = await sendCode(email);
    setGeneratedCode(codeReceived);
    setStep('CODE');
    // Simulate SMS/Email arrival
    setTimeout(() => {
        alert(`SEU CÓDIGO DE ACESSO CRONOS: ${codeReceived}`);
    }, 500);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await verifyCode(email, code);
    if (success) {
      navigate('/');
    } else {
      setError('Código inválido. Tente novamente.');
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
          <p className="text-slate-500 mt-2">Acesso Seguro & Sem Senha</p>
        </div>

        <Card className="shadow-xl border-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          
          {step === 'EMAIL' ? (
            <form onSubmit={handleSendCode} className="space-y-5 animate-in slide-in-from-right duration-300">
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-slate-800">Bem-vindo(a)</h2>
                    <p className="text-sm text-slate-500">Digite seu e-mail para entrar ou criar conta.</p>
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
                    {isLoading ? 'Enviando...' : 'Continuar com Email'}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Button>

                <p className="text-xs text-center text-slate-400">
                    Se não tiver conta, criaremos uma automaticamente.
                </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5 animate-in slide-in-from-right duration-300">
                <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">Verifique seu E-mail</h2>
                    <p className="text-sm text-slate-500">Enviamos um código para <span className="font-medium text-slate-700">{email}</span></p>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-xs text-yellow-800 text-center">
                   ⚠️ Modo Demo: O código é <strong>{generatedCode}</strong>
                </div>

                <div className="relative">
                    <Lock className="absolute left-3 top-9 text-slate-400" size={18} />
                    <Input 
                        label="Código de 6 dígitos" 
                        type="text" 
                        value={code} 
                        onChange={(e) => setCode(e.target.value)} 
                        placeholder="123456"
                        className="pl-10 tracking-widest font-mono text-lg"
                        maxLength={6}
                        required 
                        autoFocus
                    />
                </div>

                {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-100">{error}</p>}

                <Button type="submit" className="w-full justify-center" disabled={isLoading}>
                    {isLoading ? 'Verificando...' : 'Acessar Painel'}
                </Button>
                
                <button 
                    type="button" 
                    onClick={() => { setStep('EMAIL'); setCode(''); setError(''); }}
                    className="w-full text-center text-sm text-slate-400 hover:text-slate-600"
                >
                    Voltar e trocar e-mail
                </button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};