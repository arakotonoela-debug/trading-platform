import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

interface UseToastReturn {
  toasts: Toast[];
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: Toast['type'], title: string, message?: string, duration = 5000) => {
      const id = Math.random().toString(36).substr(2, 9);

      const newToast: Toast = {
        id,
        type,
        title,
        message,
        duration,
        onClose: (id: string) => removeToast(id),
      };

      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((title: string, message?: string) => {
    addToast('success', title, message);
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast('error', title, message);
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast('warning', title, message);
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast('info', title, message);
  }, [addToast]);

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast,
    clearAll,
  };
};
