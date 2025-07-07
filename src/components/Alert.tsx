import React, { useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  X,
} from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
    /** Type of alert */
  type?: AlertType;
    /** Optional title for the alert */
  title?: string;
    /** Message content of the alert */
  message: string;
    /** Whether the alert can be closed by the user */
  closable?: boolean;
    /** Callback function when the alert is closed */
  onClose?: () => void;
    /** Time in milliseconds before the alert automatically dismisses */
  autoDismiss?: number;
}

export const Alert = ({
  type = 'info',
  title,
  message,
  closable = false,
  onClose,
  autoDismiss,
}: AlertProps) => {
  useEffect(() => {
    if (autoDismiss && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onClose]);

  const typeClasses = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 border-l-4 p-4 rounded-lg shadow-sm animate-fade-in ${typeClasses[type]}`}
    >
      <div className="pt-1">{icons[type]}</div>
      <div className="flex-1">
        {title && <h3 className="font-semibold">{title}</h3>}
        <p className="text-sm">{message}</p>
      </div>
      {closable && onClose && (
        <button
          onClick={onClose}
          className="text-xl text-gray-500 hover:text-black"
          aria-label="Fermer l'alerte"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
