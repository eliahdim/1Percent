import React, { memo, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useGoalContext } from '../../context/GoalContext';

const GoalNode = ({ id, data, isConnectable, selected }) => {
    const { updateGoal } = useGoalContext();
    const [isEditing, setIsEditing] = useState(false);
    const [editLabel, setEditLabel] = useState(data.label);

    const onDoubleClick = useCallback((evt) => {
        evt.stopPropagation(); // Prevent canvas zoom/pan events if any
        setIsEditing(true);
        setEditLabel(data.label);
    }, [data.label]);

    const onFinishEdit = useCallback(() => {
        setIsEditing(false);
        if (editLabel !== data.label) {
            updateGoal(id, { title: editLabel });
        }
    }, [editLabel, data.label, id, updateGoal]);

    const onKeyDown = useCallback((evt) => {
        if (evt.key === 'Enter') {
            onFinishEdit();
        }
    }, [onFinishEdit]);

    return (
        <div style={{
            padding: '10px 15px',
            borderRadius: '8px',
            background: 'var(--bg-secondary)',
            border: selected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            minWidth: '150px',
            textAlign: 'center',
            boxShadow: selected ? '0 0 10px var(--accent-primary-alpha, rgba(99, 102, 241, 0.4))' : '0 4px 6px rgba(0,0,0,0.3)',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            cursor: 'default'
        }}>
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                style={{ background: 'var(--text-muted)' }}
            />

            {isEditing ? (
                <input
                    className="nodrag"
                    autoFocus
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onBlur={onFinishEdit}
                    onKeyDown={onKeyDown}
                    style={{
                        width: '100%',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--accent-primary)',
                        color: 'var(--text-primary)',
                        borderRadius: '4px',
                        padding: '2px 4px',
                        fontSize: 'inherit',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        outline: 'none'
                    }}
                />
            ) : (
                <strong onDoubleClick={onDoubleClick} style={{ cursor: 'text', display: 'block' }}>
                    {data.label}
                </strong>
            )}

            {data.description && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {data.description}
                </div>
            )}

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
