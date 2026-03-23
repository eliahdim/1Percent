import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { DEFAULT_STATUS_COLORS, STATUS_OPTIONS, useSettings } from '../../context/SettingsContext';

const PRIORITY_OPTIONS = [
    { value: 'none', label: 'None', color: 'var(--text-muted)' },
    { value: 'low', label: 'Low', color: '#3b82f6' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' }
];

const GoalDetailsModal = ({ goal, onClose, onUpdate, onDelete }) => {
    const { settings } = useSettings();
    const [title, setTitle] = useState(goal?.data?.label || '');
    const [description, setDescription] = useState(goal?.data?.description || '');
    const [status, setStatus] = useState(goal?.data?.status || 'Not Started');
    const [priority, setPriority] = useState(goal?.data?.priority || 'none');

    const dialogRef = useRef(null);
    const firstFocusRef = useRef(null);

    useEffect(() => {
        if (goal) {
            setTitle(goal.data.label);
            setDescription(goal.data.description || '');
            setStatus(goal.data.status || 'Not Started');
            setPriority(goal.data.priority || 'none');
        }
    }, [goal]);

    // Focus trap + Escape key
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        // Focus the first input on open
        firstFocusRef.current?.focus();

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

    if (!goal) return null;

    const handleSave = () => {
        onUpdate(goal.id, { title, description, status, priority });
        onClose();
    };

    const handleDelete = () => {
        onDelete(goal.id);
        onClose();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const progressValue = Math.round(goal.data.progress || 0);
    const progressColor = progressValue >= 75 ? 'var(--accent-success)' : progressValue >= 40 ? 'var(--accent-warning)' : 'var(--accent-primary)';

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-details-title"
        >
            <div
                ref={dialogRef}
                className="modal-panel"
                style={{ width: '650px', maxWidth: '92%' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Progress bar flush to top */}
                <div style={{
                    width: '100%',
                    height: '5px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progressValue}%`,
                        height: '100%',
                        background: progressColor,
                        transition: 'width 0.4s var(--ease-out)'
                    }} />
                </div>

                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <h2 id="goal-details-title" style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)' }}>
                            Goal Details
                        </h2>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: progressColor }}>
                            {progressValue}%
                        </span>
                    </div>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={onClose}
                        aria-label="Close goal details"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Two-Column Content */}
                <div className="modal-body">
                    <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'stretch' }}>

                        {/* LEFT: Name + Description */}
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label htmlFor="goal-title" className="label">Name</label>
                                <input
                                    ref={firstFocusRef}
                                    id="goal-title"
                                    type="text"
                                    className="input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="goal-description" className="label">Description</label>
                                <textarea
                                    id="goal-description"
                                    className="input"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        {/* RIGHT: Status + Priority */}
                        <div style={{ width: '180px', flexShrink: 0 }}>
                            {/* Status */}
                            <fieldset style={{ border: 'none', padding: 0, marginBottom: 'var(--space-5)' }}>
                                <legend className="label">Status</legend>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    {STATUS_OPTIONS.map(opt => {
                                        const isSelected = status === opt;
                                        const color = settings.statusColors?.[opt] || DEFAULT_STATUS_COLORS[opt];
                                        return (
                                            <button
                                                key={opt}
                                                className={`option-btn${isSelected ? ' option-btn--selected' : ''}`}
                                                onClick={() => setStatus(opt)}
                                                style={isSelected ? { background: color, borderColor: color } : {}}
                                                aria-pressed={isSelected}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>

                            {/* Priority */}
                            <fieldset style={{ border: 'none', padding: 0 }}>
                                <legend className="label">Priority</legend>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    {PRIORITY_OPTIONS.map(opt => {
                                        const isSelected = priority === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                className={`option-btn${isSelected ? ' option-btn--selected' : ''}`}
                                                onClick={() => setPriority(opt.value)}
                                                style={isSelected ? { background: opt.color, borderColor: opt.color } : {}}
                                                aria-pressed={isSelected}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div style={{
                        marginTop: 'var(--space-5)',
                        paddingTop: 'var(--space-4)',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        gap: 'var(--space-6)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            <Calendar size={13} aria-hidden="true" />
                            <span>Created: {formatDate(goal.data.created_at)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            <Clock size={13} aria-hidden="true" />
                            <span>Updated: {formatDate(goal.data.updated_at)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button
                        className="btn btn-danger"
                        onClick={handleDelete}
                        style={{ marginRight: 'auto' }}
                        aria-label={`Delete goal: ${title}`}
                    >
                        Delete
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoalDetailsModal;
