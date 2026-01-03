import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title: string;
  message: string;
  onClose?: () => void;
  closable?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  closable = true,
}) => {
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
    <div className={`${styles.bg} border ${styles.border} rounded-lg p-4 flex gap-4`}>
      <div className="flex-shrink-0">{styles.icon}</div>

      <div className="flex-1">
        <h3 className={`font-semibold ${styles.titleColor}`}>{title}</h3>
        <p className={`text-sm mt-1 ${styles.messageColor}`}>{message}</p>
      </div>

      {closable && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};
