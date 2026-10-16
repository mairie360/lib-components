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
    /** Type d’alerte */
  type?: AlertType;
    /** Titre facultatif de l’alerte */
  title?: string;
    /** Contenu du message de l’alerte */
  message: string;
    /** Indique si l’alerte peut être fermée par l’utilisateur */
  closable?: boolean;
    /** Fonction appelée lorsque l’alerte est fermée */
  onClose?: () => void;
    /** Délai en millisecondes avant la fermeture automatique */
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
    success: 'bg-[var(--mairie-success-surface)] text-[var(--mairie-success-text)] border-[var(--mairie-success-text)]',
    error: 'bg-[var(--mairie-error-surface)] text-[var(--mairie-error-text)] border-[var(--mairie-error-text)]',
    warning: 'bg-[var(--mairie-warning-surface)] text-[var(--mairie-warning-text)] border-[var(--mairie-warning-text)]',
    info: 'bg-[var(--mairie-accent-surface)] text-[var(--mairie-accent)] border-[var(--mairie-accent)]',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[var(--mairie-success-text)]" />,
    error: <XCircle className="w-5 h-5 text-[var(--mairie-error-text)]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[var(--mairie-warning-text)]" />,
    info: <Info className="w-5 h-5 text-[var(--mairie-accent)]" />,
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
          className="text-xl text-[var(--mairie-muted)] hover:text-[var(--mairie-text)]"
          aria-label="Fermer l’alerte"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
