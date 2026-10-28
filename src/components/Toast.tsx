import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm w-full no-print">
      {toasts.map((toast) => {
        let bgStyle = 'bg-slate-900 border-slate-700 text-white';
        let Icon = Info;

        if (toast.type === 'success') {
          bgStyle = 'bg-emerald-700 border-emerald-600 text-white shadow-emerald-900/30';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bgStyle = 'bg-rose-700 border-rose-600 text-white shadow-rose-900/30';
          Icon = AlertCircle;
        } else {
          bgStyle = 'bg-blue-700 border-blue-600 text-white shadow-blue-900/30';
          Icon = Info;
        }

        return (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-3.5 rounded-xl border shadow-xl text-xs font-medium transition-all duration-300 transform translate-y-0 opacity-100 ${bgStyle}`}
          >
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <Icon className="w-4 h-4 shrink-0 text-white" />
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/80 hover:text-white p-1 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
