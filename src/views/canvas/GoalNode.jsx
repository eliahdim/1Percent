import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const GoalNode = ({ data, isConnectable }) => {
    return (
        <div style={{
            padding: '10px 15px',
            borderRadius: '8px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            minWidth: '150px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            fontSize: '0.9rem',
            opacity: data.completed ? 0.5 : 1,
            transition: 'opacity 0.3s ease-in-out'
        }}>
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                style={{ background: 'var(--text-muted)' }}
            />

            <strong>{data.label}</strong>
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
