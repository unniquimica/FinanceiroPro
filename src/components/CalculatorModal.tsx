import React, { useState, useEffect } from 'react';
import { X, Calculator, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from './ui/Button';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalculatorModal({ isOpen, onClose }: CalculatorModalProps) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isScientific, setIsScientific] = useState(false);

  if (!isOpen) return null;

  const handleNumber = (num: string) => {
    setDisplay(prev => prev === '0' ? num : prev + num);
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleEqual = () => {
    try {
      const sanitizedEquation = (equation + display)
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[^0-9\+\-\*\/\.\(\)% ]/g, '');
      
      const result = new Function('return ' + sanitizedEquation)();
      setDisplay(String(Number.isFinite(result) ? result : 'Error'));
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleScientific = (func: string) => {
    try {
      const current = parseFloat(display);
      let result = 0;
      switch (func) {
        case 'sin': result = Math.sin(current); break;
        case 'cos': result = Math.cos(current); break;
        case 'tan': result = Math.tan(current); break;
        case 'sqrt': result = Math.sqrt(current); break;
        case 'log': result = Math.log10(current); break;
        case 'ln': result = Math.log(current); break;
        case '^2': result = Math.pow(current, 2); break;
        case 'pi': result = Math.PI; break;
      }
      setDisplay(String(result));
    } catch {
      setDisplay('Error');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const key = e.key;

      if (/[0-9]/.test(key)) {
        e.preventDefault();
        handleNumber(key);
      } else if (['+', '-', '*', '/'].includes(key)) {
        e.preventDefault();
        handleOperator(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEqual();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        e.preventDefault();
        handleClear();
      } else if (key === 'Backspace') {
        e.preventDefault();
        setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      } else if (key === '.') {
        e.preventDefault();
        if (!display.includes('.')) handleNumber('.');
      } else if (key === '%') {
        e.preventDefault();
        handleOperator('%');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, display, equation]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 w-full ${isScientific ? 'max-w-md' : 'max-w-xs'}`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold">Calculadora</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsScientific(!isScientific)} className="p-1 rounded hover:bg-slate-700 text-slate-300" title="Alternar Científica">
              {isScientific ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="p-1 rounded hover:bg-red-500/20 text-slate-300 hover:text-red-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-slate-800 rounded-lg p-4 mb-4 text-right">
            <div className="text-slate-400 text-sm h-5 overflow-hidden">{equation}</div>
            <div className="text-3xl font-bold tracking-wider truncate">{display}</div>
          </div>

          <div className="flex gap-2">
            {isScientific && (
              <div className="grid grid-cols-2 gap-2 w-1/3">
                <button onClick={() => handleScientific('sin')} className="bg-slate-700 hover:bg-slate-600 rounded p-2 text-sm">sin</button>
                <button onClick={() => handleScientific('cos')} className="bg-slate-700 hover:bg-slate-600 rounded p-2 text-sm">cos</button>
                <button onClick={() => handleScientific('tan')} className="bg-slate-700 hover:bg-slate-600 rounded p-2 text-sm">tan</button>
                <button onClick={() => handleScientific('log')} className="bg-slate-700 hover:bg-slate-600 rounded p-2 text-sm">log</button>
                <button onClick={() => handleScientific('ln')} className="bg-slate-700 hover:bg-slate-600 rounded p-2 text-sm">ln</button>
                <button onClick={() => handleScientific('sqrt')} className="bg-slate-700 hover:bg-slate-600 rounded p-2 text-sm">√</button>
                <button onClick={() => handleScientific('^2')} className="bg-slate-700 hover:bg-slate-600 rounded p-2 text-sm">x²</button>
                <button onClick={() => handleScientific('pi')} className="bg-slate-700 hover:bg-slate-600 rounded p-2 text-sm">π</button>
              </div>
            )}
            
            <div className={`grid grid-cols-4 gap-2 ${isScientific ? 'w-2/3' : 'w-full'}`}>
              <button onClick={handleClear} className="col-span-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded p-3 font-semibold">C</button>
              <button onClick={() => handleOperator('%')} className="bg-slate-700 hover:bg-slate-600 rounded p-3 text-indigo-300 font-semibold">%</button>
              <button onClick={() => handleOperator('/')} className="bg-indigo-600 hover:bg-indigo-500 rounded p-3 font-semibold">÷</button>
              
              {[7, 8, 9].map(n => <button key={n} onClick={() => handleNumber(String(n))} className="bg-slate-800 hover:bg-slate-700 rounded p-3 font-semibold">{n}</button>)}
              <button onClick={() => handleOperator('*')} className="bg-indigo-600 hover:bg-indigo-500 rounded p-3 font-semibold">×</button>
              
              {[4, 5, 6].map(n => <button key={n} onClick={() => handleNumber(String(n))} className="bg-slate-800 hover:bg-slate-700 rounded p-3 font-semibold">{n}</button>)}
              <button onClick={() => handleOperator('-')} className="bg-indigo-600 hover:bg-indigo-500 rounded p-3 font-semibold">-</button>
              
              {[1, 2, 3].map(n => <button key={n} onClick={() => handleNumber(String(n))} className="bg-slate-800 hover:bg-slate-700 rounded p-3 font-semibold">{n}</button>)}
              <button onClick={() => handleOperator('+')} className="bg-indigo-600 hover:bg-indigo-500 rounded p-3 font-semibold">+</button>
              
              <button onClick={() => handleNumber('0')} className="col-span-2 bg-slate-800 hover:bg-slate-700 rounded p-3 font-semibold">0</button>
              <button onClick={() => handleNumber('.')} className="bg-slate-800 hover:bg-slate-700 rounded p-3 font-semibold">.</button>
              <button onClick={handleEqual} className="bg-indigo-500 hover:bg-indigo-400 rounded p-3 font-semibold">=</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
