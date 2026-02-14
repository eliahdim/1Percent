import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef({});

    const removeToast = useCallback((id) => {
        // Mark as exiting for animation
        setToasts(prev => prev.map(t =>
            t.id === id ? { ...t, exiting: true } : t
        ));

        // Remove after animation completes
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 200);

        if (timersRef.current[id]) {
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
        }
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 3500) => {
        const id = ++toastIdCounter;
        const toast = { id, message, type, exiting: false };

        setToasts(prev => [...prev, toast]);

        // Auto-dismiss
        timersRef.current[id] = setTimeout(() => {
            removeToast(id);
        }, duration);

        return id;
    }, [removeToast]);

    const success = useCallback((message) => addToast(message, 'success'), [addToast]);
    const error = useCallback((message) => addToast(message, 'error', 5000), [addToast]);
    const info = useCallback((message) => addToast(message, 'info'), [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info }}>
            {children}
        </ToastContext.Provider>
    );
};
