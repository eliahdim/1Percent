import React, { memo, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useGoalContext } from '../../context/GoalContext';
import { useSettings } from '../../context/SettingsContext';

const getStatusColor = (status) => {
    switch (status) {
        case 'In Progress': return '#f59e0b';
        case 'Done': return '#10b981';
        default: return 'var(--bg-secondary)'; // Not Started / Default
    }
};

const getPriorityBorder = (priority, selected) => {
    if (selected) return '2px solid white';
    switch (priority) {
        case 'high': return '3px solid #ef4444';
        case 'medium': return '3px solid #f59e0b';
        case 'low': return '3px solid #3b82f6';
        default: return '1px solid var(--border-subtle)';
    }
};

const GoalNode = ({ id, data, isConnectable, selected }) => {
    const { updateGoal } = useGoalContext();
    const { settings } = useSettings();
    const [editingField, setEditingField] = useState(null); // 'title' | 'description' | null
    const [editValue, setEditValue] = useState('');

    const statusColor = getStatusColor(data.status);

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
        if (evt.key === 'Enter') {
            onFinishEdit();
        }
    }, [onFinishEdit]);

    const displayDescription = () => {
        const maxLength = settings.maxDescriptionLength || 50;
        if (!data.description) return <span style={{ opacity: 0.5, fontStyle: 'italic' }}>No description</span>;
        if (data.description.length <= maxLength) return data.description;
        return data.description.substring(0, maxLength) + '...';
    };

    const priorityBorder = getPriorityBorder(data.priority, selected);

    return (
        <div style={{
            padding: data.isRoot ? '20px 30px' : '10px 15px',
            borderRadius: '12px',
            background: statusColor,
            border: priorityBorder,
            color: 'var(--text-primary)',
            minWidth: data.isRoot ? '220px' : '160px',
            textAlign: 'center',
            boxShadow: selected ? '0 0 15px rgba(255,255,255,0.3)' : '0 4px 6px rgba(0,0,0,0.3)',
            fontSize: data.isRoot ? '1.1rem' : '0.9rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'default',
            position: 'relative'
        }}>
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                style={{ background: 'var(--text-muted)' }}
            />

            {/* Status Badge */}
            {settings.showStatusLabels && (
                <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '10px',
                    fontSize: '0.65rem',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    {data.status || 'Not Started'}
                </div>
            )}

            {/* Title Section */}
            <div style={{
                marginBottom: settings.showDescriptions && (data.description || editingField === 'description') ? '8px' : '0',
                display: 'flex',
                justifyContent: 'center'
            }}>
                {editingField === 'title' ? (
                    <input
                        className="nodrag"
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={onFinishEdit}
                        onKeyDown={onKeyDown}
                        style={{
                            width: `${Math.max(editValue.length, 1)}ch`,
                            minWidth: '60px',
                            maxWidth: '100%',
                            boxSizing: 'content-box',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: 'white',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            fontSize: 'inherit',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            outline: 'none'
                        }}
                    />
                ) : (
                    <strong
                        onDoubleClick={(e) => onDoubleClick(e, 'title', data.label)}
                        style={{ cursor: 'text', display: 'inline-block' }}
                    >
                        {data.label}
                    </strong>
                )}
            </div>

            {/* Description Section */}
            {settings.showDescriptions && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {editingField === 'description' ? (
                        <textarea
                            className="nodrag"
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={onFinishEdit}
                            onKeyDown={onKeyDown}
                            style={{
                                width: '90%',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                color: 'rgba(255,255,255,0.8)',
                                borderRadius: '4px',
                                padding: '4px',
                                fontSize: '0.75rem',
                                textAlign: 'center',
                                outline: 'none',
                                resize: 'none',
                                minHeight: '40px'
                            }}
                        />
                    ) : (
                        <div
                            onDoubleClick={(e) => onDoubleClick(e, 'description', data.description)}
                            style={{
                                fontSize: data.isRoot ? '0.85rem' : '0.75rem',
                                color: 'rgba(255,255,255,0.8)',
                                minHeight: '10px',
                                cursor: 'text',
                                display: 'inline-block'
                            }}
                        >
                            {displayDescription()}
                        </div>
                    )}
                </div>
            )}

            {/* Progress Bar */}
            <div style={{
                marginTop: '10px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <div style={{
                        width: `${data.progress || 0}%`,
                        height: '100%',
                        backgroundColor: 'white',
                        transition: 'width 0.5s ease-in-out'
                    }} />
                </div>
                <div style={{
                    fontSize: '0.7rem',
                    marginTop: '2px',
                    opacity: 0.8,
                    fontWeight: 'bold'
                }}>
                    {Math.round(data.progress || 0)}%
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                style={{ background: 'var(--text-muted)' }}
            />
        </div>
    );
};

export default memo(GoalNode);
