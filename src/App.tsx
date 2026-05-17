import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { AnnualView } from './pages/AnnualView';
import { Launches } from './pages/Launches';
import { Categories } from './pages/Categories';
import { Settings } from './pages/Settings';
import { AuthPage } from './pages/Auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center bg-white rounded-xl border border-slate-200">
      <div className="max-w-md space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="text-slate-500">
          Esta tela está em desenvolvimento. A estrutura de dados já foi construída e estamos montando as interfaces com o padrão Notion/Stripe.
        </p>
      </div>
    </div>
  );
}

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <FinanceProvider>
        <Layout />
      </FinanceProvider>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/anual" element={<AnnualView />} />
            <Route path="/lancamentos" element={<Launches />} />
            <Route path="/categorias" element={<Categories />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}



