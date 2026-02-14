import React from 'react';
import { Plus, Settings, Target, Trophy, GitFork, Trash2, Layout } from 'lucide-react';
import { useGoalContext } from '../../context/GoalContext';
import { useReactFlow } from '@xyflow/react';
import { getRoot } from '../../utils/dragLogic';

const Sidebar = ({ onOpenSettings, selectedNode, onAutoLayout }) => {
    const { nodes, edges, addGoal, addSubgoal, deleteGoal } = useGoalContext();
    const { getViewport } = useReactFlow();
    const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);

    // Reset confirmation state when selected node changes
    React.useEffect(() => {
        setIsConfirmingDelete(false);
    }, [selectedNode]);

    // Only root-level goals
    const goalNodes = nodes.filter(n => n.type === 'goal' && n.data.isRoot);

    // Average progress of all root goals
    const globalProgress = goalNodes.length > 0
        ? Math.round(goalNodes.reduce((acc, curr) => acc + (curr.data.progress || 0), 0) / goalNodes.length)
        : 0;

    const onAddGoalClick = () => {
        const { x, y, zoom } = getViewport();
        const centerX = -x / zoom + (window.innerWidth - 300) / 2 / zoom;
        const centerY = -y / zoom + window.innerHeight / 2 / zoom;
        addGoal('New Goal', Math.round(centerX), Math.round(centerY));
    };

    const onAddSubgoalClick = () => {
        if (selectedNode) {
            addSubgoal(selectedNode.id);
        }
    };

    // Find root of selected node for partial auto-layout
    const selectedRoot = selectedNode ? getRoot(nodes, edges, selectedNode.id) : null;

    const onAutoLayoutClick = () => {
        if (onAutoLayout) {
            onAutoLayout(selectedRoot ? selectedRoot.id : null);
        }
    };

    const onDeleteClick = () => {
        if (selectedNode) {
            if (isConfirmingDelete) {
                deleteGoal(selectedNode.id);
                setIsConfirmingDelete(false);
            } else {
                setIsConfirmingDelete(true);
            }
        }
    };

    const truncateLabel = (label, max = 15) =>
        label.length > max ? label.substring(0, max - 3) + '...' : label;

    return (
        <aside className="sidebar" aria-label="Goal management sidebar">
            {/* ── Header ── */}
            <div className="sidebar-header">
                <h1 className="sidebar-brand">
                    <Trophy size={22} color="var(--accent-primary)" aria-hidden="true" />
                    1%
                </h1>
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={onOpenSettings}
                    aria-label="Open settings"
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* ── Goals List ── */}
            <nav className="sidebar-content" aria-label="Goal list">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                    <h2 className="sidebar-section-title">Your Goals</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--accent-success)' }}>
                            {globalProgress}%
                        </span>
                        <div className="global-progress-track" role="progressbar" aria-valuenow={globalProgress} aria-valuemin={0} aria-valuemax={100} aria-label="Overall goal progress">
                            <div className="global-progress-fill" style={{ width: `${globalProgress}%` }} />
                        </div>
                    </div>
                </div>

                {goalNodes.length === 0 ? (
                    <div className="sidebar-empty">
                        <div className="sidebar-empty-icon">
                            <Target size={32} aria-hidden="true" />
                        </div>
                        <p className="sidebar-empty-text">
                            Create your first goal to get started on your journey.
                        </p>
                    </div>
                ) : (
                    <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {goalNodes.map((node) => {
                            const isActive = selectedNode?.id === node.id;
                            return (
                                <button
                                    key={node.id}
                                    role="listitem"
                                    className={`sidebar-goal-item${isActive ? ' sidebar-goal-item--active' : ''}`}
                                    aria-current={isActive ? 'true' : undefined}
                                    tabIndex={0}
                                    onClick={() => {
                                        /* Future: could scroll-to-node or select it */
                                    }}
                                >
                                    <Target size={16} aria-hidden="true" />
                                    <span style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        flex: 1
                                    }}>
                                        {node.data.label}
                                    </span>
                                    {node.data.progress !== undefined && (
                                        <span style={{
                                            fontSize: 'var(--text-xs)',
                                            fontWeight: 'var(--font-bold)',
                                            color: node.data.progress >= 100
                                                ? 'var(--accent-success)'
                                                : 'var(--text-muted)'
                                        }}>
                                            {Math.round(node.data.progress)}%
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </nav>

            {/* ── Footer Controls ── */}
            <div className="sidebar-footer">
                <button
                    className={`btn btn-full ${selectedNode ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => selectedNode ? onAddSubgoalClick() : onAddGoalClick()}
                    aria-label={selectedNode
                        ? `Add subgoal to ${selectedNode.data.label}`
                        : 'Create new root goal'
                    }
                >
                    {selectedNode ? <GitFork size={16} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
                    {selectedNode
                        ? `Add to ${truncateLabel(selectedNode.data.label)}`
                        : 'New Goal'
                    }
                </button>

                <button
                    className="btn btn-secondary btn-full"
                    onClick={onAutoLayoutClick}
                    aria-label={selectedRoot
                        ? `Auto layout tree: ${selectedRoot.data.label}`
                        : 'Auto layout all goals'
                    }
                >
                    <Layout size={16} aria-hidden="true" />
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 'var(--leading-tight)', textAlign: 'left' }}>
                        <span>Auto Layout</span>
                        {selectedRoot && (
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-normal)' }}>
                                {truncateLabel(selectedRoot.data.label, 20)}
                            </span>
                        )}
                    </span>
                </button>

                {selectedNode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {isConfirmingDelete ? (
                            <div className="confirm-bar" style={{ padding: 'var(--space-1) var(--space-2)' }}>
                                <span className="confirm-bar-message" style={{ fontSize: 'var(--text-xs)' }}>Are you sure?</span>
                                <button className="btn btn-ghost" onClick={() => setIsConfirmingDelete(false)} style={{ padding: '2px 6px', fontSize: 'var(--text-xs)' }}>
                                    Cancel
                                </button>
                                <button className="btn btn-danger" onClick={onDeleteClick} style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }}>
                                    Confirm
                                </button>
                            </div>
                        ) : (
                            <button
                                className="btn btn-danger btn-full"
                                onClick={onDeleteClick}
                                aria-label={`Delete goal: ${selectedNode.data.label}`}
                            >
                                <Trash2 size={16} aria-hidden="true" />
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
