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
  const [nextValueExpected, setNextValueExpected] = useState(false);
  const [isScientific, setIsScientific] = useState(false);

  const handleNumber = (num: string) => {
    if (nextValueExpected || display === 'Error') {
      setDisplay(num);
      setNextValueExpected(false);
    } else {
      setDisplay(prev => prev === '0' ? num : prev + num);
    }
  };

  const handleOperator = (op: string) => {
    if (display === 'Error') return;
    
    const current = parseFloat(display);
    if (isNaN(current)) return;

    if (equation && !nextValueExpected) {
      try {
        const sanitizedEquation = (equation + display)
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/[^0-9\+\-\*\/\.\(\)% ]/g, '');
        const result = new Function('return ' + sanitizedEquation)();
        if (Number.isFinite(result)) {
          const res = parseFloat(result.toFixed(8));
          setEquation(res + ' ' + op + ' ');
          setDisplay(String(res));
          setNextValueExpected(true);
          return;
        }
      } catch {
        setDisplay('Error');
        setEquation('');
        return;
      }
    }
    
    setEquation(current + ' ' + op + ' ');
    setNextValueExpected(true);
  };

  const handleEqual = () => {
    if (!equation || display === 'Error') return;
    try {
      const sanitizedEquation = (equation + display)
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[^0-9\+\-\*\/\.\(\)% ]/g, '');
      
      const result = new Function('return ' + sanitizedEquation)();
      
      if (typeof result !== 'number' || !Number.isFinite(result)) {
        setDisplay('Error');
      } else {
        setDisplay(String(parseFloat(result.toFixed(8))));
      }
      setEquation('');
      setNextValueExpected(true);
    } catch {
      setDisplay('Error');
      setEquation('');
    }
  };

  const handlePercent = () => {
    if (display === 'Error') return;
    
    const current = parseFloat(display);
    if (isNaN(current)) return;

    if (equation) {
      try {
        const sanitized = equation.trim()
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/[^0-9\+\-\*\/\.\(\)% ]/g, '');
        const baseEquation = sanitized.replace(/[\+\-\*\/]$|[\+\-\*\/] $/, '');
        const baseValue = new Function('return ' + baseEquation)();
        if (Number.isFinite(baseValue)) {
          const percentValue = (baseValue * current) / 100;
          setDisplay(String(parseFloat(percentValue.toFixed(8))));
          setNextValueExpected(true);
          return;
        }
      } catch (e) {
        console.error("Percent calc failed", e);
      }
    }
    
    setDisplay(String(current / 100));
    setNextValueExpected(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setNextValueExpected(false);
  };

  const handleScientific = (func: string) => {
    try {
      const current = parseFloat(display);
      if (isNaN(current)) return;
      
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
      setDisplay(String(parseFloat(result.toFixed(8))));
    } catch {
      setDisplay('Error');
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setDisplay('0');
      setEquation('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 w-full ${isScientific ? 'max-w-md' : 'max-w-[320px]'} animate-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-sm">Calculadora</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsScientific(!isScientific)} 
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" 
              title="Alternar Científica"
            >
              {isScientific ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-slate-950/50 rounded-xl p-4 mb-4 text-right border border-slate-800">
            <div className="text-slate-500 text-xs h-5 overflow-hidden font-mono">{equation}</div>
            <div className="text-3xl font-bold tracking-wider truncate font-mono mt-1">{display}</div>
          </div>

          <div className="flex gap-2">
            {isScientific && (
              <div className="grid grid-cols-2 gap-1.5 w-1/3">
                <button onClick={() => handleScientific('sin')} className="bg-slate-800 hover:bg-slate-700 rounded-lg p-2 text-xs font-medium border border-slate-700/50 transition-colors">sin</button>
                <button onClick={() => handleScientific('cos')} className="bg-slate-800 hover:bg-slate-700 rounded-lg p-2 text-xs font-medium border border-slate-700/50 transition-colors">cos</button>
                <button onClick={() => handleScientific('tan')} className="bg-slate-800 hover:bg-slate-700 rounded-lg p-2 text-xs font-medium border border-slate-700/50 transition-colors">tan</button>
                <button onClick={() => handleScientific('log')} className="bg-slate-800 hover:bg-slate-700 rounded-lg p-2 text-xs font-medium border border-slate-700/50 transition-colors">log</button>
                <button onClick={() => handleScientific('ln')} className="bg-slate-800 hover:bg-slate-700 rounded-lg p-2 text-xs font-medium border border-slate-700/50 transition-colors">ln</button>
                <button onClick={() => handleScientific('sqrt')} className="bg-slate-800 hover:bg-slate-700 rounded-lg p-2 text-xs font-medium border border-slate-700/50 transition-colors">√</button>
                <button onClick={() => handleScientific('^2')} className="bg-slate-800 hover:bg-slate-700 rounded-lg p-2 text-xs font-medium border border-slate-700/50 transition-colors">x²</button>
                <button onClick={() => handleScientific('pi')} className="bg-slate-800 hover:bg-slate-700 rounded-lg p-2 text-xs font-medium border border-slate-700/50 transition-colors">π</button>
              </div>
            )}
            
            <div className={`grid grid-cols-4 gap-2 ${isScientific ? 'w-2/3' : 'w-full'}`}>
              <button onClick={handleClear} className="col-span-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl p-3 font-bold border border-red-500/20 transition-colors">C</button>
              <button onClick={handlePercent} className="bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-indigo-400 font-bold border border-slate-700/50 transition-colors">%</button>
              <button onClick={() => handleOperator('÷')} className="bg-indigo-600 hover:bg-indigo-500 rounded-xl p-3 font-bold text-white shadow-lg shadow-indigo-900/20 transition-colors">÷</button>
              
              {[7, 8, 9].map(n => (
                <button key={n} onClick={() => handleNumber(String(n))} className="bg-slate-800 hover:bg-slate-700 rounded-xl p-3 font-bold border border-slate-700/50 transition-colors text-lg">
                  {n}
                </button>
              ))}
              <button onClick={() => handleOperator('×')} className="bg-indigo-600 hover:bg-indigo-500 rounded-xl p-3 font-bold text-white shadow-lg shadow-indigo-900/20 transition-colors">×</button>
              
              {[4, 5, 6].map(n => (
                <button key={n} onClick={() => handleNumber(String(n))} className="bg-slate-800 hover:bg-slate-700 rounded-xl p-3 font-bold border border-slate-700/50 transition-colors text-lg">
                  {n}
                </button>
              ))}
              <button onClick={() => handleOperator('-')} className="bg-indigo-600 hover:bg-indigo-500 rounded-xl p-3 font-bold text-white shadow-lg shadow-indigo-900/20 transition-colors text-lg">-</button>
              
              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => handleNumber(String(n))} className="bg-slate-800 hover:bg-slate-700 rounded-xl p-3 font-bold border border-slate-700/50 transition-colors text-lg">
                  {n}
                </button>
              ))}
              <button onClick={() => handleOperator('+')} className="bg-indigo-600 hover:bg-indigo-500 rounded-xl p-3 font-bold text-white shadow-lg shadow-indigo-900/20 transition-colors text-lg">+</button>
              
              <button onClick={() => handleNumber('0')} className="col-span-2 bg-slate-800 hover:bg-slate-700 rounded-xl p-3 font-bold border border-slate-700/50 transition-colors text-lg">0</button>
              <button onClick={() => handleNumber('.')} className="bg-slate-800 hover:bg-slate-700 rounded-xl p-3 font-bold border border-slate-700/50 transition-colors text-lg">.</button>
              <button onClick={handleEqual} className="bg-emerald-600 hover:bg-emerald-500 rounded-xl p-3 font-bold text-white shadow-lg shadow-emerald-900/20 transition-colors text-lg">=</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
