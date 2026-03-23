import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();
const STORAGE_KEY = 'onepercent_settings';

export const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Done'];

// Hex colors used as the base for status-tinted node card backgrounds/borders.
// We keep alpha values fixed in `GoalNode` so the UI stays consistent.
export const DEFAULT_STATUS_COLORS = {
    'Not Started': '#3b82f6',
    'In Progress': '#f59e0b',
    'Done': '#10b981',
};

const DEFAULT_SETTINGS = {
    showDescriptions: true,
    maxDescriptionLength: 50,
    showStatusLabels: true,
    theme: 'dark',
    statusColors: DEFAULT_STATUS_COLORS,
};

const normalizeSettings = (savedSettings) => {
    const next = { ...DEFAULT_SETTINGS, ...(savedSettings || {}) };
    if (next.theme !== 'dark' && next.theme !== 'light') {
        next.theme = 'dark';
    }

    const nextStatusColors = { ...DEFAULT_STATUS_COLORS, ...(next.statusColors || {}) };
    for (const status of STATUS_OPTIONS) {
        if (typeof nextStatusColors[status] !== 'string') nextStatusColors[status] = DEFAULT_STATUS_COLORS[status];
    }
    next.statusColors = nextStatusColors;

    return next;
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return DEFAULT_SETTINGS;
        try {
            return normalizeSettings(JSON.parse(saved));
        } catch {
            return DEFAULT_SETTINGS;
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        const theme = settings.theme === 'light' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme;
    }, [settings.theme]);

    const updateSettings = (updates) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
