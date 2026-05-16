import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export function AuthPage() {
  const { user, login, register, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      if (mode === 'login') {
        await login(credential, password);
        navigate('/');
      } else if (mode === 'register') {
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres');
          return;
        }
        await register(username, email, password);
        setMode('login');
        setCredential(username);
        setMessage('Cadastro realizado com sucesso! Você já pode entrar.');
      } else if (mode === 'forgot') {
        const res = await resetPassword(credential);
        if (res.newTempPassword) {
          setMessage(`Link de recuperação simulado. Sua nova senha é: ${res.newTempPassword}`);
        } else {
          setMessage(res.message || 'Verifique seu e-mail para recuperar a senha.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center pb-2 flex flex-col items-center">
          <img src="https://finance.tradecontrol.net/img/fc_logo.webp" alt="Financeiro Pró Logo" className="h-16 object-contain mb-2" />
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Financeiro Pró
          </CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Entre na sua conta' : mode === 'register' ? 'Crie uma nova conta' : 'Recuperar senha'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm font-medium">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-sm font-medium">
                {message}
              </div>
            )}
            
            {(mode === 'login' || mode === 'forgot') && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">E-mail</label>
                <input
                  required
                  type="email"
                  value={credential}
                  onChange={e => setCredential(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Nome de Usuário</label>
                  <input
                    required
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">E-mail</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            
            {(mode === 'login' || mode === 'register') && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Senha</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Cadastrar' : 'Recuperar Senha'}
            </Button>
            
            <div className="flex flex-col gap-2 text-center text-sm mt-4">
              {mode === 'login' && (
                <>
                  <button type="button" onClick={() => setMode('forgot')} className="text-blue-600 hover:underline">Esqueci minha senha</button>
                  <button type="button" onClick={() => setMode('register')} className="text-slate-600 hover:underline">Criar nova conta</button>
                </>
              )}
              {mode !== 'login' && (
                <button type="button" onClick={() => setMode('login')} className="text-blue-600 hover:underline">Voltar para o login</button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
