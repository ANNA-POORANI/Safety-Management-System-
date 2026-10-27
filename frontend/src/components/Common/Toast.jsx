import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-rose-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />
  };

  const borders = {
    success: 'border-emerald-500/40 bg-slate-900/95 text-emerald-200',
    error: 'border-rose-500/40 bg-slate-900/95 text-rose-200',
    warning: 'border-amber-500/40 bg-slate-900/95 text-amber-200',
    info: 'border-cyan-500/40 bg-slate-900/95 text-cyan-200'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${
          borders[toast.type || 'info']
        }`}
      >
        <div className="shrink-0 mt-0.5">{icons[toast.type || 'info']}</div>
        <div className="flex-1 pr-2">
          {toast.title && <h4 className="text-sm font-semibold text-white">{toast.title}</h4>}
          <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
