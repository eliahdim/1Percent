import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ICONS = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
};

const Toast = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container" role="status" aria-live="polite" aria-label="Notifications">
            {toasts.map(toast => {
                const Icon = ICONS[toast.type] || Info;
                return (
                    <div
                        key={toast.id}
                        className={`toast toast--${toast.type}${toast.exiting ? ' toast--exiting' : ''}`}
                        role="alert"
                    >
                        <Icon size={18} />
                        <span className="toast-message">{toast.message}</span>
                        <button
                            className="toast-close"
                            onClick={() => removeToast(toast.id)}
                            aria-label="Dismiss notification"
                        >
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default Toast;
