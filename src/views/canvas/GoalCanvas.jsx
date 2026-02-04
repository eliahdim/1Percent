import React, { useCallback } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    Panel,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Layout } from 'lucide-react';
import GoalNode from './GoalNode';
import { getLayoutedElements } from '../../utils/autoLayout';

const nodeTypes = {
    goal: GoalNode,
};

const initialNodes = [
    { id: '1', type: 'goal', position: { x: 250, y: 5 }, data: { label: 'Start 1% Project', description: 'Build the ultimate goal app' } },
    { id: '2', type: 'goal', position: { x: 100, y: 150 }, data: { label: 'Frontend', description: 'React + Canvas' } },
    { id: '3', type: 'goal', position: { x: 400, y: 150 }, data: { label: 'Backend', description: 'Node + SQLite' } },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e1-3', source: '1', target: '3', animated: true },
];

const GoalCanvas = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { fitView } = useReactFlow();

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

        // Fit view after a brief delay to allow render
        window.requestAnimationFrame(() => fitView({ duration: 400 }));
    }, [nodes, edges, setNodes, setEdges, fitView]);

    return (
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
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

                <Panel position="top-right">
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
        </div>
    );
};

export default () => (
    <ReactFlowProvider>
        <GoalCanvas />
    </ReactFlowProvider>
);
