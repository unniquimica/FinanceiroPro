import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Database, Download, Upload, AlertTriangle, CheckCircle2, Users, Key, Eye, EyeOff } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { useAuth } from '../context/AuthContext';
import { defaultCategories } from '../data/mockData';

export function Settings() {
  const { categories, launches, parcels, restoreData } = useFinance();
  const { user, updatePassword } = useAuth();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [clearPassword, setClearPassword] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const { login } = useAuth();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    
    try {
      setIsUpdatingPassword(true);
      await updatePassword(currentPassword, newPassword);
      setMessage({ text: 'Senha alterada com sucesso!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      setMessage({ text: error.message || 'Erro ao alterar a senha.', type: 'error' });
    } finally {
      setIsUpdatingPassword(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleExportData = () => {
    try {
      setIsExporting(true);
      const data = {
        categories,
        launches,
        parcels,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `financeiro-votoshop-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ text: 'Dados exportados com sucesso!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Erro ao exportar os dados.', type: 'error' });
    } finally {
      setIsExporting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data && (data.categories || data.launches || data.parcels)) {
          if (window.confirm('CUIDADO: Isso irá substituir todos os seus dados atuais pelos dados deste backup. Deseja continuar?')) {
            restoreData(data);
            setMessage({ text: 'Backup restaurado com sucesso!', type: 'success' });
          }
        } else {
          setMessage({ text: 'Arquivo de backup inválido ou vazio.', type: 'error' });
        }
      } catch (error) {
        console.error('Import error:', error);
        setMessage({ text: 'Erro ao ler o arquivo de backup. Verifique se é um JSON válido.', type: 'error' });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setMessage(null), 3000);
      }
    };
    reader.onerror = () => {
      setMessage({ text: 'Erro ao carregar o arquivo.', type: 'error' });
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (!isConfirmingClear) {
      if (window.confirm('TEM CERTEZA ABSOLUTA? Isso irá apagar TODOS os dados do sistema. Esta ação não pode ser desfeita.')) {
        setIsConfirmingClear(true);
      }
      return;
    }

    if (!clearPassword) {
      setMessage({ text: 'Por favor, insira sua senha para confirmar.', type: 'error' });
      return;
    }

    try {
      setIsClearing(true);
      // Re-autentica para verificar se a senha está correta
      if (user?.email) {
        await login(user.email, clearPassword);
        
        // Se chegou aqui, a senha está correta
        localStorage.removeItem('@FinancasPro:data:v1');
        restoreData({ categories: defaultCategories, launches: [], parcels: [] });
        setMessage({ text: 'Sistema resetado com sucesso!', type: 'success' });
        setIsConfirmingClear(false);
        setClearPassword('');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ text: 'Senha incorreta. Ação cancelada.', type: 'error' });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
          <p className="text-sm text-slate-500">Gerencie seus dados e preferências do sistema.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-slate-500" />
            Alterar Senha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Senha Atual</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Nova Senha</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? 'Salvando...' : 'Atualizar Senha'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-slate-500" />
            Dados e Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 border border-slate-200 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-900">Exportar Backup</h4>
              <p className="text-sm text-slate-500">Baixe um arquivo JSON contendo todos os seus registros financeiros.</p>
            </div>
            <Button onClick={handleExportData} disabled={isExporting} className="gap-2 shrink-0">
              <Download className="w-4 h-4" />
              {isExporting ? 'Exportando...' : 'Exportar Dados'}
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 border border-slate-200 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-900">Restaurar Backup</h4>
              <p className="text-sm text-slate-500">Importe um arquivo JSON gerado anteriormente.</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportData}
              accept=".json"
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isImporting} 
              variant="secondary" 
              className="gap-2 shrink-0"
            >
              <Upload className="w-4 h-4" />
              {isImporting ? 'Importando...' : 'Importar Dados'}
            </Button>
          </div>

          <div className="flex flex-col gap-4 p-4 border border-red-100 bg-red-50/50 rounded-lg">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ">
              <div>
                <h4 className="font-medium text-red-800">Apagar Tudo</h4>
                <p className="text-sm text-red-600/80">Isto excluirá permanentemente todas as suas categorias, lançamentos e pagamentos.</p>
              </div>
              {!isConfirmingClear && (
                <Button onClick={handleClearData} variant="destructive" className="shrink-0 gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Resetar Sistema
                </Button>
              )}
            </div>

            {isConfirmingClear && (
              <div className="mt-2 space-y-3 p-4 bg-white border border-red-200 rounded-md shadow-sm">
                <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Confirme sua senha para continuar
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="password"
                    placeholder="Sua senha de acesso"
                    value={clearPassword}
                    onChange={(e) => setClearPassword(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={handleClearData}
                      disabled={isClearing || !clearPassword}
                    >
                      {isClearing ? 'Apagando...' : 'Confirmar e Apagar'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsConfirmingClear(false);
                        setClearPassword('');
                      }}
                      disabled={isClearing}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
