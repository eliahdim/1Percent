import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    addEdge,
    useReactFlow,
    ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import GoalNode from './GoalNode';
import GoalDetailsModal from './GoalDetailsModal';
import { getLayoutedElements } from '../../utils/autoLayout';
import { useGoalContext } from '../../context/GoalContext';
import { moveSubtree } from '../../utils/dragLogic';

const nodeTypes = {
    goal: GoalNode,
};

// Internal component that uses hooks requiring ReactFlowProvider
const GoalCanvasInner = ({ onSelectedNodeChange, onAutoLayoutReady }) => {
    // Consume state from Context
    const {
        nodes, setNodes, onNodesChange,
        edges, setEdges, onEdgesChange,
        updateGoal, deleteGoal
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

    const selectedNode = nodes.find(n => n.selected);

    // Notify parent of selected node changes
    useEffect(() => {
        if (onSelectedNodeChange) {
            onSelectedNodeChange(selectedNode);
        }
    }, [selectedNode, onSelectedNodeChange]);

    // Expose auto-layout function to parent
    useEffect(() => {
        if (onAutoLayoutReady) {
            onAutoLayoutReady(onLayout);
        }
    }, [onLayout, onAutoLayoutReady]);

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
export default function GoalCanvas({ onSelectedNodeChange, onAutoLayoutReady }) {
    return (
        <ReactFlowProvider>
            <GoalCanvasInner 
                onSelectedNodeChange={onSelectedNodeChange}
                onAutoLayoutReady={onAutoLayoutReady}
            />
        </ReactFlowProvider>
    );
}
