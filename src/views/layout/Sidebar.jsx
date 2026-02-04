import React from 'react';
import { Plus, Settings, Target, ChevronDown, Trophy } from 'lucide-react';
import { useGoalContext } from '../../context/GoalContext';

const Sidebar = () => {
    const { nodes, addGoal } = useGoalContext();

    // In a real tree, we'd filter using graph logic. 
    // For now we just show all nodes that are goals.
    const goalNodes = nodes.filter(n => n.type === 'goal');

    return (
        <aside style={{
            width: 'var(--sidebar-width)',
            backgroundColor: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
            height: '100%'
        }}>
            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Trophy size={20} color="var(--accent-primary)" />
                    1%
                </h1>
            </div>

            {/* Goal List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '10px',
                        paddingLeft: '10px'
                    }}>
                        Your Goals
                    </p>

                    {goalNodes.map((node) => (
                        <div
                            key={node.id}
                            style={{
                                padding: '10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: 'var(--text-secondary)',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <Target size={16} />
                            <span style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: '0.9rem'
                            }}>
                                {node.data.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer / Controls */}
            <div style={{ padding: '15px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                    onClick={() => addGoal('New Goal')}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Plus size={18} />
                    New Goal
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
