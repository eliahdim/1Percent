/**
 * moves the node and all its descendants by the same delta
 * @param {Array} nodes - all nodes
 * @param {Array} edges - all edges
 * @param {Object} draggedNode - the node being dragged
 * @param {Object} delta - {x, y} change in position
 * @returns {Array} newNodes - updated list of nodes
 */
export const getDescendants = (nodes, edges, parentId) => {
    const visited = new Set();
    const stack = [parentId];

    while (stack.length > 0) {
        const currentId = stack.pop();
        // Find children
        const children = edges
            .filter(edge => edge.source === currentId)
            .map(edge => edge.target);

        children.forEach(childId => {
            if (!visited.has(childId)) {
                visited.add(childId);
                stack.push(childId);
            }
        });
    }
    return visited;
};

export const getRoot = (nodes, edges, startNodeId) => {
    let currentId = startNodeId;
    let parentEdge = edges.find(e => e.target === currentId);

    // Traverse up until no parent is found
    while (parentEdge) {
        currentId = parentEdge.source;
        parentEdge = edges.find(e => e.target === currentId);
    }

    return nodes.find(n => n.id === currentId);
};

export const moveSubtree = (nodes, edges, draggedNode, delta) => {
    const descendants = getDescendants(nodes, edges, draggedNode.id);

    return nodes.map((node) => {
        if (node.id === draggedNode.id || descendants.has(node.id)) {
            return {
                ...node,
                position: {
                    x: node.position.x + delta.x,
                    y: node.position.y + delta.y,
                },
            };
        }
        return node;
    });
};
