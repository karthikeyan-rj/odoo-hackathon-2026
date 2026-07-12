import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-toast_in flex items-start gap-3 px-4 py-3 rounded-lg shadow-modal text-sm font-ui border
            ${t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              'bg-surface border-border text-ink'}`}
        >
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="text-ink-muted hover:text-ink mt-0.5 leading-none">✕</button>
        </div>
      ))}
    </div>
  );
}

export const useToast = () => useContext(ToastContext);
