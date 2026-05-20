import React from 'react';
import { X, BookOpen, AlertCircle, Zap, Edit3, Layers, FileText } from 'lucide-react';
import { Button } from './ui/Button';

interface SystemRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemRulesModal({ isOpen, onClose }: SystemRulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Regras Importantes do Sistema</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-105 active:bg-slate-100"
            aria-label="Fecar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600 scrollbar-hide">
          {/* Section 1 */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-bold text-base text-slate-900">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              1. Lançamentos Não Contábeis
            </h4>
            <p className="leading-relaxed pl-7">
              Todos os lançamentos classificados como <span className="font-semibold text-slate-800">“Despesas Não Contábeis”</span> ou <span className="font-semibold text-slate-800">“Receitas Não Contábeis”</span> não interferem:
            </p>
            <ul className="list-disc pl-12 space-y-1 text-slate-600">
              <li>nos valores exibidos na Dashboard;</li>
              <li>nos totais da Visão Mensal.</li>
            </ul>
            <p className="leading-relaxed pl-7 text-xs text-slate-500 italic">
              Esses lançamentos são utilizados apenas para controle interno e consulta, sem impactar os resultados financeiros principais do sistema.
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2 */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-bold text-base text-slate-900">
              <Zap className="w-5 h-5 text-amber-500 shrink-0" />
              2. Lançamento Rápido
            </h4>
            <p className="leading-relaxed pl-7">
              Os lançamentos realizados através do ícone <span className="font-semibold text-slate-800">“Lançamento Rápido”</span> possuem como objetivo agilizar o cadastro de despesas e receitas do dia a dia.
            </p>
            <p className="leading-relaxed pl-7">
              Nese modo, <span className="font-semibold text-slate-800">apenas o campo Valor é obrigatório</span>.
            </p>
            <p className="leading-relaxed pl-7">
              Ao realizar um lançamento preenchendo somente o valor, o sistema classificará automaticamente o registro como:
            </p>
            <ul className="list-disc pl-12 space-y-1 text-slate-600">
              <li>Despesa Não Contábil;</li>
              <li>Receita Não Contábil.</li>
            </ul>
            <p className="leading-relaxed pl-7">
              Por esse motivo, esses lançamentos:
            </p>
            <ul className="list-disc pl-12 space-y-1 text-slate-600 font-medium text-amber-800">
              <li>não serão contabilizados na Dashboard;</li>
              <li>não serão contabilizados na Visão Mensal.</li>
            </ul>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3 */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-bold text-base text-slate-900">
              <Edit3 className="w-5 h-5 text-blue-500 shrink-0" />
              3. Edição Posterior dos Lançamentos
            </h4>
            <p className="leading-relaxed pl-7">
              Sempre que possível, recomenda-se acessar posteriormente a tela de Lançamentos para editar o registro e complementar as informações necessárias, como:
            </p>
            <ul className="list-disc pl-12 space-y-1 text-slate-600">
              <li>Descrição;</li>
              <li>Categoria;</li>
              <li>Observações.</li>
            </ul>
            <p className="leading-relaxed pl-7">
              Isso garante uma organização financeira mais completa e relatórios mais precisos.
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Section 4 */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-bold text-base text-slate-900">
              <Layers className="w-5 h-5 text-indigo-500 shrink-0" />
              4. Organização da Visão Mensal
            </h4>
            <p className="leading-relaxed pl-7">
              Na Visão Mensal, todos os lançamentos que possuírem a mesma descrição serão agrupados em uma única linha, somando automaticamente seus respectivos valores.
            </p>
            <p className="font-semibold text-slate-800 pl-7">
              Exemplo:
            </p>
            <ul className="list-disc pl-12 space-y-1 text-slate-600">
              <li>Se vários lançamentos forem cadastrados com a descrição “Lançamento Rápido”, todos aparecerão agrupados em apenas uma linha.</li>
              <li>O mesmo comportamento ocorrerá com qualquer outro nome ou descrição repetida.</li>
            </ul>
          </div>

          <hr className="border-slate-100" />

          {/* Section 5 */}
          <div className="space-y-3 text-slate-600">
            <h4 className="flex items-center gap-2 font-bold text-base text-slate-900">
              <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
              5. Campo Observações
            </h4>
            <p className="leading-relaxed pl-7">
              Todos os lançamentos contam com o campo <span className="font-semibold text-slate-800">“Observações”</span>, que pode ser utilizado para adicionar detalhes importantes sobre a despesa ou receita registrada.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50 gap-3">
          <Button onClick={onClose} variant="secondary">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
