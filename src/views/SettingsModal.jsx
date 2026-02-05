import React from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const SettingsModal = ({ onClose }) => {
    const { settings, updateSettings } = useSettings();

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'var(--bg-secondary)',
                width: '400px',
                maxWidth: '90%',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column'
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Settings</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {settings.showDescriptions ? <Eye size={20} color="var(--accent-primary)" /> : <EyeOff size={20} color="var(--text-muted)" />}
                            <div>
                                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Show Descriptions</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Display goal descriptions on the canvas</div>
                            </div>
                        </div>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                            <input
                                type="checkbox"
                                checked={settings.showDescriptions}
                                onChange={(e) => updateSettings({ showDescriptions: e.target.checked })}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: settings.showDescriptions ? 'var(--accent-primary)' : '#444',
                                transition: '.4s',
                                borderRadius: '24px'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    content: '""',
                                    height: '18px',
                                    width: '18px',
                                    left: '3px',
                                    bottom: '3px',
                                    backgroundColor: 'white',
                                    transition: '.4s',
                                    borderRadius: '50%',
                                    transform: settings.showDescriptions ? 'translateX(20px)' : 'translateX(0)'
                                }}></span>
                            </span>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 24px',
                            background: 'var(--accent-primary)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
