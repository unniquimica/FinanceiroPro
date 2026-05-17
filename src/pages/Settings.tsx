import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Database, Download, Upload, AlertTriangle, CheckCircle2, Users, Key, Eye, EyeOff } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function Settings() {
  const { categories, launches, parcels, addCategory, addLaunch, deleteCategory, deleteLaunch } = useFinance();
  const { user, updatePassword } = useAuth();
  const { showToast } = useToast();
  
  const [isExporting, setIsExporting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    
    try {
      setIsUpdatingPassword(true);
      await updatePassword(currentPassword, newPassword);
      showToast('Senha alterada com sucesso!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      showToast(error.message || 'Erro ao alterar a senha.', 'error');
    } finally {
      setIsUpdatingPassword(false);
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
      link.download = `financeiro-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Dados exportados com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao exportar os dados.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('TEM CERTEZA ABSOLUTA? Isso irá apagar todos os lançamentos e parcelas. As categorias padrão serão mantidas. Esta ação não tem volta.')) {
      try {
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories: null, launches: [], parcels: [] })
        });
        showToast('Sistema resetado com sucesso.');
        setTimeout(() => window.location.reload(), 1500);
      } catch (e) {
        showToast('Erro ao resetar dados.', 'error');
      }
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
              <p className="text-sm text-slate-500">Importe um arquivo JSON gerado anteriormente. (Em breve)</p>
            </div>
            <Button disabled variant="secondary" className="gap-2 shrink-0">
              <Upload className="w-4 h-4" />
              Importar Dados
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 border border-red-100 bg-red-50/50 rounded-lg">
            <div>
              <h4 className="font-medium text-red-800">Apagar Tudo</h4>
              <p className="text-sm text-red-600/80">Isto excluirá permanentemente todas as suas categorias, lançamentos e pagamentos.</p>
            </div>
            <Button onClick={handleClearData} variant="destructive" className="shrink-0 gap-2">
              <AlertTriangle className="w-4 h-4" />
              Resetar Sistema
            </Button>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
