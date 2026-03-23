import React, { memo, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useGoalContext } from '../../context/GoalContext';
import { DEFAULT_STATUS_COLORS, useSettings } from '../../context/SettingsContext';

const STATUS_BG_ALPHA = {
    'Not Started': 0.15,
    'In Progress': 0.25,
    'Done': 0.2,
};

const STATUS_BORDER_ALPHA = {
    'Not Started': 0.35,
    'In Progress': 0.4,
    'Done': 0.35,
};

const hexToRgba = (hex, alpha) => {
    if (!hex || typeof hex !== 'string') return `rgba(0,0,0,${alpha})`;
    const raw = hex.trim().replace('#', '');
    if (![3, 6].includes(raw.length)) return `rgba(0,0,0,${alpha})`;

    const expanded = raw.length === 3 ? raw.split('').map(ch => ch + ch).join('') : raw;
    const num = parseInt(expanded, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const PRIORITY_STYLES = {
    high: { borderLeft: '4px solid #ef4444' },
    medium: { borderLeft: '4px solid #f59e0b' },
    low: { borderLeft: '4px solid #3b82f6' },
};

const GoalNode = ({ id, data, isConnectable, selected }) => {
    const { updateGoal, toggleCollapse } = useGoalContext();
    const { settings } = useSettings();
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isHovered, setIsHovered] = useState(false);

    const onDoubleClick = useCallback((e, field, initialValue) => {
        e.stopPropagation();
        setEditingField(field);
        setEditValue(initialValue || '');
    }, []);

    const onFinishEdit = useCallback(() => {
        if (!editingField) return;

        if (editValue !== data[editingField === 'title' ? 'label' : 'description']) {
            const updates = {};
            if (editingField === 'title') updates.title = editValue;
            if (editingField === 'description') updates.description = editValue;
            updateGoal(id, updates);
        }
        setEditingField(null);
    }, [editingField, editValue, data, id, updateGoal]);

    const onKeyDown = useCallback((evt) => {
        if (evt.key === 'Enter') onFinishEdit();
        if (evt.key === 'Escape') setEditingField(null);
    }, [onFinishEdit]);

    const displayDescription = () => {
        const maxLength = settings.maxDescriptionLength || 50;
        if (!data.description) return <span style={{ opacity: 0.5, fontStyle: 'italic' }}>No description</span>;
        if (data.description.length <= maxLength) return data.description;
        return data.description.substring(0, maxLength) + '...';
    };

    const progress = Math.round(data.progress || 0);
    const isDone = progress >= 100;
    const isHighProgress = progress >= 70;
    const showCollapseButton = data.hasChildren && (isHovered || data.collapsed);

    // Build class list
    const nodeClasses = [
        'goal-node',
        data.isRoot ? 'goal-node--root' : 'goal-node--child',
        selected && 'goal-node--selected',
        isDone && 'goal-node--done',
    ].filter(Boolean).join(' ');

    // Priority left-border style
    const priorityStyle = PRIORITY_STYLES[data.priority] || {};

    // Status-tinted card background/border (driven by Settings).
    const statusKey = data.status || 'Not Started';
    const statusHex = settings.statusColors?.[statusKey] || DEFAULT_STATUS_COLORS[statusKey] || '#3b82f6';
    const statusBg = hexToRgba(statusHex, STATUS_BG_ALPHA[statusKey] ?? 0.2);
    const statusBorder = hexToRgba(statusHex, STATUS_BORDER_ALPHA[statusKey] ?? 0.35);

    return (
        <div
            className={nodeClasses}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                background: statusBg,
                border: `1px solid ${statusBorder}`,
                boxShadow: selected
                    ? '0 0 0 2px var(--node-selected-ring), 0 0 25px var(--node-selected-glow)'
                    : 'var(--shadow-md)',
                ...priorityStyle,
            }}
            role="treeitem"
            aria-label={`Goal: ${data.label}, Progress: ${progress}%, Status: ${data.status || 'Not Started'}`}
        >
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                style={{ background: 'var(--text-muted)', width: 8, height: 8 }}
            />

            {/* Status Badge */}
            {settings.showStatusLabels && (
                <div className="status-badge" aria-hidden="true">
                    {data.status || 'Not Started'}
                </div>
            )}

            {/* Title */}
            <div style={{
                marginBottom: settings.showDescriptions && (data.description || editingField === 'description') ? 'var(--space-2)' : '0',
                display: 'flex',
                justifyContent: 'center'
            }}>
                {editingField === 'title' ? (
                    <input
                        className="nodrag node-edit-input"
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={onFinishEdit}
                        onKeyDown={onKeyDown}
                        aria-label="Edit goal title"
                        style={{
                            width: `${Math.max(editValue.length, 1)}ch`,
                            minWidth: '60px',
                            maxWidth: '100%',
                            boxSizing: 'content-box',
                        }}
                    />
                ) : (
                    <strong
                        onDoubleClick={(e) => onDoubleClick(e, 'title', data.label)}
                        style={{ cursor: 'text', display: 'inline-block' }}
                        title="Double-click to edit title"
                    >
                        {data.label}
                    </strong>
                )}
            </div>

            {/* Description */}
            {settings.showDescriptions && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {editingField === 'description' ? (
                        <textarea
                            className="nodrag node-edit-textarea"
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={onFinishEdit}
                            onKeyDown={onKeyDown}
                            aria-label="Edit goal description"
                        />
                    ) : (
                        <div
                            onDoubleClick={(e) => onDoubleClick(e, 'description', data.description)}
                            style={{
                                fontSize: data.isRoot ? 'var(--text-sm)' : 'var(--text-xs)',
                                color: 'var(--node-description-color)',
                                minHeight: '10px',
                                cursor: 'text',
                                display: 'inline-block'
                            }}
                            title="Double-click to edit description"
                        >
                            {displayDescription()}
                        </div>
                    )}
                </div>
            )}

            {/* Progress Bar */}
            <div style={{ marginTop: 'var(--space-3)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                    className="progress-bar-track"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Goal progress: ${progress}%`}
                >
                    <div
                        className={`progress-bar-fill${isHighProgress ? ' progress-bar-fill--high' : ''}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="progress-bar-label">
                    {progress}%
                </div>
            </div>

            {/* Collapse Toggle */}
            {showCollapseButton && (
                <button
                    className="nodrag collapse-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleCollapse(id, data.collapsed);
                    }}
                    aria-label={data.collapsed
                        ? `Expand branch (${data.childCount} items)`
                        : 'Collapse branch'
                    }
                    aria-expanded={!data.collapsed}
                >
                    {data.collapsed ? <ChevronRight size={12} aria-hidden="true" /> : <ChevronDown size={12} aria-hidden="true" />}
                    {data.collapsed && <span>{data.childCount}</span>}
                </button>
            )}

            {!data.collapsed && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    isConnectable={isConnectable}
                    style={{ background: 'var(--text-muted)', width: 8, height: 8 }}
                />
            )}
        </div>
    );
};

export default memo(GoalNode);
