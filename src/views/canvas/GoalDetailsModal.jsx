import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Done'];
const PRIORITY_OPTIONS = [
    { value: 'none', label: 'None', color: 'var(--text-muted)' },
    { value: 'low', label: 'Low', color: '#3b82f6' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' }
];

const GoalDetailsModal = ({ goal, onClose, onUpdate, onDelete }) => {
    const [title, setTitle] = useState(goal?.data?.label || '');
    const [description, setDescription] = useState(goal?.data?.description || '');
    const [status, setStatus] = useState(goal?.data?.status || 'Not Started');
    const [priority, setPriority] = useState(goal?.data?.priority || 'none');

    useEffect(() => {
        if (goal) {
            setTitle(goal.data.label);
            setDescription(goal.data.description || '');
            setStatus(goal.data.status || 'Not Started');
            setPriority(goal.data.priority || 'none');
        }
    }, [goal]);

    if (!goal) return null;

    const handleSave = () => {
        onUpdate(goal.id, {
            title,
            description,
            status,
            priority
        });
        onClose();
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${goal.data.label}"?`)) {
            onDelete(goal.id);
            onClose();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const progressValue = Math.round(goal.data.progress || 0);
    const progressColor = progressValue >= 75 ? '#10b981' : progressValue >= 40 ? '#f59e0b' : 'var(--accent-primary)';

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
                width: '650px',
                maxWidth: '92%',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '85vh',
                overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>

                {/* Progress Bar — flush to top */}
                <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '12px 12px 0 0',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progressValue}%`,
                        height: '100%',
                        background: progressColor,
                        transition: 'width 0.4s ease'
                    }} />
                </div>

                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-subtle)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Goal Details</h2>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: progressColor }}>{progressValue}%</span>
                    </div>
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

                {/* Two-Column Content */}
                <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'stretch' }}>

                        {/* LEFT: Name + Description */}
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                            {/* Title */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</label>
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

                            {/* Description */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    style={{
                                        width: '100%',
                                        flex: 1,
                                        minHeight: '80px',
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
                        </div>

                        {/* RIGHT: Status + Priority */}
                        <div style={{ width: '180px', flexShrink: 0 }}>
                            {/* Status */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {STATUS_OPTIONS.map(opt => {
                                        const isSelected = status === opt;
                                        let bg = 'var(--bg-tertiary)';
                                        let borderColor = 'var(--border-subtle)';

                                        if (isSelected) {
                                            if (opt === 'Not Started') { bg = '#ef4444'; borderColor = '#ef4444'; }
                                            else if (opt === 'In Progress') { bg = '#f59e0b'; borderColor = '#f59e0b'; }
                                            else if (opt === 'Done') { bg = '#10b981'; borderColor = '#10b981'; }
                                        }

                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => setStatus(opt)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    background: bg,
                                                    border: `1px solid ${borderColor}`,
                                                    color: isSelected ? 'white' : 'var(--text-primary)',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: isSelected ? '600' : '400',
                                                    outline: 'none',
                                                    transition: 'all 0.2s ease',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Priority */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {PRIORITY_OPTIONS.map(opt => {
                                        const isSelected = priority === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => setPriority(opt.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    background: isSelected ? opt.color : 'var(--bg-tertiary)',
                                                    border: isSelected ? `1px solid ${opt.color}` : '1px solid var(--border-subtle)',
                                                    color: isSelected ? 'white' : 'var(--text-primary)',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: isSelected ? '600' : '400',
                                                    outline: 'none',
                                                    transition: 'all 0.2s ease',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div style={{
                        marginTop: '20px',
                        paddingTop: '14px',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        gap: '24px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <Calendar size={13} />
                            <span>Created: {formatDate(goal.data.created_at)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <Clock size={13} />
                            <span>Updated: {formatDate(goal.data.updated_at)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 20px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px'
                }}>
                    <button
                        onClick={handleDelete}
                        style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            marginRight: 'auto'
                        }}
                    >
                        Delete
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '8px 16px',
                            background: 'var(--accent-primary)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
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
