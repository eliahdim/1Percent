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
import { AlertTriangle, Trash2, X } from 'lucide-react';

const nodeTypes = {
    goal: GoalNode,
};

const GoalCanvasInner = ({ onSelectedNodeChange, onAutoLayoutReady }) => {
    const {
        nodes, setNodes, onNodesChange,
        edges, setEdges, onEdgesChange,
        updateGoal, updateGoals, deleteGoal, loading
    } = useGoalContext();

    const [selectedGoalForModal, setSelectedGoalForModal] = useState(null);
    const [confirmDeleteNode, setConfirmDeleteNode] = useState(null);

    // Drag animation tuning.
    // Higher values = faster catch-up (less "lag" feel).
    const DRAG_LAG_SPEED = 12;
    const DRAG_POSITION_EPSILON = 0.5;

    const onNodeDoubleClick = useCallback((event, node) => {
        setSelectedGoalForModal(node);
    }, []);

    const { fitView } = useReactFlow();
    const draggingNodeRef = useRef(null);
    const lastPosRef = useRef(null);

    // Keep the latest state accessible from the animation loop.
    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);
    useEffect(() => { nodesRef.current = nodes; }, [nodes]);
    useEffect(() => { edgesRef.current = edges; }, [edges]);

    // During dragging, we keep two positions:
    // - targetNodesRef: updated immediately from React Flow drag events
    // - renderNodesRef: interpolated towards targetNodesRef for a "lag/catch-up" effect
    const targetNodesRef = useRef(null);
    const renderNodesRef = useRef(null);
    const movingNodeIdsRef = useRef(new Set());
    const isDraggingRef = useRef(false);
    const rafRef = useRef(null);
    const lastFrameTimeRef = useRef(null);

    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

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
            edgesToLayout = edges.filter(e => subtreeIds.has(e.source) && subtreeIds.has(e.target));
        }

        const { nodes: layoutedNodes } = getLayoutedElements(nodesToLayout, edgesToLayout, 'TB');

        if (rootId) {
            const layoutedNodeMap = new Map(layoutedNodes.map(n => [n.id, n]));
            const newNodes = nodes.map(n => layoutedNodeMap.has(n.id) ? layoutedNodeMap.get(n.id) : n);
            setNodes(newNodes);
        } else {
            setNodes([...layoutedNodes]);
            setEdges([...edgesToLayout]);
            window.requestAnimationFrame(() => fitView({ duration: 400 }));
        }

        const updates = layoutedNodes.map(n => ({
            id: n.id,
            updates: {
                x: Math.round(n.position.x),
                y: Math.round(n.position.y)
            }
        }));

        if (updates.length > 0) updateGoals(updates);

    }, [nodes, edges, setNodes, setEdges, fitView, updateGoals]);

    const onNodeDragStart = (event, node) => {
        draggingNodeRef.current = node;
        lastPosRef.current = { ...node.position };

        isDraggingRef.current = true;
        lastFrameTimeRef.current = null;

        // Clone current positions into our animation buffers.
        // (We only interpolate positions; everything else can be kept as-is.)
        targetNodesRef.current = nodesRef.current.map(n => ({
            ...n,
            position: { ...n.position }
        }));
        renderNodesRef.current = nodesRef.current.map(n => ({
            ...n,
            position: { ...n.position }
        }));

        // Precompute which nodes are expected to move during this drag.
        const descendants = getDescendants(nodesRef.current, edgesRef.current, node.id);
        movingNodeIdsRef.current = new Set([node.id, ...Array.from(descendants)]);
    };

    const animateDragStep = useCallback((timestamp) => {
        if (!targetNodesRef.current || !renderNodesRef.current) {
            rafRef.current = null;
            return;
        }

        const renderNodes = renderNodesRef.current;
        const targetNodes = targetNodesRef.current;

        const dtMs = lastFrameTimeRef.current == null ? 16 : (timestamp - lastFrameTimeRef.current);
        lastFrameTimeRef.current = timestamp;

        // Exponential smoothing to keep animation stable across different frame rates.
        const alpha = 1 - Math.exp(-DRAG_LAG_SPEED * (dtMs / 1000));

        const targetPosById = new Map(targetNodes.map(n => [n.id, n.position]));
        const draggedId = draggingNodeRef.current?.id;

        let maxRemaining = 0;
        const nextNodes = renderNodes.map((n) => {
            const targetPos = targetPosById.get(n.id);
            if (!targetPos) return n;

            // Keep the actively dragged node under the cursor for a predictable feel.
            if (draggedId && n.id === draggedId) {
                return {
                    ...n,
                    position: { x: targetPos.x, y: targetPos.y }
                };
            }

            // Only animate the moving subtree.
            if (!movingNodeIdsRef.current.has(n.id)) return n;

            const cx = n.position.x;
            const cy = n.position.y;

            const nx = cx + (targetPos.x - cx) * alpha;
            const ny = cy + (targetPos.y - cy) * alpha;
            maxRemaining = Math.max(
                maxRemaining,
                Math.abs(targetPos.x - nx),
                Math.abs(targetPos.y - ny)
            );

            return {
                ...n,
                position: { x: nx, y: ny }
            };
        });

        renderNodesRef.current = nextNodes;
        setNodes(nextNodes);

        // While the user is dragging, we keep animating.
        // Once dragging stops, we "snap" by continuing until close enough.
        if (isDraggingRef.current) {
            rafRef.current = requestAnimationFrame(animateDragStep);
            return;
        }

        if (maxRemaining <= DRAG_POSITION_EPSILON) {
            // Ensure final positions match the most recent drag targets.
            const finalNodes = targetNodesRef.current.map(n => ({
                ...n,
                position: { ...n.position }
            }));
            renderNodesRef.current = finalNodes;
            setNodes(finalNodes);
            rafRef.current = null;
            return;
        }

        rafRef.current = requestAnimationFrame(animateDragStep);
    }, [setNodes]);

    const onNodeDrag = (event, node) => {
        const delta = {
            x: node.position.x - lastPosRef.current.x,
            y: node.position.y - lastPosRef.current.y
        };
        lastPosRef.current = { ...node.position };

        // Update the target positions immediately.
        // Then the animation loop interpolates render positions behind it.
        targetNodesRef.current = moveSubtree(
            targetNodesRef.current,
            edgesRef.current,
            node,
            delta
        );

        if (rafRef.current == null) {
            rafRef.current = requestAnimationFrame(animateDragStep);
        }
    };

    const onNodeDragStop = (event, node) => {
        const draggedNode = draggingNodeRef.current;

        isDraggingRef.current = false;
        if (draggedNode) {
            // Snap to the latest drag targets so persistence matches what you see.
            const finalNodes = targetNodesRef.current?.map(n => ({
                ...n,
                position: { ...n.position }
            }));

            if (finalNodes) {
                renderNodesRef.current = finalNodes;
                setNodes(finalNodes);
            }

            const nodesForUpdate = finalNodes || nodesRef.current;
            const descendants = getDescendants(nodesForUpdate, edgesRef.current, draggedNode.id);
            const nodesToUpdateIds = [draggedNode.id, ...Array.from(descendants)];
            const updates = [];

            nodesToUpdateIds.forEach(nodeId => {
                const currentNode = nodesForUpdate.find(n => n.id === nodeId);
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

            if (updates.length > 0) updateGoals(updates);
        }

        // Stop any in-flight animation and clear drag state.
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastFrameTimeRef.current = null;
        movingNodeIdsRef.current = new Set();
        draggingNodeRef.current = null;
        lastPosRef.current = null;
    };

    const onDeleteNodes = useCallback((deletedNodes) => {
        if (deletedNodes.length > 0) {
            // Instead of window.confirm, show our custom UI
            setConfirmDeleteNode(deletedNodes[0]);
        }
    }, []);

    const selectedNode = useMemo(() => nodes.find(n => n.selected), [nodes]);
    const onLayoutRef = useRef(onLayout);

    useEffect(() => {
        onLayoutRef.current = onLayout;
    }, [onLayout]);

    useEffect(() => {
        if (onSelectedNodeChange) onSelectedNodeChange(selectedNode);
    }, [selectedNode, onSelectedNodeChange]);

    useEffect(() => {
        if (onAutoLayoutReady) {
            onAutoLayoutReady((...args) => onLayoutRef.current(...args));
        }
    }, [onAutoLayoutReady]);

    const handleConfirmDelete = () => {
        if (confirmDeleteNode) {
            deleteGoal(confirmDeleteNode.id);
            setConfirmDeleteNode(null);
        }
    };

    return (
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
            {loading && (
                <div className="loading-overlay" aria-busy="true" aria-label="Loading your goals">
                    <div className="loading-spinner" />
                    <div className="loading-text">Manifesting your ambitions...</div>
                </div>
            )}

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
                    nodeStrokeColor="var(--accent-primary)"
                    nodeColor="var(--bg-tertiary)"
                    maskColor="rgba(0,0,0, 0.4)"
                />
                <Background gap={16} size={1} color="var(--border-subtle)" />
            </ReactFlow>

            {/* Custom accessible confirm bar for deletion */}
            {confirmDeleteNode && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 100,
                    width: 'auto',
                    minWidth: '320px'
                }}>
                    <div className="confirm-bar" role="alert">
                        <AlertTriangle size={18} color="var(--accent-danger)" />
                        <span className="confirm-bar-message">
                            Delete "{confirmDeleteNode.data.label}" and all its subgoals?
                        </span>
                        <button className="btn btn-ghost" onClick={() => setConfirmDeleteNode(null)} style={{ padding: '4px 8px' }}>
                            Cancel
                        </button>
                        <button className="btn btn-danger" onClick={handleConfirmDelete} style={{ padding: '4px 12px' }}>
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </div>
            )}

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

export default GoalCanvasInner;

