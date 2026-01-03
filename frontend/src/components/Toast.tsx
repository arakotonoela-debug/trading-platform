import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <CheckCircle className="text-green-600" size={20} />,
          titleColor: 'text-green-900',
          messageColor: 'text-green-700',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <AlertCircle className="text-red-600" size={20} />,
          titleColor: 'text-red-900',
          messageColor: 'text-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: <AlertTriangle className="text-yellow-600" size={20} />,
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-700',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <Info className="text-blue-600" size={20} />,
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-700',
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-lg p-4 flex gap-4 animate-fade-in`}>
      <div className="flex-shrink-0">{styles.icon}</div>

      <div className="flex-1">
        <h3 className={`font-semibold ${styles.titleColor}`}>{title}</h3>
        {message && <p className={`text-sm mt-1 ${styles.messageColor}`}>{message}</p>}
      </div>

      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
      >
        <X size={20} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onRemove} />
      ))}
    </div>
  );
};
