import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('onepercent_settings');
        return saved ? JSON.parse(saved) : {
            showDescriptions: true,
            maxDescriptionLength: 50
        };
    });

    useEffect(() => {
        localStorage.setItem('onepercent_settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (updates) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
