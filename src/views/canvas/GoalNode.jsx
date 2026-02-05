import React, { memo, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useGoalContext } from '../../context/GoalContext';

const getStatusColor = (status) => {
    switch (status) {
        case 'In Progress': return '#f59e0b';
        case 'Done': return '#10b981';
        default: return 'var(--bg-secondary)'; // Not Started / Default
    }
};

const GoalNode = ({ id, data, isConnectable, selected }) => {
    const { updateGoal } = useGoalContext();
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

    return (
        <div style={{
            padding: data.isRoot ? '20px 30px' : '10px 15px',
            borderRadius: '12px',
            background: statusColor,
            border: selected ? '2px solid white' : '1px solid var(--border-subtle)',
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

            {/* Title Section */}
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
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
                        {data.description || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>No description</span>}
                    </div>
                )}
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
