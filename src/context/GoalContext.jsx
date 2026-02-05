import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { api } from '../services/api';

const GoalContext = createContext();

export const useGoalContext = () => useContext(GoalContext);

// Helper to transform backend tree data to React Flow nodes/edges
const transformData = (goals) => {
    let nodes = [];
    let edges = [];

    const traverse = (goal, x = 0, y = 0, level = 0) => {
        // Create Node
        nodes.push({
            id: goal.id.toString(),
            type: 'goal',
            position: { x, y: y }, // We might want to use autoLayout later, so initial pos can be somewhat arbitrary or calculated
            data: {
                label: goal.title,
                description: goal.description,
                completed: !!goal.completed,
                isRoot: level === 0
            },
        });

        if (goal.subgoals && goal.subgoals.length > 0) {
            goal.subgoals.forEach((subgoal, index) => {
                // Create Edge
                edges.push({
                    id: `e${goal.id}-${subgoal.id}`,
                    source: goal.id.toString(),
                    target: subgoal.id.toString(),
                    animated: true
                });

                // Simple recursive positioning (can be improved by autoLayout)
                // Spacing children horizontally
                traverse(subgoal, x + (index * 200) - ((goal.subgoals.length - 1) * 100), y + 200, level + 1);
            });
        }
    };

    goals.forEach((goal, i) => {
        // Place root goals spaced out
        traverse(goal, i * 400, 50);
    });

    return { nodes, edges };
};

export const GoalProvider = ({ children }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);

    const refreshGoals = useCallback(async () => {
        try {
            // setLoading(true); // silent refresh is better for UX if we are just adding
            const goals = await api.fetchGoals();
            const { nodes: computedNodes, edges: newEdges } = transformData(goals);

            setNodes((prevNodes) => {
                const prevNodeMap = new Map(prevNodes.map(n => [n.id, n]));

                return computedNodes.map(newNode => {
                    const prevNode = prevNodeMap.get(newNode.id);
                    if (prevNode) {
                        return {
                            ...newNode,
                            position: prevNode.position,
                        };
                    }
                    return newNode;
                });
            });

            setEdges(newEdges);
        } catch (error) {
            console.error("Failed to fetch goals:", error);
        } finally {
            setLoading(false);
        }
    }, [setNodes, setEdges]);

    // Initial load
    useEffect(() => {
        refreshGoals();
    }, [refreshGoals]);

    const addGoal = useCallback(async (label) => {
        try {
            await api.createGoal({ title: label, description: 'New Goal' });
            await refreshGoals();
        } catch (error) {
            console.error("Failed to create goal:", error);
        }
    }, [refreshGoals]);

    const addSubgoal = useCallback(async (parentId) => {
        try {
            await api.createGoal({
                title: 'New Subgoal',
                description: 'Actionable step',
                parentId: parentId
            });
            await refreshGoals();
        } catch (error) {
            console.error("Failed to create subgoal:", error);
        }
    }, [refreshGoals]);

    // Custom Drag Logic: Move subtree (Placeholder for now, implementation depends on if we want to save position to DB)
    const onNodeDrag = useCallback((event, node, nodes) => {
        // TODO: potential updates
    }, []);

    const value = {
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        addGoal,
        addSubgoal,
        loading,
        refreshGoals
    };

    return (
        <GoalContext.Provider value={value}>
            {children}
        </GoalContext.Provider>
    );
};
