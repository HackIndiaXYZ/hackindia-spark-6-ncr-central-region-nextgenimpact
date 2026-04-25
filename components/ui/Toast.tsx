"use client";
import { useEffect, useState, createContext, useContext, useCallback } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  icon?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: Toast["type"], icon?: string) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast["type"] = "success", icon?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type, icon }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const colors = {
    success: "border-green-500/40 bg-green-500/10 text-green-400",
    info: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    warning: "border-orange-500/40 bg-orange-500/10 text-orange-400",
    error: "border-red-500/40 bg-red-500/10 text-red-400",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm bg-bg-card/90 shadow-2xl pointer-events-auto min-w-[260px] ${colors[t.type]}`}
          >
            {t.icon && <span className="text-base">{t.icon}</span>}
            <span className="text-sm font-medium text-text-primary">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
