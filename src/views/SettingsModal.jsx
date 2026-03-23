import React, { useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { DEFAULT_STATUS_COLORS, STATUS_OPTIONS, useSettings } from '../context/SettingsContext';

const SettingsModal = ({ onClose }) => {
    const { settings, updateSettings } = useSettings();
    const dialogRef = useRef(null);

    // Focus trap + Escape key
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        // Focus the dialog container
        dialog.focus();

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }

            if (e.key === 'Tab') {
                const focusable = dialog.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            style={{ zIndex: 2000 }}
        >
            <div
                ref={dialogRef}
                className="modal-panel"
                style={{ width: '420px', maxWidth: '90%' }}
                onClick={e => e.stopPropagation()}
                tabIndex={-1}
            >
                {/* Header */}
                <div className="modal-header">
                    <h2 id="settings-title" style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)' }}>
                        Settings
                    </h2>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={onClose}
                        aria-label="Close settings"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

                    {/* Theme Switch */}
                    <div className="settings-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            {settings.theme === 'light'
                                ? <Sun size={20} color="var(--accent-primary)" aria-hidden="true" />
                                : <Moon size={20} color="var(--accent-primary)" aria-hidden="true" />
                            }
                            <div>
                                <div className="settings-item-label" id="toggle-theme-label">Theme</div>
                                <div className="settings-item-desc" id="toggle-theme-help">Choose your preferred appearance</div>
                            </div>
                        </div>
                        <div
                            className="theme-segment"
                            role="radiogroup"
                            aria-labelledby="toggle-theme-label"
                        >
                            <button
                                type="button"
                                className={`theme-segment__btn${settings.theme === 'light' ? ' is-active' : ''}`}
                                onClick={() => updateSettings({ theme: 'light' })}
                                role="radio"
                                aria-checked={settings.theme === 'light'}
                            >
                                <Sun size={14} />
                                Light
                            </button>
                            <button
                                type="button"
                                className={`theme-segment__btn${settings.theme === 'dark' ? ' is-active' : ''}`}
                                onClick={() => updateSettings({ theme: 'dark' })}
                                role="radio"
                                aria-checked={settings.theme === 'dark'}
                            >
                                <Moon size={14} />
                                Dark
                            </button>
                        </div>
                    </div>

                    {/* Show Descriptions Toggle */}
                    <div className="settings-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            {settings.showDescriptions
                                ? <Eye size={20} color="var(--accent-primary)" aria-hidden="true" />
                                : <EyeOff size={20} color="var(--text-muted)" aria-hidden="true" />
                            }
                            <div>
                                <div className="settings-item-label" id="toggle-desc-label">Show Descriptions</div>
                                <div className="settings-item-desc" id="toggle-desc-help">Display goal descriptions on the canvas</div>
                            </div>
                        </div>
                        <label className="toggle-track">
                            <input
                                type="checkbox"
                                checked={settings.showDescriptions}
                                onChange={(e) => updateSettings({ showDescriptions: e.target.checked })}
                                aria-labelledby="toggle-desc-label"
                                aria-describedby="toggle-desc-help"
                            />
                            <span className="toggle-slider" />
                        </label>
                    </div>

                    {/* Show Status Labels Toggle */}
                    <div className="settings-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            {settings.showStatusLabels
                                ? <Eye size={20} color="var(--accent-primary)" aria-hidden="true" />
                                : <EyeOff size={20} color="var(--text-muted)" aria-hidden="true" />
                            }
                            <div>
                                <div className="settings-item-label" id="toggle-status-label">Show Status Labels</div>
                                <div className="settings-item-desc" id="toggle-status-help">Display status badges on goal nodes</div>
                            </div>
                        </div>
                        <label className="toggle-track">
                            <input
                                type="checkbox"
                                checked={settings.showStatusLabels}
                                onChange={(e) => updateSettings({ showStatusLabels: e.target.checked })}
                                aria-labelledby="toggle-status-label"
                                aria-describedby="toggle-status-help"
                            />
                            <span className="toggle-slider" />
                        </label>
                    </div>

                    {/* Status Colors */}
                    <div
                        className="settings-item"
                        style={{
                            flexDirection: 'column',
                            alignItems: 'stretch',
                        }}
                    >
                        <div style={{ marginBottom: 'var(--space-3)' }}>
                            <div>
                                <div className="settings-item-label">Status Colors</div>
                                <div className="settings-item-desc">Pick the accent color for each status. Hover a row to reset it.</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {STATUS_OPTIONS.map((opt) => {
                                const value = settings.statusColors?.[opt] || DEFAULT_STATUS_COLORS[opt];
                                const isDefault = value.toLowerCase() === DEFAULT_STATUS_COLORS[opt].toLowerCase();
                                return (
                                    <div
                                        key={opt}
                                        className="status-color-row"
                                    >
                                        <div className="status-color-name">{opt}</div>
                                        <div className="status-color-picker">
                                            <button
                                                type="button"
                                                className="status-color-reset"
                                                disabled={isDefault}
                                                onClick={() => {
                                                    updateSettings({
                                                        statusColors: {
                                                            ...(settings.statusColors || DEFAULT_STATUS_COLORS),
                                                            [opt]: DEFAULT_STATUS_COLORS[opt]
                                                        }
                                                    });
                                                }}
                                                aria-label={`Reset ${opt} color to default`}
                                            >
                                                Reset
                                            </button>
                                            <input
                                                className="status-color-input"
                                                type="color"
                                                value={value}
                                                onChange={(e) => {
                                                    updateSettings({
                                                        statusColors: {
                                                            ...(settings.statusColors || DEFAULT_STATUS_COLORS),
                                                            [opt]: e.target.value
                                                        }
                                                    });
                                                }}
                                                aria-label={`${opt} color`}
                                            />
                                            <span className="status-color-hex" aria-hidden="true">
                                                {value.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Max Description Length Slider */}
                    <div
                        className="settings-item"
                        style={{
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            opacity: settings.showDescriptions ? 1 : 0.5,
                            pointerEvents: settings.showDescriptions ? 'auto' : 'none',
                            transition: 'opacity 0.3s var(--ease-out)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                            <div>
                                <div className="settings-item-label" id="slider-desc-label">Description Length</div>
                                <div className="settings-item-desc" id="slider-desc-help">How much description to show in the tree</div>
                            </div>
                            <span style={{ color: 'var(--accent-primary)', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-sm)' }}>
                                {settings.maxDescriptionLength} chars
                            </span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="200"
                            step="5"
                            value={settings.maxDescriptionLength}
                            onChange={(e) => updateSettings({ maxDescriptionLength: parseInt(e.target.value) })}
                            aria-labelledby="slider-desc-label"
                            aria-describedby="slider-desc-help"
                            aria-valuemin={10}
                            aria-valuemax={200}
                            aria-valuenow={settings.maxDescriptionLength}
                            style={{
                                width: '100%',
                                accentColor: 'var(--accent-primary)',
                                cursor: 'pointer'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                            <span>10</span>
                            <span>200</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button
                        className="btn btn-primary"
                        onClick={onClose}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
