import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    addEdge,
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import GoalNode from './GoalNode';
import GoalDetailsModal from './GoalDetailsModal';
import { getLayoutedElements } from '../../utils/autoLayout';
import { useGoalContext } from '../../context/GoalContext';
import { moveSubtree, getDescendants } from '../../utils/dragLogic';

const nodeTypes = {
    goal: GoalNode,
};

// Internal component that uses hooks requiring ReactFlowProvider
const GoalCanvasInner = ({ onSelectedNodeChange, onAutoLayoutReady }) => {
    // Consume state from Context
    const {
        nodes, setNodes, onNodesChange,
        edges, setEdges, onEdgesChange,
        updateGoal, updateGoals, deleteGoal
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

    const onLayout = useCallback((rootId = null) => {
        let nodesToLayout = nodes;
        let edgesToLayout = edges;

        if (rootId) {
            const descendants = getDescendants(nodes, edges, rootId);
            const subtreeIds = new Set([rootId, ...descendants]);
            nodesToLayout = nodes.filter(n => subtreeIds.has(n.id));

            // Filter edges that connect nodes within the subtree
            edgesToLayout = edges.filter(e => subtreeIds.has(e.source) && subtreeIds.has(e.target));
        }

        const { nodes: layoutedNodes } = getLayoutedElements(
            nodesToLayout,
            edgesToLayout,
            'TB'
        );

        // Map layouted nodes back to full node list or update their positions
        // If we are doing partial layout, we only want to update the positions of the involved nodes
        // AND we want to persist them.

        // 1. Update State
        if (rootId) {
            const layoutedNodeMap = new Map(layoutedNodes.map(n => [n.id, n]));

            const newNodes = nodes.map(n => {
                if (layoutedNodeMap.has(n.id)) {
                    return layoutedNodeMap.get(n.id);
                }
                return n;
            });
            setNodes(newNodes);
            // Edges don't change in layout usually, but if dagre changes them (e.g. points), we might need to update. 
            // Our getLayoutedElements doesn't change edges, so we can skip setEdges for partial.
        } else {
            setNodes([...layoutedNodes]);
            setEdges([...edgesToLayout]); // edgesToLayout is all edges in full mode
            window.requestAnimationFrame(() => fitView({ duration: 400 }));
        }

        // 2. Persist Changes
        const updates = layoutedNodes.map(n => ({
            id: n.id,
            updates: {
                x: Math.round(n.position.x),
                y: Math.round(n.position.y)
            }
        }));

        if (updates.length > 0) {
            updateGoals(updates);
        }

    }, [nodes, edges, setNodes, setEdges, fitView, updateGoals]);

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

    const onNodeDragStop = (event, node) => {
        const draggedNode = draggingNodeRef.current;
        if (draggedNode) {
            // Identify all nodes that moved (dragged node + descendants)
            const descendants = getDescendants(nodes, edges, draggedNode.id);
            const nodesToUpdateIds = [draggedNode.id, ...Array.from(descendants)];

            // Prepare batch update
            const updates = [];

            nodesToUpdateIds.forEach(nodeId => {
                const currentNode = nodes.find(n => n.id === nodeId);
                if (currentNode) {
                    updates.push({
                        id: currentNode.id,
                        updates: {
                            x: Math.round(currentNode.position.x),
                            y: Math.round(currentNode.position.y)
                        }
                    });
                }
            });

            if (updates.length > 0) {
                updateGoals(updates);
            }
        }

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

    const selectedNode = useMemo(() => nodes.find(n => n.selected), [nodes]);
    const onLayoutRef = useRef(onLayout);

    // Update ref when onLayout changes
    useEffect(() => {
        onLayoutRef.current = onLayout;
    }, [onLayout]);

    // Notify parent of selected node changes
    useEffect(() => {
        if (onSelectedNodeChange) {
            onSelectedNodeChange(selectedNode);
        }
    }, [selectedNode, onSelectedNodeChange]);

    // Expose auto-layout function to parent (only once)
    useEffect(() => {
        if (onAutoLayoutReady) {
            // Provide a stable wrapper that always calls the latest onLayout
            onAutoLayoutReady(() => onLayoutRef.current());
        }
    }, [onAutoLayoutReady]);

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
export default GoalCanvasInner;
