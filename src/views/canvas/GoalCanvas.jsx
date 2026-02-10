import React, { useCallback, useRef, useState } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    Panel,
    addEdge,
    useReactFlow,
    ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Layout, GitFork, Trash2 } from 'lucide-react';
import GoalNode from './GoalNode';
import GoalDetailsModal from './GoalDetailsModal';
import { getLayoutedElements } from '../../utils/autoLayout';
import { useGoalContext } from '../../context/GoalContext';
import { moveSubtree } from '../../utils/dragLogic';

const nodeTypes = {
    goal: GoalNode,
};

// Internal component that uses hooks requiring ReactFlowProvider
const GoalCanvasInner = () => {
    // Consume state from Context
    const {
        nodes, setNodes, onNodesChange,
        edges, setEdges, onEdgesChange,
        addSubgoal, updateGoal, deleteGoal
    } = useGoalContext();

    const [selectedGoalForModal, setSelectedGoalForModal] = useState(null);

    const onNodeDoubleClick = useCallback((event, node) => {
        setSelectedGoalForModal(node);
    }, []);

    const { fitView } = useReactFlow();
    const draggingNodeRef = useRef(null);
    const lastPosRef = useRef(null);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onLayout = useCallback(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges,
            'TB' // Top to Bottom
        );

        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);

        window.requestAnimationFrame(() => fitView({ duration: 400 }));
    }, [nodes, edges, setNodes, setEdges, fitView]);

    // -- Recursive Drag Logic --
    const onNodeDragStart = (event, node) => {
        draggingNodeRef.current = node;
        lastPosRef.current = { ...node.position };
    };

    const onNodeDrag = (event, node) => {
        const delta = {
            x: node.position.x - lastPosRef.current.x,
            y: node.position.y - lastPosRef.current.y
        };

        lastPosRef.current = { ...node.position };
        setNodes((nds) => moveSubtree(nds, edges, node, delta));
    };

    const onNodeDragStop = () => {
        draggingNodeRef.current = null;
        lastPosRef.current = null;
    };
    // --------------------------

    const onAddChild = () => {
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length === 1) {
            addSubgoal(selectedNodes[0].id);
        } else {
            alert("Please select exactly one goal to add a subgoal to.");
        }
    };

    const onDeleteNodes = useCallback((deletedNodes) => {
        // This is called by React Flow when someone presses Backspace/Delete
        // We handle it manually to add confirmation
        if (deletedNodes.length > 0) {
            const node = deletedNodes[0];
            const confirmDelete = window.confirm(`Are you sure you want to delete "${node.data.label}"?`);
            if (confirmDelete) {
                deleteGoal(node.id);
            } else {
                // If cancelled, we want to put the node back or just prevent deletion
                // Since onNodesDelete happens AFTER deletion, we might need a different approach 
                // but React Flow nodes are controlled by our context 'nodes' state.
                // refreshGoals() will bring it back if we don't delete on backend.
            }
        }
    }, [deleteGoal]);

    const onDeleteButtonClick = () => {
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length === 1) {
            const node = selectedNodes[0];
            if (window.confirm(`Are you sure you want to delete "${node.data.label}"?`)) {
                deleteGoal(node.id);
            }
        }
    };

    const selectedNode = nodes.find(n => n.selected);

    return (
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStart={onNodeDragStart}
                onNodeDrag={onNodeDrag}
                onNodeDragStop={onNodeDragStop}
                onNodeDoubleClick={onNodeDoubleClick}
                onNodesDelete={onDeleteNodes}
                nodeTypes={nodeTypes}
                fitView
                colorMode="dark"
                style={{ backgroundColor: 'var(--bg-primary)' }}
            >
                <Controls style={{ fill: 'white' }} />
                <MiniMap
                    nodeStrokeColor="#007bff"
                    nodeColor="#2a2a2a"
                    maskColor="rgba(0,0,0, 0.4)"
                />
                <Background gap={16} size={1} color="#333" />

                <Panel position="top-right" style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={onAddChild}
                        title={selectedNode ? `Add subgoal to "${selectedNode.data.label}"` : "Select a goal to add a subgoal"}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            background: selectedNode ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                            border: '1px solid var(--border-subtle)',
                            color: selectedNode ? 'var(--text-primary)' : 'var(--text-muted)',
                            borderRadius: '6px',
                            cursor: selectedNode ? 'pointer' : 'not-allowed',
                            fontWeight: '500',
                            fontSize: '0.9rem',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            opacity: selectedNode ? 1 : 0.7,
                            transition: 'all 0.2s'
                        }}
                    >
                        <GitFork size={16} />
                        {selectedNode
                            ? <span>Add to <strong>{selectedNode.data.label.length > 15 ? selectedNode.data.label.substring(0, 12) + '...' : selectedNode.data.label}</strong></span>
                            : "Add Subgoal"
                        }
                    </button>
                    {selectedNode && (
                        <button
                            onClick={onDeleteButtonClick}
                            title={`Delete "${selectedNode.data.label}"`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                background: '#3b1212',
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '0.9rem',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Trash2 size={16} />
                            <span>Delete</span>
                        </button>
                    )}
                    <button
                        onClick={onLayout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.9rem',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}
                    >
                        <Layout size={16} />
                        Auto Layout
                    </button>
                </Panel>
            </ReactFlow>

            {selectedGoalForModal && (
                <GoalDetailsModal
                    goal={selectedGoalForModal}
                    onClose={() => setSelectedGoalForModal(null)}
                    onUpdate={updateGoal}
                    onDelete={deleteGoal}
                />
            )}
        </div>
    );
};

// Main Export: Wraps the Inner component in the Provider
export default function GoalCanvas() {
    return (
        <ReactFlowProvider>
            <GoalCanvasInner />
        </ReactFlowProvider>
    );
}
