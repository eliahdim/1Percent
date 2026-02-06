import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag } from 'lucide-react';

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Done'];
const GoalDetailsModal = ({ goal, onClose, onUpdate }) => {
    const [title, setTitle] = useState(goal?.data?.label || '');
    const [description, setDescription] = useState(goal?.data?.description || '');
    const [status, setStatus] = useState(goal?.data?.status || 'Not Started');

    useEffect(() => {
        if (goal) {
            setTitle(goal.data.label);
            setDescription(goal.data.description || '');
            setStatus(goal.data.status || 'Not Started');
        }
    }, [goal]);

    if (!goal) return null;

    const handleSave = () => {
        onUpdate(goal.id, {
            title,
            description,
            status
        });
        onClose();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

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
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'var(--bg-secondary)',
                width: '500px',
                maxWidth: '90%',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '80vh'
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Goal Details</h2>
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
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                    {/* Title */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Name</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-primary)',
                                borderRadius: '6px',
                                padding: '10px 12px',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Status Row */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Status</label>
                        <div 
                            role="radiogroup"
                            aria-label="Status selection"
                            style={{ 
                                display: 'flex', 
                                gap: '8px',
                                width: '100%'
                            }}
                        >
                            {STATUS_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setStatus(opt)}
                                    style={{
                                        flex: 1,
                                        padding: '10px 12px',
                                        background: status === opt ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                        border: status === opt ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                                        color: status === opt ? 'white' : 'var(--text-primary)',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: status === opt ? '600' : '400',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (status !== opt) {
                                            e.currentTarget.style.background = 'var(--border-focus)';
                                            e.currentTarget.style.borderColor = 'var(--border-focus)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (status !== opt) {
                                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                        }
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.outline = '2px solid var(--accent-secondary)';
                                        e.currentTarget.style.outlineOffset = '2px';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.outline = 'none';
                                    }}
                                    aria-pressed={status === opt}
                                    role="radio"
                                    aria-checked={status === opt}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            style={{
                                width: '100%',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-primary)',
                                borderRadius: '6px',
                                padding: '10px 12px',
                                fontSize: '0.9rem',
                                outline: 'none',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Metadata */}
                    <div style={{
                        marginTop: '24px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <Calendar size={14} />
                            <span>Created at: {formatDate(goal.data.created_at)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <Clock size={14} />
                            <span>Last updated: {formatDate(goal.data.updated_at)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            background: 'transparent',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '10px 20px',
                            background: 'var(--accent-primary)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoalDetailsModal;
