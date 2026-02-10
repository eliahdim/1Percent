import React from 'react';
import { Plus, Settings, Target, Trophy, GitFork, Trash2, Layout } from 'lucide-react';
import { useGoalContext } from '../../context/GoalContext';

const Sidebar = ({ onOpenSettings, selectedNode, onAutoLayout }) => {
    const { nodes, addGoal, addSubgoal, deleteGoal } = useGoalContext();

    // Only show root goals (isRoot is added in transformData)
    const goalNodes = nodes.filter(n => n.type === 'goal' && n.data.isRoot);

    const onAddSubgoalClick = () => {
        if (selectedNode) {
            addSubgoal(selectedNode.id);
        } else {
            alert("Please select exactly one goal to add a subgoal to.");
        }
    };

    const onDeleteClick = () => {
        if (selectedNode) {
            if (window.confirm(`Are you sure you want to delete "${selectedNode.data.label}"?`)) {
                deleteGoal(selectedNode.id);
            }
        }
    };

    const onAutoLayoutClick = () => {
        if (onAutoLayout) {
            onAutoLayout();
        }
    };

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
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <Trophy size={20} color="var(--accent-primary)" />
                    1%
                </h1>
                <button
                    onClick={onOpenSettings}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                    <Settings size={20} />
                </button>
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
            <div style={{ padding: '15px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                
                <button
                    onClick={onAddSubgoalClick}
                    disabled={!selectedNode}
                    title={selectedNode ? `Add subgoal to "${selectedNode.data.label}"` : "Select a goal to add a subgoal"}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: selectedNode ? 'var(--bg-tertiary)' : 'var(--bg-tertiary)',
                        color: selectedNode ? 'var(--text-primary)' : 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        cursor: selectedNode ? 'pointer' : 'not-allowed',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: selectedNode ? 1 : 0.6,
                        transition: 'all 0.2s'
                    }}
                >
                    <GitFork size={16} />
                    {selectedNode
                        ? `Add to ${selectedNode.data.label.length > 15 ? selectedNode.data.label.substring(0, 12) + '...' : selectedNode.data.label}`
                        : "Add Subgoal"
                    }
                </button>

                <button
                    onClick={onAutoLayoutClick}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Layout size={16} />
                    Auto Layout
                </button>

                {selectedNode && (
                    <button
                        onClick={onDeleteClick}
                        title={`Delete "${selectedNode.data.label}"`}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: '#3b1212',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
