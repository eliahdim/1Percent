import React, { createContext, useContext, useCallback } from 'react';
import { useNodesState, useEdgesState, addEdge, applyNodeChanges } from '@xyflow/react';

const GoalContext = createContext();

export const useGoalContext = () => useContext(GoalContext);

const initialNodes = [
    { id: '1', type: 'goal', position: { x: 250, y: 5 }, data: { label: 'Start 1% Project', description: 'Build the ultimate goal app' } },
    { id: '2', type: 'goal', position: { x: 100, y: 150 }, data: { label: 'Frontend', description: 'React + Canvas' } },
    { id: '3', type: 'goal', position: { x: 400, y: 150 }, data: { label: 'Backend', description: 'Node + SQLite' } },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e1-3', source: '1', target: '3', animated: true },
];

export const GoalProvider = ({ children }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const addGoal = useCallback((label) => {
        const id = Date.now().toString();
        const newNode = {
            id,
            type: 'goal',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label, description: 'New Goal' },
        };
        setNodes((nds) => [...nds, newNode]);
    }, [setNodes]);

    const addSubgoal = useCallback((parentId) => {
        const parentNode = nodes.find((n) => n.id === parentId);
        if (!parentNode) return;

        const id = Date.now().toString();
        const newNode = {
            id,
            type: 'goal',
            position: { x: parentNode.position.x + 50, y: parentNode.position.y + 100 },
            data: { label: 'New Subgoal', description: 'Actionable step' },
        };

        const newEdge = {
            id: `e${parentId}-${id}`,
            source: parentId,
            target: id,
            animated: true
        };

        setNodes((nds) => [...nds, newNode]);
        setEdges((eds) => [...eds, newEdge]);
    }, [nodes, setNodes, setEdges]);

    // Custom Drag Logic: Move subtree
    const onNodeDrag = useCallback((event, node, nodes) => {
        // This is a simplified placeholder. 
        // Real recursive drag needs to find children and update their positions 
        // relative to the movement delta of the parent.
        // For now, React Flow handles individual node dragging.
        // We will enhance this in the View component or a specific hook.
    }, []);

    const value = {
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        addGoal,
        addSubgoal
    };

    return (
        <GoalContext.Provider value={value}>
            {children}
        </GoalContext.Provider>
    );
};
