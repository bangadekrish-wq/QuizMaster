import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-ms border shadow-ms-card transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-dark-elevated border-brand-green/40 text-brand-greenLight'
                : toast.type === 'error'
                ? 'bg-dark-elevated border-brand-red/40 text-brand-redLight'
                : toast.type === 'warning'
                ? 'bg-dark-elevated border-brand-orange/40 text-brand-orangeLight'
                : 'bg-dark-elevated border-brand-cyan/40 text-brand-cyanLight'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-brand-green flex-shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-brand-red flex-shrink-0" />}
              {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-brand-orange flex-shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-brand-cyan flex-shrink-0" />}
              <span className="text-sm font-medium text-slate-100">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
